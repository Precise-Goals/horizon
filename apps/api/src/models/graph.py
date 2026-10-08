from pydantic import BaseModel, Field
from src.models.node import NodeResponse

class GraphNode(BaseModel):
    node: NodeResponse

class GraphEdge(BaseModel):
    dependent_id: str = Field(...)
    depends_on_id: str = Field(...)

class DependencyTopology(BaseModel):
    nodes: list[GraphNode]
    edges: list[GraphEdge]

class BlastRadiusResult(BaseModel):
    affected_nodes: list[str] = Field(..., description="List of affected node IDs")
    severity: str = Field(..., description="Severity of the blast radius")
    cascade_depth: int = Field(..., description="Maximum depth of the cascade")
