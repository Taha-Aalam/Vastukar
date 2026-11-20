# DDC-CWICR-OE: DataDrivenConstruction · OpenConstructionERP
# Copyright (c) 2026 Artem Boiko / DataDrivenConstruction
"""The upgrade path never installs the upstream package from PyPI.

Applying an update used to be ``pip install --upgrade openconstructionerp``,
which resolves the upstream distribution on PyPI and replaces this fork with
upstream. The install now downloads the wheel attached to the latest release of
this repository, verifies its published checksum and installs that local file.
This file pins both halves: the command that is actually run, and a source
sweep that stops an index reference creeping back into the upgrade path.
"""

from __future__ import annotations

import sys
from pathlib import Path

import pytest

from app.core.release_install import (
    ReleaseInstallError,
    build_install_command,
    pick_wheel_asset,
)

BACKEND = Path(__file__).resolve().parents[2]
ROOT = BACKEND.parent

#: Every file that can decide where an upgrade gets its bytes from.
UPGRADE_PATH_FILES = (
    BACKEND / "app" / "core" / "release_install.py",
    BACKEND / "app" / "core" / "self_upgrade.py",
    BACKEND / "app" / "main.py",
    BACKEND / "app" / "cli.py",
    ROOT / ".github" / "workflows" / "release.yml",
    ROOT / ".github" / "workflows" / "pypi-publish.yml",
)

FORBIDDEN = (
    "pypi.org",
    "pip install --upgrade openconstructionerp",
)


def test_the_install_command_targets_a_local_wheel() -> None:
    """pip is still the installer, but the thing it installs is a file path."""
    wheel = Path("/tmp/vastukar-release/openconstructionerp-19.3.1-py3-none-any.whl")
    command = build_install_command(wheel)

    assert command == [sys.executable, "-m", "pip", "install", "--upgrade", str(wheel)]
    joined = " ".join(command)
    for fragment in FORBIDDEN:
        assert fragment not in joined


def test_the_release_asset_picker_refuses_a_wrong_version() -> None:
    """A pinned version that is not the latest release cannot silently install."""
    release = {
        "tag_name": "v19.3.1",
        "assets": [
            {"name": "SHA256SUMS.txt", "browser_download_url": "https://example.test/SHA256SUMS.txt"},
            {
                "name": "openconstructionerp-19.3.1-py3-none-any.whl",
                "browser_download_url": "https://example.test/wheel.whl",
                "digest": "sha256:" + "a" * 64,
            },
        ],
    }

    assert pick_wheel_asset(release)["name"].endswith(".whl")
    with pytest.raises(ReleaseInstallError, match="not the latest release"):
        pick_wheel_asset(release, "18.0.0")


@pytest.mark.parametrize("relative", [str(p.relative_to(ROOT)) for p in UPGRADE_PATH_FILES])
def test_no_pypi_reference_survives_in_the_upgrade_path(relative: str) -> None:
    """A grep, as a test, so the proof is re-run on every change."""
    source = (ROOT / relative).read_text(encoding="utf-8")
    for fragment in FORBIDDEN:
        assert fragment not in source, f"{relative} still contains {fragment!r}"
