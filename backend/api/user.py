from fastapi import APIRouter, HTTPException, Depends
from database.mongodb import get_db
from models.user import UserUpdate
from auth.jwt_handler import get_current_user
from utils.response import success_response
from bson import ObjectId

router = APIRouter(prefix="/user", tags=["User"])


@router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    db = get_db()
    user = await db.users.find_one({"_id": ObjectId(current_user["sub"])})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return success_response(data={
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "preferences": user.get("preferences", {}),
        "travel_history": user.get("travel_history", []),
        "saved_trips": user.get("saved_trips", []),
        "role": user.get("role", "user"),
        "created_at": str(user.get("created_at", "")),
    })


@router.put("/preferences")
async def update_preferences(update: UserUpdate, current_user: dict = Depends(get_current_user)):
    db = get_db()
    update_data = {}
    if update.name:
        update_data["name"] = update.name
    if update.preferences:
        update_data["preferences"] = update.preferences.dict()

    if not update_data:
        raise HTTPException(status_code=400, detail="Nothing to update")

    await db.users.update_one(
        {"_id": ObjectId(current_user["sub"])},
        {"$set": update_data},
    )
    return success_response(message="Profile updated successfully")
