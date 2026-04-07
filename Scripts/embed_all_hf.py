import os
import duckdb
import chromadb
import requests
import time
import pandas as pd 
from dotenv import load_dotenv


load_dotenv()
HF_TOKEN = os.getenv("HUGGINGFACE_API_KEY")
API_URL = "https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction"
headers = {"Authorization": f"Bearer {HF_TOKEN}"}


DB_PATH = "../Data/posts.duckdb"
CHROMA_PATH = "../Data/chroma_db"
BATCH_SIZE = 100

def prepare_text(row):
    title = str(row.get('title', '')).strip()
    selftext = str(row.get('selftext', '')).strip()
    flair = str(row.get('link_flair_text', '')).strip()
    
    if selftext in ("[removed]", "[deleted]", "nan", "None"):
        selftext = ""
        
    flair_tag = f"[{flair}] " if flair and flair != "nan" else ""
    return f"{flair_tag}{title}. {selftext[:500]}".strip()

def query_huggingface(texts):
    while True:
        try:
            response = requests.post(API_URL, headers=headers, json={"inputs": texts})
            
            if response.status_code == 200:
                return response.json()

            error_data = response.json()
            if "estimated_time" in error_data:
                wait_time = error_data["estimated_time"]
                print(f"Model is waking up. Waiting {wait_time:.1f} seconds...")
                time.sleep(wait_time + 1) 
            else:
                print(f"API Error: {error_data}")
                raise Exception(f"Hugging Face API failed with status {response.status_code}.")
                
        except requests.exceptions.RequestException as e:
            print(f"Network error occurred: {e}. Retrying in 5 seconds...")
            time.sleep(5)

def run_hf_cloud_embedding():
    print("Start embedding....")
    os.makedirs(CHROMA_PATH, exist_ok=True)
    chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)
    
    collection = chroma_client.get_or_create_collection(
        name="posts_v1", 
        metadata={"hnsw:space": "cosine"}
    )

    
    print("Connecting to DuckDB...")
    conn = duckdb.connect(DB_PATH)
    df = conn.execute("SELECT * FROM posts").fetchdf()
    posts = df.to_dict(orient="records")
    conn.close()

    total_posts = len(posts)
    print(f"Found {total_posts} posts. Sending to the cloud...\n")

    
    for i in range(0, total_posts, BATCH_SIZE):
        batch = posts[i:i + BATCH_SIZE]
        
        ids = [str(row.get('id', f'post_{j}')) for j, row in enumerate(batch)]
        texts_to_embed = [prepare_text(row) for row in batch]
        
        metadatas = [{
            "author": str(row.get('author', 'unknown')),
            "subreddit": str(row.get('subreddit', 'unknown')),
            "score": float(row.get('score', 0.0) if not pd.isna(row.get('score')) else 0.0),
            "domain": str(row.get('domain', '')),
            "flair": str(row.get('link_flair_text', '')),
            "created_utc": float(row.get('created_utc', 0) if not pd.isna(row.get('created_utc')) else 0)
        } for row in batch]

        print(f"Cloud processing batch {i} to {min(i + BATCH_SIZE, total_posts)}...")
        embeddings = query_huggingface(texts_to_embed)
        collection.upsert(
            ids=ids,
            embeddings=embeddings,
            documents=texts_to_embed,
            metadatas=metadatas
        )
        
        time.sleep(1)

    print("\nHugging Face Cloud Pipeline Complete! ChromaDB is fully populated.")

if __name__ == "__main__":
    run_hf_cloud_embedding()