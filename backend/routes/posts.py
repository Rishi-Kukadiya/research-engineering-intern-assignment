from fastapi import APIRouter, HTTPException
import duckdb
import os

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DB_PATH = os.path.join(BASE_DIR, "Data", "posts.duckdb")

@router.get("/{post_id}")
def get_post_details(post_id: str):
    try:
        print(f"Fetching full details for post ID: {post_id}")
        conn = duckdb.connect(DB_PATH)
        
        query = f"SELECT * FROM posts WHERE id = '{post_id}' LIMIT 1"
        df = conn.execute(query).fetchdf()
        conn.close()

        if df.empty:
            raise HTTPException(status_code=404, detail="Post not found in database.")

        post_data = df.to_dict(orient="records")[0]
        cleaned_data = {k: ("" if str(v) == "nan" else v) for k, v in post_data.items()}

        return cleaned_data
        
    except Exception as e:
        print(f"Error fetching post details: {e}")
        raise HTTPException(status_code=500, detail="Internal server error while fetching post.")