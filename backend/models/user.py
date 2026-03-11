from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class LocationPreference(BaseModel):
    name: str
    latitude: float
    longitude: float
    country: Optional[str] = ""
    region: Optional[str] = ""

class UserPreferences(BaseModel):
    travel_type: Optional[List[str]] = []  # beach, mountains, city, adventure, culture, wildlife
    budget_min: Optional[float] = 10000
    budget_max: Optional[float] = 100000
    duration_days: Optional[int] = 7
    preferred_climate: Optional[str] = "warm"
    travel_companions: Optional[str] = "solo"  # solo, couple, family, friends
    preferred_regions: Optional[List[str]] = []
    preferred_currency: Optional[str] = "INR"
    selected_location: Optional[LocationPreference] = None


class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class PasswordReset(BaseModel):
    email: EmailStr
    new_password: str = Field(..., min_length=6)


class UserUpdate(BaseModel):
    name: Optional[str] = None
    preferences: Optional[UserPreferences] = None


class UserDB(BaseModel):
    id: Optional[str] = None
    name: str
    email: str
    password: str
    preferences: UserPreferences = UserPreferences()
    travel_history: List[Dict[str, Any]] = []
    saved_trips: List[str] = []
    role: str = "user"
    created_at: datetime = Field(default_factory=datetime.utcnow)


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    preferences: UserPreferences
    role: str
    created_at: datetime
