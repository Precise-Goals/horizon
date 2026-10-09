import json
import pytest
from httpx import AsyncClient
from app.engine.topology import topology_engine


@pytest.fixture(autouse=True)
def reset_engine():
    topology_engine.reset_topology()
    yield
    topology_engine.reset_topology()


@pytest.mark.asyncio
async def test_tool_probe_health_sliding_window(async_client: AsyncClient):
    """Verifies 3-consecutive-miss sliding window failure detection in horizon_probe_health."""
    # Probe 1: Miss 1 -> Node should NOT be down yet
    res1 = await async_client.post("/mcp", json={
        "jsonrpc": "2.0",
        "id": 101,
        "method": "tools/call",
        "params": {
            "name": "horizon_probe_health",
            "arguments": {"node_id": "redis-cache", "simulate_miss": True}
        }
    })
    assert res1.status_code == 200
    data1 = json.loads(res1.json()["result"]["content"][0]["text"])
    assert data1["consecutiveFailures"] == 1
    assert data1["failureDeclared"] is False
    assert data1["status"] != "down"

    # Probe 2: Miss 2 -> Node still should NOT be down
    res2 = await async_client.post("/mcp", json={
        "jsonrpc": "2.0",
        "id": 102,
        "method": "tools/call",
        "params": {
            "name": "horizon_probe_health",
            "arguments": {"node_id": "redis-cache", "simulate_miss": True}
        }
    })
    assert res2.status_code == 200
    data2 = json.loads(res2.json()["result"]["content"][0]["text"])
    assert data2["consecutiveFailures"] == 2
    assert data2["failureDeclared"] is False
    assert data2["status"] != "down"

    # Probe 3: Miss 3 -> Threshold reached! Node MUST be marked DOWN
    res3 = await async_client.post("/mcp", json={
        "jsonrpc": "2.0",
        "id": 103,
        "method": "tools/call",
        "params": {
            "name": "horizon_probe_health",
            "arguments": {"node_id": "redis-cache", "simulate_miss": True}
        }
    })
    assert res3.status_code == 200
    data3 = json.loads(res3.json()["result"]["content"][0]["text"])
    assert data3["consecutiveFailures"] == 3
    assert data3["failureDeclared"] is True
    assert data3["status"] == "down"

    # Probe 4: Success -> Counter must reset to 0 and node recovers to healthy
    res4 = await async_client.post("/mcp", json={
        "jsonrpc": "2.0",
        "id": 104,
        "method": "tools/call",
        "params": {
            "name": "horizon_probe_health",
            "arguments": {"node_id": "redis-cache", "simulate_miss": False}
        }
    })
    assert res4.status_code == 200
    data4 = json.loads(res4.json()["result"]["content"][0]["text"])
    assert data4["consecutiveFailures"] == 0
    assert data4["failureDeclared"] is False
    assert data4["status"] == "healthy"


@pytest.mark.asyncio
async def test_tool_trigger_recovery_restore_from_backup(async_client: AsyncClient):
    """Verifies horizon_trigger_recovery with restore_from_backup strategy."""
    res = await async_client.post("/mcp", json={
        "jsonrpc": "2.0",
        "id": 105,
        "method": "tools/call",
        "params": {
            "name": "horizon_trigger_recovery",
            "arguments": {
                "target_node_id": "db-primary",
                "strategy": "restore_from_backup",
                "auto_approve_low_risk": True
            }
        }
    })
    assert res.status_code == 200
    data = json.loads(res.json()["result"]["content"][0]["text"])
    assert data["targetNode"] == "db-primary"
    assert data["strategy"] == "restore_from_backup"
    assert data["requiresGateApproval"] is True
    assert data["status"] == "pending_approval"
    
    # Check playbook steps
    steps = data["steps"]
    actions = [s["action"] for s in steps]
    assert "restore_from_backup" in actions
    assert steps[0]["action"] == "restore_from_backup"
    assert steps[0]["status"] == "pending_approval"


