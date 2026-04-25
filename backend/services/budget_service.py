from typing import Dict, Any, Optional
from services.llm_service import generate_json


BUDGET_SYSTEM = """You are an expert Indian travel financial planner who knows REAL prices in Indian Rupees (INR/₹).
You MUST provide realistic, current market-rate budget breakdowns for travel destinations.

CRITICAL PRICING RULES (all prices in ₹ INR):
- Accommodation per night:
  • Budget: ₹800–₹1,500 (hostels, homestays, guesthouses)
  • Mid-range: ₹2,000–₹5,000 (3-star hotels, Airbnb, OYO)
  • Luxury: ₹8,000–₹25,000 (4-5 star hotels, resorts)
- Flights/Travel (round-trip domestic):
  • Budget: ₹4,000–₹8,000 (Indigo, SpiceJet advance booking)
  • Mid-range: ₹8,000–₹15,000 (flexible dates, Vistara/Air India)
  • Luxury: ₹15,000–₹35,000 (business class, premium carriers)
  • Train alternatives: ₹500–₹3,000 (Sleeper to AC 1st class)
  • International flights from India: ₹15,000–₹80,000+ depending on destination
- Food per person per day:
  • Budget: ₹500–₹800 (street food, dhabas, local eateries)
  • Mid-range: ₹1,000–₹2,000 (restaurants, cafes, mix of options)
  • Luxury: ₹3,000–₹6,000 (fine dining, hotel restaurants)
- Activities per person per day:
  • ₹2,000–₹5,000 (entry fees, guided tours, adventure sports, water sports)
  • Popular examples: Temple entry ₹50–₹500, Museum ₹100–₹500, Scuba diving ₹3,000–₹6,000, Trekking ₹1,500–₹4,000
- Local Transport per day:
  • Budget: ₹200–₹500 (public buses, shared autos, walking)
  • Mid-range: ₹500–₹1,200 (auto-rickshaws, Ola/Uber, rental scooter ₹300–₹500/day)
  • Luxury: ₹2,000–₹5,000 (private cabs, chauffeur-driven cars)

NEVER use USD or dollar-based pricing. All amounts must be realistic Indian market rates.
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
- Duration: {duration} days ({duration - 1} nights)
- Total Budget: ₹{total_budget:,.0f}
- Travelers: {travel_companions} ({num_travelers} person(s))
- Per Person Budget: ₹{round(per_person_budget, 2):,.0f}
- Daily Budget Per Person: ₹{round(daily_budget, 2):,.0f}
- Travel Style: {travel_style}

IMPORTANT: All prices MUST be in Indian Rupees (₹ INR) with REALISTIC current market rates.
Use actual Indian travel prices — NOT converted dollar amounts.
For accommodation, use real hotel/hostel rates from sites like MakeMyTrip, Booking.com, OYO.
For flights, use real airfare rates from sites like MakeMyTrip, Goibibo, Skyscanner for Indian routes.
For activities, estimate ₹2,000–₹5,000 per person per day based on the destination's popular attractions.

Categories to include: accommodation, flights, food, activities, local_transport (ONLY these 5, no shopping or miscellaneous).

Respond with this exact JSON format:
{{
  "total_budget": {total_budget},
  "currency": "INR",
  "duration_days": {duration},
  "num_travelers": {num_travelers},
  "per_person_budget": {round(per_person_budget, 2)},
  "breakdown": {{
    "accommodation": {{
      "total": <realistic total for {duration - 1} nights>,
      "per_night": <realistic per night rate in INR>,
      "details": "Specific hotel/stay type with realistic INR rate"
    }},
    "flights": {{
      "total": <realistic round-trip fare for {num_travelers} persons>,
      "details": "Specific airline/transport mode with realistic INR fare"
    }},
    "food": {{
      "total": <realistic total for {duration} days for {num_travelers} persons>,
      "per_day_per_person": <realistic daily food cost per person>,
      "details": "Meal breakdown with realistic INR prices"
    }},
    "activities": {{
      "total": <realistic total, ₹2000-5000 per person per day>,
      "details": "Specific activities at {destination} with real entry fees/costs"
    }},
    "local_transport": {{
      "total": <realistic transport cost for {duration} days>,
      "details": "Specific transport modes with realistic INR rates"
    }}
  }},
  "savings_tips": [
    "Specific tip 1 for {destination}",
    "Specific tip 2 for {destination}",
    "Specific tip 3 for {destination}"
  ],
  "is_feasible": true,
  "feasibility_note": "Detailed note about budget feasibility with total estimated cost"
}}"""

    try:
        result = await generate_json(prompt, system_prompt=BUDGET_SYSTEM)
        # Strip out shopping/miscellaneous if LLM still includes them
        if "breakdown" in result:
            result["breakdown"].pop("shopping", None)
            result["breakdown"].pop("miscellaneous", None)
        return result
    except Exception as e:
        print(f"⚠️  Budget generation failed: {e}. Using rule-based fallback.")
        return _rule_based_budget(destination, duration, total_budget, num_travelers, travel_style)


# ── Realistic INR cost tables per night / per day / per person ──────────────

