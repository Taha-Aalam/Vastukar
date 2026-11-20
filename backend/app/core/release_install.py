# DDC-CWICR-OE: DataDrivenConstruction · OpenConstructionERP
# Copyright (c) 2026 Artem Boiko / DataDrivenConstruction
"""Install the backend wheel attached to this repository's latest GitHub release.

The package name stays as it is by downstream rule: imports, routes, CLI
commands and environment variables are not part of this change. What moves is
the *source of the bytes*. The old upgrade ran ``pip install --upgrade
openconstructionerp``, which resolves on PyPI and therefore replaces this fork
with the upstream distribution. Here the wheel is downloaded from the owner's
latest GitHub release, checked against the checksum that release publishes,
and handed to pip as a local file path. Nothing in this module consults PyPI.

Checksum mechanism
------------------
The release workflow attaches ``SHA256SUMS.txt`` beside the wheel, in the
ordinary ``sha256sum`` format (``<64 hex chars>  <filename>``). We download that
file from the same release and look up a line naming the selected wheel. GitHub
also reports an asset ``digest`` (``sha256:…``); if no checksum file is
published we accept that digest, and if neither exists the install proceeds
unverified - "verify if the release publishes one". A mismatch aborts before
pip is invoked, so a corrupt or substituted asset can never be installed.
"""

from __future__ import annotations

import hashlib
import re
import sys
import tempfile
from pathlib import Path
from typing import Any

import httpx

#: The owner's repository. This is the only release channel for the backend.
GITHUB_REPO = "Taha-Aalam/Vastukar"
RELEASES_API_URL = f"https://api.github.com/repos/{GITHUB_REPO}/releases/latest"
RELEASES_URL = f"https://github.com/{GITHUB_REPO}/releases/latest"

#: Preferred checksum manifest, then GitHub's own per-asset digest.
CHECKSUM_ASSET_NAMES = ("SHA256SUMS.txt", "SHA256SUMS")
_CHECKSUM_LINE = re.compile(r"^([0-9a-fA-F]{64})\s+\*?(.+)$")

#: Same stream cap the converter installer uses: a wheel is large (the bundled
#: frontend lives inside it) but nowhere near half a gigabyte.
MAX_ASSET_BYTES = 512 * 1024 * 1024
DOWNLOAD_TIMEOUT_SECONDS = 600


class ReleaseInstallError(RuntimeError):
    """The release could not supply a wheel we are willing to install."""


def fetch_latest_release(client: httpx.Client | None = None) -> dict[str, Any]:
    """The newest release object from the owner's repository, as JSON."""

    def _get(c: httpx.Client) -> dict[str, Any]:
        response = c.get(
            RELEASES_API_URL,
            headers={"Accept": "application/vnd.github.v3+json"},
        )
        response.raise_for_status()
        payload = response.json()
        if not isinstance(payload, dict):
            raise ReleaseInstallError("GitHub returned no release object")
        return payload

    if client is not None:
        return _get(client)
    with httpx.Client(timeout=30) as own:
        return _get(own)


def release_version(release: dict[str, Any]) -> str:
    """The release tag without its leading ``v``, for version reporting."""
    return (release.get("tag_name") or "").strip().lstrip("v")


def pick_wheel_asset(release: dict[str, Any], version: str | None = None) -> dict[str, Any]:
    """The backend wheel attached to *release*.

    A version may be requested explicitly. Because the release in question is
    the latest one, a request naming a different version is refused rather
    than silently installing whatever the latest release happens to carry.
    """
    tag = release_version(release)
    if version and version.strip().lstrip("v") != tag:
        raise ReleaseInstallError(
            f"Requested version {version} is not the latest release ({tag or 'unknown'}). "
            f"See {RELEASES_URL}."
        )
    wheels = [
        asset
        for asset in (release.get("assets") or [])
        if (asset.get("name") or "").lower().endswith(".whl")
    ]
    if not wheels:
        raise ReleaseInstallError(
            f"The latest release ({tag or 'unknown'}) has no wheel asset attached. "
            f"See {RELEASES_URL}."
        )
    return wheels[0]


