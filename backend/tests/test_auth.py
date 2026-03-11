import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from unittest.mock import AsyncMock, patch, MagicMock

# We need to patch database before importing app
@pytest.fixture(autouse=True)
def mock_db(monkeypatch):
    """Mock MongoDB for unit tests."""
    mock_users = MagicMock()
    mock_users.find_one = AsyncMock(return_value=None)
    mock_users.insert_one = AsyncMock(return_value=MagicMock(inserted_id="507f1f77bcf86cd799439011"))
    mock_users.create_index = AsyncMock()
    mock_users.update_one = AsyncMock(return_value=MagicMock(matched_count=1))

    mock_trips = MagicMock()
    mock_trips.create_index = AsyncMock()

    mock_destinations = MagicMock()
    mock_destinations.create_index = AsyncMock()

    mock_database = MagicMock()
    mock_database.users = mock_users
    mock_database.trips = mock_trips
    mock_database.destinations = mock_destinations

    import database.mongodb as db_module
    monkeypatch.setattr(db_module, "db", mock_database)
    monkeypatch.setattr(db_module, "connect_db", AsyncMock())
    monkeypatch.setattr(db_module, "close_db", AsyncMock())
    return mock_database


@pytest.fixture
async def client(mock_db):
    from main import app
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac


@pytest.mark.asyncio
async def test_root_endpoint(client):
    response = await client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Smart Travel Recommendation System"


@pytest.mark.asyncio
async def test_health_endpoint(client):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


@pytest.mark.asyncio
async def test_register_new_user(client, mock_db):
    mock_db.users.find_one = AsyncMock(return_value=None)
    response = await client.post("/auth/register", json={
        "name": "Test User",
        "email": "test@example.com",
        "password": "password123"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert "token" in data["data"]


@pytest.mark.asyncio
async def test_register_duplicate_email(client, mock_db):
    mock_db.users.find_one = AsyncMock(return_value={"email": "existing@example.com"})
    response = await client.post("/auth/register", json={
        "name": "Test User",
        "email": "existing@example.com",
        "password": "password123"
    })
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_login_invalid_credentials(client, mock_db):
    mock_db.users.find_one = AsyncMock(return_value=None)
    response = await client.post("/auth/login", json={
        "email": "notexist@example.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 401
