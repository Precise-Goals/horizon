import json
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_tool_get_topology(async_client: AsyncClient):
    """Tests tool: horizon_get_topology."""
    payload = {
        "jsonrpc": "2.0",
        "id": 10,
        "method": "tools/call",
        "params": {
            "name": "horizon_get_topology",
            "arguments": {"status": "all"}
        }
    }
    res = await async_client.post("/mcp", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert not data.get("error")
    result = data["result"]
    assert result["isError"] is False
    content_text = result["content"][0]["text"]
    parsed = json.loads(content_text)
    assert parsed["totalNodes"] >= 5
    assert parsed["cycleDetected"] is False
    assert len(parsed["topologicalLevels"]) >= 2


@pytest.mark.asyncio
async def test_tool_simulate_failure(async_client: AsyncClient):
    """Tests tool: horizon_simulate_failure."""
    payload = {
        "jsonrpc": "2.0",
        "id": 11,
        "method": "tools/call",
        "params": {
            "name": "horizon_simulate_failure",
            "arguments": {
                "node_id": "db-primary",
                "reason": "Test chaos injection"
            }
        }
    }
    res = await async_client.post("/mcp", json=payload)
    assert res.status_code == 200
    data = res.json()
    result = data["result"]
    assert result["isError"] is False
    parsed = json.loads(result["content"][0]["text"])
    assert parsed["success"] is True
    assert parsed["affectedNode"] == "db-primary"
    assert len(parsed["blastRadius"]) > 0


@pytest.mark.asyncio
async def test_tool_trigger_recovery(async_client: AsyncClient):
    """Tests tool: horizon_trigger_recovery."""
    payload = {
        "jsonrpc": "2.0",
        "id": 12,
        "method": "tools/call",
        "params": {
            "name": "horizon_trigger_recovery",
            "arguments": {
                "target_node_id": "redis-cache",
                "auto_approve_low_risk": True
            }
        }
    }
    res = await async_client.post("/mcp", json=payload)
    assert res.status_code == 200
    data = res.json()
    result = data["result"]
    assert result["isError"] is False
    parsed = json.loads(result["content"][0]["text"])
    assert parsed["targetNode"] == "redis-cache"
    assert len(parsed["steps"]) >= 4


@pytest.mark.asyncio
async def test_tool_sign_approval_gate(async_client: AsyncClient):
    """Tests tool: horizon_sign_approval_gate."""
    payload = {
        "jsonrpc": "2.0",
        "id": 13,
        "method": "tools/call",
        "params": {
            "name": "horizon_sign_approval_gate",
            "arguments": {
                "incident_id": "INC-8820",
                "step_id": 1,
                "signer_address": "0x73595081334A18D4298A160b162faB4Fb4B3c85B"
            }
        }
    }
    res = await async_client.post("/mcp", json=payload)
    assert res.status_code == 200
    data = res.json()
    result = data["result"]
    assert result["isError"] is False
    parsed = json.loads(result["content"][0]["text"])
    assert parsed["approved"] is True
    assert parsed["chainId"] == 91562037
    assert "eip712Domain" in parsed
    assert parsed["txHash"].startswith("0x")


@pytest.mark.asyncio
async def test_tool_verify_audit_proof(async_client: AsyncClient):
    """Tests tool: horizon_verify_audit_proof."""
    payload = {
        "jsonrpc": "2.0",
        "id": 14,
        "method": "tools/call",
        "params": {
            "name": "horizon_verify_audit_proof",
            "arguments": {
                "log_id": "AUDIT-LOG-1029"
            }
        }
    }
    res = await async_client.post("/mcp", json=payload)
    assert res.status_code == 200
    data = res.json()
    result = data["result"]
    assert result["isError"] is False
    parsed = json.loads(result["content"][0]["text"])
    assert parsed["verified"] is True
    assert parsed["tamperEvident"] is True
    assert parsed["onChainHash"].startswith("0x")


@pytest.mark.asyncio
async def test_tool_synthesize_yaml(async_client: AsyncClient):
    """Tests tool: horizon_synthesize_yaml."""
    payload = {
        "jsonrpc": "2.0",
        "id": 15,
        "method": "tools/call",
        "params": {
            "name": "horizon_synthesize_yaml",
            "arguments": {
                "prompt": "E-commerce platform with MySQL master and Redis session cache"
            }
        }
    }
    res = await async_client.post("/mcp", json=payload)
    assert res.status_code == 200
    data = res.json()
    result = data["result"]
    assert result["isError"] is False
    parsed = json.loads(result["content"][0]["text"])
    assert "yaml" in parsed
    assert "AutonomousRecoveryPipeline" in parsed["yaml"]
    assert parsed["cycleDetected"] is False


@pytest.mark.asyncio
async def test_tool_ask_sre(async_client: AsyncClient):
    """Tests tool: horizon_ask_sre."""
    payload = {
        "jsonrpc": "2.0",
        "id": 16,
        "method": "tools/call",
        "params": {
            "name": "horizon_ask_sre",
            "arguments": {
                "query": "How does Kahn's algorithm prevent cascade failures in distributed clusters?"
            }
        }
    }
    res = await async_client.post("/mcp", json=payload)
    assert res.status_code == 200
    data = res.json()
    result = data["result"]
    assert result["isError"] is False
    reply = result["content"][0]["text"]
    assert len(reply) > 50


@pytest.mark.asyncio
async def test_tool_ask_sre_non_domain_guardrail(async_client: AsyncClient):
    """Tests tool: horizon_ask_sre guardrail against non-domain questions."""
    payload = {
        "jsonrpc": "2.0",
        "id": 17,
        "method": "tools/call",
        "params": {
            "name": "horizon_ask_sre",
            "arguments": {
                "query": "Give me a recipe to cook chocolate cake"
            }
        }
    }
    res = await async_client.post("/mcp", json=payload)
    assert res.status_code == 200
    data = res.json()
    result = data["result"]
    reply = result["content"][0]["text"]
    assert "technical domain" in reply or "विशेष रूप से" in reply


@pytest.mark.asyncio
async def test_tool_diagnose_cluster(async_client: AsyncClient):
    """Tests tool: horizon_diagnose_cluster."""
    payload = {
        "jsonrpc": "2.0",
        "id": 18,
        "method": "tools/call",
        "params": {
            "name": "horizon_diagnose_cluster",
            "arguments": {"detailed": True}
        }
    }
    res = await async_client.post("/mcp", json=payload)
    assert res.status_code == 200
    data = res.json()
    result = data["result"]
    parsed = json.loads(result["content"][0]["text"])
    assert parsed["acyclicSafetyVerified"] is True
    assert "singlePointsOfFailure" in parsed
    assert "nodeMetrics" in parsed
