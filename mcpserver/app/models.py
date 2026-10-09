from datetime import datetime, timezone
from typing import Any, Dict, List, Literal, Optional, Union
from pydantic import BaseModel, Field


# ==============================================================================
# Model Context Protocol (MCP) & JSON-RPC 2.0 Models
# ==============================================================================

class JsonRpcRequest(BaseModel):
    jsonrpc: Literal["2.0"] = "2.0"
    id: Optional[Union[str, int]] = None
    method: str
    params: Optional[Dict[str, Any]] = None


class JsonRpcErrorDetails(BaseModel):
    code: int
    message: str
    data: Optional[Any] = None


class JsonRpcResponse(BaseModel):
    jsonrpc: Literal["2.0"] = "2.0"
    id: Optional[Union[str, int]] = None
    result: Optional[Any] = None
    error: Optional[JsonRpcErrorDetails] = None


class McpToolParameter(BaseModel):
    type: str = "object"
    properties: Dict[str, Any] = Field(default_factory=dict)
    required: List[str] = Field(default_factory=list)


class McpToolDefinition(BaseModel):
    name: str
    description: str
    inputSchema: McpToolParameter


class McpTextContent(BaseModel):
    type: Literal["text"] = "text"
    text: str


class McpToolResult(BaseModel):
    content: List[McpTextContent]
    isError: bool = False


# ==============================================================================
# Horizon System & Topology Domain Models
# ==============================================================================

NodeType = Literal["database", "cache", "application", "gateway"]
NodeStatus = Literal["healthy", "degraded", "down", "recovering"]

PlaybookAction = Literal[
    "database_failover",
    "service_restart",
    "restore_from_backup",
    "cache_purge",
    "queue_rebalance",
    "traffic_shift",
]

RecoveryStrategy = Literal[
    "automatic",
    "database_failover",
    "service_restart",
    "restore_from_backup",
]


class SystemNode(BaseModel):
    id: str
    name: str
    type: NodeType
    status: NodeStatus = "healthy"
    dependencies: List[str] = Field(default_factory=list)
    latency_ms: float = 12.0
    error_rate: float = 0.0
    cpu_percent: float = 34.0


class DependencyEdge(BaseModel):
    source: str
    target: str


class PlaybookStep(BaseModel):
    id: int
    name: str
    action: Union[PlaybookAction, str]
    risk: Literal["low", "medium", "high"]
    status: Literal["pending", "in_progress", "completed", "failed", "pending_approval"]
    output: Optional[str] = None
    completed_at: Optional[str] = None


class TopologyState(BaseModel):
    totalNodes: int
    acyclicVerified: bool
    nodes: List[SystemNode]
    edges: List[DependencyEdge]
    topologicalLevels: List[List[str]]
    activeIncidents: int


class TimelineEvent(BaseModel):
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    event_type: str = "milestone"
    message: str
    step_id: Optional[int] = None
    details: Dict[str, Any] = Field(default_factory=dict)


class RecoveryMetrics(BaseModel):
    incident_id: Optional[str] = None
    job_id: Optional[str] = None
    start_time: str
    end_time: Optional[str] = None
    elapsed_rto_seconds: float
    target_rto_seconds: float = 60.0
    rolling_mttr_seconds: float
    rolling_history: List[float] = Field(default_factory=list)
    rto_target_met: bool = True
    status: str = "completed"


class WebhookIncidentPayload(BaseModel):
    model_config = {"extra": "allow"}

    service: Optional[str] = None
    event: Optional[str] = None
    target_node_id: Optional[str] = None
    node_id: Optional[str] = None
    source: Optional[str] = "alertmanager"
    status: Optional[str] = "firing"
    severity: Optional[str] = "critical"
    reason: Optional[str] = None
    strategy: Optional[str] = "automatic"
    auto_approve_low_risk: Optional[bool] = True

    # Prometheus Alertmanager fields
    receiver: Optional[str] = None
    alerts: Optional[List[Dict[str, Any]]] = None
    commonLabels: Optional[Dict[str, Any]] = None
    commonAnnotations: Optional[Dict[str, Any]] = None

    # Datadog fields
    id: Optional[Union[str, int]] = None
    title: Optional[str] = None
    event_type: Optional[str] = None
    alert_type: Optional[str] = None
    body: Optional[str] = None
    tags: Optional[List[str]] = None


class GateApprovalSubmission(BaseModel):
    job_id: Optional[str] = None
    incident_id: Optional[str] = None
    step_id: int
    signature: str
    approver_address: Optional[str] = None


class ProbeResult(BaseModel):
    node_id: str
    status: NodeStatus
    healthy: bool
    consecutive_failures: int
    failure_threshold: int = 3
    failure_declared: bool = False
    latency_ms: float
    error_rate: float
    message: str
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
