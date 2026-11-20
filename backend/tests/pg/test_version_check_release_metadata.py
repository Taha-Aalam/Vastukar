# DDC-CWICR-OE: DataDrivenConstruction · OpenConstructionERP
# Copyright (c) 2026 Artem Boiko / DataDrivenConstruction
"""The version the banner names and the notes it shows come from one release.

``GET /api/system/version-check`` used to read two sources: a PyPI number and
the newest GitHub release's metadata. The number could name a newer version
than the release whose notes and installer were shown underneath it, and the
PyPI project was the upstream package - so "update available" compared this
fork against upstream. The source of truth is now the LATEST RELEASE of
Taha-Aalam/Vastukar on GitHub, and the number, notes, link, date and assets all
come from that one release object.

These tests need no database and no authentication - the route touches
neither - but they live in the PG lane because that is the lane the real gate
runs. ``tests/unit`` is reached only by the files ci-postgres.yml names one by
one, and a test nobody runs is not a gate.
"""

from __future__ import annotations

from typing import Any

import httpx
import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from app.config import get_settings
from app.core import update_check_policy
from app.dependencies import get_current_user_id
from app.main import create_app

GITHUB = "api.github.com"


class _Response:
    """The two attributes the route reads off an httpx response."""

    def __init__(self, status_code: int, payload: dict[str, Any]) -> None:
        self.status_code = status_code
        self._payload = payload

    def json(self) -> dict[str, Any]:
        return self._payload


class _FakeClient:
    """Stands in for ``httpx.AsyncClient`` inside the route only.

    Routing is by substring of the URL. Crucially, a request to any host other
    than the ones in ``routes`` raises: if the route started asking PyPI again,
    these tests would fail loudly rather than quietly accepting a second source.
    """

    routes: dict[str, _Response] = {}

    def __init__(self, *_args: object, **_kwargs: object) -> None:
        pass

    async def __aenter__(self) -> _FakeClient:
        return self

    async def __aexit__(self, *_exc: object) -> bool:
        return False

    async def get(self, url: str, **_kwargs: object) -> _Response:
        for fragment, response in self.routes.items():
            if fragment in url:
                return response
        raise AssertionError(f"the route asked for an unexpected URL: {url}")


def _github_release(
    tag: str,
    *,
    assets: list[dict[str, Any]] | None = None,
) -> _Response:
    return _Response(
        200,
        {
            "tag_name": tag,
            "html_url": f"https://github.com/Taha-Aalam/Vastukar/releases/tag/{tag}",
            "body": f"## {tag.lstrip('v')}\n\nWhat this particular release changed.",
            "published_at": "2026-08-01T09:00:00Z",
            "assets": assets or [],
        },
    )


@pytest_asyncio.fixture
async def ask():
    """Ask the endpoint once, with the release endpoint answering as told."""

    async def _ask(
        monkeypatch: pytest.MonkeyPatch,
        routes: dict[str, _Response],
        *,
        disabled: bool = False,
        running_version: str | None = None,
    ) -> dict[str, Any]:
        monkeypatch.setattr(update_check_policy, "update_check_disabled", lambda home=None: disabled)
        if running_version is not None:
            # create_app captures get_settings from the main module, so that is
            # the reference to replace before the app is built.
            monkeypatch.setattr("app.main.get_settings", lambda: _settings_at(running_version))
        app = create_app()
        app.dependency_overrides[get_current_user_id] = lambda: "version-check-reader"
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            _FakeClient.routes = routes
            monkeypatch.setattr(httpx, "AsyncClient", _FakeClient)
            response = await client.get("/api/system/version-check")
        assert response.status_code == 200, response.text
        return response.json()

    return _ask


def _settings_at(version: str):
    """A real Settings object with only the reported version changed."""
    original = get_settings()
    return original.model_copy(update={"app_version": version})


async def test_the_release_tag_names_the_latest_version(ask, monkeypatch: pytest.MonkeyPatch) -> None:
    """Version comparison reads the mocked release payload directly."""
    data = await ask(monkeypatch, {GITHUB: _github_release("v15.1.0")})

    assert data["latest_version"] == "15.1.0"
    assert "What this particular release changed." in data["release_notes"]
    assert data["release_url"].endswith("/releases/tag/v15.1.0")
    assert data["published_at"] == "2026-08-01T09:00:00Z"


