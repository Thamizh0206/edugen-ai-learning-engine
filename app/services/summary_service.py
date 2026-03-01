from app.services.embedding_service import generate_embeddings, embed_query
from app.services.chunk_service import chunk_text
from app.services.vector_store import VectorStore
from app.services.llm_service import client
from app.config import settings
import json_repair

def generate_rag_summary_and_quiz(content: str):
    chunks = chunk_text(content)

    embeddings = generate_embeddings(chunks)

    vector_store = VectorStore(dimension=embeddings.shape[1])
    vector_store.add(embeddings, chunks)

    query_embedding = embed_query("Generate summary and quiz")

    retrieved_chunks = vector_store.search(query_embedding)

    context = "\n\n".join(retrieved_chunks)

    prompt = f"""
Use ONLY the context below.

{context}

Generate a JSON object with exactly these two keys:
1. "summary": A structured 1-page summary (string)
2. "questions": A list of 20 MCQs. Each object in the list must have:
   - "question": (string)
   - "options": (list of 4 strings like ["A) ...", "B) ..."])
   - "answer": (string, e.g., "A")
   - "explanation": (string)

Return ONLY valid JSON. Do not add any extra text or conversational filler.
"""

    response = client.chat.completions.create(
        model=settings.MODEL,
        messages=[
            {"role": "system", "content": "You are a helpful AI designed strictly to output raw, minified JSON without markdown code blocks, and nothing else."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3
    )

    output = response.choices[0].message.content
    
    if not output:
        raise ValueError("Received empty output from LLM.")

    # Clean markdown formatting if present
    output = output.strip()
    if output.startswith("```json"):
        output = output[7:]
    elif output.startswith("```"):
        output = output[3:]
        
    if output.endswith("```"):
        output = output[:-3]
        
    output = output.strip()

    try:
        # Use json_repair for best-effort robust JSON extraction
        parsed = json_repair.loads(output)
        if hasattr(parsed, "keys") and "questions" in parsed and "summary" in parsed:
             return parsed
        else:
             import json
             return json.loads(output) # Fallback to strict if it somehow thinks it's valid
    except Exception as e:
        print(f"Failed to decode JSON even with json_repair. Raw output:\n{response.choices[0].message.content}")
        raise ValueError(f"LLM generated invalid JSON: {str(e)}")