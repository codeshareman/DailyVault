"""Tests for writing public tools snapshots to the ZNorth Catalog path."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from dailyvault.errors import EmptyPublicSetError, SnapshotWriteError
from dailyvault.write_tools import (
    default_tools_snapshot_path,
    derive_and_write_public_tools_snapshot,
    write_public_tools_snapshot,
)


def _markdown(
    *,
    title: str,
    description: str,
    canonical_url: str,
    extra: str = "",
) -> str:
    return (
        "---\n"
        f"title: {title}\n"
        "type: tool-introduction\n"
        f"description: {description}\n"
        "category: developer-tools\n"
        "subject:\n"
        "- developer-tools\n"
        f"canonical_url: {canonical_url}\n"
        f"{extra}"
        "---\n\n"
        f"# {title}\n"
    )


def _declared_card(tools: Path) -> None:
    tools.mkdir(parents=True, exist_ok=True)
    (tools / "uv.md").write_text(
        _markdown(
            title="uv",
            description="Fast Python package manager",
            canonical_url="https://github.com/astral-sh/uv",
            extra="public_recommendation: recommended\n",
        ),
        encoding="utf-8",
    )
    (tools / "README.md").write_text("# Tools\n", encoding="utf-8")


def test_writes_complete_catalog_snapshot_to_destination(tmp_path: Path) -> None:
    tools = tmp_path / "Tools"
    _declared_card(tools)
    dest = tmp_path / "Publishing" / "MRZZZ" / "recommendations.tools.json"

    written = derive_and_write_public_tools_snapshot(tools, dest)

    payload = json.loads(written.read_text(encoding="utf-8"))
    assert written == dest
    assert payload == {
        "capability": "recommendations.tools",
        "items": [
            {
                "toolId": "astral-sh-uv",
                "name": "uv",
                "summary": "Fast Python package manager",
                "url": "https://github.com/astral-sh/uv",
                "categories": ["developer-tools"],
                "recommendation": "recommended",
            }
        ],
    }
    assert "status" not in payload


def test_derive_failure_does_not_overwrite_existing_snapshot(tmp_path: Path) -> None:
    tools = tmp_path / "Tools"
    tools.mkdir()
    (tools / "notes.md").write_text(
        _markdown(
            title="Secret notes",
            description="Private capture",
            canonical_url="https://example.com/notes",
        ),
        encoding="utf-8",
    )
    dest = tmp_path / "recommendations.tools.json"
    dest.write_text(
        '{"capability": "recommendations.tools", "items": [{"toolId": "keep"}]}\n',
        encoding="utf-8",
    )
    previous = dest.read_text(encoding="utf-8")

    with pytest.raises(EmptyPublicSetError):
        derive_and_write_public_tools_snapshot(tools, dest)

    assert dest.read_text(encoding="utf-8") == previous
    assert not dest.with_name(dest.name + ".tmp").exists()


def test_refuses_to_write_empty_or_disabled_snapshot(tmp_path: Path) -> None:
    dest = tmp_path / "recommendations.tools.json"
    dest.write_text("keep\n", encoding="utf-8")

    with pytest.raises(SnapshotWriteError):
        write_public_tools_snapshot(
            {"capability": "recommendations.tools", "items": []},
            dest,
        )
    with pytest.raises(SnapshotWriteError):
        write_public_tools_snapshot(
            {
                "capability": "recommendations.tools",
                "status": "disabled",
                "items": [],
            },
            dest,
        )

    assert dest.read_text(encoding="utf-8") == "keep\n"


def test_env_override_points_catalog_path_at_znorth_root(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setenv("ZNORTH_ROOT", str(tmp_path))

    path = default_tools_snapshot_path()

    assert path == tmp_path / "Publishing" / "MRZZZ" / "recommendations.tools.json"


def test_does_not_change_other_catalog_snapshots(tmp_path: Path) -> None:
    catalog = tmp_path / "Publishing" / "MRZZZ"
    catalog.mkdir(parents=True)
    projects = catalog / "profile.projects.json"
    skills = catalog / "profile.skills.json"
    projects.write_text(
        '{"capability": "profile.projects", "items": []}\n', encoding="utf-8"
    )
    skills.write_text(
        '{"capability": "profile.skills", "items": []}\n', encoding="utf-8"
    )
    previous_projects = projects.read_text(encoding="utf-8")
    previous_skills = skills.read_text(encoding="utf-8")
    tools = tmp_path / "Tools"
    _declared_card(tools)

    derive_and_write_public_tools_snapshot(tools, catalog / "recommendations.tools.json")

    assert projects.read_text(encoding="utf-8") == previous_projects
    assert skills.read_text(encoding="utf-8") == previous_skills
    assert (catalog / "recommendations.tools.json").exists()
