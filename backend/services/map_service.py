import os
import httpx
from typing import List, Dict, Any, Optional
from utils.cache import get_cached, set_cached
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(".env"))

MAPBOX_API_KEY = os.getenv("MAPBOX_API_KEY", "")
print("MAPBOX_API_KEY:", MAPBOX_API_KEY)
MAPBOX_BASE_URL = "https://api.mapbox.com"


async def geocode_city(city: str) -> Optional[Dict[str, Any]]:
    """Get coordinates and metadata for a city using Mapbox Geocoding API."""
    cache_key = f"geocode:{city.lower()}"
    cached = await get_cached(cache_key)
    if cached:
        return cached

    if not MAPBOX_API_KEY:
        return {"name": city, "coordinates": {"lat": 0.0, "lng": 0.0}, "country": ""}

    url = f"{MAPBOX_BASE_URL}/geocoding/v5/mapbox.places/{city}.json"
    params = {
        "access_token": MAPBOX_API_KEY,
        "types": "place,locality",
        "limit": 1,
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        data = response.json()

    features = data.get("features", [])
    if not features:
        return None

    feature = features[0]
    coords = feature["geometry"]["coordinates"]
    context = feature.get("context", [])
    country = next((c["text"] for c in context if c["id"].startswith("country")), "")

    result = {
        "name": feature["place_name"],
        "city": city,
        "country": country,
        "coordinates": {"lat": coords[1], "lng": coords[0]},
        "mapbox_id": feature.get("id"),
        "place_type": feature.get("place_type", []),
        "bbox": feature.get("bbox")
    }
    await set_cached(cache_key, result, 86400)
    return result


async def search_places(city: str, category: str = "tourist_attraction", limit: int = 10) -> List[Dict[str, Any]]:
    """Search for nearby places/attractions using Mapbox Search API."""
    cache_key = f"places:{city.lower()}:{category}"
    cached = await get_cached(cache_key)
    if cached:
        return cached

    # First geocode the city center
    geo = await geocode_city(city)
    if not geo:
        return []

    coords = geo["coordinates"]
    proximity = f"{coords['lng']},{coords['lat']}"

    if not MAPBOX_API_KEY:
        return _mock_attractions(city, category, limit)

    url = f"{MAPBOX_BASE_URL}/geocoding/v5/mapbox.places/{category}.json"
    params = {
        "access_token": MAPBOX_API_KEY,
        "proximity": proximity,
        "limit": limit,
        "types": "poi",
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        data = response.json()

    attractions = []
    for feature in data.get("features", []):
        coords_feat = feature["geometry"]["coordinates"]
        props = feature.get("properties", {})
        attractions.append({
            "name": feature.get("text", ""),
            "full_name": feature.get("place_name", ""),
            "category": props.get("category", category),
            "coordinates": {"lat": coords_feat[1], "lng": coords_feat[0]},
            "maki": props.get("maki", ""),
        })

    await set_cached(cache_key, attractions, 3600 * 6)
    return attractions


async def search_restaurants(city: str, limit: int = 10) -> List[Dict[str, Any]]:
    """Search for top restaurants and food spots using Mapbox."""
    return await search_places(city, category="restaurant,cafe,food", limit=limit)


async def search_hotels(city: str, limit: int = 5) -> List[Dict[str, Any]]:
    """Search for top accommodations and hotels using Mapbox."""
    return await search_places(city, category="hotel,hostel,lodging", limit=limit)


async def search_nearby_destinations(lat: float, lng: float, radius_km: int = 200, limit: int = 12) -> List[Dict[str, Any]]:
    """Find candidate destinations (places/cities) near a given coordinate using bounding box."""
    cache_key = f"nearby_dest:{lat}:{lng}:{radius_km}"
    cached = await get_cached(cache_key)
    if cached:
        return cached

    if not MAPBOX_API_KEY:
        return []

    # rough bounding box calc: 1 deg ~ 111km
    delta_deg = radius_km / 111.0
    min_lng, min_lat = lng - delta_deg, lat - delta_deg
    max_lng, max_lat = lng + delta_deg, lat + delta_deg
    bbox = f"{min_lng},{min_lat},{max_lng},{max_lat}"

    url = f"{MAPBOX_BASE_URL}/geocoding/v5/mapbox.places/place.json"
    params = {
        "access_token": MAPBOX_API_KEY,
        "bbox": bbox,
        "types": "place",
        "limit": limit,
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        data = response.json()

    candidates = []
    for feature in data.get("features", []):
        coords_feat = feature["geometry"]["coordinates"]
        context = feature.get("context", [])
        country = next((c["text"] for c in context if c["id"].startswith("country")), "")
        candidates.append({
            "name": feature.get("text"),
            "full_name": feature.get("place_name"),
            "country": country,
            "coordinates": {"lat": coords_feat[1], "lng": coords_feat[0]},
        })

    await set_cached(cache_key, candidates, 86400 * 7)
    return candidates




def _mock_attractions(city: str, category: str, limit: int) -> List[Dict[str, Any]]:
    return [
        {"name": f"{category.replace('_', ' ').title()} in {city}", "category": category,
         "coordinates": {"lat": 0.0, "lng": 0.0}}
        for i in range(min(limit, 5))
    ]
