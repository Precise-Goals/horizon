import asyncio
import json
import logging
import os
import sys
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, Optional

import uvicorn
from fastapi import FastAPI, HTTPException, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from sse_starlette.sse import EventSourceResponse

from app.config import settings
from app.models import JsonRpcRequest, JsonRpcResponse, JsonRpcErrorDetails, WebhookIncidentPayload
from app.tools.registry import get_tool_definitions, execute_tool
from app.engine.topology import topology_engine

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("horizon.mcpserver")

# Initialize FastAPI App
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Model Context Protocol (MCP) Server for Horizon Autonomous Infrastructure Recovery",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Enable CORS for external agents and web clients (permits all origins, methods, and headers)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# In-Memory Active SSE Sessions Map: session_id -> asyncio.Queue
active_sessions: Dict[str, asyncio.Queue] = {}


# ==============================================================================
# Protocol Handler: Universal JSON-RPC 2.0 Engine
# ==============================================================================

async def handle_jsonrpc(payload: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Core MCP JSON-RPC 2.0 processor.
    Shared across SSE (/messages), Direct HTTP (/mcp), and CLI Stdio (--stdio).
    """
    req_id = payload.get("id")
    method = payload.get("method")
    params = payload.get("params") or {}

    # Handle notifications (requests without an 'id')
    is_notification = req_id is None

    try:
        if method == "initialize":
            res = {
                "protocolVersion": "2024-11-05",
                "capabilities": {
                    "tools": {"listChanged": False},
                    "logging": {},
                },
                "serverInfo": {
                    "name": "horizon-mcp-server",
                    "version": settings.APP_VERSION,
                },
            }
            return {"jsonrpc": "2.0", "id": req_id, "result": res}

        elif method == "notifications/initialized":
            # Client acknowledging handshake
            logger.info("Client acknowledged MCP initialization handshake.")
            return None

        elif method == "ping":
            return {"jsonrpc": "2.0", "id": req_id, "result": {}}

        elif method == "tools/list":
            tools = get_tool_definitions()
            return {"jsonrpc": "2.0", "id": req_id, "result": {"tools": tools}}

        elif method == "tools/call":
            tool_name = params.get("name")
            tool_args = params.get("arguments", {})

            if not tool_name:
                return {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "error": {"code": -32602, "message": "Missing 'name' in tools/call parameters."},
                }

            logger.info(f"Executing MCP tool call: {tool_name} with args: {list(tool_args.keys())}")
            tool_result = await execute_tool(tool_name, tool_args)
            return {"jsonrpc": "2.0", "id": req_id, "result": tool_result.model_dump()}

        else:
            if is_notification:
                return None
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "error": {
                    "code": -32601,
                    "message": f"Method '{method}' not found. Supported methods: initialize, ping, tools/list, tools/call.",
                },
            }

    except Exception as exc:
        logger.error(f"Error handling method '{method}': {exc}", exc_info=True)
        if is_notification:
            return None
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "error": {"code": -32603, "message": f"Internal MCP server error: {str(exc)}"},
        }


# ==============================================================================
# Health & Status Endpoints
# ==============================================================================

@app.get("/health", tags=["Monitoring"])
@app.get("/api/v1/health", tags=["Monitoring"])
async def health_check():
    """Liveness and readiness probe for Render Free Tier orchestrator and web frontends."""
    return {
        "status": "healthy",
        "service": "horizon-mcp-server",
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "active_sse_sessions": len(active_sessions),
        "tools_registered": len(get_tool_definitions()),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


# ==============================================================================
# REST Endpoints for Web Frontend & Browser Verification (apps/web)
# ==============================================================================

@app.get("/api/v1/mcp/tools", tags=["MCP Tools"])
@app.get("/mcp/tools", tags=["MCP Tools"])
@app.get("/tools", tags=["MCP Tools"])
async def list_tools_direct():
    """
    Direct REST GET endpoint returning registered MCP tools catalogue for browser clients.
    Permits web frontends (apps/web) to inspect available autonomous recovery tools without JSON-RPC wrapping.
    """
    tools = get_tool_definitions()
    return {
        "status": "success",
        "count": len(tools),
        "tools": tools,
    }


@app.get("/api/v1/nft/rate-limits", tags=["Web3 & NFT Subscriptions"])
@app.get("/nft/rate-limits", tags=["Web3 & NFT Subscriptions"])
async def get_nft_rate_limits():
    """Returns AutoLogging rate limits (5, 10, 15, 20) with respect to NFT subscription tiers."""
    return {
        "status": "success",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "design_theme": {
            "name": "Cobalt Blue",
            "hex": "#0047AB",
            "bg_hex": "0047AB",
            "secondary": "#FFF8F0",
        },
        "canonical_image_url": "https://horizon-aiops.vercel.app/horizon.jpg",
        "rate_limits": {
            "explorer": {
                "tier_number": 1,
                "name": "Explorer Tier",
                "autologging_rate_limit": 5,
                "unit": "events/min",
                "price": "5.0 MST",
                "monitored_nodes_cap": 10,
            },
            "guardian": {
                "tier_number": 2,
                "name": "Guardian Tier",
                "autologging_rate_limit": 10,
                "unit": "events/min",
                "price": "15.0 MST",
                "monitored_nodes_cap": 50,
            },
            "sentinel": {
                "tier_number": 3,
                "name": "Sentinel Tier",
                "autologging_rate_limit": 15,
                "unit": "events/min",
                "price": "25.0 MST",
                "monitored_nodes_cap": 250,
            },
            "enterprise": {
                "tier_number": 4,
                "name": "Enterprise Tier",
                "autologging_rate_limit": 20,
                "unit": "events/min",
                "price": "50.0 MST",
                "monitored_nodes_cap": "Unlimited",
            },
        },
        "blockchain": {
            "chain_id": settings.MST_CHAIN_ID,
            "chain_name": "MST Blockchain Testnet",
            "contract_address": settings.HORIZON_SUBSCRIPTION_CONTRACT,
            "standard": "ERC-721 / EIP-747",
        },
    }


@app.get("/api/v1/nft/metadata/{tier_or_token_id}", tags=["Web3 & NFT Subscriptions"])
@app.get("/nft/metadata/{tier_or_token_id}", tags=["Web3 & NFT Subscriptions"])
async def get_nft_tier_metadata(tier_or_token_id: str):
    """Returns complete OpenSea/ERC-721 compliant metadata JSON for the requested NFT tier or token ID."""
    clean_key = tier_or_token_id.lower().replace(".json", "")

    tier_map = {
        "1": "explorer",
        "explorer": "explorer",
        "2": "guardian",
        "guardian": "guardian",
        "3": "sentinel",
        "sentinel": "sentinel",
        "4": "enterprise",
        "enterprise": "enterprise",
    }

    selected_tier = tier_map.get(clean_key, "explorer")

    tier_info = {
        "explorer": {
            "tier_num": 1,
            "name": "Explorer",
            "rate_limit": 5,
            "cap": 10,
            "desc": "Entry-level resilience for single cluster environments. Features AutoLogging rate limit of 5 events/minute.",
        },
        "guardian": {
            "tier_num": 2,
            "name": "Guardian",
            "rate_limit": 10,
            "cap": 50,
            "desc": "Production self-healing for multi-tier microservices. Features AutoLogging rate limit of 10 events/minute.",
        },
        "sentinel": {
            "tier_num": 3,
            "name": "Sentinel",
            "rate_limit": 15,
            "cap": 250,
            "desc": "Autonomous orchestration with cryptographic commander gates. Features AutoLogging rate limit of 15 events/minute.",
        },
        "enterprise": {
            "tier_num": 4,
            "name": "Enterprise",
            "rate_limit": 20,
            "cap": 999999,
            "desc": "Dedicated smart contracts, private subnets, and bespoke SLAs. Features maximum AutoLogging rate limit of 20 events/minute.",
        },
    }[selected_tier]

    return {
        "name": f"Horizon ZXPASS — {tier_info['name']} Tier #{tier_info['tier_num']}",
        "description": f"Enterprise Autonomous Infrastructure Recovery Platform NFT Subscription Pass ({tier_info['name']} Tier). Token-gated SRE recovery orchestration on MST Blockchain Testnet (Chain ID 91562037). {tier_info['desc']}",
        "image": "https://horizon-aiops.vercel.app/horizon.jpg",
        "external_url": "https://horizon-aiops.vercel.app/subscription",
        "background_color": "0047AB",
        "theme_color": "#0047AB",
        "attributes": [
            {"trait_type": "Subscription Tier", "value": tier_info["name"]},
            {"trait_type": "Tier Level", "value": tier_info["tier_num"], "display_type": "number"},
            {"trait_type": "AutoLogging Rate Limit", "value": tier_info["rate_limit"], "display_type": "number", "max_value": 20},
            {"trait_type": "Rate Limit Unit", "value": "events/min"},
            {"trait_type": "Monitored Systems Cap", "value": tier_info["cap"], "display_type": "number"},
            {"trait_type": "Theme Color", "value": "Cobalt Blue"},
            {"trait_type": "Theme Hex", "value": "#0047AB"},
            {"trait_type": "Design System", "value": "Neo-Brutalism Cobalt & Cream"},
            {"trait_type": "Network", "value": "MST Blockchain Testnet"},
            {"trait_type": "Chain ID", "value": 91562037, "display_type": "number"},
            {"trait_type": "Standard", "value": "ERC-721 / EIP-747"},
            {"trait_type": "AI Engine", "value": "Sarvam AI SRE Copilot"},
            {"trait_type": "Governance Standard", "value": "EIP-712 Cryptographic Signature"},
            {"trait_type": "Audit Ledger", "value": "On-Chain Merkle Root Hash"},
        ],
        "properties": {
            "category": "SaaS Subscription Pass",
            "platform": "Horizon Autonomous Recovery",
            "rate_limits": {
                "autologging_events_per_minute": tier_info["rate_limit"],
                "burst_allowance": tier_info["rate_limit"],
                "window_seconds": 60,
            },
            "branding": {
                "theme_color": "#0047AB",
                "secondary_color": "#FFF8F0",
                "accent_style": "Neo-Brutalist Cobalt & Cream",
            },
        },
    }


@app.get("/api/v1/nodes", tags=["Topology"])
async def get_nodes_endpoint():
    """Returns cluster topology nodes with status and latency metrics."""
    nodes = topology_engine.get_nodes()
    return [n.model_dump() for n in nodes]


@app.get("/api/v1/graph/analysis", tags=["Topology"])
async def get_graph_analysis_endpoint():
    """Executes Kahn's topological sort and returns recovery tiers."""
    levels, has_cycle = topology_engine.kahn_topological_sort()
    return {
        "hasCycle": has_cycle,
        "cycleDetected": has_cycle,
        "topologicalLevels": levels,
        "totalNodes": len(topology_engine.get_nodes()),
    }


@app.get("/api/v1/topology/templates", tags=["Topology"])
async def get_topology_templates_endpoint():
    """Returns standard pre-built DAG YAML pipeline templates for instant failure simulation."""
    return topology_engine.get_dag_pipeline_templates()


@app.post("/api/v1/topology/custom-pipeline", tags=["Topology"])
async def apply_custom_pipeline_endpoint(request: Request):
    """
    Mounts a user-defined custom DAG pipeline of nodes into the cluster topology in memory.
    Validates acyclic structure via Kahn's algorithm O(V+E) and computes blast radiuses.
    """
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid JSON payload.")

    pipeline_name = body.get("pipeline_name", "custom-dag-pipeline")
    nodes_data = body.get("nodes", [])
    if not nodes_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Nodes array cannot be empty.")

    try:
        result = topology_engine.apply_custom_dag_pipeline(pipeline_name, nodes_data)
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))


