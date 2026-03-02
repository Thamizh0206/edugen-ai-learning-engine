from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.routes.upload import router as upload_router
from app.routes import quiz
from app.database.db import init_db
import os
import traceback

# --- Rate limiter ---
limiter = Limiter(key_func=get_remote_address)

# ---- DB init ----
init_db()

# ---- App ----
app = FastAPI(title="Hush", description="AI-powered note summarizer and quiz generator")
app.state.limiter = limiter

# --- Routes ---
app.include_router(upload_router)
app.include_router(quiz.router)

# --- Errors ---
@app.exception_handler(RateLimitExceeded)
def rate_limit_handler(request, exc):
    return JSONResponse(status_code=429, content={"error": "Rate limit exceeded. Please try again later."})

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"error": f"An unexpected error occurred: {str(exc)}"}
    )

# --- Static files & Frontend ---
# Serve Vite build if available
if os.path.exists("frontend/dist"):
    app.mount("/assets", StaticFiles(directory="frontend/dist/assets"), name="assets")

@app.get("/")
def read_root():
    # Production React path
    index_path = os.path.join("frontend/dist", "index.html")
    if not os.path.exists(index_path):
        # Fallback to dev/old path
        index_path = os.path.join("frontend_old", "index.html")
    
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"message": "Welcome to Hush (frontend code not detected)"}

# --- Startup ---
@app.on_event("startup")
async def warmup():
    print("[STARTUP] Pre-loading embedding model...")
    from app.services.embedding_service import embedder  # noqa
    print("[STARTUP] Embedding model ready.")
