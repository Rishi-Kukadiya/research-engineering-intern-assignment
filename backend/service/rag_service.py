import os
from groq import Groq
from dotenv import load_dotenv
from backend.service.search_service import search_posts

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

SYSTEM_PROMPT = """
    You are the Lead Intelligence Analyst for NarrativeScope, a specialized investigative dashboard tracking digital narratives, influence operations, and community sentiment.

    Your objective is to synthesize the provided Reddit data into objective, analytical, and highly accurate intelligence reports.

    CRITICAL RULES & GUARDRAILS:
    1. STRICT GROUNDING: You must ONLY use the information provided in the CONTEXT DATA. Do NOT use outside knowledge, speculate, or hallucinate facts.
    2. MANDATORY CITATIONS: Every claim, quote, or metric you synthesize MUST be immediately followed by its source citation in brackets (e.g., "This narrative is heavily pushed by [Author: Algnoknights1 | Score: 450]").
    3. NARRATIVE FORMAT: Write in a cohesive, professional narrative paragraph structure. DO NOT use scattered bullet points or fragmented lists. Write flowing, analytical paragraphs that read like a continuous intelligence briefing.
    4. HANDLING MISSING DATA: If the CONTEXT DATA does not contain the answer, explicitly state: "There is insufficient data in the retrieved context to answer this query."
    5. ANALYTICAL TONE: Write like an investigative journalist. Be concise, objective, and neutral. Avoid conversational filler.
"""

def build_context_string(retrieved_posts: list[dict]) -> str:
    lines = []
    for i, post in enumerate(retrieved_posts):
        meta = post['metadata']
        lines.append(
            f"[{i+1}] Title: {post['document'].split('.')[0]}\n"
            f"    Author: {meta.get('author', 'Unknown')} | Score: {meta.get('score', 0)} | Domain: {meta.get('domain', 'N/A')}\n"
            f"    Content: {post['document'][:400]}..." 
        )
    return "\n\n".join(lines)

def generate_rag_answer(user_query: str) -> dict:
    retrieved_posts = search_posts(user_query, top_k=8)
    if not retrieved_posts:
        return {"answer": "I couldn't find any relevant posts in the database for this query.", "sources": []}
        
    context_str = build_context_string(retrieved_posts)
    prompt = f"""
    Context posts from our dataset:
    {context_str}
    
    User Question: {user_query}
    Please provide a detailed analysis based ONLY on the context above.
    """
    
    print("Asking Groq for the analysis...")
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile", 
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3, 
        max_tokens=500
    )
    
    return {
        "answer": response.choices[0].message.content,
        "sources": retrieved_posts
    }


if __name__ == "__main__":
    test_query = "What are people saying about police violence?"
    print(f"Testing RAG Pipeline with query: '{test_query}'\n")
    result = generate_rag_answer(test_query)
    print("\n--- AI ANSWER ---")
    print(result["answer"])
    print(result["sources"])