@app.post("/api/v1/topology/reset", tags=["Topology"])
async def reset_topology_endpoint():
    """Restores baseline default 7-node enterprise cluster topology."""
    return topology_engine.reset_to_default_cluster()


@app.post("/api/v1/chaos", tags=["Chaos"])
async def trigger_chaos_endpoint(request: Request):
    """Triggers simulated node failure or reset for chaos drills."""
    try:
        body = await request.json()
    except Exception:
        body = {}
    node_id = body.get("nodeId") or body.get("node_id") or "db-primary"
    action = body.get("action", "fail")
    if action == "fail":
        res = topology_engine.simulate_failure(node_id, reason=body.get("reason", "Chaos engineering drill"))
        return {
            "message": f"Node {node_id} set to DOWN",
            "incident": res,
        }
    else:
        node = topology_engine.get_node(node_id)
        if node:
            node.status = "healthy"
            node.latency_ms = 12.0
            node.error_rate = 0.0
        return {"message": f"Node {node_id} restored to HEALTHY"}


# ==============================================================================
# Inbound Alertmanager / Datadog Webhook Pipeline
# ==============================================================================

@app.post("/api/v1/incidents/webhook", tags=["Inbound Webhook Pipeline"])
@app.post("/incidents/webhook", tags=["Inbound Webhook Pipeline"])
async def inbound_incident_webhook(request: Request):
    """
    Inbound webhook receiver for Datadog alerts and Prometheus Alertmanager notifications.
    Ingests firing alerts, detects affected topology nodes, and automatically triggers
    the Kahn DAG autonomous recovery pipeline.
    """
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON payload in webhook request.",
        )

    # 1. Parse target node ID and incident attributes from payload
    target_node_id: Optional[str] = None
    source = "alertmanager"
    reason = "Alertmanager firing notification"
    strategy = "automatic"
    auto_approve = True

    if isinstance(body, dict):
        if body.get("target_node_id"):
            target_node_id = body["target_node_id"]
        elif body.get("node_id"):
            target_node_id = body["node_id"]

        if body.get("strategy"):
            strategy = body["strategy"]

        if "auto_approve_low_risk" in body:
            auto_approve = bool(body["auto_approve_low_risk"])

        # Check Prometheus Alertmanager structure
        if "alerts" in body and isinstance(body["alerts"], list) and len(body["alerts"]) > 0:
            source = "prometheus_alertmanager"
            first_alert = body["alerts"][0]
            labels = first_alert.get("labels", {})
            annotations = first_alert.get("annotations", {})
            reason = (
                annotations.get("summary")
                or annotations.get("description")
                or labels.get("alertname")
                or reason
            )

            # Match node identifier from labels
            for candidate_key in ["node_id", "node", "instance", "service", "host", "target"]:
                val = labels.get(candidate_key)
                if val:
                    clean_val = str(val).split(":")[0]
                    if topology_engine.get_node(clean_val):
                        target_node_id = clean_val
                        break
                    elif not target_node_id:
                        target_node_id = clean_val

        # Check Datadog structure
        elif any(k in body for k in ["event_type", "alert_type", "tags"]):
            source = "datadog"
            reason = body.get("title") or body.get("body") or "Datadog monitor alert"
            tags = body.get("tags", [])
            for t in tags:
                if isinstance(t, str) and (":" in t):
                    prefix, val = t.split(":", 1)
                    if prefix in ["service", "node", "host"]:
                        if topology_engine.get_node(val):
                            target_node_id = val
                            break

        if not reason and body.get("reason"):
            reason = body["reason"]

    # If target_node_id is still unresolved, scan payload text for known node IDs
    if not target_node_id or not topology_engine.get_node(target_node_id):
        all_nodes = [n.id for n in topology_engine.get_nodes()]
        raw_text = json.dumps(body).lower()
        for nid in all_nodes:
            if nid in raw_text:
                target_node_id = nid
                break

    # Fallback to degraded/down node or primary database
    if not target_node_id or not topology_engine.get_node(target_node_id):
        down_nodes = [n.id for n in topology_engine.get_nodes() if n.status in ["down", "degraded"]]
        target_node_id = down_nodes[0] if down_nodes else "db-primary"

    logger.info(f"Inbound alert ingested from {source}. Target node: {target_node_id}. Trigger reason: {reason}")

    # Inject failure on target node if currently healthy
    node = topology_engine.get_node(target_node_id)
    if node and node.status == "healthy":
        topology_engine.simulate_failure(target_node_id, reason=reason)

    # Trigger Kahn DAG autonomous recovery pipeline
    recovery_result = topology_engine.trigger_recovery(
        target_node_id=target_node_id,
        auto_approve_low_risk=auto_approve,
        strategy=strategy,
    )

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "status": "incident_ingested",
            "source": source,
            "targetNode": target_node_id,
            "reason": reason,
            "recoveryJobId": recovery_result.get("jobId"),
            "strategy": recovery_result.get("strategy", strategy),
            "requiresGateApproval": recovery_result.get("requiresGateApproval", False),
            "recoveryPlan": recovery_result,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    )


