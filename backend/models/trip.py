from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class ItineraryDay(BaseModel):
    day: int
    title: str
    activities: List[str]
    meals: Optional[Dict[str, str]] = {}
    accommodation: Optional[str] = ""
    estimated_cost: Optional[float] = None


class BudgetBreakdown(BaseModel):
    accommodation: float
    flights: float
    food: float
    activities: float
    local_transport: float
    total: float
    currency: str = "INR"


class TripCreate(BaseModel):
    destination: str
    country: Optional[str] = ""
    duration: int = Field(..., ge=1)
    budget: float = Field(..., ge=0)
    travel_type: Optional[List[str]] = []
    itinerary: Optional[List[Dict[str, Any]]] = []
    budget_breakdown: Optional[Dict[str, Any]] = {}
    notes: Optional[str] = ""


class TripDB(BaseModel):
    id: Optional[str] = None
    user_id: str
    destination: str
    country: Optional[str] = ""
    duration: int
    budget: float
    travel_type: Optional[List[str]] = []
    itinerary: List[Dict[str, Any]] = []
    budget_breakdown: Dict[str, Any] = {}
    notes: Optional[str] = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ItineraryRequest(BaseModel):
    destination: str
    duration: int = Field(default=5, ge=1, le=30)
    travel_type: Optional[List[str]] = ["sightseeing"]
    budget: Optional[float] = 50000.0
    travel_companions: Optional[str] = "solo"


class BudgetRequest(BaseModel):
    destination: str
    duration: int = Field(default=5, ge=1)
    total_budget: float = Field(default=50000.0, ge=0)
    travel_companions: Optional[str] = "solo"
    travel_style: Optional[str] = "budget"  # budget, mid-range, luxury
