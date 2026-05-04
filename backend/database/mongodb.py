import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://mongodb:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "travel_recommendation")

client: AsyncIOMotorClient = None
db = None


async def connect_db():
    global client, db
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DATABASE_NAME]
    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.destinations.create_index("name")
    await db.destinations.create_index([("name", 1), ("country", 1)])
    await db.trips.create_index("user_id")
    await db.interactions.create_index("user_id")
    await db.interactions.create_index("destination_id")
    await db.interactions.create_index([("user_id", 1), ("destination_id", 1)])
    print(f"✅ Connected to MongoDB: {DATABASE_NAME}")


async def close_db():
    global client
    if client:
        client.close()
        print("🔌 MongoDB connection closed")


def get_db():
    return db
