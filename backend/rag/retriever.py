import os
import json
import math
import logging
from typing import List, Dict, Any
# pyrefly: ignore [missing-import]
from langchain_core.documents import Document
from langchain_community.vectorstores import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.embeddings import FakeEmbeddings
from dotenv import load_dotenv

load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LilaRetriever:
    def __init__(self, dataset_path: str, persist_directory: str = None):
        self.dataset_path = dataset_path
        
        # Use /tmp for ChromaDB on Vercel because the filesystem is read-only
        if persist_directory:
            self.persist_directory = persist_directory
        elif os.getenv("VERCEL"):
            self.persist_directory = "/tmp/chroma_db"
        else:
            self.persist_directory = "./chroma_db"
        
        api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
        if not api_key or "your_google_api_key" in api_key.lower():
            logger.warning("GOOGLE_API_KEY not found or invalid. Using FakeEmbeddings for development.")
            self.embeddings = FakeEmbeddings(size=768)
        else:
            self.embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
            
        self.vectorstore = None
        self.places_data = []
        self._initialize()

    def _initialize(self):
        logger.info(f"Initializing LilaRetriever with dataset: {self.dataset_path}")
        try:
            # Wipe existing vectorstore to prevent duplicates on reload
            if os.path.exists(self.persist_directory):
                import shutil
                try:
                    shutil.rmtree(self.persist_directory)
                    logger.info(f"Cleared existing vectorstore at {self.persist_directory}")
                except Exception as e:
                    logger.warning(f"Could not clear vectorstore (likely file lock on Windows): {e}")
                    logger.info("Proceeding with existing vectorstore.")

            # Load JSON data
            if not os.path.exists(self.dataset_path):
                logger.error(f"Dataset not found at {self.dataset_path}")
                return

            with open(self.dataset_path, "r") as f:
                data = json.load(f)
                self.places_data = data.get("places", [])

            documents = []
            for place in self.places_data:
                content = f"""
Name: {place['name']}
Address: {place['address']}
Rating: {place['rating']} ({place['rating_count']} reviews)
Hours: {place['hours']}
Budget: {place['budget']['range']} — {place['budget']['notes']}
Description: {place['description']}
Highlights: {', '.join(place['highlights'])}
Best for (who): {', '.join(place['tags']['who'])}
Best for (time): {', '.join(place['tags']['time'])}
Best for (vibe): {', '.join(place['tags']['vibe'])}
""".strip()
                
                documents.append(Document(
                    page_content=content,
                    metadata={
                        "id": str(place.get("id", place["name"])),
                        "name": place["name"],
                        "budget_level": place["budget"]["level"],
                        "who": ", ".join(place["tags"]["who"]),
                        "time": ", ".join(place["tags"]["time"]),
                        "vibe": ", ".join(place["tags"]["vibe"]),
                        "rating": place["rating"],
                        "rating_count": place["rating_count"],
                        "latitude": place["latitude"],
                        "longitude": place["longitude"]
                    }
                ))

            # If we couldn't clear the directory, try to load it first to check if it's empty
            if os.path.exists(self.persist_directory) and os.listdir(self.persist_directory):
                self.vectorstore = Chroma(
                    persist_directory=self.persist_directory,
                    embedding_function=self.embeddings
                )
                try:
                    count = len(self.vectorstore.get()['ids'])
                    if count > 0:
                        logger.info(f"Loaded existing vectorstore with {count} documents.")
                        return
                except:
                    pass

            logger.info(f"Creating vectorstore with {len(documents)} documents...")
            self.vectorstore = Chroma.from_documents(
                documents,
                self.embeddings,
                persist_directory=self.persist_directory
            )
            logger.info("Retriever initialization complete.")
        except Exception as e:
            logger.error(f"Failed to initialize retriever: {e}")
            # Fallback to empty vectorstore if needed
            pass

    def retrieve(self, query: str, k: int = 20) -> List[Dict[str, Any]]:
        if not self.vectorstore:
            logger.warning("Vectorstore not initialized. Returning random samples.")
            # Fallback: return first k places
            return [{"place": p, "semantic_score": 0.5} for p in self.places_data[:k]]
            
        try:
            results = self.vectorstore.similarity_search_with_score(query, k=k)
            
            processed_results = []
            for doc, score in results:
                place_id = doc.metadata["id"]
                # Find full place data
                place = next((p for p in self.places_data if str(p.get("id", p["name"])) == place_id), None)
                if place:
                    # Lower score is better in Chroma (distance), we convert to similarity
                    similarity = 1.0 / (1.0 + score) if score != -1 else 0.5
                    processed_results.append({
                        "place": place,
                        "semantic_score": similarity
                    })
            
            return processed_results
        except Exception as e:
            logger.error(f"Search failed: {e}")
            return [{"place": p, "semantic_score": 0.5} for p in self.places_data[:k]]

def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def calculate_weighted_score(place: Dict[str, Any], payload: Dict[str, Any], semantic_score: float, distance_km: float = None) -> Dict[str, Any]:
    w = {
        "mood": 0.25,
        "semantic": 0.15,
        "who": 0.15,
        "time": 0.10,
        "budget": 0.10,
        "distance": 0.15,
        "rating": 0.05,
        "popularity": 0.05
    }
    
    scores = {}
    
    # 1. Who Match
    who_tags = [t.lower() for t in place["tags"]["who"]]
    scores["who"] = 1.0 if payload["who"].lower() in who_tags else 0.5
    
    # 2. Time Match
    time_tags = [t.lower() for t in place["tags"]["time"]]
    scores["time"] = 1.0 if payload["time"].lower() in time_tags else 0.5
    
    # 3. Budget Match
    budget_level = place["budget"]["level"].lower()
    scores["budget"] = 1.0 if payload["budget"].lower() == budget_level else 0.5
    
    # 4. Mood/Vibe Match
    vibe_tags = [t.lower() for t in place["tags"]["vibe"]]
    req_vibes = [v.lower() for v in payload["vibes"]]
    vibe_matches = len(set(req_vibes) & set(vibe_tags))
    scores["mood"] = vibe_matches / len(req_vibes) if req_vibes else 1.0
    
    # 5. Semantic Score
    scores["semantic"] = semantic_score
    
    # 6. Distance Score
    if distance_km is not None:
        scores["distance"] = max(0, 1 - (distance_km / 50)) 
    else:
        scores["distance"] = 1.0
        
    # 7. Rating Score
    scores["rating"] = place["rating"] / 5.0
    
    # 8. Popularity Score
    scores["popularity"] = min(1.0, place["rating_count"] / 1000)

    total_score = sum(scores[k] * w[k] for k in w)
    
    match_reasons = []
    if scores["who"] == 1.0: match_reasons.append(f"Perfect for {payload['who']}")
    if scores["mood"] > 0.5: match_reasons.append("Matches your requested vibe")
    if scores["budget"] == 1.0: match_reasons.append("Fits your budget")
    
    return {
        "total_score": round(total_score * 100),
        "match_reasons": match_reasons,
        "scores": scores
    }