# ==============================================================================
# SSE (Server-Sent Events) Transport Endpoints
# ==============================================================================

@app.get("/sse", tags=["MCP SSE Transport"])
async def sse_endpoint(request: Request):
    """
    Standard Model Context Protocol SSE connection endpoint.
    Establishes persistent SSE stream and yields initial endpoint URL event.
    """
    session_id = uuid.uuid4().hex
    queue: asyncio.Queue = asyncio.Queue()
    active_sessions[session_id] = queue
    logger.info(f"SSE client connected. Assigned session ID: {session_id}")

    # Build relative message endpoint
    endpoint_url = f"/messages?sessionId={session_id}"

    async def event_generator():
        try:
            # Step 1: Send endpoint event as required by MCP SSE standard
            yield {
                "event": "endpoint",
                "data": endpoint_url,
            }

            # Step 2: Stream downstream messages to client
            while True:
                # Check for client disconnect
                if await request.is_disconnected():
                    logger.info(f"Client disconnected for session {session_id}")
                    break

                try:
                    # Wait for message with short timeout to allow disconnect checking
                    msg = await asyncio.wait_for(queue.get(), timeout=15.0)
                    yield {
                        "event": "message",
                        "data": json.dumps(msg),
                    }
                    queue.task_done()
                except asyncio.TimeoutError:
                    # Keep-alive heartbeat comment
                    yield {"comment": "keep-alive"}

        except asyncio.CancelledError:
            logger.info(f"SSE stream cancelled for session {session_id}")
        finally:
            active_sessions.pop(session_id, None)
            logger.info(f"Cleaned up SSE session {session_id}")

    return EventSourceResponse(event_generator())


