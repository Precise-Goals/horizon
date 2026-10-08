from fastapi import APIRouter, HTTPException
from src.models.node import NodeResponse, NodeCreate, NodeStatus
from src.engine.state import state

router = APIRouter()

@router.get("/", response_model=list[NodeResponse])
async def get_nodes() -> list[NodeResponse]:
    return list(state.graph.nodes.values())

@router.post("/", response_model=NodeResponse)
async def register_node(node: NodeCreate) -> NodeResponse:
    state.graph.add_node(node.node_id, node.model_dump())
    return state.graph.nodes[node.node_id]

@router.get("/{node_id}", response_model=NodeResponse)
async def get_node(node_id: str) -> NodeResponse:
    if node_id not in state.graph.nodes:
        raise HTTPException(status_code=404, detail="Node not found")
    return state.graph.nodes[node_id]

@router.post("/{node_id}/simulate-failure", response_model=NodeResponse)
async def simulate_failure(node_id: str, status: NodeStatus) -> NodeResponse:
    if node_id not in state.graph.nodes:
        raise HTTPException(status_code=404, detail="Node not found")
    state.graph.nodes[node_id].status = status
    return state.graph.nodes[node_id]
