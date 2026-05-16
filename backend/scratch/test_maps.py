import requests
import os
from dotenv import load_dotenv

load_dotenv()

GOOGLE_MAP_API_KEY = os.getenv("GOOGLE_MAP_API_KEY")

def test_nearby(lat, lon):
    print(f"Testing with lat={lat}, lon={lon}")
    url = f"https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={lat},{lon}&radius=2000&type=tourist_attraction&key={GOOGLE_MAP_API_KEY}"
    response = requests.get(url)
    print(f"Status: {response.status_code}")
    data = response.json()
    if "error_message" in data:
        print(f"Error: {data['error_message']}")
    else:
        results = data.get("results", [])
        print(f"Found {len(results)} results")
        for r in results[:3]:
            print(f"- {r.get('name')}")

if __name__ == "__main__":
    test_nearby(12.9716, 77.5946) # Bengaluru center
