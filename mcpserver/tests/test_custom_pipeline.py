import pytest
from httpx import AsyncClient
from app.tools.registry import execute_tool
from app.engine.topology import topology_engine


@pytest.mark.asyncio
async def test_get_topology_templates_endpoint(async_client: AsyncClient):
    """Verifies GET /api/v1/topology/templates returns pre-built templates."""
    res = await async_client.get("/api/v1/topology/templates")
    assert res.status_code == 200
    data = res.json()
    assert "templates" in data
    assert len(data["templates"]) >= 4
    template_ids = [t["id"] for t in data["templates"]]
    assert "ecommerce" in template_ids
    assert "genai" in template_ids
    assert "fintech" in template_ids
    assert "minimal" in template_ids


@pytest.mark.asyncio
async def test_apply_custom_pipeline_endpoint(async_client: AsyncClient):
    """Verifies POST /api/v1/topology/custom-pipeline mounts nodes and validates Kahn DAG."""
    payload = {
        "pipeline_name": "ai-vision-pipeline",
        "nodes": [
            {"id": "vision-db", "name": "Vision Metadata Store", "type": "database", "dependencies": []},
            {"id": "gpu-worker", "name": "YOLO Object Detection Worker", "type": "application", "dependencies": ["vision-db"]},
            {"id": "vision-ingress", "name": "RTSP Video Ingress", "type": "gateway", "dependencies": ["gpu-worker"]},
        ],
    }
    res = await async_client.post("/api/v1/topology/custom-pipeline", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert data["nodes_count"] == 3
    assert len(data["topological_tiers"]) == 3
    assert data["topological_tiers"][0] == ["vision-db"]
    assert "gpu-worker" in data["blast_radius_map"]["vision-db"]

    # Verify reset endpoint works
    reset_res = await async_client.post("/api/v1/topology/reset")
    assert reset_res.status_code == 200
    assert reset_res.json()["nodes_count"] == 7


@pytest.mark.asyncio
async def test_apply_custom_pipeline_cycle_rejection(async_client: AsyncClient):
    """Verifies that circular dependency deadlocks are rejected with HTTP 422."""
    payload = {
        "pipeline_name": "deadlock-pipeline",
        "nodes": [
            {"id": "service-alpha", "name": "Alpha Service", "type": "application", "dependencies": ["service-beta"]},
            {"id": "service-beta", "name": "Beta Service", "type": "application", "dependencies": ["service-alpha"]},
        ],
    }
    res = await async_client.post("/api/v1/topology/custom-pipeline", json=payload)
    assert res.status_code == 422
    assert "Circular dependency deadlock" in res.json()["detail"]


@pytest.mark.asyncio
async def test_mcp_tool_horizon_apply_custom_dag_pipeline():
    """Verifies MCP tool execution for horizon_apply_custom_dag_pipeline."""
    arguments = {
        "pipeline_name": "fintech-micro-mesh",
        "nodes": [
            {"id": "core-ledger", "name": "Postgres Ledger", "type": "database", "dependencies": []},
            {"id": "risk-engine", "name": "Risk Evaluator", "type": "application", "dependencies": ["core-ledger"]},
            {"id": "trading-gw", "name": "FIX Gateway", "type": "gateway", "dependencies": ["risk-engine"]},
        ],
    }
    result = await execute_tool("horizon_apply_custom_dag_pipeline", arguments)
    assert result.isError is False
    assert len(result.content) == 1
    assert "fintech-micro-mesh" in result.content[0].text
    assert "topological_tiers" in result.content[0].text

    # Reset cluster back to nominal
    topology_engine._reset_to_default_topology()
