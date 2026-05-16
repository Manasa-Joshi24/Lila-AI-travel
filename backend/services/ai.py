import os
from typing import List, Dict, Any
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')
else:
    model = None

def generate_ai_summary(place_name: str, vibe: str, weather_condition: str) -> str:
    if not model:
        return f"A beautiful {vibe} spot in Bengaluru. Perfect for your current mood and the {weather_condition} weather."
        
    prompt = f"""
    Create a short, cinematic, and personalized 2-sentence travel summary for a place called '{place_name}'.
    The vibe is '{vibe}' and the current weather is '{weather_condition}'.
    Make it sound like a narrator in a high-end travel documentary.
    Do not use hashtags or emojis.
    """
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"AI Generation failed: {e}")
        return f"Discover the magic of {place_name}, where the {vibe} atmosphere meets a perfect {weather_condition} day."
