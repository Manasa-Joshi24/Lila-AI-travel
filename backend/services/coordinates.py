import requests
import logging
import urllib.parse
from typing import Tuple, Dict

logger = logging.getLogger(__name__)

# In-memory cache for coordinates: place_name -> (lat, lng)
COORDINATES_CACHE: Dict[str, Tuple[float, float]] = {}

def get_place_coordinates(place_name: str, fallback_lat: float = None, fallback_lng: float = None) -> Tuple[float, float]:
    """
    Get latitude and longitude of a place.
    Checks the in-memory cache first.
    If not in cache, falls back to the dataset coordinates if they exist and are non-zero.
    Otherwise, queries OpenStreetMap Nominatim API dynamically and caches the result.
    """
    # 1. Check in-memory cache
    if place_name in COORDINATES_CACHE:
        logger.info(f"[CACHE HIT] {place_name} -> {COORDINATES_CACHE[place_name]}")
        return COORDINATES_CACHE[place_name]

    # 2. Check if we already have valid fallback coordinates
    if fallback_lat is not None and fallback_lng is not None and fallback_lat != 0 and fallback_lng != 0:
        # Cache it and return
        COORDINATES_CACHE[place_name] = (fallback_lat, fallback_lng)
        logger.info(f"[DATASET COORDS] {place_name} -> {fallback_lat}, {fallback_lng}")
        return fallback_lat, fallback_lng

    # 3. Dynamic fetch from OpenStreetMap Nominatim API
    try:
        # Append "Bengaluru, Karnataka, India" to focus the search locally if not present
        query = place_name
        if "bengaluru" not in query.lower() and "bangalore" not in query.lower():
            query = f"{place_name}, Bengaluru, Karnataka, India"
            
        encoded_query = urllib.parse.quote(query)
        url = f"https://nominatim.openstreetmap.org/search?q={encoded_query}&format=json&limit=1"
        headers = {
            "User-Agent": "LilaTravelApp/1.0 (raj12@example.com)"
        }
        
        logger.info(f"[OSM NOMINATIM FETCH] Fetching coordinates for: {query}")
        response = requests.get(url, headers=headers, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            if data:
                lat = float(data[0]["lat"])
                lng = float(data[0]["lon"])
                COORDINATES_CACHE[place_name] = (lat, lng)
                logger.info(f"[OSM NOMINATIM SUCCESS] {place_name} -> {lat}, {lng}")
                return lat, lng
            else:
                logger.warning(f"[OSM NOMINATIM EMPTY] No results for {place_name}")
        else:
            logger.error(f"[OSM NOMINATIM ERROR] Status code {response.status_code} for {place_name}")
    except Exception as e:
        logger.error(f"[OSM NOMINATIM EXCEPTION] Error for {place_name}: {e}")

    # 4. Fallback to Bengaluru center coordinates if geocoding fails and no fallback exists
    default_lat, default_lng = 12.9716, 77.5946
    COORDINATES_CACHE[place_name] = (default_lat, default_lng)
    return default_lat, default_lng
