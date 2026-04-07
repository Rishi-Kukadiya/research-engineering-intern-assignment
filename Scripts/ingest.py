import pandas as pd
import duckdb
from pathlib import Path

def initialize_from_csv(csv_path: str, parquet_path: str, db_path: str):
    print(f"Loading pre-cleaned CSV from {csv_path}...")
    df = pd.read_csv(csv_path)
    
    if 'selftext' in df.columns:
        df['selftext'] = df['selftext'].fillna('')
    if 'title' in df.columns:
        df['title'] = df['title'].fillna('')
        
    Path(parquet_path).parent.mkdir(parents=True, exist_ok=True)
    df.to_parquet(parquet_path, index=False)
    print(f"Converted CSV to Parquet at {parquet_path}")


    print("Initializing DuckDB base table...")
    Path(db_path).parent.mkdir(parents=True, exist_ok=True)
    conn = duckdb.connect(db_path)
    
    conn.execute(f"CREATE TABLE IF NOT EXISTS posts AS SELECT * FROM read_parquet('{parquet_path}');")
    print("DuckDB initialized successfully.")
    conn.close()

if __name__ == "__main__":
    
    CSV_FILE = "../Data/reddit_cleaned.csv" 
    PARQUET_FILE = "../Data/posts.parquet"
    DB_FILE = "../Data/posts.duckdb"
    
    if Path(CSV_FILE).exists():
        initialize_from_csv(CSV_FILE, PARQUET_FILE, DB_FILE)
    else:
        print(f"Error: Could not find {CSV_FILE}. Please check the filename and path.")