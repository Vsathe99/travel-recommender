from fastapi import APIRouter, HTTPException, Depends
from typing import Optional, List
from models.destination import RecommendationRequest, RankedDestination
from models.trip import ItineraryRequest, BudgetRequest
from services.recommendation_engine import rank_destinations
from services.map_service import geocode_city, search_places
from services.weather_service import get_current_weather, get_forecast, get_travel_suitability
from services.image_service import get_destination_images
from services.itinerary_service import generate_itinerary
from services.budget_service import estimate_budget
from auth.jwt_handler import get_current_user
from utils.response import success_response, error_response

router = APIRouter(tags=["Travel"])


@router.post("/recommend-destination")
async def recommend_destinations(req: RecommendationRequest, current_user: dict = Depends(get_current_user)):
    try:
        # Construct highly specific location string if pieces are provided
        loc_parts = [p for p in [req.city, req.state, req.country] if p and p.strip()]
        base_loc = req.base_location
        if loc_parts:
            base_loc = {"name": ", ".join(loc_parts)}

        ranked = await rank_destinations(
            travel_type=req.travel_type,
            budget=req.budget,
            duration=req.duration,
            preferred_climate=req.preferred_climate,
            travel_companions=req.travel_companions,
            preferred_regions=req.preferred_regions,
            base_location=base_loc,
        )
        return success_response(data=ranked, message=f"Found {len(ranked)} recommended destinations")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation failed: {str(e)}")


@router.get("/destination/{city}")
async def get_destination(city: str, country: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    try:
        geo = await geocode_city(city, country_hint=country or "")
        
        lat = geo.get("coordinates", {}).get("lat") if geo else None
        lon = geo.get("coordinates", {}).get("lng") if geo else None
        
        weather = await get_current_weather(city, lat=lat, lon=lon)
        forecast = await get_forecast(city, lat=lat, lon=lon)
        images = await get_destination_images(city, count=12)
        suitability = get_travel_suitability(weather) if weather else "Unknown"

        return success_response(data={
            "city": city,
            "geocode": geo,
            "weather": weather,
            "forecast": forecast,
            "images": images,
            "travel_suitability": suitability,
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch destination data: {str(e)}")


@router.get("/attractions/{city}")
async def get_attractions(city: str, category: Optional[str] = "tourist_attraction", country: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    try:
        from services.map_service import search_places
        search_name = f"{city}, {country}" if country else city
        attractions = await search_places(search_name, category=category, limit=10)
        return success_response(data=attractions, message=f"Top attractions in {city}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch attractions: {str(e)}")


@router.get("/search-location")
async def search_location_autocomplete(query: str):
    try:
        from services.map_service import MAPBOX_BASE_URL, MAPBOX_API_KEY
        import httpx
        if not MAPBOX_API_KEY:
            return success_response(data=[])
        url = f"{MAPBOX_BASE_URL}/geocoding/v5/mapbox.places/{query}.json"
        params = {"access_token": MAPBOX_API_KEY, "types": "place,locality,region,country", "limit": 5, "autocomplete": "true"}
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()
        suggestions = []
        for feature in data.get("features", []):
            coords = feature["geometry"]["coordinates"]
            context = feature.get("context", [])
            country = next((c["text"] for c in context if c["id"].startswith("country")), "")
            region = next((c["text"] for c in context if c["id"].startswith("region")), "")
            suggestions.append({
                "name": feature["text"],
                "full_name": feature["place_name"],
                "latitude": coords[1],
                "longitude": coords[0],
                "country": country,
                "region": region,
            })
        return success_response(data=suggestions)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Location search failed: {str(e)}")


@router.get("/destination/{city}/restaurants")
async def get_restaurants(city: str, country: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    try:
        from services.map_service import search_restaurants
        search_name = f"{city}, {country}" if country else city
        restaurants = await search_restaurants(search_name, limit=10)
        return success_response(data=restaurants, message=f"Top restaurants in {city}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch restaurants: {str(e)}")


@router.get("/destination/{city}/accommodations")
async def get_accommodations(city: str, country: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    try:
        from services.map_service import search_hotels
        search_name = f"{city}, {country}" if country else city
        hotels = await search_hotels(search_name, limit=5)
        return success_response(data=hotels, message=f"Top accommodations in {city}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch accommodations: {str(e)}")


@router.get("/weather/{city}")
async def get_weather(city: str, current_user: dict = Depends(get_current_user)):
    try:
        weather = await get_current_weather(city)
        forecast = await get_forecast(city)
        suitability = get_travel_suitability(weather) if weather else "Unknown"
        return success_response(data={
            "current": weather,
            "forecast": forecast,
            "travel_suitability": suitability,
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch weather: {str(e)}")


@router.get("/images/{city}")
async def get_images(city: str, count: int = 12):
    images = await get_destination_images(city, count=count)
    return success_response(data=images)


@router.post("/generate-itinerary")
async def create_itinerary(req: ItineraryRequest, current_user: dict = Depends(get_current_user)):
    try:
        itinerary = await generate_itinerary(
            destination=req.destination,
            duration=req.duration,
            travel_type=req.travel_type,
            budget=req.budget,
            travel_companions=req.travel_companions,
        )
        return success_response(data={"destination": req.destination, "duration": req.duration, "itinerary": itinerary})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Itinerary generation failed: {str(e)}")


@router.post("/budget-estimate")
async def budget_estimate(req: BudgetRequest, current_user: dict = Depends(get_current_user)):
    try:
        breakdown = await estimate_budget(
            destination=req.destination,
            duration=req.duration,
            total_budget=req.total_budget,
            travel_companions=req.travel_companions,
            travel_style=req.travel_style,
        )
        return success_response(data=breakdown)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Budget estimation failed: {str(e)}")


@router.post("/compare-destinations")
async def compare_destinations(cities: List[str], current_user: dict = Depends(get_current_user)):
    if len(cities) < 2:
        raise HTTPException(status_code=400, detail="At least 2 destinations required for comparison")
    if len(cities) > 4:
        raise HTTPException(status_code=400, detail="Maximum 4 destinations can be compared at once")

    comparison = []
    for city in cities:
        geo = await geocode_city(city)
        weather = await get_current_weather(city)
        suitability = get_travel_suitability(weather) if weather else "Unknown"
        images = await get_destination_images(city, count=1)

        comparison.append({
            "city": city,
            "country": geo.get("country", "") if geo else "",
            "coordinates": geo.get("coordinates") if geo else None,
            "weather": {
                "temperature": weather.get("temperature") if weather else None,
                "description": weather.get("description") if weather else "N/A",
            },
            "travel_suitability": suitability,
            "thumbnail": images[0] if images else "",
        })

    return success_response(data=comparison)
