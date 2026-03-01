from fastapi import APIRouter
from pydantic import BaseModel
from app.services.evaluation_service import evaluate_answer, generate_followup_question
from app.database.db import update_progress

router = APIRouter()

class AnswerRequest(BaseModel):
    user_id: str
    topic: str
    question: str
    correct_answer: str
    user_answer: str
    context: str

@router.post("/submit-answer")
def submit_answer(data: AnswerRequest):
    is_correct = evaluate_answer(
        data.question,
        data.correct_answer,
        data.user_answer
    )

    update_progress(data.user_id, data.topic, is_correct)

    if is_correct:
        return {"result": "correct"}

    followup = generate_followup_question(
        data.context,
        data.question
    )

    return {
        "result": "wrong",
        "followup": followup
    }