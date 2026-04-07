from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.service.rag_service import generate_rag_answer

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str
    sources: list

@router.post("/message", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    try:
        print(f"Received query: {request.message}")
        result = generate_rag_answer(request.message)
        
        return ChatResponse(
            reply=result["answer"],
            sources=result["sources"]
        )
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail="Internal server error while generating response.")