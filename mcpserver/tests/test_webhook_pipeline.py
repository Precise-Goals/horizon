import json
import pytest
from httpx import AsyncClient
from app.engine.topology import topology_engine


@pytest.fixture(autouse=True)
def reset_topology_state():
    """Ensure every test executes with pristine cluster topology state."""
    topology_engine.reset_topology()
    yield
    topology_engine.reset_topology()


# ==============================================================================
# POST /api/v1/incidents/webhook: Inbound Ingestion Pipeline
# ==============================================================================

@pytest.mark.asyncio
async def test_webhook_datadog_monitor_alert(async_client: AsyncClient):
    """
    Verifies that inbound Datadog monitor webhook payload:
    - Extracts service from Datadog tags ('service:redis-cache')
    - Detects target node 'redis-cache'
    - Injects failure and triggers Kahn autonomous recovery pipeline
    - Returns structured ingestion response with recovery plan
    """
    datadog_payload = {
        "id": "184920491",
        "title": "Alert: High P99 Latency on Redis Session Store",
        "event_type": "query_alert_monitor",
        "alert_type": "error",
        "body": "P99 latency on redis-cache exceeded SLA threshold 50ms (measured 650ms).",
        "tags": ["service:redis-cache", "env:production", "tier:cache"],
    }

    res = await async_client.post("/api/v1/incidents/webhook", json=datadog_payload)
    assert res.status_code == 200
    data = res.json()

    assert data["status"] == "incident_ingested"
    assert data["source"] == "datadog"
    assert data["targetNode"] == "redis-cache"
    assert "High P99 Latency" in data["reason"]
    assert data["recoveryJobId"].startswith("REC-")
    assert data["requiresGateApproval"] is False

    recovery_plan = data["recoveryPlan"]
    assert recovery_plan["targetNode"] == "redis-cache"
    assert recovery_plan["status"] == "completed"
    assert len(recovery_plan["steps"]) >= 4

    # Node should be restored following automatic low-risk restart
    assert topology_engine.get_node("redis-cache").status == "healthy"


@pytest.mark.asyncio
async def test_webhook_prometheus_alertmanager_firing(async_client: AsyncClient):
    """
    Verifies that inbound Prometheus Alertmanager firing notification:
    - Matches PostgreSQL master database from alert labels
    - Triggers database failover requiring EIP-712 human-in-the-loop gate
    - Returns requiresGateApproval=True and paused recovery plan
    """
    alertmanager_payload = {
        "receiver": "horizon-mcp-webhook",
        "status": "firing",
        "alerts": [
            {
                "status": "firing",
                "labels": {
                    "alertname": "PostgresMasterDeadlock",
                    "service": "db-primary",
                    "severity": "critical",
                    "cluster": "prod-useast1",
                },
                "annotations": {
                    "summary": "Database primary connection pool exhausted and WAL archiving stalled",
                    "description": "PostgreSQL master db-primary has not acknowledged heartbeats in 30s.",
                },
            }
        ],
        "commonLabels": {
            "service": "db-primary",
            "severity": "critical",
        },
    }

    res = await async_client.post("/api/v1/incidents/webhook", json=alertmanager_payload)
    assert res.status_code == 200
    data = res.json()

    assert data["status"] == "incident_ingested"
    assert data["source"] == "prometheus_alertmanager"
    assert data["targetNode"] == "db-primary"
    assert "connection pool exhausted" in data["reason"]
    assert data["requiresGateApproval"] is True
    assert data["strategy"] == "database_failover"

    recovery_plan = data["recoveryPlan"]
    assert recovery_plan["status"] == "pending_approval"
    assert recovery_plan["requiresGateApproval"] is True
    assert recovery_plan["steps"][0]["risk"] == "high"
    assert recovery_plan["steps"][0]["status"] == "pending_approval"


@pytest.mark.asyncio
async def test_webhook_restore_from_backup_strategy(async_client: AsyncClient):
    """
    Verifies that inbound webhook requesting 'restore_from_backup' strategy:
    - Initiates 5-step S3 backup restore playbook
    - Sets high-risk gate on Step 1
    - Retains job in pending_approval state
    """
    payload = {
        "target_node_id": "db-primary",
        "service": "db-primary",
        "strategy": "restore_from_backup",
        "severity": "critical",
        "reason": "Corrupted tablespace requires point-in-time snapshot restore",
        "auto_approve_low_risk": True,
    }

    res = await async_client.post("/api/v1/incidents/webhook", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert data["status"] == "incident_ingested"
    assert data["targetNode"] == "db-primary"
    assert data["strategy"] == "restore_from_backup"
    assert data["requiresGateApproval"] is True

    plan = data["recoveryPlan"]
    assert plan["strategy"] == "restore_from_backup"
    assert len(plan["steps"]) == 5
    assert plan["steps"][0]["action"] == "restore_from_backup"
    assert plan["steps"][0]["risk"] == "high"
    assert plan["steps"][0]["status"] == "pending_approval"


@pytest.mark.asyncio
async def test_webhook_text_scan_fallback_matching(async_client: AsyncClient):
    """Verifies that unstructured alert body correctly matches node ID via text scan."""
    payload = {
        "event": "alert_fired",
        "body": "Warning: kafka-queue consumer partition rebalance deadlock detected.",
        "severity": "warning",
    }

    res = await async_client.post("/api/v1/incidents/webhook", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert data["status"] == "incident_ingested"
    assert data["targetNode"] == "kafka-queue"


@pytest.mark.asyncio
async def test_webhook_alias_endpoint(async_client: AsyncClient):
    """Verifies that route alias /incidents/webhook behaves identically to /api/v1/incidents/webhook."""
    payload = {
        "target_node_id": "auth-service",
        "reason": "Auth token verification timeout spike",
        "strategy": "service_restart",
    }

    res = await async_client.post("/incidents/webhook", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert data["status"] == "incident_ingested"
    assert data["targetNode"] == "auth-service"
    assert data["requiresGateApproval"] is False


@pytest.mark.asyncio
async def test_webhook_invalid_json_payload_error(async_client: AsyncClient):
    """Verifies that non-JSON content returns HTTP 400 Bad Request."""
    res = await async_client.post(
        "/api/v1/incidents/webhook",
        content=b"this is not a valid json string {",
        headers={"content-type": "application/json"},
    )
    assert res.status_code == 400
    data = res.json()
    assert "Invalid JSON payload" in data["detail"]
