from fastapi import FastAPI
from app.routes.upload import router as upload_router
from app.database.db import init_db
from app.routes import quiz
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse
import os

limiter = Limiter(key_func=get_remote_address)

init_db()
app = FastAPI()
app.state.limiter = limiter

# Serve static files
app.mount("/static", StaticFiles(directory="frontend"), name="static")

@app.exception_handler(RateLimitExceeded)
def rate_limit_handler(request, exc):
    return JSONResponse(status_code=429, content={"detail": "Rate limit exceeded"})

app.include_router(quiz.router)
app.include_router(upload_router)

@app.get("/")
def read_root():
    index_path = os.path.join("frontend", "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"message": "Welcome to Hush Project (Frontend not found)"}
