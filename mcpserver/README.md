# Horizon Autonomous MCP Server 🚀

A production-ready **Model Context Protocol (MCP)** server providing autonomous infrastructure recovery, Kahn's algorithm topological sequencing, Sarvam AI manifest synthesis, and MST Testnet cryptographic governance to AI agents, IDEs (Cursor, Claude Desktop), and automation pipelines.

Engineered specifically for **Render Free Tier** deployment (< 60MB memory footprint, < 1.5s cold starts, dynamic `$PORT` binding, `/health` endpoint).

---

## ✨ Features

- **8 Core MCP Tools**:
  - `horizon_get_topology`: Real-time infrastructure dependency graph and Kahn topological levels.
  - `horizon_simulate_failure`: Chaos fault injection and BFS cascaded blast radius calculation.
  - `horizon_trigger_recovery`: Autonomous multi-tier bottom-up recovery along Kahn order.
  - `horizon_sign_approval_gate`: EIP-712 cryptographic approval for high blast-radius failovers.
  - `horizon_verify_audit_proof`: SHA-256 Merkle root verification against MST Testnet block logs.
  - `horizon_synthesize_yaml`: Kubernetes CRD & Terraform manifest generation via Sarvam-105b.
  - `horizon_ask_sre`: Multilingual conversational SRE Copilot with strict domain guardrails.
  - `horizon_diagnose_cluster`: Full health audit, detecting circular deadlocks and SPOFs.
- **Multi-Transport Support**:
  - **SSE**: `GET /sse` + `POST /messages` (Cursor IDE, Claude Desktop SSE).
  - **Direct HTTP**: `POST /mcp` (stateless agents, webhooks, cURL).
  - **Standard I/O**: `python -m app.main --stdio` (local subprocess for Claude Desktop).
- **Interactive Web Dashboard**: Accessible at `GET /` with live tool explorer and copy-paste configs.
- **Render Free Tier Ready**: Blueprint `render.yaml`, `Procfile`, multi-stage `Dockerfile`, `runtime.txt`.

---

## 🚀 Quick Start (Local Development)

### 1. Set Up Python Virtual Environment
```bash
cd mcpserver
python -m venv .venv

# On Windows:
.\.venv\Scripts\Activate.ps1

# On Linux / macOS:
source .venv/bin/activate

pip install -r requirements.txt
```

### 2. Configure Environment
Create `.env` inside `mcpserver/` or rely on the root `.env`:
```env
SARVAM_API_KEY=sk_mhp6zj2k_CZWnzOpKIR4wrCdCDUwa6hJY
SARVAM_BASE_URL=https://api.sarvam.ai
SARVAM_MODEL=sarvam-105b
MST_TESTNET_RPC=https://testnetrpc.mstblockchain.com
MST_CHAIN_ID=91562037
PORT=10000
```

### 3. Run the MCP Server
```bash
uvicorn app.main:app --host 0.0.0.0 --port 10000 --reload
```
Open [http://localhost:10000](http://localhost:10000) to view the developer dashboard and test endpoints.

### 4. Run Automated Test Suite
```bash
pytest tests -v
```
All 16 unit and integration tests run in ~10 seconds.

---

## ☁️ Live Production Deployment (Render Free Tier)

The server is currently running live in production on Render:
👉 **`https://horizon-mcp-server-phf8.onrender.com`**

- **Health Probe**: `https://horizon-mcp-server-phf8.onrender.com/health`
- **SSE Transport**: `https://horizon-mcp-server-phf8.onrender.com/sse`
- **HTTP Transport**: `https://horizon-mcp-server-phf8.onrender.com/mcp`
- **Static Outbound IP Egress (Firewall Whitelist)**:
  - `74.220.52.0/24` (74.220.52.0 - 74.220.52.255)
  - `74.220.60.0/24` (74.220.60.0 - 74.220.60.255)

Complete deployment instructions are detailed in [**DEPLOYMENT.md**](./DEPLOYMENT.md).

---

## 🔌 Connecting to AI Agents & IDEs

For detailed setup instructions with Cursor, Claude Desktop, Windsurf, and cURL, see [**API_GUIDE.md**](./API_GUIDE.md).

### Cursor IDE (`.cursor/mcp.json`):
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

---

## 📁 Project Structure

```text
mcpserver/
├── .venv/                   # Python virtual environment
├── app/
│   ├── engine/
│   │   ├── blockchain.py    # MST Testnet EIP-712 & Merkle verification
│   │   ├── sarvam.py        # Sarvam-105b AI YAML synthesis & SRE Copilot
│   │   └── topology.py      # Kahn's algorithm DAG & BFS blast radius engine
│   ├── tools/
│   │   └── registry.py      # MCP tool definitions & execution dispatcher
│   ├── config.py            # Environment settings with fallback loader
│   ├── models.py            # Pydantic JSON-RPC 2.0 & domain models
│   └── main.py              # FastAPI server (SSE, HTTP JSON-RPC, Health, UI)
├── tests/
│   ├── conftest.py          # Pytest async HTTP fixtures
│   ├── test_endpoints.py    # Health, Dashboard & JSON-RPC handshake tests
│   ├── test_tools.py        # Tests for all 8 recovery tools
│   └── test_sse.py          # SSE connection validation
├── .env.example             # Environment variable template
├── .gitignore               # Ignores .venv, caches, and secrets
├── API_GUIDE.md             # Complete API & Tool reference documentation
├── DEPLOYMENT.md            # Step-by-step Render Free Tier deployment guide
├── Dockerfile               # Multi-stage lightweight production container
├── Procfile                 # Render process command definition
├── render.yaml              # Render Blueprint Infrastructure-as-Code
├── requirements.txt         # Pinned production Python dependencies
├── runtime.txt              # Render buildpack Python version (3.11.9)
└── README.md                # Server documentation & quickstart
```

---

## 📜 License
Apache-2.0. Built for Horizon Autonomous Enterprise Infrastructure Recovery.
