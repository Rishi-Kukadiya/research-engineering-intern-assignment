from fastapi import APIRouter, HTTPException
import json
import os

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
GRAPH_PATH = os.path.join(BASE_DIR, "Data", "network_graph.json")

@router.get("/graph")
def get_network_graph():
    try:
        print("Serving network graph data...")
        if not os.path.exists(GRAPH_PATH):
            raise HTTPException(status_code=404, detail="Graph data not found. Did you run build_graph.py?")
            
        with open(GRAPH_PATH, "r", encoding="utf-8") as f:
            graph_data = json.load(f)
            
        return graph_data
    except Exception as e:
        print(f"Network API Error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error while fetching graph.")