@app.post("/messages", tags=["MCP SSE Transport"])
async def messages_endpoint(request: Request):
    """
    Standard Model Context Protocol POST endpoint for SSE clients.
    Receives JSON-RPC request and routes response back into the SSE stream.
    """
    session_id = request.query_params.get("sessionId")
    if not session_id or session_id not in active_sessions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing or invalid sessionId parameter. Connect to /sse first.",
        )

    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid JSON body.")

    # Process JSON-RPC request
    response_msg = await handle_jsonrpc(body)

    if response_msg:
        # Push response back down the SSE stream
        queue = active_sessions.get(session_id)
        if queue:
            await queue.put(response_msg)

    return Response(status_code=status.HTTP_202_ACCEPTED)


# ==============================================================================
# Direct HTTP JSON-RPC 2.0 Transport (/mcp and /api/v1/mcp)
# ==============================================================================

@app.post("/mcp", tags=["MCP HTTP Transport"])
@app.post("/api/v1/mcp", tags=["MCP HTTP Transport"])
async def direct_mcp_endpoint(request: Request):
    """
    Direct HTTP JSON-RPC 2.0 endpoint for stateless agents, curl, and custom workflows.
    Bypasses SSE and returns synchronous JSON-RPC responses immediately.
    """
    try:
        body = await request.json()
    except Exception:
        return JSONResponse(
            status_code=400,
            content={"jsonrpc": "2.0", "error": {"code": -32700, "message": "Parse error: Invalid JSON."}},
        )

    response_payload = await handle_jsonrpc(body)
    if response_payload is None:
        return Response(status_code=204)

    return JSONResponse(content=response_payload)


