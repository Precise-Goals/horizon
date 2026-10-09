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
    action: str
    risk: Literal["low", "medium", "high"]
    status: Literal["pending", "in_progress", "completed", "failed", "pending_approval"]
    output: Optional[str] = None


class TopologyState(BaseModel):
    totalNodes: int
    acyclicVerified: bool
    nodes: List[SystemNode]
    edges: List[DependencyEdge]
    topologicalLevels: List[List[str]]
    activeIncidents: int