@pytest.mark.asyncio
async def test_human_approval_gate_unblocking_and_mttr(async_client: AsyncClient):
    """Verifies horizon_submit_gate_approval unblocking recovery and tracking MTTR."""
    # Step 1: Trigger gated recovery for db-primary
    rec_res = await async_client.post("/mcp", json={
        "jsonrpc": "2.0",
        "id": 106,
        "method": "tools/call",
        "params": {
            "name": "horizon_trigger_recovery",
            "arguments": {
                "target_node_id": "db-primary",
                "strategy": "database_failover"
            }
        }
    })
    rec_data = json.loads(rec_res.json()["result"]["content"][0]["text"])
    job_id = rec_data["jobId"]
    assert rec_data["status"] == "pending_approval"
    assert rec_data["requiresGateApproval"] is True

    # Step 2: Sign approval gate using horizon_sign_approval_gate
    sign_res = await async_client.post("/mcp", json={
        "jsonrpc": "2.0",
        "id": 107,
        "method": "tools/call",
        "params": {
            "name": "horizon_sign_approval_gate",
            "arguments": {
                "incident_id": rec_data["incidentId"],
                "step_id": 1,
                "signer_address": "0x73595081334A18D4298A160b162faB4Fb4B3c85B"
            }
        }
    })
    sign_data = json.loads(sign_res.json()["result"]["content"][0]["text"])
    tx_hash = sign_data["txHash"]
    assert tx_hash.startswith("0x")

    # Step 3: Submit cryptographic gate approval using horizon_submit_gate_approval
    submit_res = await async_client.post("/mcp", json={
        "jsonrpc": "2.0",
        "id": 108,
        "method": "tools/call",
        "params": {
            "name": "horizon_submit_gate_approval",
            "arguments": {
                "job_id": job_id,
                "step_id": 1,
                "signature": tx_hash,
                "approver_address": "0x73595081334A18D4298A160b162faB4Fb4B3c85B"
            }
        }
    })
    assert submit_res.status_code == 200
    submit_data = json.loads(submit_res.json()["result"]["content"][0]["text"])
    assert submit_data["success"] is True
    assert submit_data["status"] == "completed"
    assert submit_data["elapsedRtoSeconds"] > 0
    assert submit_data["rollingMttrSeconds"] > 0

    # Ensure all downstream steps transitioned from pending to completed
    for step in submit_data["steps"]:
        assert step["status"] == "completed"

    # Step 4: Verify incident timeline via horizon_get_incident_timeline
    timeline_res = await async_client.post("/mcp", json={
        "jsonrpc": "2.0",
        "id": 109,
        "method": "tools/call",
        "params": {
            "name": "horizon_get_incident_timeline",
            "arguments": {
                "job_id_or_incident_id": job_id
            }
        }
    })
    assert timeline_res.status_code == 200
    timeline_data = json.loads(timeline_res.json()["result"]["content"][0]["text"])
    assert timeline_data["jobId"] == job_id
    assert timeline_data["status"] == "completed"
    assert timeline_data["liveRtoStopwatchSeconds"] > 0
    assert len(timeline_data["milestones"]) >= 2
    assert len(timeline_data["timelineEvents"]) >= 1
    assert "rollingMttrMetrics" in timeline_data
    assert timeline_data["rollingMttrMetrics"]["rollingMttrSeconds"] > 0


@pytest.mark.asyncio
async def test_tool_submit_gate_approval_invalid_signature(async_client: AsyncClient):
    """Verifies that submitting an invalid cryptographic signature fails with error."""
    # Trigger gated recovery
    rec_res = await async_client.post("/mcp", json={
        "jsonrpc": "2.0",
        "id": 110,
        "method": "tools/call",
        "params": {
            "name": "horizon_trigger_recovery",
            "arguments": {"target_node_id": "db-primary", "strategy": "database_failover"}
        }
    })
    rec_data = json.loads(rec_res.json()["result"]["content"][0]["text"])
    job_id = rec_data["jobId"]

    # Submit bad signature (non-hex, invalid format)
    bad_res = await async_client.post("/mcp", json={
        "jsonrpc": "2.0",
        "id": 111,
        "method": "tools/call",
        "params": {
            "name": "horizon_submit_gate_approval",
            "arguments": {
                "job_id": job_id,
                "step_id": 1,
                "signature": "invalid_sig_xyz",
                "approver_address": "0x73595081334A18D4298A160b162faB4Fb4B3c85B"
            }
        }
    })
    assert bad_res.status_code == 200
    result_data = bad_res.json()["result"]
    assert result_data["isError"] is True
    assert "Execution error" in result_data["content"][0]["text"]


@pytest.mark.asyncio
async def test_tool_broadcast_incident(async_client: AsyncClient):
    """Verifies horizon_broadcast_incident dispatches War Room notifications."""
    res = await async_client.post("/mcp", json={
        "jsonrpc": "2.0",
        "id": 112,
        "method": "tools/call",
        "params": {
            "name": "horizon_broadcast_incident",
            "arguments": {
                "incident_id": "INC-8820",
                "channels": ["#war-room-critical", "#sre-alerts"],
                "webhook_url": "https://httpbin.org/status/200"
            }
        }
    })
    assert res.status_code == 200
    data = json.loads(res.json()["result"]["content"][0]["text"])
    assert data["success"] is True
    assert data["incidentId"] == "INC-8820"
    assert len(data["channelsDispatched"]) == 2
    assert "alertTitle" in data
    assert "message" in data
