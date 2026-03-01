from openai import OpenAI
from app.config import settings
import json

client = OpenAI(
    api_key=settings.OPENROUTER_API_KEY,
    base_url="https://openrouter.ai/api/v1"
)

def generate_summary_and_quiz(content: str) -> dict:
    prompt = f"""
You are an AI exam preparation assistant.

Based ONLY on the provided content:

1. Generate a structured 1-page summary.
2. Generate exactly 20 multiple-choice questions.
3. Each question must have 4 options.
4. Provide correct answer.
5. Provide explanation.

Return strictly in JSON format:
{{
  "summary": "...",
  "quiz": [
    {{
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "answer": "...",
      "explanation": "..."
    }}
  ]
}}

Content:
{content}
"""

    response = client.chat.completions.create(
        model=settings.MODEL,
        messages=[
            {"role": "system", "content": "You output strictly valid JSON."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3
        
    )

    output = response.choices[0].message.content

    try:
        return json.loads(output)
    except:
        raise ValueError("Model returned invalid JSON.")