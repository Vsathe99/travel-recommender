from fastapi import APIRouter, HTTPException, status, Depends
from database.mongodb import get_db
from models.user import UserCreate, UserLogin, PasswordReset
from auth.jwt_handler import create_access_token
from utils.password import hash_password, verify_password
from utils.response import success_response, error_response
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register")
async def register(user: UserCreate):
    db = get_db()
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_doc = {
        "name": user.name,
        "email": user.email,
        "password": hash_password(user.password),
        "preferences": {},
        "travel_history": [],
        "saved_trips": [],
        "role": "user",
        "created_at": datetime.utcnow(),
    }
    result = await db.users.insert_one(user_doc)
    token = create_access_token({"sub": str(result.inserted_id), "email": user.email, "role": "user"})

    return success_response(
        data={"token": token, "user": {"id": str(result.inserted_id), "name": user.name, "email": user.email, "role": "user"}},
        message="Registration successful",
        status_code=201,
    )


@router.post("/login")
async def login(user: UserLogin):
    db = get_db()
    db_user = await db.users.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({
        "sub": str(db_user["_id"]),
        "email": db_user["email"],
        "role": db_user.get("role", "user"),
    })

    return success_response(
        data={
            "token": token,
            "user": {
                "id": str(db_user["_id"]),
                "name": db_user["name"],
                "email": db_user["email"],
                "role": db_user.get("role", "user"),
                "preferences": db_user.get("preferences", {}),
            },
        },
        message="Login successful",
    )


@router.post("/reset-password")
async def reset_password(data: PasswordReset):
    db = get_db()
    db_user = await db.users.find_one({"email": data.email})
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    new_hashed = hash_password(data.new_password)
    await db.users.update_one({"email": data.email}, {"$set": {"password": new_hashed}})
    return success_response(message="Password reset successful")
