from fastapi import APIRouter, HTTPException
import duckdb
import os

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DB_PATH = os.path.join(BASE_DIR, "Data", "posts.duckdb")

@router.get("/anomalies")
def get_viral_anomalies():
    try:
        print("Fetching viral anomalies from DuckDB...")
        conn = duckdb.connect(DB_PATH)
        
        query = """
        WITH AuthorBaseline AS (
            SELECT 
                author, 
                COUNT(*) as total_posts,
                AVG(score) as mean_score, 
                STDDEV_POP(score) as std_score
            FROM posts 
            WHERE author IS NOT NULL AND author != '[deleted]'
            GROUP BY author 
            HAVING COUNT(*) > 3
        )
        SELECT 
            p.title, 
            p.author, 
            CAST(p.score AS FLOAT) as score, 
            CAST(p.num_comments AS INTEGER) as num_comments,
            p.domain,
            CAST(ROUND(b.mean_score, 2) AS FLOAT) as mean_score,
            CAST(CASE 
                WHEN b.std_score > 0 THEN ROUND((p.score - b.mean_score) / b.std_score, 2) 
                ELSE 0 
            END AS FLOAT) as virality_z_score
        FROM posts p
        JOIN AuthorBaseline b ON p.author = b.author
        WHERE CASE WHEN b.std_score > 0 THEN (p.score - b.mean_score) / b.std_score ELSE 0 END > 2.5
        ORDER BY virality_z_score DESC
        LIMIT 50;
        """
        df = conn.execute(query).fetchdf()
        conn.close()
        
        df = df.fillna("")
        return {"anomalies": df.to_dict(orient="records")}
        
    except Exception as e:
        print(f"Anomalies API Error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/polarization")
def get_media_polarization():
    try:
        print("Fetching media polarization from DuckDB...")
        conn = duckdb.connect(DB_PATH)
        
        query = """
        SELECT 
            link_flair_text as topic_category, 
            domain as media_source, 
            CAST(COUNT(*) AS INTEGER) as citation_count,
            CAST(ROUND(AVG(score), 2) AS FLOAT) as avg_engagement
        FROM posts
        WHERE 
            link_flair_text IS NOT NULL 
            AND link_flair_text != 'nan'
            AND domain IS NOT NULL 
            AND domain NOT LIKE '%reddit.com%'
            AND domain NOT LIKE '%redd.it%'
        GROUP BY link_flair_text, domain
        HAVING COUNT(*) >= 5 
        ORDER BY citation_count DESC
        LIMIT 40;
        """
        df = conn.execute(query).fetchdf()
        conn.close()
        
        df = df.fillna("")
        return {"polarization": df.to_dict(orient="records")}
        
    except Exception as e:
        print(f"Polarization API Error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")