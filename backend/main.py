from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes import chat
from backend.routes import search
from backend.routes import timeseries 
from backend.routes import network
from backend.routes import clusters
from backend.routes import posts

app = FastAPI(
    title="NarrativeScope API",
    description="Backend engine for social media narrative intelligence",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/v1/health")
def health_check():
    return {"status": "ok", "system": "NarrativeScope Backend Active"}

app.include_router(chat.router, prefix="/api/v1/chat", tags=["Chat"])
app.include_router(search.router, prefix="/api/v1/search", tags=["Search"])
app.include_router(timeseries.router, prefix="/api/v1/timeseries", tags=["TimeSeries"])
app.include_router(network.router, prefix="/api/v1/network", tags=["Network Graph"])
app.include_router(clusters.router, prefix="/api/v1/clusters", tags=["Clusetering Topics"])
app.include_router(posts.router, prefix="/api/v1/posts", tags=["Post Details"]) 