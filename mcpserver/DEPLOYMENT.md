# Horizon MCP Server — Render Free Tier Deployment Guide

This guide provides step-by-step instructions for deploying the **Horizon Model Context Protocol (MCP) Server** onto **Render Free Tier**.

The MCP server is engineered specifically to run efficiently within Render Free Tier resource constraints (512 MB RAM, 0.1 CPU core), features fast sub-second cold starts, binds dynamically to `$PORT`, and exposes `/health` for zero-downtime health checking.

---

## 📋 Prerequisites

1. A [Render account](https://render.com) (free, no credit card required).
2. GitHub or GitLab repository containing this `mcpserver` directory.
3. Your **Sarvam AI API Key** (defaults to the key in the root repository `.env`).
4. (Optional) Custom RPC URL for MST Blockchain Testnet.

---

## 🚀 Option 1: 1-Click Infrastructure-as-Code (Render Blueprint) — Recommended

The repository includes a production-tested [`render.yaml`](./render.yaml) Blueprint in `mcpserver/render.yaml`.

### Steps:
1. Log in to your [Render Dashboard](https://dashboard.render.com/).
2. Click **Blueprints** in the top navigation bar.
3. Click **New Blueprint Instance**.
4. Connect your repository.
5. In the **Blueprint Path** field, specify:
   ```text
   mcpserver/render.yaml
   ```
6. Render will parse the configuration and prompt you for the environment variables:
   - `SARVAM_API_KEY`: Enter your Sarvam AI API key (`sk_mhp6zj2k...`).
7. Click **Apply**.
8. Render will automatically build the service, install dependencies, bind to the dynamic `$PORT`, and launch the web service with an active health probe on `/health`.

---

## 🛠️ Option 2: Manual Web Service Setup on Render Dashboard

If you prefer to configure the service manually via the Render UI:

### Step 1: Create New Web Service
1. In the Render Dashboard, click **New +** > **Web Service**.
2. Select **Build and deploy from a Git repository**.
3. Choose your repository and click **Connect**.

### Step 2: Configure Build & Runtime Settings
Configure the form with the following exact values:

| Configuration Field | Value | Notes |
| :--- | :--- | :--- |
| **Name** | `horizon-mcp-server` | Any unique name you choose |
| **Region** | `Oregon (US West)` or `Frankfurt (EU Central)` | Choose region closest to your users |
| **Branch** | `main` | Production branch |
| **Root Directory** | `mcpserver` | **Recommended:** Pointing this to `mcpserver` isolates the Python app from root `package.json` |
| **Runtime** | `Python 3` | Uses Python 3.11 specified in `runtime.txt` |
| **Build Command** | `pip install -r requirements.txt` | Installs pinned production dependencies |
| **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 1` | Single worker optimized for 512MB RAM |
| **Instance Type** | `Free` (0.1 CPU, 512 MB RAM) | $0/month free tier |

> [!TIP]
> **Resolving "Could not open requirements file: No such file or directory: requirements.txt"**
> If you already created a service and left **Root Directory** blank:
> - **Method 1**: In Render Dashboard, go to your service > **Settings** > scroll to **Root Directory** > set to `mcpserver` > click **Save Changes** and **Manual Deploy**.
> - **Method 2**: If leaving **Root Directory** blank (repository root), set **Build Command** to `pip install -r requirements.txt` and **Start Command** to `uvicorn main:app --host 0.0.0.0 --port $PORT --workers 1` (or `cd mcpserver && uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 1`). Both are supported via root fallbacks.

### Step 3: Configure Health Check Path
Scroll down to **Advanced Settings**:
- **Health Check Path**: `/health`
- **Auto-Deploy**: `Yes` (deploys on every `git push` to `main`)

### Step 4: Add Environment Variables
Under the **Environment Variables** section, add:

```env
PYTHON_VERSION=3.11.9
ENVIRONMENT=production
SARVAM_API_KEY=sk_mhp6zj2k_CZWnzOpKIR4wrCdCDUwa6hJY
SARVAM_BASE_URL=https://api.sarvam.ai
SARVAM_MODEL=sarvam-105b
MST_TESTNET_RPC=https://testnetrpc.mstblockchain.com
MST_CHAIN_ID=91562037
MST_EXPLORER_URL=https://testnet.mstscan.com
HORIZON_AUDIT_CONTRACT=0x3EDad230dCFc6Dd3C357490b9feDa49639646BB7
```

### Step 5: Deploy
Click **Create Web Service**. Render will execute the build in ~45 seconds.

---

## 🐳 Option 3: Docker Container Deployment on Render

If you prefer immutable container builds, the repository includes a multi-stage production [`Dockerfile`](./Dockerfile):

1. In Render, select **New +** > **Web Service**.
2. Connect your repository.
3. Set **Root Directory** to `mcpserver`.
4. Set **Runtime** to **Docker**.
5. Select **Free** instance type.
6. Provide the environment variables listed in Step 4 above.
7. Click **Create Web Service**. Render will execute the multi-stage build (`python:3.11-slim`) and start the container as a non-root `appuser`.

---

## 🩺 Verification & Health Check

Once deployment finishes, Render provides a public URL:
`https://horizon-mcp-server-<random>.onrender.com`

### 1. Test Health Probe
```bash
curl https://horizon-mcp-server-<random>.onrender.com/health
```
**Expected Response (HTTP 200):**
```json
{
  "status": "healthy",
  "service": "horizon-mcp-server",
  "version": "1.0.0",
  "environment": "production",
  "active_sse_sessions": 0,
  "tools_registered": 8,
  "timestamp": "2026-10-09T11:05:00.000000+00:00"
}
```

### 2. View Interactive Web Dashboard
Open your browser to:
`https://horizon-mcp-server-<random>.onrender.com/`

You will see the live developer dashboard listing all 8 registered recovery tools, copy-paste configurations, and active transport endpoints.

### 3. Test Direct MCP JSON-RPC 2.0
```bash
curl -X POST https://horizon-mcp-server-<random>.onrender.com/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}'
```

---

## ⏱️ Render Free Tier Optimization & Keep-Alive

### Free Tier Inactivity Spin-Down
Render's free tier puts instances into hibernation after **15 minutes of inactivity**. When an incoming request arrives (e.g. from Cursor or Claude), Render spins the instance back up within **15–30 seconds**.

### Keeping the Instance Warm (Optional)
If you want instant response times without cold starts, you can set up a free automated cron ping:
1. Go to [cron-job.org](https://cron-job.org) or [UptimeRobot](https://uptimerobot.com) (both 100% free).
2. Create an HTTP monitor pinging:
   ```text
   GET https://horizon-mcp-server-<random>.onrender.com/health
   ```
3. Set the interval to **every 10 minutes**.
4. This keeps the free instance awake and warm 24/7.

---

## 🔒 Security Best Practices

1. **API Keys**: Never check your private `.env` file or raw private keys into source control. Always inject them via the Render Environment Variables tab.
2. **CORS**: By default `CORS_ORIGINS=*` is enabled to allow web-based IDE clients and local AI agents to connect. To restrict access to your domain, set `CORS_ORIGINS=https://your-domain.com`.
3. **Audit Trails**: All high-risk cluster failover steps trigger EIP-712 structured data signing requests tied to the MST Testnet contract (`0x3EDad230dCFc6Dd3C357490b9feDa49639646BB7`).
