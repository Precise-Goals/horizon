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
    assert data["tools_registered"] == 12
    assert "timestamp" in data


@pytest.mark.asyncio
async def test_dashboard_html(async_client: AsyncClient):
    """Verifies that the root developer dashboard renders valid HTML."""
    res = await async_client.get("/")
    assert res.status_code == 200
    assert "text/html" in res.headers["content-type"]
    assert "Horizon Autonomous MCP Server" in res.text
    assert "horizon_get_topology" in res.text
    assert "/api/v1/incidents/webhook" in res.text


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
    """Verifies tools/list method returns full 12-tool registered tool catalogue."""
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
    assert len(tools) == 12
    tool_names = [t["name"] for t in tools]
    expected_tools = [
        "horizon_get_topology",
        "horizon_simulate_failure",
        "horizon_trigger_recovery",
        "horizon_sign_approval_gate",
        "horizon_verify_audit_proof",
        "horizon_synthesize_yaml",
        "horizon_ask_sre",
        "horizon_diagnose_cluster",
        "horizon_probe_health",
        "horizon_submit_gate_approval",
        "horizon_get_incident_timeline",
        "horizon_broadcast_incident",
    ]
    for exp in expected_tools:
        assert exp in tool_names


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


@pytest.mark.asyncio
async def test_inbound_webhook_prometheus_alertmanager(async_client: AsyncClient):
    """Verifies that POST /api/v1/incidents/webhook ingests Prometheus Alertmanager alerts and triggers Kahn recovery."""
    payload = {
        "receiver": "horizon-webhook",
        "status": "firing",
        "alerts": [
            {
                "status": "firing",
                "labels": {
                    "alertname": "PostgresDown",
                    "instance": "db-primary:5432",
                    "node_id": "db-primary",
                    "severity": "critical"
                },
                "annotations": {
                    "summary": "Master PostgreSQL instance unreachable",
                    "description": "5 consecutive health probes failed"
                },
                "startsAt": "2026-10-09T14:00:00Z"
            }
        ],
        "strategy": "database_failover"
    }
    res = await async_client.post("/api/v1/incidents/webhook", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "incident_ingested"
    assert data["source"] == "prometheus_alertmanager"
    assert data["targetNode"] == "db-primary"
    assert data["recoveryJobId"].startswith("REC-")
    assert data["requiresGateApproval"] is True
    assert len(data["recoveryPlan"]["steps"]) >= 4


@pytest.mark.asyncio
async def test_inbound_webhook_datadog(async_client: AsyncClient):
    """Verifies that POST /api/v1/incidents/webhook ingests Datadog alerts and triggers recovery."""
    payload = {
        "id": "10492819",
        "title": "High Latency & Node Failure on Redis Cache",
        "event_type": "alert",
        "alert_type": "error",
        "body": "Redis Cache node latency spiked above 500ms and connection timed out.",
        "tags": ["service:redis-cache", "env:production"],
        "strategy": "service_restart"
    }
    res = await async_client.post("/api/v1/incidents/webhook", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "incident_ingested"
    assert data["source"] == "datadog"
    assert data["targetNode"] == "redis-cache"
    assert data["recoveryJobId"].startswith("REC-")
    assert data["requiresGateApproval"] is False
