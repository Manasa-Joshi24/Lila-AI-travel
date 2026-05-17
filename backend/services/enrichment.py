import requests
import os
from typing import Dict, Any
from dotenv import load_dotenv

load_dotenv()

OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")
SERP_API_KEY = os.getenv("SERP_API_KEY")
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

import urllib.parse
from functools import lru_cache

@lru_cache(maxsize=128)
def get_place_image(place_name: str, category: str = "Adventure") -> str:
    fallbacks = {
        "Adventure": "https://images.unsplash.com/photo-1533692328991-08159ff19fca?auto=format&fit=crop&q=80&w=1600",
        "Romantic": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1600",
        "Nature": "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=1600",
        "Educational": "https://images.unsplash.com/photo-1518998053401-a41454e56704?auto=format&fit=crop&q=80&w=1600",
        "Chill": "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80&w=1600"
    }
    
    # Capitalize category if it exists to match keys
    if category:
        category = category.title()
    fallback_image = fallbacks.get(category, fallbacks["Chill"])

    if not SERP_API_KEY or "your_" in SERP_API_KEY.lower():
        return fallback_image

    try:
        query = urllib.parse.quote(f"{place_name} Bengaluru")
        url = f"https://serpapi.com/search.json?q={query}&tbm=isch&ijn=0&api_key={SERP_API_KEY}"
        response = requests.get(url, timeout=3)
        if response.status_code == 200:
            data = response.json()
            images_results = data.get("images_results", [])
            
            # Avoid domains that block hotlinking or have CORS issues
            bad_domains = ["lookaside.instagram.com", "instagram.com", "facebook.com", "fbcdn.net", "fbsbx.com"]
            
            for img in images_results:
                original = img.get("original")
                if original and original.startswith("http"):
                    # Check if domain is in bad_domains
                    if not any(domain in original for domain in bad_domains):
                        return original
    except Exception as e:
        pass
    
    return fallback_image
