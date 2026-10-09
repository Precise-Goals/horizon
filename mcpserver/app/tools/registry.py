import json
from typing import Any, Dict, List, Optional
from app.models import McpToolDefinition, McpToolParameter, McpToolResult, McpTextContent
from app.engine.topology import topology_engine
from app.engine.sarvam import sarvam_engine
from app.engine.blockchain import blockchain_engine


MCP_TOOLS: List[McpToolDefinition] = [
    McpToolDefinition(
        name="horizon_get_topology",
        description="Inspect the live infrastructure topology graph, active nodes, dependency edges, health metrics, and Kahn topological levels.",
        inputSchema=McpToolParameter(
            type="object",
            properties={
                "status": {
                    "type": "string",
                    "description": "Optional status filter ('all', 'healthy', 'degraded', 'down', 'recovering')",
                    "enum": ["all", "healthy", "degraded", "down", "recovering"],
                    "default": "all"
                }
            },
            required=[]
        )
    ),
    McpToolDefinition(
        name="horizon_simulate_failure",
        description="Simulate an infrastructure node outage or chaos drill, and calculate the downstream blast radius using Breadth-First Search (BFS) and Kahn's algorithm.",
        inputSchema=McpToolParameter(
            type="object",
            properties={
                "node_id": {
                    "type": "string",
                    "description": "Unique identifier of the node to fail (e.g., 'db-primary', 'redis-cache', 'auth-service', 'kafka-queue')"
                },
                "reason": {
                    "type": "string",
                    "description": "Operational reason or chaos drill scenario for the outage",
                    "default": "Chaos engineering drill"
                }
            },
            required=["node_id"]
        )
    ),
    McpToolDefinition(
        name="horizon_trigger_recovery",
        description="Trigger an autonomous multi-tier recovery sequence executed in Kahn topological bottom-up order. Automatically flags human-in-the-loop approval gates for stateful or high-blast-radius nodes.",
        inputSchema=McpToolParameter(
            type="object",
            properties={
                "target_node_id": {
                    "type": "string",
                    "description": "Identifier of the failed or degraded target node to recover (e.g. 'db-primary', 'redis-cache')"
                },
                "auto_approve_low_risk": {
                    "type": "boolean",
                    "description": "Whether to automatically approve and execute low-risk recovery steps",
                    "default": True
                }
            },
            required=["target_node_id"]
        )
    ),
    McpToolDefinition(
        name="horizon_sign_approval_gate",
        description="Generate an EIP-712 structured cryptographic approval payload for Human-in-the-Loop high blast-radius recovery actions anchored to the MST Testnet smart contract.",
        inputSchema=McpToolParameter(
            type="object",
            properties={
                "incident_id": {
                    "type": "string",
                    "description": "Incident identifier requiring governance authorization (e.g. 'INC-8820')"
                },
                "step_id": {
                    "type": "integer",
                    "description": "Playbook step number requiring signature (e.g. 1)"
                },
                "signer_address": {
                    "type": "string",
                    "description": "Ethereum/MST wallet address authorizing the recovery gate (e.g. '0x73595081334A18D4298A160b162faB4Fb4B3c85B')"
                }
            },
            required=["incident_id", "step_id"]
        )
    ),
    McpToolDefinition(
        name="horizon_verify_audit_proof",
        description="Verify a SHA-256 Merkle root audit proof against immutable MST Testnet block logs for compliance and tamper-evident incident response.",
        inputSchema=McpToolParameter(
            type="object",
            properties={
                "log_id": {
                    "type": "string",
                    "description": "Audit log or incident ID to verify against on-chain block states"
                },
                "expected_hash": {
                    "type": "string",
                    "description": "Optional expected cryptographic state root hash"
                }
            },
            required=["log_id"]
        )
    ),
    McpToolDefinition(
        name="horizon_synthesize_yaml",
        description="Synthesize production-grade Kubernetes CRD (AutonomousRecoveryPipeline) or Terraform infrastructure recovery manifests using Sarvam AI (sarvam-105b).",
        inputSchema=McpToolParameter(
            type="object",
            properties={
                "prompt": {
                    "type": "string",
                    "description": "Natural language description of the target architecture (e.g. 'E-commerce microservices with MySQL master and Redis cache' or 'GenAI RAG pipeline with pgvector')"
                }
            },
            required=["prompt"]
        )
    ),
    McpToolDefinition(
        name="horizon_ask_sre",
        description="Query the Horizon SRE Copilot (powered by Sarvam AI) for autonomous site reliability engineering advice, incident triage, and multilingual recovery instructions.",
        inputSchema=McpToolParameter(
            type="object",
            properties={
                "query": {
                    "type": "string",
                    "description": "Technical SRE question in any supported language (English, Hindi, Spanish, etc.)"
                }
            },
            required=["query"]
        )
    ),
    McpToolDefinition(
        name="horizon_diagnose_cluster",
        description="Execute a cluster health and resilience audit: detects acyclic safety (Kahn sort), single points of failure (SPOFs), and unhedged blast radii.",
        inputSchema=McpToolParameter(
            type="object",
            properties={
                "detailed": {
                    "type": "boolean",
                    "description": "Include detailed per-node metric breakdowns",
                    "default": False
                }
            },
            required=[]
        )
    )
]


def get_tool_definitions() -> List[Dict[str, Any]]:
    """Returns the list of tool definitions formatted for MCP tools/list protocol."""
    return [tool.model_dump() for tool in MCP_TOOLS]


