import pytest
from unittest.mock import AsyncMock, patch


@pytest.mark.asyncio
async def test_weather_mock_fallback():
    """Test that weather service returns mock data when API key is missing."""
    from services.weather_service import get_current_weather
    with patch("services.weather_service.OPENWEATHER_API_KEY", ""):
        result = await get_current_weather("Bali")
    assert result is not None
    assert "temperature" in result
    assert result["city"] == "Bali"
    assert result.get("mock") is True


@pytest.mark.asyncio
async def test_image_placeholder_fallback():
    """Test that image service returns placeholder URLs when API key is missing."""
    from services.image_service import get_destination_images
    with patch("services.image_service.UNSPLASH_ACCESS_KEY", ""):
        images = await get_destination_images("Paris", count=3)
    assert len(images) == 3
    for img in images:
        assert "unsplash" in img.lower()


@pytest.mark.asyncio
async def test_rule_based_ranking():
    """Test the rule-based fallback ranking in recommendation engine."""
    from services.recommendation_engine import _rule_based_ranking
    candidates = [
        {"name": "Bali", "country": "Indonesia"},
        {"name": "Goa", "country": "India"},
        {"name": "Paris", "country": "France"},
    ]
    results = _rule_based_ranking(candidates, ["beach"], 1000.0, 7, {})
    assert len(results) > 0
    assert all("score" in r for r in results)
    assert results[0]["score"] >= results[-1]["score"]  # sorted descending


@pytest.mark.asyncio
async def test_budget_rule_based_fallback():
    """Test the rule-based budget estimation fallback."""
    from services.budget_service import _rule_based_budget
    result = _rule_based_budget("Goa", 7, 50000.0, 2, "mid-range")
    assert "breakdown" in result
    assert "total_budget" in result
    assert result["total_budget"] == 50000.0
    assert result["currency"] == "INR"
    assert result["num_travelers"] == 2
    breakdown = result["breakdown"]
    assert "accommodation" in breakdown
    assert "flights" in breakdown
    assert "food" in breakdown
    assert "activities" in breakdown
    assert "local_transport" in breakdown
    # Shopping and miscellaneous should NOT be present
    assert "shopping" not in breakdown
    assert "miscellaneous" not in breakdown
    # Verify realistic INR values (accommodation should be > ₹1000/night)
    assert breakdown["accommodation"]["per_night"] >= 1000
