import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from bson import ObjectId


@pytest.mark.asyncio
async def test_itinerary_template_fallback():
    """Test itinerary template fallback when LLM is unavailable."""
    from services.itinerary_service import _template_itinerary
    itinerary = _template_itinerary("Tokyo", 5, ["city", "culture"])
    assert len(itinerary) == 5
    for day in itinerary:
        assert "day" in day
        assert "activities" in day
        assert len(day["activities"]) > 0


@pytest.mark.asyncio
async def test_itinerary_day_numbering():
    """Ensure days are numbered correctly."""
    from services.itinerary_service import _template_itinerary
    itinerary = _template_itinerary("Paris", 3, ["city"])
    assert [d["day"] for d in itinerary] == [1, 2, 3]
