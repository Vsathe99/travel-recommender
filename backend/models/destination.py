from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


class Coordinates(BaseModel):
    lat: float
    lng: float


class Attraction(BaseModel):
    name: str
    category: str
    description: Optional[str] = ""
    coordinates: Optional[Coordinates] = None
    rating: Optional[float] = None
    maki: Optional[str] = ""


class Restaurant(BaseModel):
    name: str
    location: str
    distance: Optional[float] = None
    rating: Optional[float] = None
    coordinates: Optional[Coordinates] = None


class Accommodation(BaseModel):
    name: str
    location: str
    distance: Optional[float] = None
    price_range: Optional[str] = ""
    coordinates: Optional[Coordinates] = None


class WeatherInfo(BaseModel):
    temperature: Optional[float] = None
    feels_like: Optional[float] = None
    humidity: Optional[int] = None
    description: Optional[str] = ""
    icon: Optional[str] = ""
    wind_speed: Optional[float] = None


class DestinationBase(BaseModel):
    name: str
    country: str
    coordinates: Optional[Coordinates] = None
    description: Optional[str] = ""
    travel_type: Optional[List[str]] = []
    avg_cost_per_day: Optional[float] = None
    rating: Optional[float] = None
    best_season: Optional[str] = ""
    language: Optional[str] = ""
    currency: Optional[str] = ""
    timezone: Optional[str] = ""


class DestinationDB(DestinationBase):
    id: Optional[str] = None
    attractions: List[Attraction] = []
    restaurants: List[Restaurant] = []
    accommodations: List[Accommodation] = []
    avg_cost_inr: Optional[float] = None
    weather_info: Optional[WeatherInfo] = None
    images: List[str] = []


class RecommendationRequest(BaseModel):
    travel_type: List[str] = Field(default=["beach"])
    budget: float = Field(default=50000.0, ge=0)
    duration: int = Field(default=7, ge=1)
    preferred_climate: Optional[str] = "warm"
    travel_companions: Optional[str] = "solo"
    preferred_regions: Optional[List[str]] = []
    base_location: Optional[Dict[str, Any]] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None


class RankedDestination(BaseModel):
    destination: str
    country: Optional[str] = ""
    score: float
    reason: str
    estimated_cost: Optional[float] = None
    weather_suitability: Optional[str] = ""
    coordinates: Optional[Coordinates] = None
    avg_cost_inr: Optional[float] = None
    restaurants: Optional[List[Dict[str, Any]]] = []
    hotels: Optional[List[Dict[str, Any]]] = []
