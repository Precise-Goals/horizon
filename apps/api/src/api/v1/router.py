"""API v1 router aggregating all endpoint routers."""

from fastapi import APIRouter

from src.api.v1.endpoints import health, nodes, graph, playbooks, recovery

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(nodes.router, prefix="/nodes", tags=["Nodes"])
api_router.include_router(graph.router, prefix="/graph", tags=["Dependency Graph"])
api_router.include_router(playbooks.router, prefix="/playbooks", tags=["Playbooks"])
api_router.include_router(recovery.router, prefix="/recovery", tags=["Recovery"])
