print("[DEBUG] Starting main.py")
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
print("[DEBUG] Importing routers...")
try:
    from backend.routes import chat
    print("[DEBUG] chat router imported")
    from backend.routes import search
    print("[DEBUG] search router imported")
    from backend.routes import timeseries
    print("[DEBUG] timeseries router imported")
    from backend.routes import network
    print("[DEBUG] network router imported")
    from backend.routes import clusters
    print("[DEBUG] clusters router imported")
    from backend.routes import posts
    print("[DEBUG] posts router imported")
    from backend.routes import analytics
    print("[DEBUG] analytics router imported")
except Exception as e:
    print(f"[ERROR] Router import failed: {e}")
    raise

print("[DEBUG] Creating FastAPI app")
app = FastAPI(
    title="NarrativeScope API",
    description="Backend engine for social media narrative intelligence",
    version="1.0.0"
)
print("[DEBUG] FastAPI app created")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
print("[DEBUG] Middleware added")


@app.get("/api/v1/health")
def health_check():
    print("[DEBUG] Health check endpoint called")
    return {"status": "ok", "system": "NarrativeScope Backend Active"}

print("[DEBUG] Including routers...")
app.include_router(chat.router, prefix="/api/v1/chat", tags=["Chat"])
app.include_router(search.router, prefix="/api/v1/search", tags=["Search"])
app.include_router(timeseries.router, prefix="/api/v1/timeseries", tags=["TimeSeries"])
app.include_router(network.router, prefix="/api/v1/network", tags=["Network Graph"])
app.include_router(clusters.router, prefix="/api/v1/clusters", tags=["Clusetering Topics"])
app.include_router(posts.router, prefix="/api/v1/posts", tags=["Post Details"]) 
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["Advanced Analytics"])
print("[DEBUG] All routers included. App startup complete.")