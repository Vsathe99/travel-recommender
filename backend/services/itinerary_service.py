from typing import List, Optional, Dict, Any
from services.llm_service import generate_json, generate_text
from services.google_scraper.scraper import scrape_google_places


ITINERARY_SYSTEM = """You are an expert travel planner. 
Create detailed, practical, and exciting day-by-day itineraries.
Always respond with valid JSON only."""


async def generate_itinerary(
    destination: str,
    duration: int,
    travel_type: Optional[List[str]] = None,
    budget: Optional[float] = None,
    travel_companions: Optional[str] = "solo",
) -> List[Dict[str, Any]]:
    """Generate an LLM-powered day-wise travel itinerary."""

    travel_type_str = ", ".join(travel_type) if travel_type else "general sightseeing"
    budget_info = f"Total budget: ₹{budget}" if budget else "Flexible budget"

    try:
        restaurants = await scrape_google_places(f"restaurants near {destination}")
        hotels = await scrape_google_places(f"hotels near {destination}")
        places_context = (
            f"\nAvailable Top Restaurants: {', '.join([r['name'] for r in restaurants])}\n"
            f"Available Top Hotels: {', '.join([h['name'] for h in hotels])}"
        )
    except Exception:
        places_context = ""

    prompt = f"""Create a detailed {duration}-day travel itinerary for {destination}.

Trip Details:
- Travel Type: {travel_type_str}
- {budget_info}
- Travel Companions: {travel_companions}
- Duration: {duration} days
{places_context}

CRITICAL REQUIREMENT:
You MUST specify exact tourist attractions, exact local food stops and restaurants for meals, and explicitly name accommodation suggestions.
For food and accommodation, prioritize utilizing the Available Top Restaurants and Top Hotels provided in the prompt.

Return a JSON array with one object per day in this exact format:
[
  {{
    "day": 1,
    "title": "Arrival & First Impressions",
    "theme": "Exploration",
    "activities": [
      "Morning: Arrive and check into hotel, freshen up",
      "Afternoon: Visit the city center and main landmark",
      "Evening: Dinner at a local restaurant, explore night market"
    ],
    "meals": {{
      "breakfast": "Hotel breakfast or local café",
      "lunch": "Street food near the main attraction",
      "dinner": "Traditional local restaurant"
    }},
    "accommodation": "Mid-range hotel in city center",
    "estimated_cost": 120,
    "tips": "Book airport transfer in advance to save time"
  }}
]

Make activities specific, practical, and exciting. Include real attraction names, street food spots, and specific hotel names."""

    try:
        itinerary = await generate_json(prompt, system_prompt=ITINERARY_SYSTEM)
        if isinstance(itinerary, list):
            return itinerary
        raise ValueError("Not a list")
    except Exception as e:
        print(f"⚠️  Itinerary generation failed: {e}. Using template fallback.")
        return _template_itinerary(destination, duration, travel_type or [])


def _template_itinerary(destination: str, duration: int, travel_type: List[str]) -> List[Dict]:
    themes = [
        ("Arrival & Orientation", "Getting settled and first impressions"),
        ("Main Attractions", "Iconic landmarks and must-see spots"),
        ("Local Culture", "Authentic experiences and hidden gems"),
        ("Adventure & Activities", "Outdoor adventures and unique experiences"),
        ("Shopping & Relaxation", "Markets, souvenirs, and unwinding"),
        ("Day Trips", "Exploring nearby areas"),
        ("Final Day & Departure", "Last moments and return"),
    ]

    activities_map = {
        "beach": ["Morning beach walk at sunrise", "Snorkeling or swimming", "Beachfront lunch", "Sunset cruise"],
        "culture": ["Museum visit", "Historical site tour", "Cultural performance", "Local cooking class"],
        "adventure": ["Hiking or trekking", "Water sports", "Rock climbing", "Paragliding"],
        "city": ["City walking tour", "Shopping district visit", "Rooftop bar", "Night food tour"],
    }

    base_activities = []
    for t in travel_type:
        base_activities.extend(activities_map.get(t, activities_map["city"]))

    if not base_activities:
        base_activities = activities_map["city"]

    return [
        {
            "day": i + 1,
            "title": themes[i % len(themes)][0],
            "theme": themes[i % len(themes)][1],
            "activities": [
                f"Morning: {base_activities[i % len(base_activities)]}",
                f"Afternoon: Explore local area around {destination}",
                f"Evening: Dinner and relaxation",
            ],
            "meals": {
                "breakfast": "Local café",
                "lunch": "Restaurant near attraction",
                "dinner": "Traditional local cuisine",
            },
            "accommodation": f"Hotel in {destination}",
            "estimated_cost": 100 + (i * 10),
            "tips": f"Day {i+1} tip: Book popular spots early.",
        }
        for i in range(duration)
    ]