async def execute_tool(name: str, arguments: Optional[Dict[str, Any]] = None) -> McpToolResult:
    """Dispatches and executes an MCP tool by name."""
    args = arguments or {}

    try:
        if name == "horizon_get_topology":
            status_filter = args.get("status", "all")
            nodes = topology_engine.get_nodes(status_filter)
            edges = topology_engine.get_edges()
            levels, cycle_detected = topology_engine.kahn_topological_sort()

            data = {
                "totalNodes": len(nodes),
                "cycleDetected": cycle_detected,
                "topologicalLevels": levels,
                "nodes": [n.model_dump() for n in nodes],
                "edges": [e.model_dump() for e in edges],
            }
            return McpToolResult(
                content=[McpTextContent(type="text", text=json.dumps(data, indent=2))],
                isError=False,
            )

        elif name == "horizon_simulate_failure":
            node_id = args.get("node_id")
            if not node_id:
                return McpToolResult(
                    content=[McpTextContent(type="text", text="Error: 'node_id' is required.")],
                    isError=True,
                )
            reason = args.get("reason", "Chaos engineering drill")
            result = topology_engine.simulate_failure(node_id, reason)
            return McpToolResult(
                content=[McpTextContent(type="text", text=json.dumps(result, indent=2))],
                isError=False,
            )

        elif name == "horizon_trigger_recovery":
            target_node_id = args.get("target_node_id")
            if not target_node_id:
                return McpToolResult(
                    content=[McpTextContent(type="text", text="Error: 'target_node_id' is required.")],
                    isError=True,
                )
            auto_approve = args.get("auto_approve_low_risk", True)
            result = topology_engine.trigger_recovery(target_node_id, auto_approve_low_risk=auto_approve)
            return McpToolResult(
                content=[McpTextContent(type="text", text=json.dumps(result, indent=2))],
                isError=False,
            )

        elif name == "horizon_sign_approval_gate":
            incident_id = args.get("incident_id")
            step_id = args.get("step_id")
            if not incident_id or step_id is None:
                return McpToolResult(
                    content=[McpTextContent(type="text", text="Error: 'incident_id' and 'step_id' are required.")],
                    isError=True,
                )
            signer = args.get("signer_address")
            payload = blockchain_engine.format_eip712_payload(incident_id, int(step_id), signer)
            return McpToolResult(
                content=[McpTextContent(type="text", text=json.dumps(payload, indent=2))],
                isError=False,
            )

        elif name == "horizon_verify_audit_proof":
            log_id = args.get("log_id")
            if not log_id:
                return McpToolResult(
                    content=[McpTextContent(type="text", text="Error: 'log_id' is required.")],
                    isError=True,
                )
            expected_hash = args.get("expected_hash")
            proof = await blockchain_engine.verify_audit_proof(log_id, expected_hash)
            return McpToolResult(
                content=[McpTextContent(type="text", text=json.dumps(proof, indent=2))],
                isError=False,
            )

        elif name == "horizon_synthesize_yaml":
            prompt = args.get("prompt")
            if not prompt:
                return McpToolResult(
                    content=[McpTextContent(type="text", text="Error: 'prompt' is required.")],
                    isError=True,
                )
            result = await sarvam_engine.synthesize_yaml_pipeline(prompt)
            return McpToolResult(
                content=[McpTextContent(type="text", text=json.dumps(result, indent=2))],
                isError=False,
            )

        elif name == "horizon_ask_sre":
            query = args.get("query")
            if not query:
                return McpToolResult(
                    content=[McpTextContent(type="text", text="Error: 'query' is required.")],
                    isError=True,
                )
            copilot_reply = await sarvam_engine.ask_sre_copilot(query)
            return McpToolResult(
                content=[McpTextContent(type="text", text=copilot_reply)],
                isError=False,
            )

        elif name == "horizon_diagnose_cluster":
            nodes = topology_engine.get_nodes()
            levels, cycle_detected = topology_engine.kahn_topological_sort()

            # Identify Single Points of Failure (SPOFs)
            spofs = []
            for n in nodes:
                blast = topology_engine.compute_blast_radius(n.id)
                if len(blast) >= 3:
                    spofs.append({
                        "nodeId": n.id,
                        "name": n.name,
                        "downstreamImpact": len(blast),
                        "affectedNodes": blast
                    })

            degraded_or_down = [n.id for n in nodes if n.status in ["down", "degraded"]]
            health_status = "CRITICAL" if any(n.status == "down" for n in nodes) else (
                "DEGRADED" if degraded_or_down else "OPTIMAL"
            )

            diagnosis = {
                "overallHealth": health_status,
                "cycleDetected": cycle_detected,
                "acyclicSafetyVerified": not cycle_detected,
                "totalNodes": len(nodes),
                "degradedOrDownNodes": degraded_or_down,
                "singlePointsOfFailure": spofs,
                "topologicalRecoveryLevels": levels,
                "recommendation": (
                    "Deploy read replica and circuit breaker to mitigate database SPOF."
                    if spofs else "Cluster topology is fully balanced and redundant."
                ),
            }

            if args.get("detailed", False):
                diagnosis["nodeMetrics"] = [
                    {
                        "id": n.id,
                        "latencyMs": n.latency_ms,
                        "errorRate": n.error_rate,
                        "cpuPercent": n.cpu_percent,
                    }
                    for n in nodes
                ]

            return McpToolResult(
                content=[McpTextContent(type="text", text=json.dumps(diagnosis, indent=2))],
                isError=False,
            )

        else:
            return McpToolResult(
                content=[McpTextContent(type="text", text=f"Unknown tool name: '{name}'. Available tools: {[t.name for t in MCP_TOOLS]}")],
                isError=True,
            )

    except Exception as e:
        return McpToolResult(
            content=[McpTextContent(type="text", text=f"Execution error in tool '{name}': {str(e)}")],
            isError=True,
        )
