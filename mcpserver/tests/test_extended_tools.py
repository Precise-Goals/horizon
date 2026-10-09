import json
import pytest
from httpx import AsyncClient
from unittest.mock import patch, AsyncMock
from app.engine.topology import topology_engine


@pytest.fixture(autouse=True)
def reset_topology_state():
    """Ensure every test executes with pristine cluster topology state."""
    topology_engine.reset_topology()
    yield
    topology_engine.reset_topology()


# ==============================================================================
# horizon_probe_health: 3-Consecutive-Miss Threshold Verification
# ==============================================================================

@pytest.mark.asyncio
async def test_tool_probe_health_three_consecutive_miss_threshold(async_client: AsyncClient):
    """
    Verifies sliding window health probe failure detection:
    - Probe 1 (miss): consecutive_failures=1, failure_declared=False, status='healthy'
    - Probe 2 (miss): consecutive_failures=2, failure_declared=False, status='healthy'
    - Probe 3 (miss): consecutive_failures=3, failure_declared=True, status transitioned to 'down', blast radius degraded
    """
    target = "redis-cache"

    # --- Probe 1: First Miss ---
    payload_1 = {
        "jsonrpc": "2.0",
        "id": 101,
        "method": "tools/call",
        "params": {
            "name": "horizon_probe_health",
            "arguments": {"node_id": target, "simulate_miss": True},
        },
    }
    res_1 = await async_client.post("/mcp", json=payload_1)
    assert res_1.status_code == 200
    data_1 = json.loads(res_1.json()["result"]["content"][0]["text"])
    assert data_1["nodeId"] == target
    assert data_1["consecutiveFailures"] == 1
    assert data_1["failureDeclared"] is False
    assert data_1["status"] == "healthy"
    assert "PROBE MISSED" in data_1["message"]

    # Verify node in cluster is still healthy after 1 miss
    assert topology_engine.get_node(target).status == "healthy"

    # --- Probe 2: Second Miss ---
    payload_2 = {
        "jsonrpc": "2.0",
        "id": 102,
        "method": "tools/call",
        "params": {
            "name": "horizon_probe_health",
            "arguments": {"node_id": target, "simulate_miss": True},
        },
    }
    res_2 = await async_client.post("/mcp", json=payload_2)
    assert res_2.status_code == 200
    data_2 = json.loads(res_2.json()["result"]["content"][0]["text"])
    assert data_2["nodeId"] == target
    assert data_2["consecutiveFailures"] == 2
    assert data_2["failureDeclared"] is False
    assert data_2["status"] == "healthy"
    assert "PROBE MISSED" in data_2["message"]

    # Verify node in cluster is still healthy after 2 misses
    assert topology_engine.get_node(target).status == "healthy"

    # --- Probe 3: Third Miss (Hard Failure Declared) ---
    payload_3 = {
        "jsonrpc": "2.0",
        "id": 103,
        "method": "tools/call",
        "params": {
            "name": "horizon_probe_health",
            "arguments": {"node_id": target, "simulate_miss": True},
        },
    }
    res_3 = await async_client.post("/mcp", json=payload_3)
    assert res_3.status_code == 200
    data_3 = json.loads(res_3.json()["result"]["content"][0]["text"])
    assert data_3["nodeId"] == target
    assert data_3["consecutiveFailures"] == 3
    assert data_3["failureDeclared"] is True
    assert data_3["status"] == "down"
    assert "HARD FAILURE" in data_3["message"]

    # Verify node in cluster transitioned to 'down'
    node = topology_engine.get_node(target)
    assert node.status == "down"
    assert node.latency_ms >= 500.0
    assert node.error_rate >= 0.5

    # Verify downstream blast radius (auth-service depends on redis-cache) is degraded
    auth_node = topology_engine.get_node("auth-service")
    assert auth_node.status == "degraded"


@pytest.mark.asyncio
async def test_tool_probe_health_recovery_resets_miss_counter(async_client: AsyncClient):
    """Verifies that a healthy probe resets the consecutive failure counter back to 0 before threshold."""
    target = "redis-cache"

    # Probe 1: Miss
    await async_client.post(
        "/mcp",
        json={
            "jsonrpc": "2.0",
            "id": 104,
            "method": "tools/call",
            "params": {"name": "horizon_probe_health", "arguments": {"node_id": target, "simulate_miss": True}},
        },
    )
    assert topology_engine._consecutive_failures.get(target) == 1

    # Probe 2: Successful probe (simulate_miss=False)
    res_recover = await async_client.post(
        "/mcp",
        json={
            "jsonrpc": "2.0",
            "id": 105,
            "method": "tools/call",
            "params": {"name": "horizon_probe_health", "arguments": {"node_id": target, "simulate_miss": False}},
        },
    )
    assert res_recover.status_code == 200
    data = json.loads(res_recover.json()["result"]["content"][0]["text"])
    assert data["nodeId"] == target
    assert data["consecutiveFailures"] == 0
    assert data["healthy"] is True
    assert data["failureDeclared"] is False
    assert "PROBE HEALTHY" in data["message"]


