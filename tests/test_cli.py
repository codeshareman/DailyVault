"""Tests for reading tool-card Markdown and the derive CLI."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from dailyvault.cli import main
from dailyvault.derive_tools import derive_public_tools_snapshot_from_markdown


def _markdown(
    *,
    title: str,
    description: str,
    canonical_url: str,
    extra: str = "",
    card_type: str = "tool-introduction",
) -> str:
    return (
        "---\n"
        f"title: {title}\n"
        f"type: {card_type}\n"
        f"description: {description}\n"
        "category: developer-tools\n"
        "subject:\n"
        "- developer-tools\n"
        f"canonical_url: {canonical_url}\n"
        f"{extra}"
        "---\n\n"
        f"# {title}\n"
    )


def test_markdown_declaration_derives_complete_snapshot() -> None:
    snapshot = derive_public_tools_snapshot_from_markdown(
        [
            _markdown(
                title="uv",
                description="Fast Python package manager",
                canonical_url="https://github.com/astral-sh/uv",
                extra="public_recommendation: recommended\n",
            )
        ]
    )

    assert snapshot["items"][0] == {
        "toolId": "astral-sh-uv",
        "name": "uv",
        "summary": "Fast Python package manager",
        "url": "https://github.com/astral-sh/uv",
        "categories": ["developer-tools"],
        "recommendation": "recommended",
    }


def test_commented_declaration_is_omitted() -> None:
    declared = _markdown(
        title="uv",
        description="Fast Python package manager",
        canonical_url="https://github.com/astral-sh/uv",
        extra="public_recommendation: recommended\n",
    )
    commented = _markdown(
        title="Secret notes",
        description="Private capture",
        canonical_url="https://example.com/notes",
        extra="# public_recommendation: recommended  # 可选：recommended | situational | exploring；省略则不上公开清单\n",
    )

    snapshot = derive_public_tools_snapshot_from_markdown([declared, commented])

    assert [item["name"] for item in snapshot["items"]] == ["uv"]


def test_cli_reads_markdown_cards_to_stdout(
    tmp_path: Path, capsys: pytest.CaptureFixture[str]
) -> None:
    tools = tmp_path / "Tools"
    tools.mkdir()
    (tools / "uv.md").write_text(
        _markdown(
            title="uv",
            description="Fast Python package manager",
            canonical_url="https://github.com/astral-sh/uv",
            extra="public_recommendation: recommended\n",
        ),
        encoding="utf-8",
    )
    (tools / "notes.md").write_text(
        _markdown(
            title="Secret notes",
            description="Private capture",
            canonical_url="https://example.com/notes",
        ),
        encoding="utf-8",
    )
    (tools / "README.md").write_text("# Tools\n", encoding="utf-8")

    exit_code = main(["derive-tools", "--tools-dir", str(tools)])

    captured = capsys.readouterr()
    assert exit_code == 0
    payload = json.loads(captured.out)
    assert payload["capability"] == "recommendations.tools"
    assert payload["items"][0]["toolId"] == "astral-sh-uv"
    assert payload["items"][0]["name"] == "uv"
    assert len(payload["items"]) == 1


def test_cli_tools_alias_writes_snapshot(
    tmp_path: Path, capsys: pytest.CaptureFixture[str]
) -> None:
    tools = tmp_path / "Tools"
    tools.mkdir()
    (tools / "uv.md").write_text(
        _markdown(
            title="uv",
            description="Fast Python package manager",
            canonical_url="https://github.com/astral-sh/uv",
            extra="public_recommendation: recommended\n",
        ),
        encoding="utf-8",
    )
    dest = tmp_path / "recommendations.tools.json"

    exit_code = main(
        [
            "tools",
            "--tools-dir",
            str(tools),
            "--output",
            str(dest),
        ]
    )

    captured = capsys.readouterr()
    assert exit_code == 0
    assert captured.out.strip() == str(dest)
    payload = json.loads(dest.read_text(encoding="utf-8"))
    assert payload["capability"] == "recommendations.tools"
    assert payload["items"][0]["toolId"] == "astral-sh-uv"

