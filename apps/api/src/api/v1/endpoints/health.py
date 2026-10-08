from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class HealthResponse(BaseModel):
    status: str
    version: str
    components: dict[str, str]

@router.get("/", response_model=HealthResponse)
@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    return HealthResponse(
        status="UP",
        version="1.0.0",
        components={
            "engine": "UP",
            "database": "UP"
        }
    )
