from enum import Enum
from pydantic import BaseModel, Field
from datetime import datetime, timezone

class AuditSeverity(str, Enum):
    INFO = "INFO"
    WARNING = "WARNING"
    CRITICAL = "CRITICAL"

class AuditActor(str, Enum):
    SYSTEM = "SYSTEM"
    HUMAN = "HUMAN"
    LLM_AGENT = "LLM_AGENT"

class AuditLogEntry(BaseModel):
    log_id: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    severity: AuditSeverity
    actor: AuditActor
    actor_id: str
    action: str
    target_id: str | None = None
    details: dict = Field(default_factory=dict)
