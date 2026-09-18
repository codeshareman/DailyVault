"""Tests for public software recommendation snapshot derivation."""

from __future__ import annotations

import pytest

from dailyvault.derive_tools import derive_public_tools_snapshot
from dailyvault.errors import (
    DuplicateIdentityError,
    EmptyPublicSetError,
    InvalidCardShapeError,
    InvalidCategoryError,
    InvalidRecommendationError,
    MissingCanonicalUrlError,
    RetiredPublicDeclarationError,
    UnsafeUrlError,
)


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


def test_duplicate_derived_identity_fails() -> None:
    with pytest.raises(DuplicateIdentityError):
        derive_public_tools_snapshot(
            [
                _card(public_recommendation="recommended"),
                _card(
                    title="uv mirror",
                    description="Same repository",
                    public_recommendation="situational",
                ),
            ]
        )


def test_retired_declared_card_fails() -> None:
    with pytest.raises(RetiredPublicDeclarationError):
        derive_public_tools_snapshot(
            [_card(status="retired", public_recommendation="recommended")]
        )


def test_retired_without_declaration_is_omitted() -> None:
    snapshot = derive_public_tools_snapshot(
        [
            _card(public_recommendation="recommended"),
            _card(
                title="Old notes",
                description="Retired capture",
                canonical_url="https://example.com/old",
                category="productivity",
                subject=["productivity"],
                status="retired",
            ),
        ]
    )

    assert [item["toolId"] for item in snapshot["items"]] == ["astral-sh-uv"]


def test_illegal_recommendation_fails() -> None:
    with pytest.raises(InvalidRecommendationError):
        derive_public_tools_snapshot(
            [_card(public_recommendation="favorite")]
        )


def test_illegal_recommendation_does_not_yield_partial_snapshot() -> None:
    with pytest.raises(InvalidRecommendationError):
        derive_public_tools_snapshot(
            [
                _card(public_recommendation="recommended"),
                _card(
                    title="Bad rec",
                    description="Not a public state",
                    canonical_url="https://example.com/bad",
                    category="productivity",
                    subject=["productivity"],
                    public_recommendation="favorite",
                ),
            ]
        )


def test_unsafe_http_url_fails() -> None:
    with pytest.raises(UnsafeUrlError):
        derive_public_tools_snapshot(
            [
                _card(
                    canonical_url="http://example.com/tool",
                    public_recommendation="recommended",
                )
            ]
        )


def test_localhost_url_fails() -> None:
    with pytest.raises(UnsafeUrlError):
        derive_public_tools_snapshot(
            [
                _card(
                    canonical_url="https://localhost/tool",
                    public_recommendation="recommended",
                )
            ]
        )


def test_declared_card_missing_canonical_url_fails() -> None:
    card = _card(public_recommendation="recommended")
    del card["canonical_url"]
    with pytest.raises(MissingCanonicalUrlError):
        derive_public_tools_snapshot([card])


def test_non_slug_category_fails() -> None:
    with pytest.raises(InvalidCategoryError):
        derive_public_tools_snapshot(
            [
                _card(
                    category="Developer Tools",
                    subject=["developer-tools"],
                    public_recommendation="recommended",
                )
            ]
        )



def test_declared_card_missing_title_fails() -> None:
    with pytest.raises(InvalidCardShapeError):
        derive_public_tools_snapshot(
            [_card(title="", public_recommendation="recommended")]
        )


def test_declared_card_missing_title_does_not_yield_partial_snapshot() -> None:
    with pytest.raises(InvalidCardShapeError):
        derive_public_tools_snapshot(
            [
                _card(public_recommendation="recommended"),
                _card(
                    title="",
                    description="No name",
                    canonical_url="https://example.com/nameless",
                    public_recommendation="situational",
                ),
            ]
        )
