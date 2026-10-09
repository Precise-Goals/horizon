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
