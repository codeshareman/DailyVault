"""Derive ZNorth Catalog recommendations.tools snapshots from tool cards."""

from __future__ import annotations

import re
from collections.abc import Mapping, Sequence
from pathlib import Path
from typing import Any, TypedDict
from urllib.parse import urlsplit

import yaml

from dailyvault.errors import EmptyPublicSetError

VALID_RECOMMENDATIONS = frozenset({"recommended", "situational", "exploring"})
_SLUG_PATTERN = re.compile(r"[^a-z0-9]+")


class ToolSnapshot(TypedDict):
    toolId: str
    name: str
    summary: str
    url: str
    categories: list[str]
    recommendation: str


class PublicToolsSnapshot(TypedDict):
    capability: str
    items: list[ToolSnapshot]


def derive_public_tools_snapshot(
    cards: Sequence[Mapping[str, Any]],
) -> PublicToolsSnapshot:
    """Build a Catalog snapshot from tool-card records."""

    items: list[ToolSnapshot] = []
    for card in cards:
        if card.get("type") != "tool-introduction":
            continue
        recommendation = card.get("public_recommendation")
        if recommendation not in VALID_RECOMMENDATIONS:
            continue

        canonical_url = card.get("canonical_url")
        title = card.get("title")
        description = card.get("description")
        if not isinstance(canonical_url, str) or not canonical_url:
            continue
        if not isinstance(title, str) or not title:
            continue
        if not isinstance(description, str) or not description:
            continue

        items.append(
            {
                "toolId": derive_tool_id(canonical_url),
                "name": title,
                "summary": description,
                "url": canonical_url,
                "categories": _categories(card),
                "recommendation": recommendation,
            }
        )

    if not items:
        raise EmptyPublicSetError("public software recommendation set is empty")

    return {"capability": "recommendations.tools", "items": items}


def parse_tool_card_markdown(text: str) -> dict[str, Any] | None:
    """Parse YAML frontmatter from a tool-card Markdown document."""

    if not text.startswith("---"):
        return None
    parts = text.split("---", 2)
    if len(parts) < 3:
        return None
    data = yaml.safe_load(parts[1])
    if not isinstance(data, dict):
        return None
    return data


def derive_public_tools_snapshot_from_markdown(
    texts: Sequence[str],
) -> PublicToolsSnapshot:
    """Parse Markdown cards, then derive a Catalog snapshot."""

    cards = [
        card
        for text in texts
        if (card := parse_tool_card_markdown(text)) is not None
    ]
    return derive_public_tools_snapshot(cards)


def derive_public_tools_snapshot_from_dir(tools_dir: Path) -> PublicToolsSnapshot:
    """Read Markdown tool cards from a directory and derive a Catalog snapshot."""

    texts: list[str] = []
    for path in sorted(tools_dir.glob("*.md")):
        if path.name.lower() == "readme.md":
            continue
        texts.append(path.read_text(encoding="utf-8"))
    return derive_public_tools_snapshot_from_markdown(texts)



def derive_tool_id(canonical_url: str) -> str:
    """Derive a Catalog toolId from a canonical URL. Authors do not supply this."""

    parsed = urlsplit(canonical_url)
    host = parsed.netloc.lower()
    if host.startswith("www."):
        host = host[4:]
    path_parts = [part for part in parsed.path.split("/") if part]

    if host == "github.com" and len(path_parts) >= 2:
        owner, repo = path_parts[0], path_parts[1]
        if repo.endswith(".git"):
            repo = repo[:-4]
        return _slug(f"{owner}-{repo}")

    if host == "npmjs.com" and path_parts and path_parts[0] == "package":
        remainder = path_parts[1:]
        if remainder and remainder[0].startswith("@") and len(remainder) >= 2:
            return _slug(f"{remainder[0][1:]}-{remainder[1]}")
        if remainder:
            return _slug(remainder[0])

    return _slug(host.replace(".", "-"))


def _categories(card: Mapping[str, Any]) -> list[str]:
    values: list[str] = []
    category = card.get("category")
    if isinstance(category, str) and category:
        values.append(category)

    subject = card.get("subject")
    if isinstance(subject, str) and subject:
        subject_values = [subject]
    elif isinstance(subject, list):
        subject_values = [item for item in subject if isinstance(item, str) and item]
    else:
        subject_values = []

    for item in subject_values:
        if item not in values:
            values.append(item)
    return values


def _slug(value: str) -> str:
    slug = _SLUG_PATTERN.sub("-", value.lower()).strip("-")
    return re.sub(r"-{2,}", "-", slug)
