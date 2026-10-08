import threading
import uuid
from datetime import datetime, timezone
from src.models.audit import AuditLogEntry, AuditSeverity, AuditActor

class AuditLogger:
    def __init__(self) -> None:
        self._logs: list[AuditLogEntry] = []
        self._lock = threading.Lock()

    def log(self, severity: AuditSeverity, actor: AuditActor, actor_id: str, action: str, target_id: str | None = None, details: dict | None = None) -> None:
        entry = AuditLogEntry(
            log_id=str(uuid.uuid4()),
            severity=severity,
            actor=actor,
            actor_id=actor_id,
            action=action,
            target_id=target_id,
            details=details or {}
        )
        with self._lock:
            self._logs.append(entry)

    def search(self, node_id: str | None = None, actor: AuditActor | None = None, severity: AuditSeverity | None = None, limit: int = 100) -> list[AuditLogEntry]:
        with self._lock:
            results = self._logs
        
        if node_id:
            results = [r for r in results if r.target_id == node_id or r.details.get("node_id") == node_id]
        if actor:
            results = [r for r in results if r.actor == actor]
        if severity:
            results = [r for r in results if r.severity == severity]
            
        return sorted(results, key=lambda x: x.timestamp, reverse=True)[:limit]
