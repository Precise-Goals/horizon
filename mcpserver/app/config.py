import os
from pathlib import Path
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Search for .env in current directory or root repository directory
current_dir = Path(__file__).resolve().parent.parent
root_env_path = current_dir.parent / ".env"
local_env_path = current_dir / ".env"

if local_env_path.exists():
    load_dotenv(local_env_path)
elif root_env_path.exists():
    load_dotenv(root_env_path)
else:
    load_dotenv()


class Settings(BaseModel):
    # App Metadata
    APP_NAME: str = Field(default="Horizon Autonomous MCP Server")
    APP_VERSION: str = Field(default="1.0.0")

    # Server network
    PORT: int = Field(default_factory=lambda: int(os.getenv("PORT", "10000")))
    HOST: str = Field(default_factory=lambda: os.getenv("HOST", "0.0.0.0"))
    ENVIRONMENT: str = Field(default_factory=lambda: os.getenv("ENVIRONMENT", "production"))
    CORS_ORIGINS: str = Field(default_factory=lambda: os.getenv("CORS_ORIGINS", "*"))

    # Sarvam AI
    SARVAM_API_KEY: str = Field(
        default_factory=lambda: os.getenv(
            "SARVAM_API_KEY",
            os.getenv("VITE_SARVAM_API_KEY", "sk_mhp6zj2k_CZWnzOpKIR4wrCdCDUwa6hJY")
        )
    )
    SARVAM_BASE_URL: str = Field(
        default_factory=lambda: os.getenv(
            "SARVAM_BASE_URL",
            os.getenv("VITE_SARVAM_BASE_URL", "https://api.sarvam.ai")
        ).rstrip("/")
    )
    SARVAM_MODEL: str = Field(
        default_factory=lambda: os.getenv(
            "SARVAM_MODEL",
            os.getenv("VITE_SARVAM_MODEL", "sarvam-105b")
        )
    )

    # MST Blockchain (Testnet 91562037)
    MST_TESTNET_RPC: str = Field(
        default_factory=lambda: os.getenv(
            "MST_TESTNET_RPC",
            os.getenv("VITE_MST_TESTNET_RPC", "https://testnetrpc.mstblockchain.com")
        )
    )
    MST_CHAIN_ID: int = Field(
        default_factory=lambda: int(os.getenv(
            "MST_CHAIN_ID",
            os.getenv("CHAIN_ID", os.getenv("VITE_MST_CHAIN_ID", "91562037"))
        ))
    )
    MST_EXPLORER_URL: str = Field(
        default_factory=lambda: os.getenv(
            "MST_EXPLORER_URL",
            os.getenv("VITE_MST_EXPLORER_URL", "https://testnet.mstscan.com")
        )
    )
    HORIZON_AUDIT_CONTRACT: str = Field(
        default_factory=lambda: os.getenv(
            "HORIZON_AUDIT_CONTRACT",
            os.getenv("VITE_NFT_SUBSCRIPTION_CONTRACT", "0x3EDad230dCFc6Dd3C357490b9feDa49639646BB7")
        )
    )
    HORIZON_SUBSCRIPTION_CONTRACT: str = Field(
        default_factory=lambda: os.getenv(
            "HORIZON_SUBSCRIPTION_CONTRACT",
            os.getenv("VITE_NFT_SUBSCRIPTION_CONTRACT", "0x3EDad230dCFc6Dd3C357490b9feDa49639646BB7")
        )
    )

    def get_allowed_origins_list(self) -> list[str]:
        """Returns parsed list of allowed CORS origins."""
        if self.CORS_ORIGINS == "*":
            return ["*"]
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    def is_production(self) -> bool:
        """Determines whether server environment is configured for production."""
        return self.ENVIRONMENT.lower() in ("production", "prod")


settings = Settings()


    def get_server_port(self) -> int:
        return self.PORT
