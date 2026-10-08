from enum import Enum
from pydantic import BaseModel, Field
from datetime import datetime, timezone
from src.models.playbook import PlaybookStep

class RecoveryStatus(str, Enum):
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    PAUSED_APPROVAL = "PAUSED_APPROVAL"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    ROLLED_BACK = "ROLLED_BACK"

class RecoveryStepState(BaseModel):
    step: PlaybookStep
    status: RecoveryStatus
    start_time: datetime | None = None
    end_time: datetime | None = None
    logs: list[str] = Field(default_factory=list)

class RecoveryPlan(BaseModel):
    plan_id: str
    root_cause_node_ids: list[str]
    steps: list[PlaybookStep]

class RecoveryJob(BaseModel):
    job_id: str
    root_cause_node_id: str
    ordered_steps: list[RecoveryStepState]
    status: RecoveryStatus = RecoveryStatus.PENDING
    start_time: datetime | None = None
    end_time: datetime | None = None

class ApprovalAction(str, Enum):
    APPROVE = "APPROVE"
    REJECT = "REJECT"

class ApprovalRequest(BaseModel):
    action: ApprovalAction
    approver: str
    reason: str | None = None