# Accommodation per night (for 1 room)
_ACCOM_PER_NIGHT = {
    "budget": 1200,      # Hostels, homestays, guesthouses
    "mid-range": 3500,   # 3-star hotels, OYO, Airbnb
    "luxury": 12000,     # 4-5 star hotels, resorts
}

# Round-trip flights/travel per person (domestic avg)
_FLIGHTS_PER_PERSON = {
    "budget": 5000,      # Advance booking, low-cost carriers
    "mid-range": 10000,  # Flexible dates, premium economy
    "luxury": 22000,     # Business class, premium carriers
}

# Food per person per day
_FOOD_PER_DAY = {
    "budget": 600,       # Street food, dhabas, local eateries
    "mid-range": 1500,   # Mix of restaurants and cafes
    "luxury": 4000,      # Fine dining, hotel restaurants
}

# Activities per person per day
_ACTIVITIES_PER_DAY = {
    "budget": 2000,      # Entry fees, basic tours
    "mid-range": 3500,   # Guided tours, adventure sports
    "luxury": 5000,      # Premium experiences, private tours
}

# Local transport per day (for group)
_TRANSPORT_PER_DAY = {
    "budget": 300,       # Public buses, shared autos, walking
    "mid-range": 800,    # Auto-rickshaws, Ola/Uber, scooter rental
    "luxury": 3000,      # Private cabs, chauffeur-driven
}


def _rule_based_budget(
    destination: str, duration: int, total: float, num_travelers: int, style: str
) -> Dict[str, Any]:
    """Fallback rule-based budget estimation with realistic INR prices."""
    nights = max(duration - 1, 1)
    per_person = total / num_travelers

    accom_per_night = _ACCOM_PER_NIGHT.get(style, 3500)
    accommodation = round(nights * accom_per_night, 2)

    flight_per_person = _FLIGHTS_PER_PERSON.get(style, 10000)
    flights = round(flight_per_person * num_travelers, 2)

    food_per_day = _FOOD_PER_DAY.get(style, 1500)
    food = round(duration * food_per_day * num_travelers, 2)

    activity_per_day = _ACTIVITIES_PER_DAY.get(style, 3500)
    activities = round(duration * activity_per_day * num_travelers, 2)

    transport_per_day = _TRANSPORT_PER_DAY.get(style, 800)
    transport = round(duration * transport_per_day, 2)

    calculated_total = accommodation + flights + food + activities + transport

    style_labels = {
        "budget": {
            "accommodation": f"Budget homestay/guesthouse (₹{accom_per_night:,}/night)",
            "flights": f"Advance-booked economy flight (₹{flight_per_person:,}/person round-trip)",
            "food": f"Street food & local eateries (₹{food_per_day:,}/person/day)",
            "activities": f"Sightseeing, entry fees & local tours (₹{activity_per_day:,}/person/day)",
            "transport": f"Public transport & shared autos (₹{transport_per_day:,}/day)",
        },
        "mid-range": {
            "accommodation": f"3-star hotel / OYO (₹{accom_per_night:,}/night)",
            "flights": f"Economy flight (₹{flight_per_person:,}/person round-trip)",
            "food": f"Restaurants & cafes (₹{food_per_day:,}/person/day)",
            "activities": f"Guided tours, adventure & sightseeing (₹{activity_per_day:,}/person/day)",
            "transport": f"Ola/Uber & auto-rickshaws (₹{transport_per_day:,}/day)",
        },
        "luxury": {
            "accommodation": f"4-5 star hotel / resort (₹{accom_per_night:,}/night)",
            "flights": f"Premium/business class flight (₹{flight_per_person:,}/person round-trip)",
            "food": f"Fine dining & hotel restaurants (₹{food_per_day:,}/person/day)",
            "activities": f"Premium tours & private experiences (₹{activity_per_day:,}/person/day)",
            "transport": f"Private cab / chauffeur-driven (₹{transport_per_day:,}/day)",
        },
    }
    labels = style_labels.get(style, style_labels["mid-range"])

    return {
        "total_budget": total,
        "currency": "INR",
        "duration_days": duration,
        "num_travelers": num_travelers,
        "per_person_budget": round(per_person, 2),
        "breakdown": {
            "accommodation": {
                "total": accommodation,
                "per_night": accom_per_night,
                "details": labels["accommodation"],
            },
            "flights": {
                "total": flights,
                "details": labels["flights"],
            },
            "food": {
                "total": food,
                "per_day_per_person": food_per_day,
                "details": labels["food"],
            },
            "activities": {
                "total": activities,
                "details": labels["activities"],
            },
            "local_transport": {
                "total": transport,
                "details": labels["transport"],
            },
        },
        "savings_tips": [
            f"Book flights to {destination} 2-3 weeks in advance on MakeMyTrip/Goibibo for best fares",
            "Eat at local dhabas and street food stalls away from tourist areas to save 50-70%",
            "Use public transport or rent a scooter (₹300-500/day) instead of taxis",
        ],
        "is_feasible": calculated_total <= total * 1.15,
        "feasibility_note": (
            f"Estimated trip cost is ₹{round(calculated_total):,}. "
            + ("Your budget of ₹{:,} is sufficient.".format(round(total)) if calculated_total <= total
               else "Consider increasing your budget to ₹{:,} for a comfortable trip.".format(round(calculated_total)))
        ),
    }
