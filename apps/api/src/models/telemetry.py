from pydantic import BaseModel, Field
from datetime import datetime, timezone

class MetricPoint(BaseModel):
    metric_name: str
    value: float
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    tags: dict = Field(default_factory=dict)

class TelemetrySnapshot(BaseModel):
    snapshot_id: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    metrics: list[MetricPoint]
