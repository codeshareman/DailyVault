"""Failure categories for public software recommendation derivation."""

from __future__ import annotations


class DailyVaultError(Exception):
    """Base error for DailyVault projection scripts."""

    code: str = "dailyvault_error"

    def __init__(self, message: str, *, code: str | None = None) -> None:
        super().__init__(message)
        if code is not None:
            self.code = code


class DeriveToolsError(DailyVaultError):
    """Base error for public tools snapshot derivation."""

    code = "derive_tools_error"


class EmptyPublicSetError(DeriveToolsError):
    code = "empty_public_set"