async def test_a_newer_release_is_reported_as_available(ask, monkeypatch: pytest.MonkeyPatch) -> None:
    """A release newer than the running version is an available update."""
    data = await ask(
        monkeypatch,
        {GITHUB: _github_release("v15.1.0")},
        running_version="15.0.9",
    )

    assert data["current_version"] == "15.0.9"
    assert data["latest_version"] == "15.1.0"
    assert data["update_available"] is True


async def test_an_equal_release_is_not_reported_as_available(ask, monkeypatch: pytest.MonkeyPatch) -> None:
    """``15.1`` and ``15.1.0`` are one release written by two tools."""
    data = await ask(
        monkeypatch,
        {GITHUB: _github_release("v15.1")},
        running_version="15.1.0",
    )

    assert data["latest_version"] == "15.1"
    assert data["update_available"] is False
    assert "What this particular release changed." in data["release_notes"]


async def test_assets_come_from_the_same_release(ask, monkeypatch: pytest.MonkeyPatch) -> None:
    """The wheel offered for install is the one on the release we are naming."""
    data = await ask(
        monkeypatch,
        {
            GITHUB: _github_release(
                "v15.1.0",
                assets=[
                    {
                        "name": "openconstructionerp-15.1.0-py3-none-any.whl",
                        "browser_download_url": "https://github.com/Taha-Aalam/Vastukar/releases/download/v15.1.0/wheel.whl",
                        "size": 123,
                    }
                ],
            )
        },
    )

    assert data["assets"] == [
        {
            "name": "openconstructionerp-15.1.0-py3-none-any.whl",
            "url": "https://github.com/Taha-Aalam/Vastukar/releases/download/v15.1.0/wheel.whl",
            "size": 123,
        }
    ]


async def test_an_unreachable_release_names_the_running_version(ask, monkeypatch: pytest.MonkeyPatch) -> None:
    """No second source to fall back to: say what we have, promise nothing."""
    data = await ask(monkeypatch, {GITHUB: _Response(503, {})})

    assert data["latest_version"] == data["current_version"]
    assert data["update_available"] is False
    assert data["release_notes"] == ""
    assert data["release_url"].endswith("/releases")


async def test_a_disabled_check_asks_nobody(ask, monkeypatch: pytest.MonkeyPatch) -> None:
    """The launcher's "Turn off update checks" has to reach this route too."""
    data = await ask(monkeypatch, {GITHUB: _github_release("v99.0.0")}, disabled=True)

    assert data["check_disabled"] is True
    assert data["update_available"] is False
    assert data["latest_version"] == data["current_version"]
    assert data["assets"] == []


async def test_a_pressed_button_skips_the_cache(monkeypatch: pytest.MonkeyPatch) -> None:
    """About's "Check for updates" must not be answered from this morning's cache."""
    monkeypatch.setattr(update_check_policy, "update_check_disabled", lambda home=None: False)
    app = create_app()
    app.dependency_overrides[get_current_user_id] = lambda: "version-check-reader"
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        monkeypatch.setattr(httpx, "AsyncClient", _FakeClient)
        _FakeClient.routes = {GITHUB: _github_release("v15.1.0")}
        first = (await client.get("/api/system/version-check")).json()
        _FakeClient.routes = {GITHUB: _github_release("v15.2.0")}
        cached = (await client.get("/api/system/version-check")).json()
        fresh = (await client.get("/api/system/version-check", params={"force": "true"})).json()

    assert first["latest_version"] == "15.1.0"
    assert cached["latest_version"] == "15.1.0"
    assert fresh["latest_version"] == "15.2.0"


async def test_the_automatic_answer_is_held_for_a_day(monkeypatch: pytest.MonkeyPatch) -> None:
    """Asked again only once a day has passed, not after the old four hours."""
    monkeypatch.setattr(update_check_policy, "update_check_disabled", lambda home=None: False)
    app = create_app()
    app.dependency_overrides[get_current_user_id] = lambda: "version-check-reader"
    transport = ASGITransport(app=app)

    def age_cache(seconds: float) -> None:
        app.state._version_check_cache["checked_at"] -= seconds

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        monkeypatch.setattr(httpx, "AsyncClient", _FakeClient)
        _FakeClient.routes = {GITHUB: _github_release("v15.1.0")}
        await client.get("/api/system/version-check")
        _FakeClient.routes = {GITHUB: _github_release("v15.2.0")}
        age_cache(23 * 60 * 60)
        within_the_day = (await client.get("/api/system/version-check")).json()
        age_cache(60 * 60 + 1)
        next_day = (await client.get("/api/system/version-check")).json()

    assert within_the_day["latest_version"] == "15.1.0"
    assert next_day["latest_version"] == "15.2.0"
