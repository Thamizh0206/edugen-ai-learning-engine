import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
    MODEL = "liquid/lfm-2.5-1.2b-instruct:free"

settings = Settings()