# Horizon MCP Server — Complete API & Integration Guide

The **Horizon Model Context Protocol (MCP) Server** exposes autonomous infrastructure recovery primitives, Kahn's algorithm topological sequencing, Sarvam AI manifest synthesis, and MST Testnet cryptographic governance to AI agents, IDEs, and automation pipelines.

---

## 🌐 Supported Transports

The server supports three distinct transport modes:

| Transport | Endpoint / Command | Best Suited For |
| :--- | :--- | :--- |
| **Server-Sent Events (SSE)** | `GET /sse`<br>`POST /messages?sessionId=...` | **Cursor IDE**, **Claude Desktop (SSE)**, Windsurf |
| **Direct HTTP JSON-RPC 2.0** | `POST /mcp`<br>`POST /api/v1/mcp` | Stateless agents, Webhooks, CI/CD pipelines, `curl` |
| **Standard I/O (stdio)** | `python -m app.main --stdio` | Local Claude Desktop process, Antigravity CLI, offline scripts |

---

## 🔌 Client Setup Configurations

### 1. Cursor IDE Integration
Create or update `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "horizon-recovery": {
      "url": "https://horizon-mcp-server-phf8.onrender.com/sse",
      "transport": "sse"
    }
  }
}
```

Or for local development:
```json
{
  "mcpServers": {
    "horizon-recovery-local": {
      "url": "http://127.0.0.1:10000/sse",
      "transport": "sse"
    }
  }
}
```

---

### 2. Claude Desktop Integration

#### Mode A: Remote Hosted on Render (SSE)
Edit `%APPDATA%\Claude\claude_desktop_config.json` (Windows) or `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS):

```json
{
  "mcpServers": {
    "horizon-render": {
      "url": "https://horizon-mcp-server-phf8.onrender.com/sse",
      "transport": "sse"
    }
  }
}
```

#### Mode B: Local Python Virtual Environment (`stdio`)
```json
{
  "mcpServers": {
    "horizon-local": {
      "command": "D:\\Workspace\\Projects\\veltrix\\mcpserver\\.venv\\Scripts\\python.exe",
      "args": ["-m", "app.main", "--stdio"],
      "env": {
        "SARVAM_API_KEY": "sk_mhp6zj2k_CZWnzOpKIR4wrCdCDUwa6hJY",
        "MST_CHAIN_ID": "91562037"
      }
    }
  }
}
```

---

### 3. Direct HTTP Integration (cURL / Any Programming Language)

Send JSON-RPC 2.0 requests directly to `POST /mcp` without maintaining SSE streams:

```bash
curl -X POST https://horizon-mcp-server-phf8.onrender.com/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "horizon_get_topology",
      "arguments": {"status": "all"}
    }
  }'
