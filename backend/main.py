from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import os
import logging
from rag.retriever import LilaRetriever, calculate_weighted_score, haversine
from services.enrichment import get_weather, get_nearby_hotels, get_nearby_attractions, get_place_image
from services.ai import generate_ai_summary
from services.coordinates import get_place_coordinates
from dotenv import load_dotenv

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI(title="Lila AI Backend")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Retriever
# Note: Path is relative to this file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
retriever = LilaRetriever(
    dataset_path=os.path.join(BASE_DIR, "datasets", "bengaluru_places_rag.json")
)

class RecommendationRequest(BaseModel):
    who: str = "Solo"
    time: str = "One Day"
    vibes: List[str] = Field(default_factory=list)
    budget: str = "Moderate"
    range: str = "Local BLR"
    extras: List[str] = Field(default_factory=list)
    latitude: Optional[float] = None
    longitude: Optional[float] = None

@app.get("/")
async def root():
    return {"message": "Lila AI Backend is running"}

@app.post("/api/recommendations")
async def get_recommendations(req: RecommendationRequest):
    logger.info(f"Received recommendation request: {req}")
    try:
        # 1. Query construction
        query = f"{', '.join(req.vibes)} for {req.who}"
        
        # 2. Retrieve candidates
        candidates = retriever.retrieve(query, k=15)
        
        # Get user coordinates from payload, fallback to Bengaluru center if none
        user_lat = req.latitude
        user_lng = req.longitude
        if user_lat is None or user_lng is None:
            user_lat = 12.9716
            user_lng = 77.5946
            logger.info("User coordinates not provided in request. Falling back to Bengaluru center: 12.9716, 77.5946")
        else:
            logger.info(f"Using user geolocated coordinates: {user_lat}, {user_lng}")
            
        recommendations = []
        for item in candidates:
            place = item["place"]
            
            # Fetch coordinates dynamically (combining in-memory cache and dataset fallbacks)
            place_lat, place_lng = get_place_coordinates(
                place["name"], 
                fallback_lat=place.get("latitude"), 
                fallback_lng=place.get("longitude")
            )
            
            # Calculate distance using Haversine formula
            dist = haversine(user_lat, user_lng, place_lat, place_lng)
            
            score_data = calculate_weighted_score(place, req.dict(), item["semantic_score"], dist)
            
            # Fetch weather for each recommendation using place coordinates
            weather = get_weather(place_lat, place_lng)
            
            # Fetch dynamic image based on place name and category
            vibe_category = place["tags"]["vibe"][0] if place.get("tags", {}).get("vibe") else "Chill"
            image_url = get_place_image(place["name"], vibe_category)
            
            recommendations.append({
                "id": str(place.get("id", place["name"])),
                "name": place["name"],
                "summary": place["description"][:120] + "...",
                "score": score_data["total_score"],
                "tags": place["tags"]["vibe"] + place["tags"]["who"],
                "image_url": image_url,
                "lat": place_lat,
                "lng": place_lng,
                "rating": place.get("rating", 4.0),
                "weather": weather,
                "budget_level": place.get("budget", {}).get("level", "Moderate"),
                "distance_km": round(dist, 1) if dist is not None else None
            })
        
        recommendations.sort(key=lambda x: x["score"], reverse=True)
        return {"recommendations": recommendations[:8]}
        
    except Exception as e:
        logger.error(f"Error in recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/place/{place_id}")
async def get_place_details(place_id: str):
    place = next((p for p in retriever.places_data if str(p.get("id", p["name"])) == place_id), None)
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
        
    # Get place coordinates from get_place_coordinates
    place_lat, place_lng = get_place_coordinates(
        place["name"],
        fallback_lat=place.get("latitude"),
        fallback_lng=place.get("longitude")
    )
    
    weather = get_weather(place_lat, place_lng)
    
    # Generate AI summary
    vibes_str = ", ".join(place.get("tags", {}).get("vibe", ["pleasant"]))
    ai_summary = generate_ai_summary(place["name"], vibes_str, weather.get("condition", "clear"))
    
    # Fetch dynamic image based on place name and category
    vibe_category = place.get("tags", {}).get("vibe", ["Chill"])[0]
    image_url = get_place_image(place["name"], vibe_category)

    return {
        "id": str(place.get("id", place["name"])),
        "name": place["name"],
        "description": place["description"],
        "long_description": place.get("description"), # Fallback to description
        "highlights": place.get("highlights", []),
        "weather": weather,
        "nearby_hotels": get_nearby_hotels(place["name"], 0),
        "nearby_places": get_nearby_attractions(place_lat, place_lng, place["name"]),
        "image_url": image_url,
        "rating": place.get("rating", 4.0),
        "location": {
            "lat": place_lat,
            "lng": place_lng,
            "address": place.get("address", "Bengaluru, India")
        },
        "budget": place.get("budget", {"level": "Moderate", "range": "N/A"}),
        "timings": {
            "hours": place.get("hours", "9:00 AM - 6:00 PM")
        },
        "best_time_to_visit": "October to February",
        "things_to_carry": ["Water bottle", "Camera", "Comfortable shoes"],
        "travel_tips": [
            "Reach early to avoid crowds.",
            "Use public transport or ride-sharing apps like Ola/Uber.",
            "Check for any local events or closures before visiting."
        ],
        "ai_summary": ai_summary
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
