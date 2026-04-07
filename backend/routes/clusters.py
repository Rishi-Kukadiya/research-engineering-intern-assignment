from fastapi import APIRouter, HTTPException
from bertopic import BERTopic
import os

router = APIRouter()


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "models", "bertopic_k15.pkl")

topic_model = None
@router.get("/topics")
def get_topics():
    global topic_model
    try:
        if topic_model is None:
            print("Loading BERTopic model into memory (this happens only once)...")
            if not os.path.exists(MODEL_PATH):
                raise HTTPException(status_code=404, detail="Model not found. Run train_topics.py first.")
            topic_model = BERTopic.load(MODEL_PATH)
            
        print("Fetching topic clusters...")
        topic_info = topic_model.get_topic_info()
        topic_info = topic_info[topic_info['Topic'] != -1]
        

        formatted_topics = []
        for _, row in topic_info.iterrows():
            topic_id = row["Topic"]
            keywords = [word for word, weight in topic_model.get_topic(topic_id)[:5]]
            
            formatted_topics.append({
                "id": topic_id,
                "label": row["Name"],
                "size": row["Count"],
                "keywords": keywords
            })
            
        return {"topics": formatted_topics}
        
    except Exception as e:
        print(f"Cluster API Error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error while fetching topics.")