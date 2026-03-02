from app.services.llm_service import client
from app.config import settings
import json
import json_repair


def _call_llm_with_fallback(messages: list, max_tokens: int = 400) -> str:
    """Try each model in settings.MODELS until one succeeds."""
    last_error = None
    for model in settings.MODELS:
        try:
            response = client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=0.4,
                max_tokens=max_tokens
            )
            return response.choices[0].message.content or ""
        except Exception as e:
            err_str = str(e)
            if "429" in err_str or "rate" in err_str.lower() or "unavailable" in err_str.lower():
                last_error = e
                continue
            raise
    raise last_error or RuntimeError("All models failed.")


def evaluate_answer(question: str, correct_answer: str, user_answer: str) -> bool:
    """Simple exact-match check (case-insensitive, trimmed)."""
    return user_answer.strip().lower() == correct_answer.strip().lower()


def generate_followup_question(context: str, question: str) -> dict:
    """Generate a follow-up MCQ when the user answers incorrectly."""
    prompt = (
        f'The user answered this question incorrectly: "{question}"\n\n'
        "Generate ONE new question testing the same concept.\n"
        "Return ONLY valid JSON with these exact keys:\n"
        '{"question": "...", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "answer": "A", "explanation": "..."}'
    )

    messages = [
        {"role": "user", "content": "You output raw JSON only. No markdown or extra text.\n\n" + prompt}
    ]

    try:
        output = _call_llm_with_fallback(messages, max_tokens=400)
        output = output.strip()
        for fence in ("```json", "```"):
            if output.startswith(fence):
                output = output[len(fence):]
                break
        if output.endswith("```"):
            output = output[:-3]
        output = output.strip()

        try:
            return json_repair.loads(output)
        except Exception:
            return json.loads(output)

    except Exception:
        return {
            "question": "Could not generate a follow-up question.",
            "options": [],
            "answer": "",
            "explanation": ""
        }