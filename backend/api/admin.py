from fastapi import APIRouter, HTTPException, Depends
from database.mongodb import get_db
from auth.jwt_handler import get_current_admin
from utils.response import success_response
from bson import ObjectId

router = APIRouter(prefix="/admin", tags=["Admin"])


def _safe_user(u: dict) -> dict:
    return {
        "id": str(u["_id"]),
        "name": u.get("name", ""),
        "email": u.get("email", ""),
        "role": u.get("role", "user"),
        "saved_trips_count": len(u.get("saved_trips", [])),
        "created_at": str(u.get("created_at", "")),
    }


@router.get("/stats")
async def get_stats(admin: dict = Depends(get_current_admin)):
    db = get_db()
    total_users = await db.users.count_documents({})
    total_trips = await db.trips.count_documents({})
    total_admins = await db.users.count_documents({"role": "admin"})

    # Most popular destinations
    pipeline = [
        {"$group": {"_id": "$destination", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 5},
    ]
    popular_cursor = db.trips.aggregate(pipeline)
    popular_destinations = [
        {"destination": p["_id"], "count": p["count"]} async for p in popular_cursor
    ]

    return success_response(data={
        "total_users": total_users,
        "total_trips": total_trips,
        "total_admins": total_admins,
        "popular_destinations": popular_destinations,
    })


@router.get("/users")
async def get_all_users(admin: dict = Depends(get_current_admin), page: int = 1, limit: int = 20):
    db = get_db()
    skip = (page - 1) * limit
    cursor = db.users.find({}, {"password": 0}).skip(skip).limit(limit).sort("created_at", -1)
    users = [_safe_user(u) async for u in cursor]
    total = await db.users.count_documents({})
    return success_response(data={"users": users, "total": total, "page": page, "limit": limit})


@router.get("/trips")
async def get_all_trips(admin: dict = Depends(get_current_admin), page: int = 1, limit: int = 20):
    db = get_db()
    skip = (page - 1) * limit
    cursor = db.trips.find({}).skip(skip).limit(limit).sort("created_at", -1)
    trips = []
    async for t in cursor:
        trips.append({
            "id": str(t["_id"]),
            "user_id": t.get("user_id", ""),
            "destination": t.get("destination", ""),
            "budget": t.get("budget", 0),
            "duration": t.get("duration", 0),
            "created_at": str(t.get("created_at", "")),
        })
    total = await db.trips.count_documents({})
    return success_response(data={"trips": trips, "total": total, "page": page, "limit": limit})


@router.delete("/users/{user_id}")
async def delete_user(user_id: str, admin: dict = Depends(get_current_admin)):
    db = get_db()
    try:
        result = await db.users.delete_one({"_id": ObjectId(user_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID")
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return success_response(message="User deleted successfully")


@router.put("/users/{user_id}/make-admin")
async def make_admin(user_id: str, admin: dict = Depends(get_current_admin)):
    db = get_db()
    try:
        result = await db.users.update_one({"_id": ObjectId(user_id)}, {"$set": {"role": "admin"}})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID")
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return success_response(message="User promoted to admin")
