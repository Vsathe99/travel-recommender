import json
from typing import List, Dict, Any, Optional
import logging
from services.llm_service import generate_json
from services.weather_service import get_current_weather, get_travel_suitability
from services.google_scraper.scraper import scrape_google_places


SYSTEM_PROMPT = """You are an expert travel consultant AI. 
Your job is to rank travel destinations based on user preferences.
You MUST respond with ONLY a valid JSON array, no other text."""


async def rank_destinations(
    travel_type: List[str],
    budget: float,
    duration: int,
    preferred_climate: Optional[str] = "warm",
    travel_companions: Optional[str] = "solo",
    preferred_regions: Optional[List[str]] = None,
    base_location: Optional[Dict[str, Any]] = None,
) -> List[Dict[str, Any]]:
    """Main recommendation pipeline: LLM generates destinations → Geocode & Scrape → Return."""
    
    # 1. Ask LLM to generate the absolute best matching destinations purely based on domain knowledge
    location_context = ""
    if base_location and "name" in base_location:
         location_context = f"Must be located rigidly within: {base_location['name']}"
    elif preferred_regions:
         location_context = f"Must be located within: {', '.join(preferred_regions)}"
         
    prompt = f"""User Travel Preferences:
- Travel Type: {', '.join(travel_type)}
- Total Budget: ₹{budget} for {duration} days (₹{round(budget/duration, 0)}/day)
- Preferred Climate: {preferred_climate}
- Travel Companions: {travel_companions}
- Location Constraints: {location_context or 'Any global destination'}

Generate the TOP 6 recommended destinations that perfectly match the constraints.
If the location constraint is a country (e.g., Japan), generate the 6 best specific cities/spots IN that country that match the travel type (e.g., Okinawa for beaches).

Respond ONLY with a JSON array in this exact format:
[
  {{
    "destination": "City/Spot Name",
    "country": "Country Name",
    "score": 9.4,
    "reason": "Brief reason why it's a great match focusing on food, stay, and vibe",
    "estimated_cost": 80000,
    "highlights": ["highlight1", "highlight2"]
  }}
]"""

    try:
        ranked = await generate_json(prompt, system_prompt=SYSTEM_PROMPT)
        if not isinstance(ranked, list):
            raise ValueError("LLM did not return a list")
    except Exception as e:
        print(f"⚠️  LLM ranking failed: {e}. Return empty.")
        return []

    # 2. Enrich the LLM's generated destinations with real Coordinates, Weather, and Scraped Places
    enriched = []
    
    # Needs geocode_city import from map_service
    from services.map_service import geocode_city
    from database.mongodb import get_db
    
    for item in ranked:
        dest_name = item.get("destination", "")
        country = item.get("country", "")
        search_query = f"{dest_name}, {country}" if country else dest_name
        
        # Geocode with country hint for disambiguation
        geo = await geocode_city(dest_name, country_hint=country)
        if geo and "coordinates" in geo:
             item["coordinates"] = geo["coordinates"]
             item["country"] = geo.get("country") or country
        else:
             item["coordinates"] = {"lat": 0.0, "lng": 0.0} # Fallback
             
        # Weather
        try:
             lat = item.get("coordinates", {}).get("lat")
             lon = item.get("coordinates", {}).get("lng")
             w = await get_current_weather(dest_name, lat=lat, lon=lon)
             if w:
                 item["weather_suitability"] = get_travel_suitability(w)
             else:
                 item["weather_suitability"] = "Unknown"
        except:
             item["weather_suitability"] = "Unknown"
             
        # Scrape Real Places
        try:
             item["restaurants"] = await scrape_google_places(f"restaurants in {search_query}")
             item["hotels"] = await scrape_google_places(f"hotels in {search_query}")
        except Exception as e:
             logging.error(f"Failed to scrape places for {dest_name}: {e}")
             item["restaurants"] = []
             item["hotels"] = []
             
        item["avg_cost_inr"] = item.get("estimated_cost", 0) / (duration or 1)

        # Save destination to MongoDB catalog for CF training
        try:
            db = get_db()
            if db is not None:
                existing = await db.destinations.find_one({"name": dest_name, "country": country})
                if not existing:
                    dest_doc = {
                        "name": dest_name,
                        "country": country,
                        "travel_type": travel_type,
                        "budget_tier": "budget" if budget / max(duration, 1) < 5000 else "mid" if budget / max(duration, 1) < 15000 else "luxury",
                        "climate": preferred_climate or "temperate",
                        "region": "",
                        "description": item.get("reason", ""),
                        "coordinates": item.get("coordinates"),
                        "avg_cost_per_day": item.get("avg_cost_inr", 0),
                        "highlights": item.get("highlights", []),
                    }
                    await db.destinations.insert_one(dest_doc)
                    logging.info(f"📍 Saved new destination to catalog: {dest_name}, {country}")
        except Exception as e:
            logging.warning(f"Failed to save destination to catalog: {e}")

        enriched.append(item)

    return enriched


def _rule_based_ranking(
    candidates: List[Dict], travel_type: List[str], budget: float, duration: int, weather_data: Dict
) -> List[Dict]:
    """Fallback rule-based ranking when LLM is unavailable."""
    scored = []
    daily_budget = budget / max(duration, 1)

    budget_tier = (
        "budget" if daily_budget < 100 else "mid" if daily_budget < 300 else "luxury"
    )

    budget_scores = {
        "Bali": {"budget": 9, "mid": 9, "luxury": 7},
        "Goa": {"budget": 9, "mid": 7, "luxury": 5},
        "Phuket": {"budget": 8, "mid": 9, "luxury": 7},
        "Paris": {"budget": 5, "mid": 7, "luxury": 9},
        "Tokyo": {"budget": 5, "mid": 8, "luxury": 9},
        "Maldives": {"budget": 4, "mid": 6, "luxury": 10},
    }

    for dest in candidates:
        name = dest["name"]
        base = budget_scores.get(name, {}).get(budget_tier, 7)
        w = weather_data.get(name, {})
        suitability = get_travel_suitability(w) if w else "Good"
        suit_score = {"Excellent": 1.0, "Good": 0.8, "Fair": 0.5, "Poor": 0.2}.get(suitability, 0.7)
        score = round(base * suit_score * 0.9 + 0.5, 1)
        scored.append({
            "destination": name,
            "country": dest.get("country", ""),
            "score": min(score, 10.0),
            "reason": f"Good match for {', '.join(travel_type)} travel with a {budget_tier} budget.",
            "estimated_cost": round(daily_budget * duration * 0.85, 0),
            "weather_suitability": suitability,
            "highlights": ["Great local culture", "Beautiful scenery", "Good food"],
        })

    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored[:6]
