import requests
import os
from typing import Dict, Any
from dotenv import load_dotenv

load_dotenv()

OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")

def get_weather(lat: float, lon: float) -> Dict[str, Any]:
    # Safe fallback if API key is missing
    if not OPENWEATHER_API_KEY or "your_" in OPENWEATHER_API_KEY.lower():
        return {"temp": 24, "condition": "Clear", "humidity": 60, "feels_like": 26, "rain_probability": 0}
        
    url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}&units=metric"
    try:
        response = requests.get(url, timeout=3)
        data = response.json()
        return {
            "temp": round(data["main"]["temp"]),
            "condition": data["weather"][0]["main"],
            "humidity": data["main"]["humidity"],
            "feels_like": round(data["main"].get("feels_like", data["main"]["temp"])),
            "rain_probability": data.get("clouds", {}).get("all", 0)
        }
    except:
        return {"temp": 24, "condition": "Clear", "humidity": 60, "feels_like": 26, "rain_probability": 0}

def get_nearby_hotels(location_name: str, distance_km: float) -> list:
    # Removed Google/SerpAPI logic - returning static curated suggestions
    return [
        {"name": "Luxury Stay Nearby", "price": "₹₹₹", "rating": 4.8, "distance": "2km", "link": "#"},
        {"name": "Boutique Hotel", "price": "₹₹", "rating": 4.5, "distance": "5km", "link": "#"}
    ] if distance_km > 20 else []

def get_nearby_attractions(lat: float, lon: float, name: str = "this location") -> list:
    # Removed Google Maps logic - returning curated fallbacks
    return [
        {"name": "Scenic Viewpoint", "type": "Sightseeing", "rating": 4.7},
        {"name": "Local Cultural Hub", "type": "Culture", "rating": 4.5},
        {"name": "Nature Walk", "type": "Outdoor", "rating": 4.8}
    ]
