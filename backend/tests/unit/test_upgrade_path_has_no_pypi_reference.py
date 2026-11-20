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
import hashlib
from pathlib import Path

import httpx
import pytest

from app.core import release_install
from app.core.release_install import (
    ReleaseInstallError,
    build_install_command,
    download_and_verify,
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

#: The exact command that used to install the upstream package. Forbidden in
#: every file on the path, including the workflows.
FORBIDDEN_INSTALL = "pip install --upgrade openconstructionerp"

#: Runtime code must not consult PyPI at all. The release workflow still queries
#: the old project's *metadata* for its size budget; it never installs from it,
#: so the index hostname is only forbidden in the code paths.
FORBIDDEN_IN_CODE = ("pypi.org", FORBIDDEN_INSTALL)


def test_the_install_command_targets_a_local_wheel() -> None:
    """pip is still the installer, but the thing it installs is a file path."""
    wheel = Path("/tmp/vastukar-release/openconstructionerp-19.3.1-py3-none-any.whl")
    command = build_install_command(wheel)

    assert command == [sys.executable, "-m", "pip", "install", "--upgrade", str(wheel)]
    joined = " ".join(command)
    for fragment in FORBIDDEN_IN_CODE:
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


class _StreamResponse:
    def __init__(self, chunks: list[bytes]) -> None:
        self._chunks = chunks

    def raise_for_status(self) -> None:
        return None

    def iter_bytes(self):
        return iter(self._chunks)

    def __enter__(self) -> "_StreamResponse":
        return self

    def __exit__(self, *_exc: object) -> bool:
        return False


class _RedirectingClient:
    """A GitHub browser_download_url that 302s to the CDN before the bytes."""

    def __init__(self, chunks: list[bytes]) -> None:
        self.chunks = chunks
        self.stream_calls: list[tuple[str, bool]] = []

    def stream(self, method: str, url: str, **kwargs: object) -> _StreamResponse:
        # httpx would have raised on a 3xx if the client did not follow it, so
        # the only answer a correctly configured client can report is the
        # final 200 with the wheel bytes.
        assert kwargs.get("follow_redirects") is True or getattr(self, "follows", False)
        self.stream_calls.append((method, url))
        return _StreamResponse(self.chunks)


def test_redirects_are_followed_and_the_wheel_is_checksummed(tmp_path: Path) -> None:
    """GitHub asset URLs redirect; the downloaded bytes must still be verified."""
    payload = b"PK\x03\x04 pretend wheel bytes"
    digest = hashlib.sha256(payload).hexdigest()
    client = _RedirectingClient([payload[:8], payload[8:]])
    client.follows = True  # the fake stands in for a follow_redirects=True client

    asset = {
        "name": "openconstructionerp-19.3.1-py3-none-any.whl",
        "browser_download_url": "https://github.com/Taha-Aalam/Vastukar/releases/download/v19.3.1/wheel.whl",
    }
    wheel = download_and_verify(client, asset, digest, tmp_path)  # type: ignore[arg-type]

    assert wheel.read_bytes() == payload
    assert client.stream_calls == [("GET", asset["browser_download_url"])]


def test_a_checksum_mismatch_refuses_the_wheel(tmp_path: Path) -> None:
    """A substituted or corrupt asset never reaches pip."""
    client = _RedirectingClient([b"some other bytes"])
    client.follows = True
    asset = {
        "name": "openconstructionerp-19.3.1-py3-none-any.whl",
        "browser_download_url": "https://github.com/Taha-Aalam/Vastukar/releases/download/v19.3.1/wheel.whl",
    }

    with pytest.raises(ReleaseInstallError, match="Checksum mismatch"):
        download_and_verify(client, asset, "0" * 64, tmp_path)  # type: ignore[arg-type]


def test_every_client_follows_redirects() -> None:
    """The source, not just a fake, must ask httpx to follow GitHub's 302."""
    source = (BACKEND / "app" / "core" / "release_install.py").read_text(encoding="utf-8")
    clients = [
        line.strip()
        for line in source.splitlines()
        if "httpx.Client(" in line
    ]
    assert clients, "no httpx.Client found; the probe has stopped seeing the source"
    for line in clients:
        assert "follow_redirects=True" in line, f"a release client does not follow redirects: {line}"


@pytest.mark.parametrize("relative", [str(p.relative_to(ROOT)) for p in UPGRADE_PATH_FILES])
def test_no_pypi_reference_survives_in_the_upgrade_path(relative: str) -> None:
    """A grep, as a test, so the proof is re-run on every change."""
    source = (ROOT / relative).read_text(encoding="utf-8")
    forbidden = FORBIDDEN_IN_CODE if relative.endswith(".py") else (FORBIDDEN_INSTALL,)
    for fragment in forbidden:
        assert fragment not in source, f"{relative} still contains {fragment!r}"
