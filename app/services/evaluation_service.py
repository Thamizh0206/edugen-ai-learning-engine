from app.services.llm_service import client
from app.config import settings
import json

def evaluate_answer(question, correct_answer, user_answer):
    return user_answer.strip().lower() == correct_answer.strip().lower()

def generate_followup_question(context, question):
    prompt = f"""
User answered incorrectly.

Original Question:
{question}

Generate a similar question testing the same concept.
Return JSON:
{{
  "question": "...",
  "options": ["A", "B", "C", "D"],
  "answer": "...",
  "explanation": "..."
}}
"""

    response = client.chat.completions.create(
        model=settings.MODEL,
        messages=[
            {"role": "system", "content": "Return strictly valid JSON."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.4
    )

    return json.loads(response.choices[0].message.content)