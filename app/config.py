import os
from dotenv import load_dotenv

load_dotenv(override=True)

class Settings:
    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
    # Extended list of free models to handle high congestion times
    MODELS = [
        "google/gemma-3-27b-it:free",
        "mistralai/mistral-small-3.1-24b-instruct:free",
        "meta-llama/llama-3.3-70b-instruct:free",   
        "arcee-ai/trinity-mini:free",
        "openai/gpt-oss-20b:free",
        "arcee-ai/trinity-large-preview:free",
        "stepfun/step-3.5-flash:free",
    ]

settings = Settings()