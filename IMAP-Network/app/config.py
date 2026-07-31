import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from cryptography.fernet import Fernet

class Settings(BaseSettings):
    # --- Security ---
    # Encryption key for stored IMAP passwords (Fernet).
    ENCRYPTION_KEY: str = os.getenv("ENCRYPTION_KEY", Fernet.generate_key().decode())

    # --- Database ---
    # Default to SQLite so the app runs with ZERO external infrastructure
    # (great for demos / recruiters cloning the repo). Point DATABASE_URL at
    # MySQL/Postgres in .env for a real deployment, e.g.
    #   mysql+pymysql://root@localhost:3308/receipt_manager
    DATABASE_URL: str = "sqlite:///./data/savy.db"

    # --- JWT Authentication ---
    SECRET_KEY: str = "YOUR_SECRET_KEY_HERE"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:3001"]
    API_V1_PREFIX: str = "/api/v1"

    # --- LLM (OpenAI-compatible endpoint, e.g. KKU IntelSphere) ---
    OPENAI_API_KEY: str = ""
    OPENAI_BASE_URL: str | None = None          # None => api.openai.com
    LLM_MODEL: str = "qwen3.7-max"              # text agent / advisor
    VISION_MODEL: str = "gemini-2.5-flash"     # multimodal slip/receipt OCR

    # --- Vector store (Qdrant) ---
    # Embedded file mode by default => no server needed.
    # Point at http://localhost:6333 to use a running Qdrant server.
    QDRANT_LOCATION: str = "./data/qdrant"
    QDRANT_COLLECTION: str = "receipts"
    EMBEDDING_MODEL: str = "BAAI/bge-small-en-v1.5"  # local via fastembed

    # --- Agent behaviour ---
    MAX_TOOL_ITERATIONS: int = 6

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def llm_configured(self) -> bool:
        return bool(self.OPENAI_API_KEY)

settings = Settings()
