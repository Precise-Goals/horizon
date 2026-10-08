from enum import Enum
from pydantic import BaseModel, Field

class PlaybookAction(str, Enum):
    RESTART = "RESTART"
    FAILOVER = "FAILOVER"
    RESTORE = "RESTORE"
    SCALE = "SCALE"
    DNS_UPDATE = "DNS_UPDATE"
    CACHE_PURGE = "CACHE_PURGE"

class PlaybookStep(BaseModel):
    step_id: str
    name: str
    action: PlaybookAction
    target_node_id: str
    is_high_risk: bool
    timeout_seconds: int

class PlaybookDefinition(BaseModel):
    playbook_id: str
    name: str
    description: str
    steps: list[PlaybookStep]

class PlaybookExecutionRequest(BaseModel):
    playbook_id: str
    target_node_id: str
