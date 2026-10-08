from enum import Enum
from pydantic import BaseModel, Field

class NodeType(str, Enum):
    DATABASE = "DATABASE"
    APPLICATION = "APPLICATION"
    NETWORK = "NETWORK"
    CACHE = "CACHE"
    GATEWAY = "GATEWAY"
    QUEUE = "QUEUE"
    STORAGE = "STORAGE"

class NodeStatus(str, Enum):
    HEALTHY = "HEALTHY"
    DEGRADED = "DEGRADED"
    DOWN = "DOWN"
    RECOVERING = "RECOVERING"
    UNKNOWN = "UNKNOWN"

class NodeBase(BaseModel):
    name: str = Field(..., description="Name of the node")
    node_type: NodeType = Field(..., description="Type of the node")
    status: NodeStatus = Field(NodeStatus.UNKNOWN, description="Current status")
    metadata: dict = Field(default_factory=dict, description="Additional metadata")

class NodeCreate(NodeBase):
    node_id: str = Field(..., description="Unique ID for the node")

class NodeUpdate(BaseModel):
    name: str | None = None
    node_type: NodeType | None = None
    status: NodeStatus | None = None
    metadata: dict | None = None

class NodeResponse(NodeCreate):
    pass
