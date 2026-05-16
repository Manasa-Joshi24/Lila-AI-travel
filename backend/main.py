from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import os
import logging
from rag.retriever import LilaRetriever, calculate_weighted_score, haversine
from services.enrichment import get_weather, get_nearby_hotels, get_nearby_attractions
from services.ai import generate_ai_summary
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
        
        recommendations = []
        for item in candidates:
            place = item["place"]
            # Map stuff removed - distance set to 0 or ignored
            dist = 0
            
            score_data = calculate_weighted_score(place, req.dict(), item["semantic_score"], dist)
            
            # Fetch weather for each recommendation
            weather = get_weather(place.get("latitude", 0), place.get("longitude", 0))
            
            recommendations.append({
                "id": str(place.get("id", place["name"])),
                "name": place["name"],
                "summary": place["description"][:120] + "...",
                "score": score_data["total_score"],
                "tags": place["tags"]["vibe"] + place["tags"]["who"],
                "image_url": place.get("image_url", "https://images.unsplash.com/photo-1596422846543-75c6fc197f07"),
                "lat": place.get("latitude", 0),
                "lng": place.get("longitude", 0),
                "rating": place.get("rating", 4.0),
                "weather": weather,
                "budget_level": place.get("budget", {}).get("level", "Moderate"),
                "distance_km": round(dist, 1)
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
        
    weather = get_weather(place["latitude"], place["longitude"])
    
    # Generate AI summary
    vibes_str = ", ".join(place.get("tags", {}).get("vibe", ["pleasant"]))
    ai_summary = generate_ai_summary(place["name"], vibes_str, weather.get("condition", "clear"))
    
    return {
        "id": str(place.get("id", place["name"])),
        "name": place["name"],
        "description": place["description"],
        "long_description": place.get("description"), # Fallback to description
        "highlights": place.get("highlights", []),
        "weather": weather,
        "nearby_hotels": get_nearby_hotels(place["name"], 0),
        "nearby_places": get_nearby_attractions(place["latitude"], place["longitude"], place["name"]),
        "image_url": place.get("image_url", "https://images.unsplash.com/photo-1596422846543-75c6fc197f07"),
        "rating": place.get("rating", 4.0),
        "location": {
            "lat": place.get("latitude", 0),
            "lng": place.get("longitude", 0),
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
