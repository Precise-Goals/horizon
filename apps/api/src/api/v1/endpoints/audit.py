from fastapi import APIRouter, Query
from src.models.audit import AuditLogEntry, AuditSeverity, AuditActor
from src.engine.state import state

router = APIRouter()

@router.get("/", response_model=list[AuditLogEntry])
async def get_audit_logs(
    node_id: str | None = None,
    actor: AuditActor | None = None,
    severity: AuditSeverity | None = None,
    limit: int = Query(100, le=1000)
) -> list[AuditLogEntry]:
    return state.audit.search(node_id=node_id, actor=actor, severity=severity, limit=limit)
