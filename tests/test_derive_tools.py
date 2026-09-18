"""Tests for public software recommendation snapshot derivation."""

from __future__ import annotations

import pytest

from dailyvault.derive_tools import derive_public_tools_snapshot
from dailyvault.errors import EmptyPublicSetError


def _card(**fields: object) -> dict[str, object]:
    card: dict[str, object] = {
        "type": "tool-introduction",
        "title": "uv",
        "description": "Fast Python package manager",
        "canonical_url": "https://github.com/astral-sh/uv",
        "category": "developer-tools",
        "subject": ["developer-tools", "python"],
        "status": "active",
    }
    card.update(fields)
    return card


def test_declared_card_becomes_complete_snapshot_item() -> None:
    snapshot = derive_public_tools_snapshot(
        [_card(public_recommendation="recommended")]
    )

    assert snapshot == {
        "capability": "recommendations.tools",
        "items": [
            {
                "toolId": "astral-sh-uv",
                "name": "uv",
                "summary": "Fast Python package manager",
                "url": "https://github.com/astral-sh/uv",
                "categories": ["developer-tools", "python"],
                "recommendation": "recommended",
            }
        ],
    }


def test_omitted_declaration_does_not_appear() -> None:
    snapshot = derive_public_tools_snapshot(
        [
            _card(public_recommendation="recommended"),
            _card(
                title="Secret notes",
                description="Private capture",
                canonical_url="https://example.com/notes",
                category="productivity",
                subject=["productivity"],
            ),
        ]
    )

    assert [item["toolId"] for item in snapshot["items"]] == ["astral-sh-uv"]
    assert [item["name"] for item in snapshot["items"]] == ["uv"]


def test_copy_and_recommendation_come_from_card_fields() -> None:
    snapshot = derive_public_tools_snapshot(
        [
            _card(
                title="Ruff",
                description="Fast Python linter",
                canonical_url="https://github.com/astral-sh/ruff",
                category="developer-tools",
                subject=["developer-tools", "python"],
                public_recommendation="situational",
            )
        ]
    )

    item = snapshot["items"][0]
    assert item["name"] == "Ruff"
    assert item["summary"] == "Fast Python linter"
    assert item["url"] == "https://github.com/astral-sh/ruff"
    assert item["categories"] == ["developer-tools", "python"]
    assert item["recommendation"] == "situational"


def test_github_identity_uses_owner_repo() -> None:
    snapshot = derive_public_tools_snapshot(
        [_card(public_recommendation="recommended")]
    )

    assert snapshot["items"][0]["toolId"] == "astral-sh-uv"


def test_npm_identity_uses_package_name() -> None:
    snapshot = derive_public_tools_snapshot(
        [
            _card(
                title="pnpm",
                description="JavaScript package manager",
                canonical_url="https://www.npmjs.com/package/pnpm",
                category="developer-tools",
                subject=["developer-tools"],
                public_recommendation="recommended",
            )
        ]
    )

    assert snapshot["items"][0]["toolId"] == "pnpm"
    assert "toolId" not in _card()


def test_other_identity_uses_registered_hostname() -> None:
    snapshot = derive_public_tools_snapshot(
        [
            _card(
                title="pnpm",
                description="JavaScript package manager",
                canonical_url="https://pnpm.io/",
                category="developer-tools",
                subject=["developer-tools"],
                public_recommendation="exploring",
            )
        ]
    )

    assert snapshot["items"][0]["toolId"] == "pnpm-io"


def test_author_tool_id_is_ignored() -> None:
    snapshot = derive_public_tools_snapshot(
        [
            _card(
                toolId="hand-written",
                public_recommendation="recommended",
            )
        ]
    )

    assert snapshot["items"][0]["toolId"] == "astral-sh-uv"


def test_empty_public_set_fails() -> None:
    with pytest.raises(EmptyPublicSetError):
        derive_public_tools_snapshot([_card()])
