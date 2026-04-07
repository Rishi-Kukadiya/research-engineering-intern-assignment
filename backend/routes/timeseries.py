from fastapi import APIRouter, HTTPException
import duckdb
import os

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DB_PATH = os.path.join(BASE_DIR, "Data", "posts.duckdb")

@router.get("/posts")
def get_posts_timeseries():
    try:
        print("Fetching time-series data from DuckDB...")
        conn = duckdb.connect(DB_PATH)
        
        query = """
            SELECT 
                strftime(to_timestamp(created_utc), '%Y-%m-%d') as date, 
                CAST(COUNT(*) AS INTEGER) as count, 
                CAST(ROUND(AVG(score), 2) AS FLOAT) as avg_score
            FROM posts
            WHERE created_utc IS NOT NULL
            GROUP BY date
            ORDER BY date
        """
        df = conn.execute(query).fetchdf()
        conn.close()
        
        return {"series": df.to_dict(orient="records")}
    except Exception as e:
        print(f"Time-Series API Error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error while fetching timeseries.")