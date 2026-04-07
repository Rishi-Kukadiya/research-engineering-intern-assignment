from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.service.search_service import search_posts
import os 



router = APIRouter()
class SearchRequest(BaseModel):
    query: str
    top_k: int = 10

@router.post("/semantic")
async def semantic_search(request: SearchRequest):
    try:
        print(f"Executing semantic search for: {request.query}")
        results = search_posts(request.query, request.top_k)
        return {
            "results": results, 
            "total": len(results)
        }
    except Exception as e:
        print(f"Search API Error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during search.")