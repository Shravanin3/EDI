import os
from dotenv import load_dotenv

# Load environment variables from the .env file
load_dotenv()

class Config:
    # Environment
    FLASK_ENV = os.getenv("FLASK_ENV", "development")
    
    # Database
    # Database
    # If DATABASE_URL is not set, use local SQLite so backend can run without Postgres.
    # If DATABASE_URL is set but points to Postgres and Postgres is not available,
    # you must start Postgres or override DATABASE_URL.
    # Force SQLite locally if DATABASE_URL is not explicitly provided.
    # (Your current environment has no Postgres running on localhost:5432.)
    DATABASE_URL = os.getenv("DATABASE_URL")
    if not DATABASE_URL or DATABASE_URL.startswith("postgres"):
        DATABASE_URL = "sqlite:///zero_trust.db"

    # Authentication (Clerk)
    CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")

    # ML & LLM Models
    LOCAL_NLP_MODEL = os.getenv("LOCAL_NLP_MODEL", "all-MiniLM-L6-v2")
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

    # GitHub Remediation
    GITHUB_BOT_TOKEN = os.getenv("GITHUB_BOT_TOKEN")
    GITHUB_WEBHOOK_SECRET = os.getenv("GITHUB_WEBHOOK_SECRET")

config = Config()