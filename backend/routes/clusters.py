from fastapi import APIRouter, HTTPException
import os
import json

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_PATH = os.path.join(BASE_DIR, "Data", "topics_data.json")
@router.get("/topics")
def get_topics():
    try:
        print(DATA_PATH)
        if not os.path.exists(DATA_PATH):
            raise HTTPException(
                status_code=404, 
                detail="Topics data not found. Ensure topics_data.json is deployed."
            )
            
        with open(DATA_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        return data
        
    except Exception as e:
        print(f"Cluster API Error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error while fetching topics.")