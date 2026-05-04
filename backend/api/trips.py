from fastapi import APIRouter, HTTPException, Depends
from database.mongodb import get_db
from models.trip import TripCreate, TripDB
from auth.jwt_handler import get_current_user
from utils.response import success_response
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/trip", tags=["Trips"])


def _serialize_trip(trip: dict) -> dict:
    return {
        "id": str(trip["_id"]),
        "user_id": str(trip.get("user_id", "")),
        "destination": trip.get("destination", ""),
        "country": trip.get("country", ""),
        "duration": trip.get("duration", 0),
        "budget": trip.get("budget", 0),
        "travel_type": trip.get("travel_type", []),
        "itinerary": trip.get("itinerary", []),
        "budget_breakdown": trip.get("budget_breakdown", {}),
        "notes": trip.get("notes", ""),
        "created_at": str(trip.get("created_at", "")),
        "updated_at": str(trip.get("updated_at", "")),
    }


@router.post("/save")
async def save_trip(trip: TripCreate, current_user: dict = Depends(get_current_user)):
    db = get_db()
    trip_doc = {
        **trip.dict(),
        "user_id": current_user["sub"],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    result = await db.trips.insert_one(trip_doc)
    # Add reference to user's saved_trips
    await db.users.update_one(
        {"_id": ObjectId(current_user["sub"])},
        {"$addToSet": {"saved_trips": str(result.inserted_id)}},
    )

    # Log interaction for CF model training
    try:
        # Find or create the destination in the catalog
        dest = await db.destinations.find_one({"name": trip.destination})
        dest_id = str(dest["_id"]) if dest else None

        # If destination doesn't exist in catalog, save it
        if not dest:
            new_dest = {
                "name": trip.destination,
                "country": trip.country or "",
                "travel_type": trip.travel_type or [],
            }
            insert_result = await db.destinations.insert_one(new_dest)
            dest_id = str(insert_result.inserted_id)

        await db.interactions.insert_one({
            "user_id": current_user["sub"],
            "destination_id": dest_id,
            "destination_name": trip.destination,
            "country": trip.country or "",
            "interaction_type": "save",
            "weight": 4.0,
            "created_at": datetime.utcnow(),
        })
    except Exception as e:
        pass  # Don't fail the save if interaction logging fails

    return success_response(
        data={"trip_id": str(result.inserted_id)},
        message="Trip saved successfully",
        status_code=201,
    )


@router.get("/history")
async def get_trip_history(current_user: dict = Depends(get_current_user)):
    db = get_db()
    cursor = db.trips.find({"user_id": current_user["sub"]}).sort("created_at", -1)
    trips = [_serialize_trip(t) async for t in cursor]
    return success_response(data=trips)


@router.get("/{trip_id}")
async def get_trip(trip_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    try:
        trip = await db.trips.find_one({"_id": ObjectId(trip_id), "user_id": current_user["sub"]})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid trip ID")
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return success_response(data=_serialize_trip(trip))


@router.put("/{trip_id}")
async def update_trip(trip_id: str, trip: TripCreate, current_user: dict = Depends(get_current_user)):
    db = get_db()
    try:
        result = await db.trips.update_one(
            {"_id": ObjectId(trip_id), "user_id": current_user["sub"]},
            {"$set": {**trip.dict(), "updated_at": datetime.utcnow()}},
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid trip ID")
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Trip not found")
    return success_response(message="Trip updated successfully")


@router.delete("/{trip_id}")
async def delete_trip(trip_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    try:
        result = await db.trips.delete_one({"_id": ObjectId(trip_id), "user_id": current_user["sub"]})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid trip ID")
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Trip not found")
    await db.users.update_one(
        {"_id": ObjectId(current_user["sub"])},
        {"$pull": {"saved_trips": trip_id}},
    )
    return success_response(message="Trip deleted successfully")
