from fastapi import APIRouter, UploadFile, File
from app.services.summary_service import generate_rag_summary_and_quiz

router = APIRouter()

@router.post("/upload")
async def upload_notes(file: UploadFile = File(...)):
    content = await file.read()
    text = content.decode("utf-8")

    result = generate_rag_summary_and_quiz(text)

    return result