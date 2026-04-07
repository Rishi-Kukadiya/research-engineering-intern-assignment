import os
import duckdb
import pandas as pd
from bertopic import BERTopic
from umap import UMAP
from hdbscan import HDBSCAN
from sklearn.feature_extraction.text import CountVectorizer


DB_PATH = "../Data/posts.duckdb"
MODEL_DIR = "../backend/models"

def train_clustering_model():
    print("Connecting to DuckDB to fetch text data for clustering...")
    conn = duckdb.connect(DB_PATH)
    
    query = """
        SELECT id, title, selftext 
        FROM posts 
        WHERE title IS NOT NULL OR selftext IS NOT NULL
    """
    df = conn.execute(query).fetchdf()
    conn.close()


    df['selftext'] = df['selftext'].fillna('')
    df['title'] = df['title'].fillna('')
    docs = (df['title'] + ". " + df['selftext'].str[:500]).tolist()

    print(f"Training BERTopic on {len(docs)} documents. This might take a few minutes...")
    umap_model = UMAP(n_neighbors=15, n_components=5, min_dist=0.0, metric='cosine', random_state=42)
    hdbscan_model = HDBSCAN(min_cluster_size=10, metric='euclidean', cluster_selection_method='eom', prediction_data=True)
    vectorizer_model = CountVectorizer(stop_words="english", ngram_range=(1, 2), min_df=2)

    topic_model = BERTopic(
        umap_model=umap_model,
        hdbscan_model=hdbscan_model,
        vectorizer_model=vectorizer_model,
        nr_topics=15, 
        verbose=True
    )

    topics, probs = topic_model.fit_transform(docs)

    os.makedirs(MODEL_DIR, exist_ok=True)
    model_path = os.path.join(MODEL_DIR, "bertopic_k15.pkl")
    topic_model.save(model_path, serialization="pickle")
    
    print(f"Topic Model successfully trained and saved to {model_path}!")

if __name__ == "__main__":
    train_clustering_model()