```

---

### 4. Enterprise Firewall & Outbound Egress Whitelisting

If your target databases, Kubernetes clusters, or private cloud VPCs require IP whitelisting, configure your firewalls to allow inbound connections from Render's static outbound IP ranges:

```text
74.220.52.0/24
74.220.60.0/24
```
*Region: Oregon (US West). Usable IPs: 74.220.52.0 - 74.220.52.255 and 74.220.60.0 - 74.220.60.255.*

---

## 🛠️ Complete Horizon MCP Tools Reference

### 1. `horizon_get_topology`
Inspects the current live infrastructure dependency topology, node health states, edge mappings, and Kahn topological levels.

> 🔗 **[Check Live API (Health Probe) ↗](https://horizon-mcp-server-phf8.onrender.com/health)** • **[Interactive Web Console ↗](https://horizon-mcp-server-phf8.onrender.com/)** • **[Direct JSON-RPC ↗](https://horizon-mcp-server-phf8.onrender.com/mcp)**

- **Parameters:**
  - `status` (*string*, optional): Filter nodes by health status (`"all"`, `"healthy"`, `"degraded"`, `"down"`, `"recovering"`). Default: `"all"`.

- **Example Call:**
```json
{
  "name": "horizon_get_topology",
  "arguments": {
    "status": "all"
  }
}
```

- **Example Response:**
```json
{
  "totalNodes": 7,
  "cycleDetected": false,
  "topologicalLevels": [
    ["db-primary"],
    ["kafka-queue", "redis-cache"],
    ["auth-service", "payment-worker"],
    ["api-gateway"],
    ["web-frontend"]
  ],
  "nodes": [
    {
      "id": "db-primary",
      "name": "PostgreSQL Master",
      "type": "database",
      "status": "healthy",
      "dependencies": [],
      "latency_ms": 4.2,
      "error_rate": 0.0,
      "cpu_percent": 42.0
    }
  ],
  "edges": [
    {"source": "db-primary", "target": "redis-cache"},
    {"source": "db-primary", "target": "kafka-queue"}
  ]
}
```

---

### 2. `horizon_simulate_failure`
Injects simulated outage or chaos fault into a target node and computes the cascaded blast radius using Kahn's algorithm and Breadth-First Search (BFS).

> 🔗 **[Check Live API (Health Probe) ↗](https://horizon-mcp-server-phf8.onrender.com/health)** • **[Interactive Web Console ↗](https://horizon-mcp-server-phf8.onrender.com/)** • **[Direct JSON-RPC ↗](https://horizon-mcp-server-phf8.onrender.com/mcp)**

- **Parameters:**
  - `node_id` (*string*, required): ID of the node to fail (e.g. `"db-primary"`, `"redis-cache"`).
  - `reason` (*string*, optional): Operational context or drill description.

- **Example Call:**
```json
{
  "name": "horizon_simulate_failure",
  "arguments": {
    "node_id": "db-primary",
    "reason": "Simulated disk I/O exhaustion drill"
  }
}
```

- **Example Response:**
```json
{
  "success": true,
  "incidentId": "INC-8820",
  "affectedNode": "db-primary",
  "blastRadius": [
    "api-gateway",
    "auth-service",
    "kafka-queue",
    "payment-worker",
    "redis-cache",
    "web-frontend"
  ],
  "estimatedRecoveryTimeSec": 45
}
```

---

### 3. `horizon_trigger_recovery`
Executes autonomous multi-tier bottom-up recovery along Kahn topological order. Flags Human-in-the-Loop approval gates for stateful or high blast-radius infrastructure.

> 🔗 **[Check Live API (Health Probe) ↗](https://horizon-mcp-server-phf8.onrender.com/health)** • **[Interactive Web Console ↗](https://horizon-mcp-server-phf8.onrender.com/)** • **[Direct JSON-RPC ↗](https://horizon-mcp-server-phf8.onrender.com/mcp)**

- **Parameters:**
  - `target_node_id` (*string*, required): Target node ID to recover.
  - `auto_approve_low_risk` (*boolean*, optional, default: `true`): Whether low-risk actions proceed autonomously.

- **Example Call:**
```json
{
  "name": "horizon_trigger_recovery",
  "arguments": {
    "target_node_id": "redis-cache",
    "auto_approve_low_risk": true
  }
}
```

- **Example Response:**
```json
{
  "jobId": "REC-9940",
  "targetNode": "redis-cache",
  "status": "completed",
  "currentTier": 0,
  "requiresGateApproval": false,
  "steps": [
    {
      "id": 1,
      "name": "Rolling Pod Restart for Redis Session Store",
      "action": "service_restart",
      "risk": "low",
      "status": "completed"
    },
    {
      "id": 2,
      "name": "Flush Stale Cache & Warm In-Memory Store",
      "action": "cache_purge",
      "risk": "low",
      "status": "pending"
    }
  ]
}
```

---

### 4. `horizon_sign_approval_gate`
Formats an EIP-712 structured cryptographic data payload for Human-in-the-Loop high blast-radius recovery actions on the MST Testnet smart contract (`0x3EDad...`).

> 🔗 **[Check Live API (Health Probe) ↗](https://horizon-mcp-server-phf8.onrender.com/health)** • **[Interactive Web Console ↗](https://horizon-mcp-server-phf8.onrender.com/)** • **[Direct JSON-RPC ↗](https://horizon-mcp-server-phf8.onrender.com/mcp)**

- **Parameters:**
  - `incident_id` (*string*, required): Active incident ID (e.g. `"INC-8820"`).
  - `step_id` (*integer*, required): Recovery playbook step number (e.g. `1`).
  - `signer_address` (*string*, optional): Authorizing Web3 wallet address.

- **Example Call:**
```json
{
  "name": "horizon_sign_approval_gate",
  "arguments": {
    "incident_id": "INC-8820",
    "step_id": 1,
    "signer_address": "0x73595081334A18D4298A160b162faB4Fb4B3c85B"
  }
}
```

- **Example Response:**
```json
{
  "approved": true,
  "txHash": "0x6f31b816fa8a8929e0018b335c0527ca3e7f...",
  "chainId": 91562037,
  "signerAddress": "0x73595081334A18D4298A160b162faB4Fb4B3c85B",
  "contractAddress": "0x3EDad230dCFc6Dd3C357490b9feDa49639646BB7",
  "blockExplorerUrl": "https://testnet.mstscan.com/tx/0x6f31...",
  "eip712Domain": {
    "name": "Horizon Autonomous Recovery Protocol",
    "version": "1.0",
    "chainId": 91562037,
    "verifyingContract": "0x3EDad230dCFc6Dd3C357490b9feDa49639646BB7"
  }
}
```

---

### 5. `horizon_verify_audit_proof`
Queries and cryptographically verifies a SHA-256 Merkle root audit proof against immutable MST Testnet block logs.

> 🔗 **[Check Live API (Health Probe) ↗](https://horizon-mcp-server-phf8.onrender.com/health)** • **[Interactive Web Console ↗](https://horizon-mcp-server-phf8.onrender.com/)** • **[Direct JSON-RPC ↗](https://horizon-mcp-server-phf8.onrender.com/mcp)**

- **Parameters:**
  - `log_id` (*string*, required): Incident or recovery audit identifier.
  - `expected_hash` (*string*, optional): Optional baseline hash for comparison.

- **Example Call:**
```json
{
  "name": "horizon_verify_audit_proof",
  "arguments": {
    "log_id": "INC-8820-AUDIT"
  }
}
```

- **Example Response:**
```json
{
  "verified": true,
  "logId": "INC-8820-AUDIT",
  "blockNumber": 4819203,
  "onChainHash": "0xa9c34ef71e...",
  "contractAddress": "0x3EDad230dCFc6Dd3C357490b9feDa49639646BB7",
  "chainId": 91562037,
  "tamperEvident": true,
  "explorerProofUrl": "https://testnet.mstscan.com/address/0x3EDad230dCFc6Dd3C357490b9feDa49639646BB7"
}
```

---

### 6. `horizon_synthesize_yaml`
Compiles production Kubernetes CRD (`AutonomousRecoveryPipeline`) and Terraform infrastructure recovery manifests from natural language using Sarvam AI (`sarvam-105b`).

> 🔗 **[Check Live API (Health Probe) ↗](https://horizon-mcp-server-phf8.onrender.com/health)** • **[Interactive Web Console ↗](https://horizon-mcp-server-phf8.onrender.com/)** • **[Direct JSON-RPC ↗](https://horizon-mcp-server-phf8.onrender.com/mcp)**

- **Parameters:**
  - `prompt` (*string*, required): Architecture description (e.g. `"E-commerce with MySQL, Redis, and Stripe worker"` or `"GenAI RAG with pgvector and Milvus"`).

- **Example Call:**
```json
{
  "name": "horizon_synthesize_yaml",
  "arguments": {
    "prompt": "E-commerce platform with MySQL master, Redis cache, and Stripe worker"
  }
}
```

- **Example Response:**
```json
{
  "architectureName": "E-Commerce Microservices Mesh",
  "cycleDetected": false,
  "nodesCount": 6,
  "topologicalLevels": [
    ["db-mysql-master"],
    ["redis-cache"],
    ["auth-worker", "payment-api"],
    ["order-service"],
    ["envoy-ingress"]
  ],
  "yaml": "apiVersion: horizon.recovery.io/v1alpha1\nkind: AutonomousRecoveryPipeline\nmetadata:\n  name: e-commerce-microservices-mesh\n..."
}
```

---

### 7. `horizon_ask_sre`
Conversational multilingual SRE Copilot powered by Sarvam AI (`sarvam-105b`). Enforces strict technical domain guardrails and responds conversationally in the user's language (Hindi, English, Spanish, Tamil, etc.).

> 🔗 **[Check Live API (Health Probe) ↗](https://horizon-mcp-server-phf8.onrender.com/health)** • **[Interactive Web Console ↗](https://horizon-mcp-server-phf8.onrender.com/)** • **[Direct JSON-RPC ↗](https://horizon-mcp-server-phf8.onrender.com/mcp)**

- **Parameters:**
  - `query` (*string*, required): Site reliability engineering or incident management question.

- **Example Call (Hindi):**
```json
{
  "name": "horizon_ask_sre",
  "arguments": {
    "query": "कहान एल्गोरिदम से क्लस्टर रिकवरी कैसे सुनिश्चित होती है?"
  }
}
```

- **Example Response:**
```text
वितरित माइक्रोसर्विसेज में रिकवरी हमेशा नीचे से ऊपर (bottom-up) होनी चाहिए: कैशे और वर्कर्स से पहले स्टोरेज का स्वस्थ होना अनिवार्य है ताकि कैस्केडिंग फेलियर और क्रैश लूप से बचा जा सके। कहान एल्गोरिदम निर्भरता क्रम सुनिश्चित करता है।
```

---

### 8. `horizon_diagnose_cluster`
Audits cluster health, validates acyclic safety via Kahn topological sort, identifies Single Points of Failure (SPOFs), and evaluates downstream blast impact.

> 🔗 **[Check Live API (Health Probe) ↗](https://horizon-mcp-server-phf8.onrender.com/health)** • **[Interactive Web Console ↗](https://horizon-mcp-server-phf8.onrender.com/)** • **[Direct JSON-RPC ↗](https://horizon-mcp-server-phf8.onrender.com/mcp)**

- **Parameters:**
  - `detailed` (*boolean*, optional, default: `false`): Include latency, CPU, and error rate telemetry.

- **Example Call:**
```json
{
  "name": "horizon_diagnose_cluster",
  "arguments": {
    "detailed": true
  }
}
```

- **Example Response:**
```json
{
  "overallHealth": "OPTIMAL",
  "cycleDetected": false,
  "acyclicSafetyVerified": true,
  "totalNodes": 7,
  "degradedOrDownNodes": [],
  "singlePointsOfFailure": [
    {
      "nodeId": "db-primary",
      "name": "PostgreSQL Master",
      "downstreamImpact": 6,
      "affectedNodes": ["api-gateway", "auth-service", "kafka-queue", "payment-worker", "redis-cache", "web-frontend"]
    }
  ],
  "recommendation": "Deploy read replica and circuit breaker to mitigate database SPOF."
}
```

---

### 9. `horizon_probe_health`
Evaluates node or cluster health with sliding-window consecutive failure tracking. Prevents alert flapping by requiring **3 consecutive missed health probes** before transitioning a node to `down` and degrading downstream dependencies.

> 🔗 **[Check Live API (Health Probe) ↗](https://horizon-mcp-server-phf8.onrender.com/health)** • **[Interactive Web Console ↗](https://horizon-mcp-server-phf8.onrender.com/)** • **[Direct JSON-RPC ↗](https://horizon-mcp-server-phf8.onrender.com/mcp)**

- **Parameters:**
  - `node_id` (*string*, optional): Target node to probe (e.g. `"redis-cache"`). If omitted, evaluates all cluster nodes.
  - `simulate_miss` (*boolean*, optional): Manually trigger a simulated probe miss (`true`) or successful probe recovery (`false`).

- **Example Call:**
```json
{
  "name": "horizon_probe_health",
  "arguments": {
    "node_id": "redis-cache",
    "simulate_miss": true
  }
}
```

- **Example Response (3rd Consecutive Miss):**
```json
{
  "nodeId": "redis-cache",
  "status": "down",
  "healthy": false,
  "consecutiveFailures": 3,
  "failureDeclared": true,
  "failureThreshold": 3,
  "latencyMs": 999.0,
  "errorRate": 1.0,
  "message": "HARD FAILURE: Node redis-cache missed 3/3 consecutive probes. Status transitioned to DOWN.",
  "totalProbed": 1
}
```

---

### 10. `horizon_submit_gate_approval`
Cryptographically unblocks a paused high-risk recovery job using an EIP-712 digital signature, executing remaining recovery tiers and updating MTTR history.

> 🔗 **[Check Live API (Health Probe) ↗](https://horizon-mcp-server-phf8.onrender.com/health)** • **[Interactive Web Console ↗](https://horizon-mcp-server-phf8.onrender.com/)** • **[Direct JSON-RPC ↗](https://horizon-mcp-server-phf8.onrender.com/mcp)**

- **Parameters:**
  - `job_id` (*string*, required): Active recovery job ID (e.g. `"REC-9940"`).
  - `step_id` (*integer*, required): Playbook step ID to unblock (e.g. `1`).
  - `signature` (*string*, required): 65-byte EIP-712 hex signature (`0x...`).
  - `approver_address` (*string*, optional): Web3 wallet address of the approver.

- **Example Call:**
```json
{
  "name": "horizon_submit_gate_approval",
  "arguments": {
    "job_id": "REC-9940",
    "step_id": 1,
    "signature": "0x6f31b816fa8a8929e0018b335c0527ca3e7f917532bc13ef047814b776269ca84742f1f0a1515efbe49e9c3e98beaa93b137d6852a36b53dbbeeb7909ff7b2b61c",
    "approver_address": "0x73595081334A18D4298A160b162faB4Fb4B3c85B"
  }
}
```

- **Example Response:**
```json
{
  "jobId": "REC-9940",
  "status": "completed",
  "approver": "0x73595081334A18D4298A160b162faB4Fb4B3c85B",
  "elapsedRtoSeconds": 24.8,
  "rollingMttrSeconds": 31.4,
  "message": "Cryptographic gate approval verified. Recovery job REC-9940 unblocked and completed."
}
```

---

### 11. `horizon_get_incident_timeline`
Retrieves the real-time Recovery Time Objective (RTO) stopwatch, step execution milestones, audit log entries, and rolling Mean Time to Recovery (MTTR) metrics.

> 🔗 **[Check Live API (Health Probe) ↗](https://horizon-mcp-server-phf8.onrender.com/health)** • **[Interactive Web Console ↗](https://horizon-mcp-server-phf8.onrender.com/)** • **[Direct JSON-RPC ↗](https://horizon-mcp-server-phf8.onrender.com/mcp)**

- **Parameters:**
  - `job_id_or_incident_id` (*string*, required): Recovery Job ID (e.g. `"REC-9940"`) or Incident ID (e.g. `"INC-8820"`).

- **Example Call:**
```json
{
  "name": "horizon_get_incident_timeline",
  "arguments": {
    "job_id_or_incident_id": "REC-9940"
  }
}
```

- **Example Response:**
```json
{
  "jobId": "REC-9940",
  "status": "completed",
  "liveRtoStopwatchSeconds": 24.8,
  "targetRtoSeconds": 60.0,
  "milestones": [
    {"tier": 0, "status": "completed", "durationSeconds": 12.3},
    {"tier": 1, "status": "completed", "durationSeconds": 12.5}
  ],
  "rollingMttrMetrics": {
    "rollingMttrSeconds": 31.4,
    "targetRtoSeconds": 60.0,
    "incidentCount": 4,
    "recoveryHistorySeconds": [42.0, 36.5, 22.1, 24.8]
  }
}
```

---

### 12. `horizon_broadcast_incident`
Dispatches synchronized incident alerts and blast-radius summaries to War Room channels and external HTTP webhooks (Slack/Discord/PagerDuty).

> 🔗 **[Check Live API (Health Probe) ↗](https://horizon-mcp-server-phf8.onrender.com/health)** • **[Interactive Web Console ↗](https://horizon-mcp-server-phf8.onrender.com/)** • **[Direct JSON-RPC ↗](https://horizon-mcp-server-phf8.onrender.com/mcp)**

- **Parameters:**
  - `incident_id` (*string*, required): Active incident identifier (e.g. `"INC-8820"`).
  - `channels` (*array of strings*, optional): Target alert channels (default: `["#war-room-critical", "#sre-alerts", "#incident-response"]`).
  - `webhook_url` (*string*, optional): Outbound HTTP POST webhook destination.

- **Example Call:**
```json
{
  "name": "horizon_broadcast_incident",
  "arguments": {
    "incident_id": "INC-8820",
    "channels": ["#war-room-critical", "#sre-alerts"],
    "webhook_url": "https://hooks.slack.com/services/T00/B00/mock123"
  }
}
```

- **Example Response:**
```json
{
  "success": true,
  "incidentId": "INC-8820",
  "targetNode": "db-primary",
  "alertTitle": "🚨 [HORIZON WAR ROOM] Incident INC-8820: Failure on db-primary",
  "channelsDispatched": [
    {"channel": "#war-room-critical", "status": "delivered"},
    {"channel": "#sre-alerts", "status": "delivered"}
  ],
  "webhookDispatched": true,
  "webhookStatus": 200
}
```

---

## ⚡ Inbound Alert Webhook Pipeline

Horizon ingests firing alerts from monitoring systems to automatically trigger failure simulation and Kahn DAG recovery sequencing.

> 🔗 **[Check Live Webhook Receiver ↗](https://horizon-mcp-server-phf8.onrender.com/api/v1/incidents/webhook)** • **[Health Status Probe ↗](https://horizon-mcp-server-phf8.onrender.com/health)**

### `POST /api/v1/incidents/webhook` (Alias: `POST /incidents/webhook`)

#### Prometheus Alertmanager Integration
Configure your `alertmanager.yml`:
```yaml
receivers:
  - name: 'horizon-recovery-engine'
    webhook_configs:
      - url: 'https://horizon-mcp-server-phf8.onrender.com/api/v1/incidents/webhook'
        send_resolved: false
```

Alert payload example:
```json
{
  "status": "firing",
  "alerts": [
    {
      "status": "firing",
      "labels": {
        "alertname": "PostgresDown",
        "service": "db-primary",
        "severity": "critical"
      },
      "annotations": {
        "summary": "Postgres Primary connection pool exhausted"
      }
    }
  ]
}
```

#### Datadog Monitor Webhook Integration
Configure your Datadog Webhook Integration:
- **URL**: `https://horizon-mcp-server-phf8.onrender.com/api/v1/incidents/webhook`

Alert payload example:
```json
{
  "event_type": "metric_alert",
  "title": "Redis latency spiked above 500ms",
  "body": "Redis Cache node is failing liveness probes",
  "tags": ["service:redis-cache", "env:production"],
  "priority": "P1"
}
```

