"""Application configuration using Pydantic Settings."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Horizon API configuration.
    
    All settings can be overridden via environment variables.
    """

    PROJECT_NAME: str = "Horizon API"
    VERSION: str = "0.1.0"
    API_V1_PREFIX: str = "/api/v1"
    DEBUG: bool = False

    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
    ]

    # Firebase
    FIREBASE_PROJECT_ID: str = ""
    FIREBASE_DATABASE_URL: str = ""

    # Web3
    WEB3_RPC_URL: str = ""
    NFT_CONTRACT_ADDRESS: str = ""

    # LLM
    LLM_API_KEY: str = ""
    LLM_MODEL: str = "gpt-4"

    class Config:
        """Pydantic settings configuration."""

        env_file = ".env"
        case_sensitive = True


settings = Settings()
