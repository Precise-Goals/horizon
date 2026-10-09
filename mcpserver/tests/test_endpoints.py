import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check(async_client: AsyncClient):
    """Verifies that the Render health probe endpoint responds with healthy status and metadata."""
    res = await async_client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["service"] == "horizon-mcp-server"
    assert data["tools_registered"] >= 6
    assert "timestamp" in data


@pytest.mark.asyncio
async def test_dashboard_html(async_client: AsyncClient):
    """Verifies that the root developer dashboard renders valid HTML."""
    res = await async_client.get("/")
    assert res.status_code == 200
    assert "text/html" in res.headers["content-type"]
    assert "Horizon Autonomous MCP Server" in res.text
    assert "horizon_get_topology" in res.text


@pytest.mark.asyncio
async def test_direct_mcp_initialize(async_client: AsyncClient):
    """Verifies JSON-RPC 2.0 initialize handshake via direct HTTP POST /mcp."""
    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "initialize",
        "params": {
            "protocolVersion": "2024-11-05",
            "capabilities": {},
            "clientInfo": {"name": "test-client", "version": "1.0"},
        },
    }
    res = await async_client.post("/mcp", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["jsonrpc"] == "2.0"
    assert data["id"] == 1
    assert data["result"]["serverInfo"]["name"] == "horizon-mcp-server"
    assert "tools" in data["result"]["capabilities"]


@pytest.mark.asyncio
async def test_direct_mcp_ping(async_client: AsyncClient):
    """Verifies JSON-RPC ping method."""
    payload = {
        "jsonrpc": "2.0",
        "id": 2,
        "method": "ping",
    }
    res = await async_client.post("/mcp", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == 2
    assert data["result"] == {}


@pytest.mark.asyncio
async def test_direct_mcp_tools_list(async_client: AsyncClient):
    """Verifies tools/list method returns full registered tool suite."""
    payload = {
        "jsonrpc": "2.0",
        "id": 3,
        "method": "tools/list",
    }
    res = await async_client.post("/mcp", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "tools" in data["result"]
    tools = data["result"]["tools"]
    tool_names = [t["name"] for t in tools]
    assert "horizon_get_topology" in tool_names
    assert "horizon_simulate_failure" in tool_names
    assert "horizon_trigger_recovery" in tool_names
    assert "horizon_sign_approval_gate" in tool_names
    assert "horizon_verify_audit_proof" in tool_names
    assert "horizon_synthesize_yaml" in tool_names
    assert "horizon_ask_sre" in tool_names
    assert "horizon_diagnose_cluster" in tool_names


@pytest.mark.asyncio
async def test_direct_mcp_unknown_method(async_client: AsyncClient):
    """Verifies that unknown method returns JSON-RPC error code -32601."""
    payload = {
        "jsonrpc": "2.0",
        "id": 99,
        "method": "unknown_action_xyz",
    }
    res = await async_client.post("/mcp", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "error" in data
    assert data["error"]["code"] == -32601
