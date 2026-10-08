"""API v1 router aggregating all endpoint routers."""

from fastapi import APIRouter

from src.api.v1.endpoints import health, nodes, graph, playbooks, recovery, audit, telemetry

api_router = APIRouter()

api_router.include_router(health.router, prefix="/health", tags=["Health"])
api_router.include_router(nodes.router, prefix="/nodes", tags=["Nodes"])
api_router.include_router(graph.router, prefix="/graph", tags=["Dependency Graph"])
api_router.include_router(playbooks.router, prefix="/playbooks", tags=["Playbooks"])
api_router.include_router(recovery.router, prefix="/recovery", tags=["Recovery"])
api_router.include_router(audit.router, prefix="/audit", tags=["Audit"])
api_router.include_router(telemetry.router, prefix="/telemetry", tags=["Telemetry"])