@pytest.mark.asyncio
async def test_tool_probe_health_cluster_wide(async_client: AsyncClient):
    """Verifies probing entire cluster when node_id is omitted."""
    payload = {
        "jsonrpc": "2.0",
        "id": 106,
        "method": "tools/call",
        "params": {
            "name": "horizon_probe_health",
            "arguments": {},
        },
    }
    res = await async_client.post("/mcp", json=payload)
    assert res.status_code == 200
    data = json.loads(res.json()["result"]["content"][0]["text"])
    assert data["totalProbed"] == 7
    assert data["healthyCount"] == 7
    assert data["downCount"] == 0
    assert data["failureThreshold"] == 3
    assert len(data["probes"]) == 7


@pytest.mark.asyncio
async def test_tool_probe_health_unknown_node_error(async_client: AsyncClient):
    """Verifies error handling when probing an unknown node ID."""
    payload = {
        "jsonrpc": "2.0",
        "id": 107,
        "method": "tools/call",
        "params": {
            "name": "horizon_probe_health",
            "arguments": {"node_id": "non-existent-service-99"},
        },
    }
    res = await async_client.post("/mcp", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["result"]["isError"] is True
    assert "not found in cluster" in data["result"]["content"][0]["text"]


# ==============================================================================
# restore_from_backup Strategy in horizon_trigger_recovery
# ==============================================================================

@pytest.mark.asyncio
async def test_tool_trigger_recovery_restore_from_backup_playbook(async_client: AsyncClient):
    """
    Verifies 5-step point-in-time snapshot backup restore playbook and high-risk gate:
    - Step 1: Restore Point-In-Time Snapshot (high risk, pending_approval)
    - Step 2: Verify Snapshot Consistency & Replay Transaction Log (medium risk, pending)
    - Step 3: Flush Stale Cache & Warm In-Memory Store (low risk, pending)
    - Step 4: Rebalance Event Consumer Partitions (low risk, pending)
    - Step 5: Release Ingress Traffic Barrier & Reset Probes (low risk, pending)
    - Job is paused awaiting cryptographic EIP-712 human-in-the-loop gate approval.
    """
    # 1. Simulate failure on database
    topology_engine.simulate_failure("db-primary", reason="Disk block corruption detected")

    # 2. Trigger recovery with restore_from_backup strategy
    payload = {
        "jsonrpc": "2.0",
        "id": 108,
        "method": "tools/call",
        "params": {
            "name": "horizon_trigger_recovery",
            "arguments": {
                "target_node_id": "db-primary",
                "strategy": "restore_from_backup",
                "auto_approve_low_risk": True,
            },
        },
    }
    res = await async_client.post("/mcp", json=payload)
    assert res.status_code == 200
    data = json.loads(res.json()["result"]["content"][0]["text"])

    assert data["targetNode"] == "db-primary"
    assert data["strategy"] == "restore_from_backup"
    assert data["status"] == "pending_approval"
    assert data["requiresGateApproval"] is True
    assert data["currentTier"] == 0

    steps = data["steps"]
    assert len(steps) == 5

    # Step 1: High-risk snapshot restore gated
    assert steps[0]["id"] == 1
    assert steps[0]["action"] == "restore_from_backup"
    assert steps[0]["risk"] == "high"
    assert steps[0]["status"] == "pending_approval"
    assert "Restore Point-In-Time Snapshot" in steps[0]["name"]

    # Step 2: Medium-risk log replay
    assert steps[1]["id"] == 2
    assert steps[1]["action"] == "restore_from_backup"
    assert steps[1]["risk"] == "medium"
    assert steps[1]["status"] == "pending"

    # Step 3: Cache purge
    assert steps[2]["id"] == 3
    assert steps[2]["action"] == "cache_purge"
    assert steps[2]["risk"] == "low"
    assert steps[2]["status"] == "pending"

    # Step 4: Queue rebalance
    assert steps[3]["id"] == 4
    assert steps[3]["action"] == "queue_rebalance"
    assert steps[3]["risk"] == "low"
    assert steps[3]["status"] == "pending"

    # Step 5: Traffic shift
    assert steps[4]["id"] == 5
    assert steps[4]["action"] == "traffic_shift"
    assert steps[4]["risk"] == "low"
    assert steps[4]["status"] == "pending"


# ==============================================================================
# horizon_submit_gate_approval: EIP-712 Unblocking & RTO/MTTR Calculation
# ==============================================================================

@pytest.mark.asyncio
async def test_tool_submit_gate_approval_unblocks_and_completes_job(async_client: AsyncClient):
    """
    Verifies that submitting a valid 0x EIP-712 signature:
    - Cryptographically authorizes step 1
    - Unblocks the paused recovery job
    - Executes and marks all remaining downstream tiers as completed
    - Restores cluster node states to healthy
    - Calculates elapsed RTO seconds and updates rolling MTTR metrics
    """
    # 1. Trigger gated recovery for db-primary
    topology_engine.simulate_failure("db-primary", reason="Hardware crash")
    rec_res = topology_engine.trigger_recovery(
        target_node_id="db-primary",
        strategy="restore_from_backup",
        auto_approve_low_risk=True,
    )
    job_id = rec_res["jobId"]
    assert rec_res["status"] == "pending_approval"
    assert rec_res["requiresGateApproval"] is True

    # 2. Submit EIP-712 cryptographic signature approval
    valid_sig = "0x" + "9f" * 32
    signer = "0x73595081334A18D4298A160b162faB4Fb4B3c85B"

    payload = {
        "jsonrpc": "2.0",
        "id": 109,
        "method": "tools/call",
        "params": {
            "name": "horizon_submit_gate_approval",
            "arguments": {
                "job_id": job_id,
                "step_id": 1,
                "signature": valid_sig,
                "approver_address": signer,
            },
        },
    }
    res = await async_client.post("/mcp", json=payload)
    assert res.status_code == 200
    data = json.loads(res.json()["result"]["content"][0]["text"])

    assert data["success"] is True
    assert data["jobId"] == job_id
    assert data["stepId"] == 1
    assert data["status"] == "completed"
    assert data["approverAddress"] == signer
    assert data["signature"] == valid_sig

    # Verify RTO and MTTR metrics calculation
    assert isinstance(data["elapsedRtoSeconds"], float)
    assert data["elapsedRtoSeconds"] > 0
    assert isinstance(data["rollingMttrSeconds"], float)
    assert data["rollingMttrSeconds"] > 0

    # Verify all 5 playbook steps transitioned to completed
    steps = data["steps"]
    assert len(steps) == 5
    for s in steps:
        assert s["status"] == "completed"
        assert s["completed_at"] is not None

    # Step 1 should record cryptographic approval
    assert signer in steps[0]["output"]

    # Verify cluster node health is fully restored
    assert topology_engine.get_node("db-primary").status == "healthy"
    for n in topology_engine.get_nodes():
        assert n.status == "healthy"


@pytest.mark.asyncio
async def test_tool_submit_gate_approval_invalid_signature_error(async_client: AsyncClient):
    """Verifies that non-hex or malformed signature is rejected with error."""
    rec_res = topology_engine.trigger_recovery(
        target_node_id="db-primary",
        strategy="database_failover",
    )
    job_id = rec_res["jobId"]

    payload = {
        "jsonrpc": "2.0",
        "id": 110,
        "method": "tools/call",
        "params": {
            "name": "horizon_submit_gate_approval",
            "arguments": {
                "job_id": job_id,
                "step_id": 1,
                "signature": "invalid-non-hex-sig",
            },
        },
    }
    res = await async_client.post("/mcp", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["result"]["isError"] is True
    assert "Invalid signature format" in data["result"]["content"][0]["text"]


# ==============================================================================
# horizon_get_incident_timeline: Live RTO Stopwatch, Steps & Rolling MTTR
# ==============================================================================

@pytest.mark.asyncio
async def test_tool_get_incident_timeline_tracking(async_client: AsyncClient):
    """
    Verifies timeline inspection tool:
    - Live RTO stopwatch seconds
    - Step milestones and timeline event log
    - Rolling MTTR list and target SLA verification
    """
    # 1. Trigger incident and recovery
    sim = topology_engine.simulate_failure("redis-cache", reason="Out of memory")
    incident_id = sim["incidentId"]
    rec = topology_engine.trigger_recovery("redis-cache", auto_approve_low_risk=True)
    job_id = rec["jobId"]

    # 2. Query timeline using job_id
    payload = {
        "jsonrpc": "2.0",
        "id": 111,
        "method": "tools/call",
        "params": {
            "name": "horizon_get_incident_timeline",
            "arguments": {"job_id_or_incident_id": job_id},
        },
    }
    res = await async_client.post("/mcp", json=payload)
    assert res.status_code == 200
    data = json.loads(res.json()["result"]["content"][0]["text"])

    assert data["jobId"] == job_id
    assert data["targetNode"] == "redis-cache"
    assert data["status"] == "completed"
    assert isinstance(data["liveRtoStopwatchSeconds"], float)
    assert data["targetRtoSeconds"] == 60.0
    assert len(data["steps"]) >= 4

    # Milestones & timeline events
    assert len(data["milestones"]) >= 2
    assert len(data["timelineEvents"]) >= 1

    # Rolling MTTR metrics
    metrics = data["rollingMttrMetrics"]
    assert "rollingMttrSeconds" in metrics
    assert "rollingHistory" in metrics
    assert isinstance(metrics["rollingHistory"], list)
    assert len(metrics["rollingHistory"]) >= 5
    assert metrics["targetMet"] is True


@pytest.mark.asyncio
async def test_tool_get_incident_timeline_by_incident_id(async_client: AsyncClient):
    """Verifies that incident timeline can also be queried by incident_id."""
    sim = topology_engine.simulate_failure("auth-service", reason="Connection refused")
    incident_id = sim["incidentId"]

    payload = {
        "jsonrpc": "2.0",
        "id": 112,
        "method": "tools/call",
        "params": {
            "name": "horizon_get_incident_timeline",
            "arguments": {"incident_id": incident_id},
        },
    }
    res = await async_client.post("/mcp", json=payload)
    assert res.status_code == 200
    data = json.loads(res.json()["result"]["content"][0]["text"])
    assert data["incidentId"] == incident_id
    assert data["targetNode"] == "auth-service"
    assert data["targetRtoSeconds"] == 60.0


# ==============================================================================
# horizon_broadcast_incident: War Room Channels & Alert Formatting
# ==============================================================================

@pytest.mark.asyncio
async def test_tool_broadcast_incident_default_channels(async_client: AsyncClient):
    """Verifies war room broadcast formatting with default channel suite."""
    sim = topology_engine.simulate_failure("db-primary", reason="Replication lag > 300s")
    incident_id = sim["incidentId"]

    payload = {
        "jsonrpc": "2.0",
        "id": 113,
        "method": "tools/call",
        "params": {
            "name": "horizon_broadcast_incident",
            "arguments": {"incident_id": incident_id},
        },
    }
    res = await async_client.post("/mcp", json=payload)
    assert res.status_code == 200
    data = json.loads(res.json()["result"]["content"][0]["text"])

    assert data["success"] is True
    assert data["incidentId"] == incident_id
    assert data["targetNode"] == "db-primary"
    assert "HORIZON WAR ROOM" in data["alertTitle"]
    assert "db-primary" in data["message"]

    # Default channels
    dispatched_channels = [ch["channel"] for ch in data["channelsDispatched"]]
    assert "#war-room-critical" in dispatched_channels
    assert "#sre-alerts" in dispatched_channels
    assert "#incident-response" in dispatched_channels


@pytest.mark.asyncio
async def test_tool_broadcast_incident_custom_channels_and_webhook(async_client: AsyncClient):
    """Verifies broadcast with custom channels and simulated outbound webhook endpoint."""
    sim = topology_engine.simulate_failure("kafka-queue", reason="Partition leader offline")
    incident_id = sim["incidentId"]

    custom_channels = ["#ops-triage", "#fintech-infra"]
    webhook_url = "https://hooks.slack.com/services/T00/B00/mock123"

    # Test via MCP protocol tools/call
    payload = {
        "jsonrpc": "2.0",
        "id": 114,
        "method": "tools/call",
        "params": {
            "name": "horizon_broadcast_incident",
            "arguments": {
                "incident_id": incident_id,
                "channels": custom_channels,
                "webhook_url": webhook_url,
            },
        },
    }
    res = await async_client.post("/mcp", json=payload)
    assert res.status_code == 200
    data = json.loads(res.json()["result"]["content"][0]["text"])

    assert data["success"] is True
    assert len(data["channelsDispatched"]) == 2
    assert [c["channel"] for c in data["channelsDispatched"]] == custom_channels
    assert data["webhookUrl"] == webhook_url

    # Test successful webhook dispatch branch via direct engine mock
    mock_resp = AsyncMock()
    mock_resp.status_code = 200
    with patch("httpx.AsyncClient.__aenter__") as mock_enter:
        mock_instance = AsyncMock()
        mock_instance.post.return_value = mock_resp
        mock_enter.return_value = mock_instance

        direct_res = await topology_engine.broadcast_incident_alert(
            incident_id=incident_id,
            channels=custom_channels,
            webhook_url=webhook_url,
        )
        assert direct_res["webhookDispatched"] is True
        assert direct_res["webhookStatus"] == 200
