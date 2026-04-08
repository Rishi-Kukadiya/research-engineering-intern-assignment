import os
import json
from bertopic import BERTopic

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "backend", "models" ,"bertopic_k15.pkl")
OUTPUT_PATH = os.path.join(BASE_DIR, "Data", "topics_data.json")

def generate_topics_json(): 
    print(f"Loading BERTopic model from {MODEL_PATH}...")
    try:
        topic_model = BERTopic.load(MODEL_PATH)
    except FileNotFoundError:
        print(f"Error: Model not found at {MODEL_PATH}")
        return

    print("Fetching topic clusters...")
    topic_info = topic_model.get_topic_info()
    
    topic_info = topic_info[topic_info['Topic'] != -1]
    formatted_topics = []
    for _, row in topic_info.iterrows():
        topic_id = row["Topic"]
        keywords = [word for word, weight in topic_model.get_topic(topic_id)[:5]]
        
        formatted_topics.append({
            "id": int(topic_id),      
            "label": str(row["Name"]),
            "size": int(row["Count"]),
            "keywords": keywords
        })

    final_output = {"topics": formatted_topics}
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(final_output, f, indent=4)

    print(f"Success! Pre-computed data saved to {OUTPUT_PATH}")
if __name__ == "__main__":
    generate_topics_json()