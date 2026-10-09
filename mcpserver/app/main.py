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
from app.models import JsonRpcRequest, JsonRpcResponse, JsonRpcErrorDetails
from app.tools.registry import get_tool_definitions, execute_tool

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

# Enable CORS for external agents and web clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
async def health_check():
    """Liveness and readiness probe for Render Free Tier orchestrator."""
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
