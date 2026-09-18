"""Write derived recommendations.tools snapshots to the ZNorth Catalog directory."""

from __future__ import annotations

import json
import os
from collections.abc import Mapping
from pathlib import Path

from dailyvault.derive_tools import derive_public_tools_snapshot_from_dir
from dailyvault.errors import SnapshotWriteError

ZNORTH_ROOT_ENV = "ZNORTH_ROOT"
CATALOG_RELATIVE = Path("Publishing") / "MRZZZ" / "recommendations.tools.json"


def dailyvault_root() -> Path:
    return Path(__file__).resolve().parents[2]


def default_znorth_root() -> Path:
    override = os.environ.get(ZNORTH_ROOT_ENV)
    if override:
        return Path(override).expanduser().resolve()
    return (dailyvault_root().parent / "ZNorth").resolve()


def default_tools_snapshot_path() -> Path:
    return default_znorth_root() / CATALOG_RELATIVE


def derive_and_write_public_tools_snapshot(tools_dir: Path, dest: Path) -> Path:
    """Derive a snapshot, then write it. Failure leaves dest untouched."""

    snapshot = derive_public_tools_snapshot_from_dir(tools_dir)
    return write_public_tools_snapshot(snapshot, dest)


def write_public_tools_snapshot(
    snapshot: Mapping[str, object],
    dest: Path,
) -> Path:
    """Atomically write a complete non-empty Catalog snapshot. Never disable."""

    capability = snapshot.get("capability")
    items = snapshot.get("items")
    if (
        capability != "recommendations.tools"
        or not isinstance(items, list)
        or not items
        or snapshot.get("status") == "disabled"
    ):
        raise SnapshotWriteError(
            "refusing to write empty or disabled recommendations.tools snapshot"
        )

    payload = json.dumps(
        {"capability": "recommendations.tools", "items": items},
        ensure_ascii=False,
        indent=2,
    )
    dest.parent.mkdir(parents=True, exist_ok=True)
    tmp = dest.with_name(dest.name + ".tmp")
    try:
        tmp.write_text(payload + "\n", encoding="utf-8")
        tmp.replace(dest)
    except OSError as error:
        if tmp.exists():
            tmp.unlink()
        raise SnapshotWriteError(f"failed to write {dest}: {error}") from error
    return dest
