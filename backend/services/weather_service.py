import os
import httpx
from typing import Dict, Any, Optional, List
from utils.cache import get_cached, set_cached
from dotenv import load_dotenv

load_dotenv()

OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "")
OPENWEATHER_BASE = "https://api.openweathermap.org/data/2.5"


async def get_current_weather(city: str) -> Optional[Dict[str, Any]]:
    """Fetch current weather for a city using OpenWeatherMap."""
    cache_key = f"weather:{city.lower()}"
    cached = await get_cached(cache_key)
    if cached:
        return cached

    if not OPENWEATHER_API_KEY:
        return _mock_weather(city)

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{OPENWEATHER_BASE}/weather",
                params={"q": city, "appid": OPENWEATHER_API_KEY, "units": "metric"},
            )
            response.raise_for_status()
            data = response.json()
    except Exception as e:
        print(f"⚠️  Weather API error for {city}: {e}")
        return _mock_weather(city)

    result = {
        "city": data["name"],
        "country": data["sys"]["country"],
        "temperature": round(data["main"]["temp"], 1),
        "feels_like": round(data["main"]["feels_like"], 1),
        "humidity": data["main"]["humidity"],
        "description": data["weather"][0]["description"].title(),
        "icon": data["weather"][0]["icon"],
        "icon_url": f"https://openweathermap.org/img/wn/{data['weather'][0]['icon']}@2x.png",
        "wind_speed": data["wind"]["speed"],
        "visibility": data.get("visibility", 0),
        "pressure": data["main"]["pressure"],
    }
    await set_cached(cache_key, result, 1800)  # 30 min cache
    return result


async def get_forecast(city: str) -> Optional[List[Dict[str, Any]]]:
    """Fetch 5-day / 3-hour forecast for a city."""
    cache_key = f"forecast:{city.lower()}"
    cached = await get_cached(cache_key)
    if cached:
        return cached

    if not OPENWEATHER_API_KEY:
        return _mock_forecast()

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{OPENWEATHER_BASE}/forecast",
                params={"q": city, "appid": OPENWEATHER_API_KEY, "units": "metric", "cnt": 40},
            )
            response.raise_for_status()
            data = response.json()
    except Exception as e:
        print(f"⚠️  Forecast API error for {city}: {e}")
        return _mock_forecast()

    # Collapse to daily (take one reading per day around noon)
    days: Dict[str, Dict] = {}
    for item in data.get("list", []):
        date = item["dt_txt"].split(" ")[0]
        time_part = item["dt_txt"].split(" ")[1]
        if date not in days or abs(int(time_part.split(":")[0]) - 12) < abs(
            int(days[date]["time"].split(":")[0]) - 12
        ):
            days[date] = {
                "date": date,
                "time": time_part,
                "temp_max": item["main"]["temp_max"],
                "temp_min": item["main"]["temp_min"],
                "description": item["weather"][0]["description"].title(),
                "icon": item["weather"][0]["icon"],
                "icon_url": f"https://openweathermap.org/img/wn/{item['weather'][0]['icon']}@2x.png",
                "humidity": item["main"]["humidity"],
                "wind_speed": item["wind"]["speed"],
            }

    result = list(days.values())[:7]
    await set_cached(cache_key, result, 3600)
    return result


def get_travel_suitability(weather: Dict[str, Any]) -> str:
    """Return a travel suitability label based on current weather."""
    temp = weather.get("temperature", 20)
    humidity = weather.get("humidity", 60)
    desc = weather.get("description", "").lower()

    if "storm" in desc or "heavy rain" in desc or "blizzard" in desc:
        return "Poor"
    if temp < 0 or temp > 40:
        return "Poor"
    if "rain" in desc or "drizzle" in desc:
        return "Fair"
    if 15 <= temp <= 32 and humidity < 80:
        return "Excellent"
    if 10 <= temp <= 35:
        return "Good"
    return "Fair"


def _mock_weather(city: str) -> Dict[str, Any]:
    return {
        "city": city,
        "country": "N/A",
        "temperature": 25.0,
        "feels_like": 26.0,
        "humidity": 65,
        "description": "Partly Cloudy",
        "icon": "02d",
        "icon_url": "https://openweathermap.org/img/wn/02d@2x.png",
        "wind_speed": 3.5,
        "visibility": 10000,
        "pressure": 1013,
        "mock": True,
    }


def _mock_forecast() -> List[Dict[str, Any]]:
    from datetime import date, timedelta
    return [
        {
            "date": str(date.today() + timedelta(days=i)),
            "temp_max": 28 + i,
            "temp_min": 20 + i,
            "description": "Partly Cloudy",
            "icon": "02d",
            "icon_url": "https://openweathermap.org/img/wn/02d@2x.png",
            "humidity": 65,
            "wind_speed": 3.5,
        }
        for i in range(7)
    ]
