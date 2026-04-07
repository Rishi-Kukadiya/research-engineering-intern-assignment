import os
import requests
import chromadb
from dotenv import load_dotenv

load_dotenv()
HF_TOKEN = os.getenv("HUGGINGFACE_API_KEY")
API_URL = "https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction"
headers = {"Authorization": f"Bearer {HF_TOKEN}"}

CHROMA_PATH = "../Data/chroma_db"

chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)
collection = chroma_client.get_collection(name="posts_v1")

def embed_query(query_text: str) -> list[float]:
    response = requests.post(API_URL, headers=headers, json={"inputs": [query_text]})
    if response.status_code == 200:
        return response.json()[0] 
    else:
        raise Exception(f"Failed to embed query: {response.text}")

def search_posts(query: str, top_k: int = 10) -> list[dict]:
    print(f"Searching database for: '{query}'")
    query_embedding = embed_query(query)
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k
    )
    
    formatted_results = []
    if results['ids'] and len(results['ids']) > 0:
        for i in range(len(results['ids'][0])):
            formatted_results.append({
                "id": results['ids'][0][i],
                "document": results['documents'][0][i],
                "metadata": results['metadatas'][0][i],
                "distance": results['distances'][0][i] 
            })
            
    return formatted_results