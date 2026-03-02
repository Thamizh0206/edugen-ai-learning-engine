from app.database.db import get_doc_hash, get_cached_response, save_cache
from slowapi import Limiter
from slowapi.util import get_remote_address
from fastapi import Request, APIRouter, UploadFile, File, BackgroundTasks
from app.services.summary_service import generate_rag_summary_and_quiz

router = APIRouter()

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

processing_tasks = set()

def process_document(text: str, doc_hash: str):
    try:
        result = generate_rag_summary_and_quiz(text)
        save_cache(doc_hash, result)
    except Exception as e:
        import traceback
        traceback.print_exc()
        save_cache(doc_hash, {"error": f"Processing failed: {str(e)}"})
    finally:
        processing_tasks.discard(doc_hash)

import fitz  # PyMuPDF
import io

@router.post("/upload")
async def upload_notes(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    content = await file.read()
    
    if len(content) > MAX_FILE_SIZE:
        return {"error": "File too large. Max 5MB allowed."}

    text = ""
    if file.filename.endswith(".pdf"):
        # Process PDF using PyMuPDF
        pdf_stream = io.BytesIO(content)
        with fitz.open(stream=pdf_stream, filetype="pdf") as doc:
            for page in doc:
                text += page.get_text() + "\n"
    elif file.filename.endswith(".txt"):
        # Process raw text
        text = content.decode("utf-8", errors="ignore")
    else:
        return {"error": "Unsupported file format. Please upload .txt or .pdf files."}
    
    if not text.strip():
        return {"error": "Could not extract text from the uploaded file."}

    doc_hash = get_doc_hash(text)
    cached = get_cached_response(doc_hash)

    if cached:
        return {"status": "ready", "data": cached}

    if doc_hash in processing_tasks:
        return {"status": "processing", "doc_hash": doc_hash}

    processing_tasks.add(doc_hash)
    background_tasks.add_task(process_document, text, doc_hash)

    return {"status": "processing", "doc_hash": doc_hash}

@router.get("/status/{doc_hash}")
def check_status(doc_hash: str):
    cached = get_cached_response(doc_hash)
    if cached:
        return {"status": "ready", "data": cached}
    if doc_hash in processing_tasks:
        return {"status": "processing"}
    return {"status": "error", "error": "Task failed or disappeared."}
