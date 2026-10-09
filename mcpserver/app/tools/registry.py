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
        description="Trigger an autonomous multi-tier recovery sequence executed in Kahn topological bottom-up order with playbooks for database failover, service restart, or backup restoration. Automatically flags human-in-the-loop approval gates for stateful or high-blast-radius nodes.",
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
                },
                "strategy": {
                    "type": "string",
                    "description": "Recovery playbook strategy: 'automatic', 'database_failover', 'service_restart', or 'restore_from_backup'",
                    "enum": ["automatic", "database_failover", "service_restart", "restore_from_backup"],
                    "default": "automatic"
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
    ),
    McpToolDefinition(
        name="horizon_probe_health",
        description="Evaluates node and cluster health using a 3-consecutive-miss sliding window threshold before declaring a hard failure.",
        inputSchema=McpToolParameter(
            type="object",
            properties={
                "node_id": {
                    "type": "string",
                    "description": "Optional identifier of a specific node to probe. If omitted, probes all cluster nodes."
                },
                "simulate_miss": {
                    "type": "boolean",
                    "description": "Simulate a probe timeout or missed heartbeat to evaluate the consecutive failure threshold",
                    "default": False
                }
            },
            required=[]
        )
    ),
    McpToolDefinition(
        name="horizon_submit_gate_approval",
        description="Submits a cryptographic EIP-712 signature to unblock a paused recovery job gate and complete all downstream tiers.",
        inputSchema=McpToolParameter(
            type="object",
            properties={
                "job_id": {
                    "type": "string",
                    "description": "Recovery job identifier or incident identifier currently paused awaiting approval"
                },
                "step_id": {
                    "type": "integer",
                    "description": "Playbook step number being authorized (e.g., 1)"
                },
                "signature": {
                    "type": "string",
                    "description": "Hex cryptographic signature (0x...) authorizing execution of the gated tier"
                },
                "approver_address": {
                    "type": "string",
                    "description": "Optional Ethereum/MST wallet address authorizing the gate (e.g. '0x73595081334A18D4298A160b162faB4Fb4B3c85B')"
                }
            },
            required=["job_id", "step_id", "signature"]
        )
    ),
    McpToolDefinition(
        name="horizon_get_incident_timeline",
        description="Retrieves recovery timeline, live RTO stopwatch seconds, step milestones, and rolling MTTR metrics.",
        inputSchema=McpToolParameter(
            type="object",
            properties={
                "job_id_or_incident_id": {
                    "type": "string",
                    "description": "Identifier of the recovery job or incident to inspect"
                }
            },
            required=["job_id_or_incident_id"]
        )
    ),
    McpToolDefinition(
        name="horizon_broadcast_incident",
        description="Dispatches War Room notifications to incident channels and outbound HTTP webhooks (Slack/Discord).",
        inputSchema=McpToolParameter(
            type="object",
            properties={
                "incident_id": {
                    "type": "string",
                    "description": "Identifier of the incident to broadcast"
                },
                "channels": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "List of Slack/Discord channels or teams to alert (e.g. ['#war-room-critical', '#sre-alerts'])"
                },
                "webhook_url": {
                    "type": "string",
                    "description": "Optional outbound HTTP webhook endpoint URL for external alert routing"
                }
            },
            required=["incident_id"]
        )
    ),
    McpToolDefinition(
        name="horizon_get_nft_rate_limits",
        description="Inspects Web3 NFT subscription plans, AutoLogging rate limits (5, 10, 15, 20 events/min), Cobalt Blue (#0047AB) theme configuration, canonical image URL, and complete OpenSea/ERC-721 metadata schemas.",
        inputSchema=McpToolParameter(
            type="object",
            properties={
                "tier": {
                    "type": "string",
                    "description": "Optional tier name ('explorer', 'guardian', 'sentinel', 'enterprise') or token ID (1, 2, 3, 4)",
                    "enum": ["all", "explorer", "guardian", "sentinel", "enterprise", "1", "2", "3", "4"],
                    "default": "all"
                }
            },
            required=[]
        )
    ),
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
            strategy = args.get("strategy", "automatic")
            result = topology_engine.trigger_recovery(
                target_node_id,
                auto_approve_low_risk=auto_approve,
                strategy=strategy,
            )
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

        elif name == "horizon_probe_health":
            node_id = args.get("node_id")
            simulate_miss = args.get("simulate_miss")
            result = topology_engine.probe_cluster_health(node_id=node_id, simulate_miss=simulate_miss)
            return McpToolResult(
                content=[McpTextContent(type="text", text=json.dumps(result, indent=2))],
                isError=False,
            )

        elif name == "horizon_submit_gate_approval":
            job_id = args.get("job_id") or args.get("incident_id") or args.get("job_id_or_incident_id")
            step_id = args.get("step_id")
            signature = args.get("signature")
            if not job_id or step_id is None or not signature:
                return McpToolResult(
                    content=[McpTextContent(type="text", text="Error: 'job_id', 'step_id', and 'signature' are required.")],
                    isError=True,
                )
            approver = args.get("approver_address")
            result = topology_engine.submit_gate_approval(
                job_id=job_id,
                step_id=int(step_id),
                signature=signature,
                approver_address=approver,
            )
            return McpToolResult(
                content=[McpTextContent(type="text", text=json.dumps(result, indent=2))],
                isError=False,
            )

        elif name == "horizon_get_incident_timeline":
            job_id_or_incident_id = args.get("job_id_or_incident_id") or args.get("job_id") or args.get("incident_id")
            if not job_id_or_incident_id:
                return McpToolResult(
                    content=[McpTextContent(type="text", text="Error: 'job_id_or_incident_id' is required.")],
                    isError=True,
                )
            result = topology_engine.get_incident_timeline(job_id_or_incident_id)
            return McpToolResult(
                content=[McpTextContent(type="text", text=json.dumps(result, indent=2))],
                isError=False,
            )

        elif name == "horizon_broadcast_incident":
            incident_id = args.get("incident_id")
            if not incident_id:
                return McpToolResult(
                    content=[McpTextContent(type="text", text="Error: 'incident_id' is required.")],
                    isError=True,
                )
            channels = args.get("channels")
            webhook_url = args.get("webhook_url")
            result = await topology_engine.broadcast_incident_alert(
                incident_id=incident_id,
                channels=channels,
                webhook_url=webhook_url,
            )
            return McpToolResult(
                content=[McpTextContent(type="text", text=json.dumps(result, indent=2))],
                isError=False,
            )

        elif name == "horizon_get_nft_rate_limits":
            tier = str(args.get("tier", "all")).lower()
            limits = {
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
            }
            output_payload = {
                "status": "success",
                "design_theme": {
                    "color_name": "Cobalt Blue",
                    "hex": "#0047AB",
                    "bg_hex": "0047AB",
                    "secondary_color": "#FFF8F0",
                },
                "canonical_image_url": "https://horizon-aiops.vercel.app/horizon.jpg",
                "rate_limits": limits,
                "metadata_standard": "ERC-721 / EIP-747 / OpenSea",
                "requested_tier": tier,
            }
            return McpToolResult(
                content=[McpTextContent(type="text", text=json.dumps(output_payload, indent=2))],
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
