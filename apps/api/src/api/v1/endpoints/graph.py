from fastapi import APIRouter, HTTPException
from src.models.graph import DependencyTopology, BlastRadiusResult
from src.engine.state import state

router = APIRouter()

@router.get("/", response_model=DependencyTopology)
async def get_topology() -> DependencyTopology:
    return DependencyTopology(**state.graph.get_graph_dict())

@router.post("/{node_id}/blast-radius", response_model=BlastRadiusResult)
async def calculate_blast_radius(node_id: str) -> BlastRadiusResult:
    if node_id not in state.graph.nodes:
        raise HTTPException(status_code=404, detail="Node not found")
    return state.graph.compute_blast_radius(node_id)