def _checksum_from_manifest(client: httpx.Client, release: dict[str, Any], filename: str) -> str | None:
    """Read a published ``SHA256SUMS.txt``/``SHA256SUMS`` for *filename*."""
    assets = {a.get("name"): a for a in (release.get("assets") or [])}
    for name in CHECKSUM_ASSET_NAMES:
        asset = assets.get(name)
        url = (asset or {}).get("browser_download_url")
        if not url:
            continue
        response = client.get(url)
        response.raise_for_status()
        for line in response.text.splitlines():
            match = _CHECKSUM_LINE.match(line.strip())
            if match and match.group(2).strip() == filename:
                return match.group(1).lower()
    return None


def expected_checksum(
    client: httpx.Client,
    release: dict[str, Any],
    asset: dict[str, Any],
) -> str | None:
    """The SHA-256 the release publishes for *asset*, or ``None`` if it does not."""
    from_manifest = _checksum_from_manifest(client, release, asset.get("name") or "")
    if from_manifest:
        return from_manifest
    digest = (asset.get("digest") or "").strip()
    if digest.lower().startswith("sha256:"):
        return digest.split(":", 1)[1].lower() or None
    return None


def download_and_verify(
    client: httpx.Client,
    asset: dict[str, Any],
    expected: str | None,
    dest_dir: Path,
) -> Path:
    """Stream the wheel to *dest_dir* and verify it before returning its path."""
    url = asset.get("browser_download_url")
    if not url:
        raise ReleaseInstallError("The wheel asset has no download URL")
    name = Path(asset.get("name") or "release-wheel.whl").name
    if not name.endswith(".whl"):
        raise ReleaseInstallError(f"Refusing a non-wheel release asset: {name}")

    target = dest_dir / name
    digest = hashlib.sha256()
    written = 0
    with client.stream("GET", url) as response:
        response.raise_for_status()
        with target.open("wb") as handle:
            for chunk in response.iter_bytes():
                written += len(chunk)
                if written > MAX_ASSET_BYTES:
                    handle.close()
                    target.unlink(missing_ok=True)
                    raise ReleaseInstallError("The release wheel exceeds the download size cap")
                digest.update(chunk)
                handle.write(chunk)

    if expected and digest.hexdigest().lower() != expected.lower():
        target.unlink(missing_ok=True)
        raise ReleaseInstallError(
            f"Checksum mismatch for {name}: the release publishes {expected}, "
            f"the downloaded file hashes to {digest.hexdigest()}."
        )
    return target


def build_install_command(wheel: Path) -> list[str]:
    """The pip command that installs a *local* wheel, never a package index."""
    return [sys.executable, "-m", "pip", "install", "--upgrade", str(wheel)]


def prepare_release_install(version: str | None = None) -> tuple[list[str], str, Path]:
    """Fetch, select, download and verify the release wheel.

    Returns the local pip command, the release version and the temporary
    directory holding the wheel. The caller owns that directory and must remove
    it once pip has finished. Meant for a worker thread: every step here is
    blocking network or disk work.
    """
    release = fetch_latest_release()
    asset = pick_wheel_asset(release, version)
    dest = Path(tempfile.mkdtemp(prefix="vastukar-release-"))
    with httpx.Client(timeout=DOWNLOAD_TIMEOUT_SECONDS) as client:
        try:
            checksum = expected_checksum(client, release, asset)
            wheel = download_and_verify(client, asset, checksum, dest)
        except Exception:
            _remove_download_dir(dest)
            raise
    return build_install_command(wheel), release_version(release), dest


def _remove_download_dir(dest: Path) -> None:
    """Best-effort removal of a downloaded wheel's scratch directory."""
    import shutil

    shutil.rmtree(dest, ignore_errors=True)
