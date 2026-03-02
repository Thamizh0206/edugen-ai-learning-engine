from app.services.embedding_service import generate_embeddings, embed_query
from app.services.chunk_service import chunk_text
from app.services.vector_store import VectorStore
from app.services.llm_service import client
from app.config import settings
import json_repair
import json
import re
import logging

# Set up logging
logger = logging.getLogger("hush")
logger.setLevel(logging.INFO)

def _call_llm_with_fallback(messages: list, max_tokens: int = 3000) -> str:
    """Try each model in settings.MODELS until one succeeds, with generous error handling."""
    last_error = None
    for model in settings.MODELS:
        try:
            logger.info(f"[LLM] Attempting with {model}...")
            response = client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=0.3,
                max_tokens=max_tokens,
                timeout=45.0
            )
            content = response.choices[0].message.content or ""
            if content.strip():
                logger.info(f"[LLM] Success with {model}")
                return content
            logger.warning(f"[LLM] {model} returned empty content, trying next...")
        except Exception as e:
            logger.error(f"[LLM] Error with {model}: {str(e)}")
            last_error = e
            continue
    
    raise last_error or RuntimeError("All AI models are currently overwhelmed. Please try again in 60 seconds.")


def _parse_json(output: str) -> dict:
    # Look for the last JSON object in case there's garbage before/after
    # Use non-greedy match for the content between the first and last curly brace
    match = re.search(r'(\{.*\})', output, re.DOTALL)
    if match: 
        output = match.group(1)
    
    output = output.strip()
    for fence in ("```json", "```"):
        if output.startswith(fence):
            output = output[len(fence):]
            break
    if output.endswith("```"): output = output[:-3]
    output = output.strip()

    try: 
        parsed = json_repair.loads(output)
        if isinstance(parsed, dict): return parsed
    except: pass
    
    try: 
        parsed = json.loads(output)
        if isinstance(parsed, dict): return parsed
    except: pass
    
    raise ValueError(f"The AI generated an invalid response format: {output[:100]}...")


def generate_rag_summary_and_quiz(content: str) -> dict:
    chunks = chunk_text(content)
    if not chunks: raise ValueError("Document is too short.")

    logger.info(f"Generating summary/quiz for content of length {len(content)}")

    # Embedding
    embeddings = generate_embeddings(chunks)
    vector_store = VectorStore(dimension=embeddings.shape[1])
    vector_store.add(embeddings, chunks)

    # Hybrid Retrieval: Always include the first bit of the document + top relevant bits
    query_embedding = embed_query("summary and study questions")
    retrieved_chunks_idx = vector_store.search_indices(query_embedding, top_k=6)
    
    # Combined context (preserving order and removing duplicates)
    selected_indices = sorted(list(set([0, 1] + retrieved_chunks_idx)))
    context_chunks = [chunks[i] for i in selected_indices if i < len(chunks)]
    context = "\n\n".join(context_chunks)

    prompt = (
        "You are an expert educational tutor. Study this text and generate a summary and quiz.\n\n"
        "TEXT CONTENT:\n"
        f"{context}\n\n"
        "REQUIREMENTS:\n"
        "1. 'summary': A concise 3-5 sentence explanation of the main points.\n"
        "2. 'questions': A list of exactly 10 Multiple Choice Questions.\n"
        "   Each MUST have:\n"
        "   - 'question': the query text\n"
        "   - 'options': A list of exactly 4 strings. EACH string MUST start with the letter for that option (e.g., 'A) ...', 'B) ...', 'C) ...', 'D) ...')\n"
        "   - 'answer': A single letter (A, B, C, or D)\n"
        "   - 'explanation': a brief reason why that answer is correct\n\n"
        "IMPORTANT: Output ONLY a valid JSON object. No extra text or markdown formatting."
    )

    output = _call_llm_with_fallback([{"role": "user", "content": prompt}])
    parsed = _parse_json(output)

    summary_text = str(parsed.get("summary", "Summary failed to generate."))

    final_data = {
        "summary": summary_text,
        "questions": []
    }

    raw_qs = parsed.get("questions") or parsed.get("quiz") or parsed.get("mcqs") or []
    if isinstance(raw_qs, list):
        for q in raw_qs:
            if isinstance(q, dict) and q.get("question") and q.get("options"):
                ans = str(q.get("answer", "A")).strip().upper()
                if len(ans) > 1: ans = ans[0] if ans[0] in "ABCD" else "A"
                
                # Force letter prefixes in options if missing
                opts = []
                letters = ["A)", "B)", "C)", "D)"]
                for i, opt in enumerate(q["options"][:4]):
                    opt_str = str(opt).strip()
                    if not any(opt_str.startswith(l) for l in letters):
                        opt_str = f"{letters[i]} {opt_str}"
                    opts.append(opt_str)

                final_data["questions"].append({
                    "question": str(q["question"]),
                    "options": opts,
                    "answer": ans,
                    "explanation": str(q.get("explanation", ""))
                })

    logger.info(f"Successfully generated summary and {len(final_data['questions'])} questions")
    return final_data