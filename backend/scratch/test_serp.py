import requests
import os
from dotenv import load_dotenv

load_dotenv()

SERP_API_KEY = os.getenv("SERP_API_KEY")

def test_serp_nearby(lat, lon):
    print(f"Testing SerpAPI with lat={lat}, lon={lon}")
    url = "https://serpapi.com/search.json"
    params = {
        "engine": "google_local",
        "q": "attractions near Cubbon Park",
        "ll": f"@{lat},{lon},15z",
        "api_key": SERP_API_KEY
    }
    response = requests.get(url, params=params)
    print(f"Status: {response.status_code}")
    data = response.json()
    local_results = data.get("local_results", [])
    print(f"Found {len(local_results)} results")
    for r in local_results[:3]:
        print(f"- {r.get('title')}")

if __name__ == "__main__":
    test_serp_nearby(12.9716, 77.5946)
