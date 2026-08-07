"""Tests for the global search API route."""

from __future__ import annotations

from collections.abc import Generator
from datetime import UTC, datetime
from types import SimpleNamespace
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from api.database import get_db
from api.deps import get_current_user
from api.main import app
from api.models import JournalEntryModel, PhotoModel, PlaceModel, TripModel

client = TestClient(app)


class FakeScalars:
    """Fake SQLAlchemy ScalarResult."""

    def __init__(self, rows):
        self._rows = rows

    def all(self):
        """Return all rows."""
        return self._rows


class FakeResult:
    """Fake SQLAlchemy Result."""

    def __init__(self, rows):
        self._rows = rows

    def scalars(self):
        """Return fake scalar results."""
        return FakeScalars(self._rows)


class FakeDbSession:
    """Simple fake async database session."""

    async def execute(self, query):
        """Return fake query results."""
        model = query.column_descriptions[0]["type"]

        if model in {
            PlaceModel,
            TripModel,
            JournalEntryModel,
            PhotoModel,
        }:
            return FakeResult([])

        return FakeResult([])


@pytest.fixture(autouse=True)
def override_deps() -> Generator[FakeDbSession, None, None]:
    """Override application dependencies for testing."""
    session = FakeDbSession()

    async def override_db():
        yield session

    async def override_current_user():
        return SimpleNamespace(id="user-1")

    app.dependency_overrides[get_db] = override_db
    app.dependency_overrides[get_current_user] = override_current_user

    yield session

    app.dependency_overrides.clear()


def test_search_empty_query_returns_bad_request() -> None:
    """An empty search query should return HTTP 400."""
    response = client.get("/search?q=")

    assert response.status_code == 400
    assert response.json() == {
        "errors": {
            "_": ["Search query cannot be empty."],
        }
    }


def test_search_includes_photo_results() -> None:
    """Photo search results should be serialized correctly."""
    photo = SimpleNamespace(
        id="photo-1",
        place_id="place-1",
        caption="Beach sunset",
        storage_key="test-key",
        created_at=datetime(2026, 8, 7, tzinfo=UTC),
    )

    original_execute = FakeDbSession.execute

    async def photo_only_execute(self, query):
        """Return a photo only for photo queries."""
        if query.column_descriptions[0]["type"] is PhotoModel:
            return FakeResult([photo])

        return await original_execute(self, query)

    with (
        patch(
            "api.routers.search.get_file_url",
            return_value="https://example.test/test-key",
        ),
        patch.object(FakeDbSession, "execute", photo_only_execute),
    ):
        response = client.get("/search?q=beach")

    assert response.status_code == 200
    assert response.json()["photos"] == [
        {
            "id": "photo-1",
            "placeId": "place-1",
            "caption": "Beach sunset",
            "url": "https://example.test/test-key",
            "createdAt": "2026-08-07T00:00:00Z",
        }
    ]
