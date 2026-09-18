"""CLI entry points for DailyVault projection scripts."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from dailyvault.derive_tools import derive_public_tools_snapshot_from_dir
from dailyvault.errors import DailyVaultError
from dailyvault.write_tools import (
    default_tools_snapshot_path,
    derive_and_write_public_tools_snapshot,
)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="DailyVault projection tools")
    subparsers = parser.add_subparsers(dest="command", required=True)

    derive = subparsers.add_parser(
        "derive-tools",
        help="Derive a recommendations.tools Catalog snapshot to stdout",
    )
    derive.add_argument(
        "--tools-dir",
        type=Path,
        default=Path("Tools"),
        help="Directory of tool-card Markdown files",
    )
    write = subparsers.add_parser(
        "write-tools",
        aliases=["tools"],
        help="Write a recommendations.tools Catalog snapshot to ZNorth",
    )
    write.add_argument(
        "--tools-dir",
        type=Path,
        default=Path("Tools"),
        help="Directory of tool-card Markdown files",
    )
    write.add_argument(
        "--output",
        type=Path,
        default=None,
        help="Snapshot destination; default is sibling ZNorth Catalog path",
    )

    args = parser.parse_args(argv)

    if args.command == "derive-tools":
        try:
            snapshot = derive_public_tools_snapshot_from_dir(args.tools_dir)
        except DailyVaultError as error:
            print(f"{error.code}: {error}", file=sys.stderr)
            return 1
        json.dump(snapshot, sys.stdout, ensure_ascii=False, indent=2)
        sys.stdout.write("\n")
        return 0

    if args.command in {"write-tools", "tools"}:
        dest = args.output or default_tools_snapshot_path()
        try:
            written = derive_and_write_public_tools_snapshot(args.tools_dir, dest)
        except DailyVaultError as error:
            print(f"{error.code}: {error}", file=sys.stderr)
            return 1
        print(str(written))
        return 0

    raise AssertionError(f"unknown command: {args.command}")


if __name__ == "__main__":
    raise SystemExit(main())
