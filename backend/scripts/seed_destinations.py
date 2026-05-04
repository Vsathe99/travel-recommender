"""
Seed ~150 popular global destinations into MongoDB for CF model training.
Run:  python -m scripts.seed_destinations
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "travel_recommendation")

# ── Destination catalog ──────────────────────────────────────────────────────
DESTINATIONS = [
    # ── South Asia ──
    {"name": "Goa", "country": "India", "travel_type": ["beach", "culture"], "budget_tier": "budget", "climate": "tropical", "region": "South Asia"},
    {"name": "Manali", "country": "India", "travel_type": ["mountain", "adventure"], "budget_tier": "budget", "climate": "cold", "region": "South Asia"},
    {"name": "Jaipur", "country": "India", "travel_type": ["culture", "city"], "budget_tier": "budget", "climate": "arid", "region": "South Asia"},
    {"name": "Kerala", "country": "India", "travel_type": ["beach", "culture", "wildlife"], "budget_tier": "budget", "climate": "tropical", "region": "South Asia"},
    {"name": "Udaipur", "country": "India", "travel_type": ["culture", "city"], "budget_tier": "mid", "climate": "arid", "region": "South Asia"},
    {"name": "Rishikesh", "country": "India", "travel_type": ["adventure", "culture"], "budget_tier": "budget", "climate": "temperate", "region": "South Asia"},
    {"name": "Leh Ladakh", "country": "India", "travel_type": ["mountain", "adventure"], "budget_tier": "mid", "climate": "cold", "region": "South Asia"},
    {"name": "Andaman Islands", "country": "India", "travel_type": ["beach", "adventure"], "budget_tier": "mid", "climate": "tropical", "region": "South Asia"},
    {"name": "Varanasi", "country": "India", "travel_type": ["culture"], "budget_tier": "budget", "climate": "temperate", "region": "South Asia"},
    {"name": "Shimla", "country": "India", "travel_type": ["mountain", "city"], "budget_tier": "budget", "climate": "cold", "region": "South Asia"},
    {"name": "Darjeeling", "country": "India", "travel_type": ["mountain", "culture"], "budget_tier": "budget", "climate": "cold", "region": "South Asia"},
    {"name": "Colombo", "country": "Sri Lanka", "travel_type": ["city", "beach", "culture"], "budget_tier": "budget", "climate": "tropical", "region": "South Asia"},
    {"name": "Kathmandu", "country": "Nepal", "travel_type": ["culture", "mountain", "adventure"], "budget_tier": "budget", "climate": "temperate", "region": "South Asia"},
    {"name": "Maldives", "country": "Maldives", "travel_type": ["beach"], "budget_tier": "luxury", "climate": "tropical", "region": "South Asia"},
    {"name": "Bhutan", "country": "Bhutan", "travel_type": ["culture", "mountain"], "budget_tier": "mid", "climate": "cold", "region": "South Asia"},
    {"name": "Ooty", "country": "India", "travel_type": ["mountain", "wildlife"], "budget_tier": "budget", "climate": "temperate", "region": "South Asia"},
    {"name": "Coorg", "country": "India", "travel_type": ["mountain", "wildlife"], "budget_tier": "budget", "climate": "temperate", "region": "South Asia"},
    {"name": "Hampi", "country": "India", "travel_type": ["culture", "adventure"], "budget_tier": "budget", "climate": "arid", "region": "South Asia"},

    # ── Southeast Asia ──
    {"name": "Bali", "country": "Indonesia", "travel_type": ["beach", "culture", "adventure"], "budget_tier": "mid", "climate": "tropical", "region": "Southeast Asia"},
    {"name": "Phuket", "country": "Thailand", "travel_type": ["beach"], "budget_tier": "mid", "climate": "tropical", "region": "Southeast Asia"},
    {"name": "Bangkok", "country": "Thailand", "travel_type": ["city", "culture"], "budget_tier": "budget", "climate": "tropical", "region": "Southeast Asia"},
    {"name": "Chiang Mai", "country": "Thailand", "travel_type": ["culture", "mountain"], "budget_tier": "budget", "climate": "tropical", "region": "Southeast Asia"},
    {"name": "Hanoi", "country": "Vietnam", "travel_type": ["city", "culture"], "budget_tier": "budget", "climate": "tropical", "region": "Southeast Asia"},
    {"name": "Ho Chi Minh City", "country": "Vietnam", "travel_type": ["city", "culture"], "budget_tier": "budget", "climate": "tropical", "region": "Southeast Asia"},
    {"name": "Ha Long Bay", "country": "Vietnam", "travel_type": ["beach", "adventure"], "budget_tier": "mid", "climate": "tropical", "region": "Southeast Asia"},
    {"name": "Siem Reap", "country": "Cambodia", "travel_type": ["culture", "adventure"], "budget_tier": "budget", "climate": "tropical", "region": "Southeast Asia"},
    {"name": "Luang Prabang", "country": "Laos", "travel_type": ["culture", "mountain"], "budget_tier": "budget", "climate": "tropical", "region": "Southeast Asia"},
    {"name": "Singapore", "country": "Singapore", "travel_type": ["city"], "budget_tier": "luxury", "climate": "tropical", "region": "Southeast Asia"},
    {"name": "Kuala Lumpur", "country": "Malaysia", "travel_type": ["city", "culture"], "budget_tier": "mid", "climate": "tropical", "region": "Southeast Asia"},
    {"name": "Langkawi", "country": "Malaysia", "travel_type": ["beach", "adventure"], "budget_tier": "mid", "climate": "tropical", "region": "Southeast Asia"},
    {"name": "Boracay", "country": "Philippines", "travel_type": ["beach"], "budget_tier": "mid", "climate": "tropical", "region": "Southeast Asia"},
    {"name": "Palawan", "country": "Philippines", "travel_type": ["beach", "adventure", "wildlife"], "budget_tier": "mid", "climate": "tropical", "region": "Southeast Asia"},

    # ── East Asia ──
    {"name": "Tokyo", "country": "Japan", "travel_type": ["city", "culture"], "budget_tier": "luxury", "climate": "temperate", "region": "East Asia"},
    {"name": "Kyoto", "country": "Japan", "travel_type": ["culture"], "budget_tier": "luxury", "climate": "temperate", "region": "East Asia"},
    {"name": "Osaka", "country": "Japan", "travel_type": ["city", "culture"], "budget_tier": "luxury", "climate": "temperate", "region": "East Asia"},
    {"name": "Seoul", "country": "South Korea", "travel_type": ["city", "culture"], "budget_tier": "mid", "climate": "temperate", "region": "East Asia"},
    {"name": "Beijing", "country": "China", "travel_type": ["city", "culture"], "budget_tier": "mid", "climate": "temperate", "region": "East Asia"},
    {"name": "Shanghai", "country": "China", "travel_type": ["city"], "budget_tier": "mid", "climate": "temperate", "region": "East Asia"},
    {"name": "Hong Kong", "country": "China", "travel_type": ["city", "culture"], "budget_tier": "luxury", "climate": "tropical", "region": "East Asia"},
    {"name": "Taipei", "country": "Taiwan", "travel_type": ["city", "culture"], "budget_tier": "mid", "climate": "tropical", "region": "East Asia"},

    # ── Europe ──
    {"name": "Paris", "country": "France", "travel_type": ["city", "culture"], "budget_tier": "luxury", "climate": "temperate", "region": "Europe"},
    {"name": "London", "country": "United Kingdom", "travel_type": ["city", "culture"], "budget_tier": "luxury", "climate": "temperate", "region": "Europe"},
    {"name": "Rome", "country": "Italy", "travel_type": ["city", "culture"], "budget_tier": "mid", "climate": "mediterranean", "region": "Europe"},
    {"name": "Florence", "country": "Italy", "travel_type": ["culture", "city"], "budget_tier": "mid", "climate": "mediterranean", "region": "Europe"},
    {"name": "Venice", "country": "Italy", "travel_type": ["culture", "city"], "budget_tier": "luxury", "climate": "mediterranean", "region": "Europe"},
    {"name": "Amalfi Coast", "country": "Italy", "travel_type": ["beach", "culture"], "budget_tier": "luxury", "climate": "mediterranean", "region": "Europe"},
    {"name": "Barcelona", "country": "Spain", "travel_type": ["city", "beach", "culture"], "budget_tier": "mid", "climate": "mediterranean", "region": "Europe"},
    {"name": "Madrid", "country": "Spain", "travel_type": ["city", "culture"], "budget_tier": "mid", "climate": "mediterranean", "region": "Europe"},
    {"name": "Ibiza", "country": "Spain", "travel_type": ["beach"], "budget_tier": "luxury", "climate": "mediterranean", "region": "Europe"},
    {"name": "Lisbon", "country": "Portugal", "travel_type": ["city", "culture", "beach"], "budget_tier": "mid", "climate": "mediterranean", "region": "Europe"},
    {"name": "Amsterdam", "country": "Netherlands", "travel_type": ["city", "culture"], "budget_tier": "mid", "climate": "temperate", "region": "Europe"},
    {"name": "Berlin", "country": "Germany", "travel_type": ["city", "culture"], "budget_tier": "mid", "climate": "temperate", "region": "Europe"},
    {"name": "Munich", "country": "Germany", "travel_type": ["city", "culture"], "budget_tier": "mid", "climate": "temperate", "region": "Europe"},
    {"name": "Vienna", "country": "Austria", "travel_type": ["city", "culture"], "budget_tier": "mid", "climate": "temperate", "region": "Europe"},
    {"name": "Prague", "country": "Czech Republic", "travel_type": ["city", "culture"], "budget_tier": "budget", "climate": "temperate", "region": "Europe"},
    {"name": "Budapest", "country": "Hungary", "travel_type": ["city", "culture"], "budget_tier": "budget", "climate": "temperate", "region": "Europe"},
    {"name": "Dubrovnik", "country": "Croatia", "travel_type": ["beach", "culture"], "budget_tier": "mid", "climate": "mediterranean", "region": "Europe"},
    {"name": "Santorini", "country": "Greece", "travel_type": ["beach", "culture"], "budget_tier": "luxury", "climate": "mediterranean", "region": "Europe"},
    {"name": "Athens", "country": "Greece", "travel_type": ["city", "culture"], "budget_tier": "mid", "climate": "mediterranean", "region": "Europe"},
    {"name": "Istanbul", "country": "Turkey", "travel_type": ["city", "culture"], "budget_tier": "mid", "climate": "mediterranean", "region": "Europe"},
    {"name": "Cappadocia", "country": "Turkey", "travel_type": ["adventure", "culture"], "budget_tier": "mid", "climate": "arid", "region": "Europe"},
    {"name": "Zurich", "country": "Switzerland", "travel_type": ["city", "mountain"], "budget_tier": "luxury", "climate": "cold", "region": "Europe"},
    {"name": "Interlaken", "country": "Switzerland", "travel_type": ["mountain", "adventure"], "budget_tier": "luxury", "climate": "cold", "region": "Europe"},
    {"name": "Reykjavik", "country": "Iceland", "travel_type": ["adventure", "culture"], "budget_tier": "luxury", "climate": "cold", "region": "Europe"},
    {"name": "Edinburgh", "country": "United Kingdom", "travel_type": ["city", "culture"], "budget_tier": "mid", "climate": "cold", "region": "Europe"},
    {"name": "Copenhagen", "country": "Denmark", "travel_type": ["city", "culture"], "budget_tier": "luxury", "climate": "cold", "region": "Europe"},
    {"name": "Stockholm", "country": "Sweden", "travel_type": ["city", "culture"], "budget_tier": "luxury", "climate": "cold", "region": "Europe"},
    {"name": "Norwegian Fjords", "country": "Norway", "travel_type": ["adventure", "mountain"], "budget_tier": "luxury", "climate": "cold", "region": "Europe"},
    {"name": "Cinque Terre", "country": "Italy", "travel_type": ["beach", "culture"], "budget_tier": "mid", "climate": "mediterranean", "region": "Europe"},
    {"name": "Nice", "country": "France", "travel_type": ["beach", "city"], "budget_tier": "luxury", "climate": "mediterranean", "region": "Europe"},

    # ── Americas ──
    {"name": "New York", "country": "United States", "travel_type": ["city", "culture"], "budget_tier": "luxury", "climate": "temperate", "region": "Americas"},
    {"name": "Los Angeles", "country": "United States", "travel_type": ["city", "beach"], "budget_tier": "luxury", "climate": "mediterranean", "region": "Americas"},
    {"name": "San Francisco", "country": "United States", "travel_type": ["city", "culture"], "budget_tier": "luxury", "climate": "mediterranean", "region": "Americas"},
    {"name": "Miami", "country": "United States", "travel_type": ["beach", "city"], "budget_tier": "luxury", "climate": "tropical", "region": "Americas"},
    {"name": "Hawaii", "country": "United States", "travel_type": ["beach", "adventure"], "budget_tier": "luxury", "climate": "tropical", "region": "Americas"},
    {"name": "Las Vegas", "country": "United States", "travel_type": ["city"], "budget_tier": "luxury", "climate": "arid", "region": "Americas"},
    {"name": "Grand Canyon", "country": "United States", "travel_type": ["adventure"], "budget_tier": "mid", "climate": "arid", "region": "Americas"},
    {"name": "Cancun", "country": "Mexico", "travel_type": ["beach"], "budget_tier": "mid", "climate": "tropical", "region": "Americas"},
    {"name": "Mexico City", "country": "Mexico", "travel_type": ["city", "culture"], "budget_tier": "budget", "climate": "temperate", "region": "Americas"},
    {"name": "Cusco", "country": "Peru", "travel_type": ["culture", "adventure", "mountain"], "budget_tier": "mid", "climate": "cold", "region": "Americas"},
    {"name": "Machu Picchu", "country": "Peru", "travel_type": ["culture", "adventure"], "budget_tier": "mid", "climate": "temperate", "region": "Americas"},
    {"name": "Rio de Janeiro", "country": "Brazil", "travel_type": ["beach", "city", "culture"], "budget_tier": "mid", "climate": "tropical", "region": "Americas"},
    {"name": "Buenos Aires", "country": "Argentina", "travel_type": ["city", "culture"], "budget_tier": "mid", "climate": "temperate", "region": "Americas"},
    {"name": "Patagonia", "country": "Argentina", "travel_type": ["adventure", "mountain", "wildlife"], "budget_tier": "luxury", "climate": "cold", "region": "Americas"},
    {"name": "Cartagena", "country": "Colombia", "travel_type": ["beach", "culture", "city"], "budget_tier": "mid", "climate": "tropical", "region": "Americas"},
    {"name": "Havana", "country": "Cuba", "travel_type": ["culture", "city", "beach"], "budget_tier": "budget", "climate": "tropical", "region": "Americas"},
    {"name": "Costa Rica", "country": "Costa Rica", "travel_type": ["adventure", "wildlife", "beach"], "budget_tier": "mid", "climate": "tropical", "region": "Americas"},
    {"name": "Toronto", "country": "Canada", "travel_type": ["city", "culture"], "budget_tier": "luxury", "climate": "cold", "region": "Americas"},
    {"name": "Vancouver", "country": "Canada", "travel_type": ["city", "mountain", "adventure"], "budget_tier": "luxury", "climate": "temperate", "region": "Americas"},
    {"name": "Banff", "country": "Canada", "travel_type": ["mountain", "adventure", "wildlife"], "budget_tier": "luxury", "climate": "cold", "region": "Americas"},

    # ── Africa ──
    {"name": "Cape Town", "country": "South Africa", "travel_type": ["city", "beach", "adventure"], "budget_tier": "mid", "climate": "mediterranean", "region": "Africa"},
    {"name": "Marrakech", "country": "Morocco", "travel_type": ["culture", "city"], "budget_tier": "mid", "climate": "arid", "region": "Africa"},
    {"name": "Serengeti", "country": "Tanzania", "travel_type": ["wildlife", "adventure"], "budget_tier": "luxury", "climate": "tropical", "region": "Africa"},
    {"name": "Zanzibar", "country": "Tanzania", "travel_type": ["beach", "culture"], "budget_tier": "mid", "climate": "tropical", "region": "Africa"},
    {"name": "Masai Mara", "country": "Kenya", "travel_type": ["wildlife", "adventure"], "budget_tier": "luxury", "climate": "tropical", "region": "Africa"},
    {"name": "Victoria Falls", "country": "Zimbabwe", "travel_type": ["adventure"], "budget_tier": "mid", "climate": "tropical", "region": "Africa"},
    {"name": "Cairo", "country": "Egypt", "travel_type": ["culture", "city"], "budget_tier": "mid", "climate": "arid", "region": "Africa"},
    {"name": "Luxor", "country": "Egypt", "travel_type": ["culture"], "budget_tier": "mid", "climate": "arid", "region": "Africa"},
    {"name": "Mauritius", "country": "Mauritius", "travel_type": ["beach"], "budget_tier": "luxury", "climate": "tropical", "region": "Africa"},
    {"name": "Seychelles", "country": "Seychelles", "travel_type": ["beach"], "budget_tier": "luxury", "climate": "tropical", "region": "Africa"},

    # ── Middle East ──
    {"name": "Dubai", "country": "UAE", "travel_type": ["city", "beach"], "budget_tier": "luxury", "climate": "arid", "region": "Middle East"},
    {"name": "Abu Dhabi", "country": "UAE", "travel_type": ["city", "culture"], "budget_tier": "luxury", "climate": "arid", "region": "Middle East"},
    {"name": "Petra", "country": "Jordan", "travel_type": ["culture", "adventure"], "budget_tier": "mid", "climate": "arid", "region": "Middle East"},
    {"name": "Dead Sea", "country": "Jordan", "travel_type": ["beach", "adventure"], "budget_tier": "mid", "climate": "arid", "region": "Middle East"},
    {"name": "Muscat", "country": "Oman", "travel_type": ["city", "culture", "beach"], "budget_tier": "mid", "climate": "arid", "region": "Middle East"},
    {"name": "Jerusalem", "country": "Israel", "travel_type": ["culture"], "budget_tier": "mid", "climate": "mediterranean", "region": "Middle East"},

    # ── Oceania ──
    {"name": "Sydney", "country": "Australia", "travel_type": ["city", "beach"], "budget_tier": "luxury", "climate": "temperate", "region": "Oceania"},
    {"name": "Melbourne", "country": "Australia", "travel_type": ["city", "culture"], "budget_tier": "luxury", "climate": "temperate", "region": "Oceania"},
    {"name": "Great Barrier Reef", "country": "Australia", "travel_type": ["beach", "adventure", "wildlife"], "budget_tier": "luxury", "climate": "tropical", "region": "Oceania"},
    {"name": "Queenstown", "country": "New Zealand", "travel_type": ["adventure", "mountain"], "budget_tier": "luxury", "climate": "cold", "region": "Oceania"},
    {"name": "Auckland", "country": "New Zealand", "travel_type": ["city", "adventure"], "budget_tier": "luxury", "climate": "temperate", "region": "Oceania"},
    {"name": "Fiji", "country": "Fiji", "travel_type": ["beach"], "budget_tier": "luxury", "climate": "tropical", "region": "Oceania"},
    {"name": "Bora Bora", "country": "French Polynesia", "travel_type": ["beach"], "budget_tier": "luxury", "climate": "tropical", "region": "Oceania"},

    # ── Central Asia ──
    {"name": "Tashkent", "country": "Uzbekistan", "travel_type": ["culture", "city"], "budget_tier": "budget", "climate": "arid", "region": "Central Asia"},
    {"name": "Samarkand", "country": "Uzbekistan", "travel_type": ["culture"], "budget_tier": "budget", "climate": "arid", "region": "Central Asia"},

    # ── More India ──
    {"name": "Munnar", "country": "India", "travel_type": ["mountain", "wildlife"], "budget_tier": "budget", "climate": "tropical", "region": "South Asia"},
    {"name": "Jodhpur", "country": "India", "travel_type": ["culture", "city"], "budget_tier": "budget", "climate": "arid", "region": "South Asia"},
    {"name": "Amritsar", "country": "India", "travel_type": ["culture"], "budget_tier": "budget", "climate": "temperate", "region": "South Asia"},
    {"name": "Meghalaya", "country": "India", "travel_type": ["mountain", "adventure", "wildlife"], "budget_tier": "budget", "climate": "tropical", "region": "South Asia"},
    {"name": "Rann of Kutch", "country": "India", "travel_type": ["adventure", "culture"], "budget_tier": "budget", "climate": "arid", "region": "South Asia"},
    {"name": "Pondicherry", "country": "India", "travel_type": ["beach", "culture"], "budget_tier": "budget", "climate": "tropical", "region": "South Asia"},
    {"name": "Agra", "country": "India", "travel_type": ["culture"], "budget_tier": "budget", "climate": "temperate", "region": "South Asia"},
    {"name": "Mysore", "country": "India", "travel_type": ["culture", "city"], "budget_tier": "budget", "climate": "temperate", "region": "South Asia"},

    # ── More Europe ──
    {"name": "Bruges", "country": "Belgium", "travel_type": ["culture", "city"], "budget_tier": "mid", "climate": "temperate", "region": "Europe"},
    {"name": "Salzburg", "country": "Austria", "travel_type": ["culture", "mountain"], "budget_tier": "mid", "climate": "cold", "region": "Europe"},
    {"name": "Hallstatt", "country": "Austria", "travel_type": ["mountain", "culture"], "budget_tier": "mid", "climate": "cold", "region": "Europe"},
    {"name": "Positano", "country": "Italy", "travel_type": ["beach", "culture"], "budget_tier": "luxury", "climate": "mediterranean", "region": "Europe"},
    {"name": "Porto", "country": "Portugal", "travel_type": ["city", "culture", "beach"], "budget_tier": "mid", "climate": "mediterranean", "region": "Europe"},
    {"name": "Split", "country": "Croatia", "travel_type": ["beach", "culture", "city"], "budget_tier": "mid", "climate": "mediterranean", "region": "Europe"},
    {"name": "Lake Bled", "country": "Slovenia", "travel_type": ["mountain", "adventure"], "budget_tier": "mid", "climate": "temperate", "region": "Europe"},
    {"name": "Tallinn", "country": "Estonia", "travel_type": ["city", "culture"], "budget_tier": "budget", "climate": "cold", "region": "Europe"},
    {"name": "Krakow", "country": "Poland", "travel_type": ["city", "culture"], "budget_tier": "budget", "climate": "temperate", "region": "Europe"},
    {"name": "Helsinki", "country": "Finland", "travel_type": ["city", "culture"], "budget_tier": "luxury", "climate": "cold", "region": "Europe"},
    {"name": "Lapland", "country": "Finland", "travel_type": ["adventure", "wildlife"], "budget_tier": "luxury", "climate": "cold", "region": "Europe"},
    {"name": "Montenegro", "country": "Montenegro", "travel_type": ["beach", "mountain", "adventure"], "budget_tier": "mid", "climate": "mediterranean", "region": "Europe"},

    # ── Additional ──
    {"name": "Tulum", "country": "Mexico", "travel_type": ["beach", "culture"], "budget_tier": "mid", "climate": "tropical", "region": "Americas"},
    {"name": "Galapagos Islands", "country": "Ecuador", "travel_type": ["wildlife", "adventure"], "budget_tier": "luxury", "climate": "tropical", "region": "Americas"},
    {"name": "Salar de Uyuni", "country": "Bolivia", "travel_type": ["adventure"], "budget_tier": "mid", "climate": "cold", "region": "Americas"},
    {"name": "Angkor Wat", "country": "Cambodia", "travel_type": ["culture"], "budget_tier": "budget", "climate": "tropical", "region": "Southeast Asia"},
    {"name": "Da Nang", "country": "Vietnam", "travel_type": ["beach", "city"], "budget_tier": "budget", "climate": "tropical", "region": "Southeast Asia"},
    {"name": "Nara", "country": "Japan", "travel_type": ["culture"], "budget_tier": "mid", "climate": "temperate", "region": "East Asia"},
    {"name": "Jeju Island", "country": "South Korea", "travel_type": ["beach", "adventure"], "budget_tier": "mid", "climate": "temperate", "region": "East Asia"},
]


async def seed():
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DATABASE_NAME]

    # Upsert each destination (avoid duplicates on re-run)
    inserted = 0
    skipped = 0
    for dest in DESTINATIONS:
        existing = await db.destinations.find_one({"name": dest["name"], "country": dest["country"]})
        if existing:
            skipped += 1
            continue
        await db.destinations.insert_one(dest)
        inserted += 1

    print(f"✅ Seeded {inserted} destinations ({skipped} already existed)")
    print(f"📊 Total in DB: {await db.destinations.count_documents({})}")
    client.close()


if __name__ == "__main__":
    asyncio.run(seed())
