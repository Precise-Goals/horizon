from fastapi import APIRouter
from src.models.telemetry import TelemetrySnapshot, MetricPoint
from datetime import datetime, timezone
import uuid

router = APIRouter()

snapshot_store: list[TelemetrySnapshot] = []

@router.get("/", response_model=TelemetrySnapshot)
async def get_telemetry_snapshot() -> TelemetrySnapshot:
    if not snapshot_store:
        return TelemetrySnapshot(
            snapshot_id=str(uuid.uuid4()),
            metrics=[]
        )
    return snapshot_store[-1]

@router.post("/")
async def ingest_telemetry(snapshot: TelemetrySnapshot) -> dict:
    snapshot_store.append(snapshot)
    return {"status": "success"}