# ==============================================================================
# Interactive Web Dashboard (Root /)
# ==============================================================================

@app.get("/", response_class=HTMLResponse, tags=["Dashboard"])
async def dashboard():
    """Interactive developer landing page and MCP connection inspector."""
    tools = get_tool_definitions()
    tools_html = "".join([
        f"""
        <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 14px 18px; margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <code style="font-size: 15px; color: #60a5fa; font-weight: 600;">{t['name']}</code>
                <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; background: rgba(96,165,250,0.15); color: #93c5fd; padding: 2px 8px; border-radius: 4px;">Tool</span>
            </div>
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">{t['description']}</p>
            <div style="font-size: 12px; color: #64748b;">
                Required: <span style="color: #cbd5e1;">{', '.join(t['inputSchema'].get('required', [])) or 'None'}</span>
            </div>
        </div>
        """ for t in tools
    ])

    return f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Horizon Autonomous MCP Server</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
            * {{ box-sizing: border-box; }}
            body {{
                font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
                background: #090d16;
                color: #f1f5f9;
                margin: 0;
                padding: 40px 20px;
                display: flex;
                justify-content: center;
            }}
            .container {{
                max-width: 900px;
                width: 100%;
            }}
            .badge {{
                display: inline-flex;
                align-items: center;
                gap: 6px;
                background: rgba(34, 197, 94, 0.12);
                border: 1px solid rgba(34, 197, 94, 0.3);
                color: #4ade80;
                font-size: 12px;
                font-weight: 600;
                padding: 4px 12px;
                border-radius: 9999px;
            }}
            .pulse {{
                width: 8px;
                height: 8px;
                background: #22c55e;
                border-radius: 50%;
                box-shadow: 0 0 8px #22c55e;
            }}
            h1 {{ font-size: 28px; margin: 16px 0 8px 0; font-weight: 700; letter-spacing: -0.02em; }}
            p.lead {{ color: #94a3b8; font-size: 15px; margin-top: 0; margin-bottom: 24px; line-height: 1.6; }}
            .grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin-bottom: 28px; }}
            .card {{
                background: #0f172a;
                border: 1px solid #1e293b;
                border-radius: 10px;
                padding: 18px 20px;
            }}
            .card-title {{ font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; font-weight: 600; margin-bottom: 6px; }}
            .card-value {{ font-family: 'JetBrains Mono', monospace; font-size: 14px; color: #38bdf8; word-break: break-all; }}
            pre {{
                background: #020617;
                border: 1px solid #1e293b;
                border-radius: 8px;
                padding: 16px;
                font-family: 'JetBrains Mono', monospace;
                font-size: 12px;
                color: #e2e8f0;
                overflow-x: auto;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="badge"><div class="pulse"></div> Render Free Tier Ready &bull; Online</div>
            <h1>Horizon Autonomous MCP Server</h1>
            <p class="lead">Model Context Protocol endpoint powering autonomous infrastructure recovery, Kahn's topological sequencing, Sarvam-105b manifest synthesis, and MST Testnet cryptographic gates.</p>
            
            <div class="grid">
                <div class="card">
                    <div class="card-title">SSE Stream Endpoint</div>
                    <div class="card-value">GET /sse</div>
                </div>
                <div class="card">
                    <div class="card-title">Message POST Endpoint</div>
                    <div class="card-value">POST /messages</div>
                </div>
                <div class="card">
                    <div class="card-title">Direct JSON-RPC Endpoint</div>
                    <div class="card-value">POST /mcp</div>
                </div>
                <div class="card">
                    <div class="card-title">REST Tools Catalogue</div>
                    <div class="card-value">GET /api/v1/mcp/tools</div>
                </div>
                <div class="card">
                    <div class="card-title">Inbound Webhook Pipeline</div>
                    <div class="card-value">POST /api/v1/incidents/webhook</div>
                </div>
                <div class="card">
                    <div class="card-title">Health Check Probe</div>
                    <div class="card-value">GET /health</div>
                </div>
                <div class="card">
                    <div class="card-title">Static Outbound Egress CIDRs</div>
                    <div class="card-value" style="font-size: 12px; color: #a7f3d0;">74.220.52.0/24<br>74.220.60.0/24</div>
                </div>
            </div>

            <h3 style="font-size: 18px; margin-top: 32px; margin-bottom: 14px;">Cursor &amp; Claude Desktop Configuration</h3>
            <pre><code>{{
  "mcpServers": {{
    "horizon-recovery": {{
      "url": "https://horizon-mcp-server-phf8.onrender.com/sse",
      "transport": "sse"
    }}
  }}
}}</code></pre>

            <h3 style="font-size: 18px; margin-top: 32px; margin-bottom: 14px;">Registered Autonomous Recovery Tools ({len(tools)})</h3>
            {tools_html}
        </div>
    </body>
    </html>
    """


# ==============================================================================
# CLI Stdio Mode (Claude Desktop / Antigravity Local Process Support)
# ==============================================================================

async def run_stdio_loop():
    """Runs synchronous JSON-RPC stdio event loop for local CLI execution."""
    logger.info("Starting Horizon MCP Server in STDIO mode...")
    reader = asyncio.StreamReader()
    protocol = asyncio.StreamReaderProtocol(reader)
    await asyncio.get_event_loop().connect_read_pipe(lambda: protocol, sys.stdin)

    while True:
        try:
            line = await reader.readline()
            if not line:
                break
            line_str = line.decode().strip()
            if not line_str:
                continue

            payload = json.loads(line_str)
            response = await handle_jsonrpc(payload)
            if response:
                out_bytes = (json.dumps(response) + "\n").encode()
                sys.stdout.buffer.write(out_bytes)
                sys.stdout.buffer.flush()
        except asyncio.CancelledError:
            break
        except Exception as e:
            logger.error(f"Error in stdio loop: {e}", exc_info=True)


if __name__ == "__main__":
    if "--stdio" in sys.argv:
        asyncio.run(run_stdio_loop())
    else:
        port = int(os.environ.get("PORT", settings.PORT))
        uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=False, workers=1)
