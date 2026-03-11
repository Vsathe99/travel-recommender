from typing import Dict, Any, Optional
from services.llm_service import generate_json


BUDGET_SYSTEM = """You are an expert travel financial planner.
Provide realistic, itemized budget breakdowns for travel destinations.
Respond with valid JSON only."""


async def estimate_budget(
    destination: str,
    duration: int,
    total_budget: float,
    travel_companions: Optional[str] = "solo",
    travel_style: Optional[str] = "mid-range",
) -> Dict[str, Any]:
    """Generate an LLM-powered budget breakdown for a trip."""

    num_travelers = {"solo": 1, "couple": 2, "family": 4, "friends": 3}.get(travel_companions, 1)
    per_person_budget = total_budget / num_travelers
    daily_budget = per_person_budget / max(duration, 1)

    prompt = f"""Create a detailed budget breakdown for the following trip:

Trip Details:
- Destination: {destination}
- Duration: {duration} days
- Total Budget: ₹{total_budget}
- Travelers: {travel_companions} ({num_travelers} person(s))
- Per Person Budget: ₹{round(per_person_budget, 2)}
- Daily Budget Per Person: ₹{round(daily_budget, 2)}
- Travel Style: {travel_style}

Provide a REALISTIC itemized budget breakdown. Consider local prices in {destination}.

Respond with this exact JSON format:
{{
  "total_budget": {total_budget},
  "currency": "INR",
  "duration_days": {duration},
  "num_travelers": {num_travelers},
  "per_person_budget": {round(per_person_budget, 2)},
  "breakdown": {{
    "accommodation": {{
      "total": 0,
      "per_night": 0,
      "details": "Type of accommodation"
    }},
    "flights": {{
      "total": 0,
      "details": "Flight estimates"
    }},
    "food": {{
      "total": 0,
      "per_day_per_person": 0,
      "details": "Meal breakdown"
    }},
    "activities": {{
      "total": 0,
      "details": "Activities and entrance fees"
    }},
    "local_transport": {{
      "total": 0,
      "details": "Taxis, public transit, rentals"
    }},
    "shopping": {{
      "total": 0,
      "details": "Souvenirs and shopping"
    }},
    "miscellaneous": {{
      "total": 0,
      "details": "Tips, emergencies, insurance"
    }}
  }},
  "savings_tips": [
    "Tip 1",
    "Tip 2",
    "Tip 3"
  ],
  "is_feasible": true,
  "feasibility_note": "Note about whether the budget is realistic"
}}"""

    try:
        result = await generate_json(prompt, system_prompt=BUDGET_SYSTEM)
        return result
    except Exception as e:
        print(f"⚠️  Budget generation failed: {e}. Using rule-based fallback.")
        return _rule_based_budget(destination, duration, total_budget, num_travelers, travel_style)


def _rule_based_budget(
    destination: str, duration: int, total: float, num_travelers: int, style: str
) -> Dict[str, Any]:
    """Fallback rule-based budget estimation."""
    cost_multiplier = {"budget": 0.6, "mid-range": 1.0, "luxury": 2.2}.get(style, 1.0)
    per_person = total / num_travelers

    accommodation = round(duration * 5000 * cost_multiplier, 2)
    food = round(duration * 2000 * cost_multiplier * num_travelers, 2)
    activities = round(duration * 1500 * cost_multiplier * num_travelers, 2)
    transport = round(duration * 1000 * cost_multiplier * num_travelers, 2)
    flights = round(15000 * cost_multiplier * num_travelers, 2)
    shopping = round(per_person * 0.1, 2)
    misc = round(per_person * 0.05, 2)
    calculated_total = accommodation + food + activities + transport + flights + shopping + misc

    return {
        "total_budget": total,
        "currency": "INR",
        "duration_days": duration,
        "num_travelers": num_travelers,
        "per_person_budget": round(per_person, 2),
        "breakdown": {
            "accommodation": {"total": accommodation, "per_night": round(accommodation / duration, 2), "details": f"{style.title()} hotel/hostel"},
            "flights": {"total": flights, "details": "Round-trip flight estimate"},
            "food": {"total": food, "per_day_per_person": round(food / duration / num_travelers, 2), "details": "Meals at local restaurants"},
            "activities": {"total": activities, "details": "Entrance fees, tours, excursions"},
            "local_transport": {"total": transport, "details": "Taxis, buses, metro"},
            "shopping": {"total": shopping, "details": "Souvenirs and personal shopping"},
            "miscellaneous": {"total": misc, "details": "Tips, insurance, emergencies"},
        },
        "savings_tips": [
            "Book accommodation and flights early for best rates",
            "Eat at local restaurants away from tourist areas",
            "Use public transport instead of taxis",
        ],
        "is_feasible": calculated_total <= total * 1.2,
        "feasibility_note": (
            f"Estimated trip cost is ₹{round(calculated_total, 0)}. "
            + ("Budget is sufficient." if calculated_total <= total else "Consider increasing budget.")
        ),
    }
