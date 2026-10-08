# Horizon: Improvement Plan

**Goal:** Run all of Horizon on **React + Vite + Bun, hosted on Vercel**, using SDKs only (Firebase, ethers, Sarvam AI, MCP), with the blockchain verification and the Sarvam AI integration properly organized.
**Status:** Proposed
**Date:** 2026-10-08
**Position in roadmap:** "Sprint 6.5" (hardening and migration), between Sprint 6 (done) and Sprint 7 (LLM)

---

## 1. Summary

### 1.1 What changes

| Today | After this plan |
|---|---|
| Python FastAPI engine in `apps/api` (always-on design) | Stateless TypeScript API on Vercel Functions (`/api/v1/*`) |
| Frontend uses simulated/demo data | Frontend reads live state from Firebase RTDB, written by the API |
| Monitor loop as a daemon | `tick` endpoint advanced by the dashboard and (optionally) Vercel Cron |
| Playbooks run as long async tasks | Playbooks are a persisted state machine, one step per invocation |
| Env vars scattered and unvalidated | One `.env.example`, Zod-validated, client/server split |
| Blockchain: contracts exist, verification not organized | Clear split: wallet login and NFT gating, plus hash-chained audit anchored on-chain |
| Sarvam AI keys in env, no clear integration point | One server-only module with masking, schema validation, fallback and approval gate |

### 1.2 What this plan does not do

- It does not control real Docker or Kubernetes. Vercel can't reach those. The environment stays **simulated** in Firebase, which the project brief explicitly allows ("a simulated environment").
- It does not require a second hosting provider. If you later want real container control, an engine can be added on a VM without changing the API contract.

### 1.3 Why this works on Vercel

Vercel runs code on demand, so it can't host a loop that never stops. Horizon avoids needing one:

1. **State lives in Firebase RTDB**, not in process memory.
2. **Time-based work** (probing, advancing an incident) runs inside a `tick` call. Any caller can trigger it, and a lock prevents double processing.
3. **Waiting for a human** costs nothing. An approval step just sets a status and stops. The approval request resumes it.

> **Verify before relying on it:** function max duration, cron frequency and WebSocket beta limits all depend on your Vercel plan. This plan avoids WebSockets and long-running functions on purpose.

---

## 2. Decisions needed from you

| # | Decision | Default in this plan |
|---|---|---|
| D1 | Language for the new API | **TypeScript** (strict off for the server is fine; Bun runs it without a build step) |
| D2 | Keep the Python code? | Keep `apps/api` as the **reference spec** until TS tests pass, then archive it |
| D3 | Server framework | **Hono** (small, works on Vercel) |
| D4 | Background ticks | Dashboard-driven, with Vercel Cron as an optional backup |
| D5 | Chain | Testnet only (Sepolia or Polygon testnet) |
| D6 | Sarvam model | Read from env (`SARVAM_MODEL`), default `sarvam-105b` |

If you answer differently, only Phase 2 onward changes shape. Phases 0 and 1 are valid either way.

---

## 3. Target architecture

```
                         Vercel project
 ┌────────────────────────────────────────────────────────┐
 │  apps/web  (React + Vite + Bun, static)                │
 │      │ listens (RTDB)         │ calls (REST)           │
 │      ▼                        ▼                        │
 │  api/  (Hono, one function, /api/v1/*)                 │
 │   ├─ tick        probe nodes, advance incidents        │
 │   ├─ nodes/graph read + config                         │
 │   ├─ incidents   list, timeline, MTTR                  │
 │   ├─ approve     verify wallet signature, resume       │
 │   ├─ chaos       demo failure injection                │
 │   ├─ ai          Sarvam suggestions (propose only)     │
 │   ├─ auth        wallet login, NFT check               │
 │   └─ mcp         developer MCP server                  │
 └───────────────┬───────────────┬───────────────┬────────┘
                 ▼               ▼               ▼
          Firebase RTDB     Sarvam AI API    EVM testnet
          + Firebase Auth   (server only)    (NFT + AuditVault)
```

**Rules that keep it simple:**

- The frontend only **reads** RTDB. Only the API writes (via the Admin SDK). RTDB rules enforce this.
- All business logic is **pure functions** in `api/_lib/`, with no I/O inside the graph, planner or audit-hash code, so it is trivially testable.
- Every route is under `/api/v1/` and authenticated (CONSTRAINTS §5, §6).

---

## 4. Proposed repository layout

```
horizon/
├─ apps/web/                  existing frontend (keep)
├─ api/                       Vercel Functions (new)
│   ├─ v1/[[...route]].ts     single Hono entry (hono/vercel adapter)
│   └─ _lib/
│       ├─ env.ts             Zod-validated server env (fails fast)
│       ├─ firebase.ts        Admin SDK singleton
│       ├─ auth.ts            Firebase token + wallet + NFT middleware
│       ├─ chain.ts           ethers provider, NFT check, anchor writer
│       ├─ sarvam.ts          Sarvam client, masking, schema validation
│       ├─ graph.ts           DAG, cycle check, blast radius, topo levels
│       ├─ planner.ts         recovery plan from graph + failures
│       ├─ playbooks.ts       playbook library + risk levels
│       ├─ machine.ts         incident state machine (pure transitions)
│       ├─ tick.ts            probe + advance orchestration
│       ├─ audit.ts           hash chain + anchoring queue
│       ├─ notify.ts          Slack/Teams webhooks
│       └─ mcp.ts             MCP tool definitions
├─ packages/shared/           Zod schemas + types (used by web and api)
├─ contracts/                 Solidity (existing)
├─ apps/api/                  Python reference (archive after parity)
├─ Docs/                      PRD, ARCHITECTURE, ADRs, this plan
├─ .env.example
├─ vercel.json
└─ package.json               Bun workspaces
```

> **Vercel monorepo note:** set the project root to the repo root, with the build command running `bun run --cwd apps/web build` and the output directory set to `apps/web/dist`. Confirm the exact settings in the Vercel dashboard when you import the repo.

---

## 5. Phase plan

Effort estimates assume one developer working with AI-agent help. Treat them as rough.

### Phase 0: Hygiene and secrets (0.5 day)

**Why first:** the env is currently "not organized", and every later phase depends on it.

**Tasks**

- **P0-1** Create `.env.example` (full list in section 6) and commit it. Commit **no** real values.
- **P0-2** Confirm `.env*` is in `.gitignore` (except `.env.example`).
- **P0-3** Check git history for any committed secret (Sarvam key, signer key, service account). If found, **rotate it**, since deleting the commit is not enough.
- **P0-4** Create `api/_lib/env.ts` with a Zod schema for server vars. It throws a readable error naming the missing variable.
- **P0-5** Create `apps/web/src/env.ts` validating `VITE_*` vars the same way.
- **P0-6** Add all variables to the Vercel project (Production and Preview), server-only ones **without** the `VITE_` prefix.
- **P0-7** Create a **dedicated testnet wallet** for `AUDIT_SIGNER_PRIVATE_KEY`, holding only test funds. Never reuse a personal wallet.

**Acceptance:** starting the API with a missing variable fails immediately with a clear message. No secret appears in the browser bundle (search the built `dist/` for key prefixes).

---

### Phase 1: Shared schemas and docs alignment (0.5 to 1 day)

**Tasks**

- **P1-1** Create `packages/shared` with Zod schemas translated from the Pydantic models: Node, Edge, Telemetry, Playbook, PlaybookStep, Incident, RecoveryPlan, AuditEntry, Approval. Export inferred types.
- **P1-2** Write the ADRs (see section 9) and update `CONSTRAINTS.md` §1 and §3, `ARCHITECTURE.md` §3, §11, §12, and the PRD tech stack so `AGENTS.md` stops steering agents toward Python.
- **P1-3** Resolve the directory naming conflict (`apps/api` vs `backend/` across docs). Use `api/` (Vercel) and `apps/web`, and update scope rules in `AGENTS.md` §3 to match.
- **P1-4** Define RTDB schema additions (section 7) and write RTDB security rules.

**Acceptance:** web and api both import types from `packages/shared`. Docs no longer contradict each other.

---

### Phase 2: Port the core logic (2 to 3 days)

**Method:** port the **Python unit tests first**, then make them pass in TypeScript. The existing passing suite is your specification.

**Tasks**

- **P2-1** `graph.ts`: build DAG from "X depends on Y" edges; cycle detection (return the cycle path); blast radius via reverse traversal; root-cause detection (failed nodes whose dependencies are all healthy).
- **P2-2** `planner.ts`: topological sort on the **affected subgraph only**, returned as **levels** (nodes in a level are independent). Map each node to a playbook.
- **P2-3** `playbooks.ts`: port `database_failover`, `service_restart`, `cache_purge`, `traffic_reroute`. Each step has `risk: "low" | "high"` and a declarative `action`, with no shell strings.
- **P2-4** `machine.ts`: pure transition function for the incident lifecycle:
  `detected → analyzing → awaiting_approval → recovering → verifying → resolved` (plus `escalated` for cycles and `failed`).
- **P2-5** Cycle handling: if a cycle exists, set the incident to `escalated`, stop all automation, store the cycle path for the UI.

**Acceptance:** all ported tests pass with `bun test`. A test covers the example chain DB → cache → auth → gateway → frontend, and one covers a cycle.

---

### Phase 3: Tick engine and incident state in RTDB (2 days)

This phase replaces the always-on loop.

**Tasks**

- **P3-1** Simulated nodes in RTDB (`/infrastructure`), each with `status`, `depends_on`, `last_ping`, `consecutive_failures`, and a `sim` block (for example `{ healthy: true }`) that the chaos endpoint flips.
- **P3-2** `tick.ts` flow:
  1. Acquire lock (see below). If held, return `{ skipped: true }`.
  2. Probe each node (read its `sim` state, apply probe rules).
  3. Update `consecutive_failures`. **3 consecutive failures = failed** (avoids false positives, per PRD).
  4. For newly failed nodes, create or update an incident: compute blast radius, root cause, plan.
  5. Advance each active incident by **at most one step** using `machine.ts`.
  6. Write audit entries for every transition.
  7. Release lock.
- **P3-3** **Lock:** use an RTDB transaction on `/locks/tick` storing `{ holder, expiresAt }`. Expire after about 10 seconds so a crashed invocation can't block forever.
- **P3-4** **Idempotent steps:** step status moves `pending → running → done|failed` using RTDB transactions, so two overlapping ticks can never run the same step twice.
- **P3-5** "Verify before moving on": after a recovery step, the node must report **healthy** on a following tick before dependents start. This is what prevents crash loops.
- **P3-6** Endpoint `POST /api/v1/tick` (authenticated, or secret-protected for Cron via `TICK_SECRET`).
- **P3-7** Frontend hook `useTickDriver`: while the dashboard is open and the user is an Operator or Commander, call `/tick` every 3 to 5 seconds. The lock makes multiple open tabs harmless.
- **P3-8** Optional: `vercel.json` cron entry calling `/tick` as a backup (check plan frequency limits).
- **P3-9** Chaos endpoint `POST /api/v1/chaos` (Operator and above, `DEMO_MODE` only): fail or heal a node, or run a scripted cascade (kill the DB and let dependents fail).
- **P3-10** Recovery timing: store `detectedAt`, `approvedAt`, `resolvedAt`. MTTR = `resolvedAt − detectedAt`.

**Acceptance:** killing the simulated DB produces the cascade, correct blast radius, the ordered recovery plan, a paused approval for the high-risk step, then resolution, all driven only by ticks. Two parallel ticks never duplicate a step (test it).

---

### Phase 4: Auth, wallet login and NFT gating (1.5 to 2 days)

This phase organizes the blockchain **access** side.

**Flow**

```
1. Client:  GET  /api/v1/auth/nonce?address=0x..      → server stores nonce (short TTL)
2. Client:  signer.signMessage(message with nonce)     → signature
3. Client:  POST /api/v1/auth/wallet {address, signature}
4. Server:  ethers.verifyMessage → recovered address must match
5. Server:  check NFT ownership/tier on-chain (cached briefly)
6. Server:  firebase-admin createCustomToken(uid, {wallet, role, tier})
7. Client:  signInWithCustomToken → normal Firebase session
```

**Tasks**

- **P4-1** Nonce endpoint with expiry, single-use (deleted after verification).
- **P4-2** Login message includes domain, address, nonce and expiry, so a signature can't be replayed elsewhere.
- **P4-3** `chain.ts`: `getTier(address)` reading the subscription NFT contract through a `JsonRpcProvider`. Cache the result for about 60 seconds.
- **P4-4** Auth middleware, applied to every `/api/v1/*` route except nonce/login:
  1. Verify the Firebase ID token.
  2. Load role (Viewer, Operator, Commander) from `/users/{uid}`.
  3. For gated routes, require the tier claim (Standard vs Enterprise).
  4. Return a generic error body (no internals leaked).
- **P4-5** Link wallet to user: store `wallet_address` in `/users/{uid}` on first verified login. Use **one wallet per Commander account**.
- **P4-6** Tier gating table (in code, not scattered): Standard = automated recovery; Enterprise = Sarvam AI features and audit export.
- **P4-7** **Break-glass:** if the RPC is down, allow a documented, heavily audited fallback for super-admins only (from the PRD risk table). Log every use.
- **P4-8** Rate limit login and nonce endpoints.

**Acceptance:** a wallet without the NFT is rejected; one with the NFT gets a Firebase session whose claims match its tier; replaying an old signature fails.

---

### Phase 5: Approval gate and audit hash chain (2 days)

This phase organizes the blockchain **verification** side.

#### 5A Approval gate

**Flow**

1. The tick reaches a **high-risk** step and sets the incident to `awaiting_approval`, writing `/approvals/{incidentId}_{stepId}` with the request details.
2. The dashboard shows the approval card.
3. The Commander signs a message containing: incident ID, step ID, a **hash of the step definition**, a nonce, and an expiry.
4. `POST /api/v1/approve` verifies:
   - the recovered address equals the Commander's linked wallet,
   - the role is Commander,
   - the nonce is unused and unexpired,
   - the step hash matches the current step (so a step can't be swapped after signing).
5. The step is marked approved, the signature hash goes into the audit chain, and the next tick resumes.

**Tasks:** P5-1 approval request writer, P5-2 message builder shared by web and api (put it in `packages/shared` so both sides sign and verify the identical string), P5-3 verification endpoint, P5-4 reject action, P5-5 timeout policy (an unanswered approval escalates, never auto-approves).

#### 5B Audit hash chain

**Design**

Each entry: `{ id, ts, actor, type, data, prevHash, hash }` where `hash = sha256(prevHash + canonicalJSON(entry fields))`. The latest hash is stored at `/audit/head`.

**Tasks**

- **P5-6** `audit.ts`: canonical JSON serialization (sorted keys, so hashes are stable), `append()` using an RTDB **transaction on `/audit/head`** so concurrent writers keep the chain linear.
- **P5-7** Verifier function `verifyChain()` walking all entries and reporting the first broken link. Expose it as `GET /api/v1/audit/verify` and a "Verified" badge in the Audit UI.
- **P5-8** **Anchoring:** critical entries (approvals, failovers, resolution) are queued in `/audit/anchor_queue`. A flush step (called from tick, so it needs no extra infrastructure) batches the pending hashes into one on-chain call to `HorizonAuditVault`. Record the transaction hash back on the entries.
- **P5-9** Anchoring must **never block recovery**. If the chain is slow or down, the queue grows and flushes later.
- **P5-10** Confirm the `HorizonAuditVault` function names and ABI against the contract before wiring; keep the ABI in `packages/shared`.
- **P5-11** Audit export (Enterprise tier): JSON download including entry hashes and anchor transaction hashes, so an outside party can verify independently.

**Acceptance:** editing any stored audit entry by hand makes `verifyChain` fail. An approval can't be replayed or applied to a different step. Anchored hashes are visible on the block explorer.

---

### Phase 6: Sarvam AI integration (1.5 days)

**Principle:** the model can only **suggest**. It never has direct write access to anything.

**SDK:** the official JavaScript package `sarvamai` (the docs show `import { SarvamAIClient } from "sarvamai"` and chat completion through `client.chat.completions`). Pin the version. Read current model names and request/response field names from the Sarvam docs, since the JS SDK uses wire-format field names rather than camelCase.

**Tasks**

- **P6-1** `api/_lib/sarvam.ts` as the **only** file that imports the SDK. It exports a small set of functions:
  - `suggestRecovery(incidentContext)`
  - `generatePostMortem(incident, auditEntries)`
  - `chat(question, context)` (Horizon Assistant)
- **P6-2** **Masking before sending** (S7-006): strip or tokenize emails, IPs, hostnames, wallet addresses, tokens and anything matching key patterns. Keep a reversible map server-side if the output needs the real names back.
- **P6-3** **Structured output:** instruct the model to answer in JSON, extract the JSON from the response (the models have hybrid reasoning, so don't assume the reply is pure JSON), and validate with Zod. Reject anything that fails.
- **P6-4** **Action allowlist:** suggested steps may only use actions that exist in `playbooks.ts` (for example `restart_service`, `flush_cache`). Unknown actions are dropped. Never execute strings from the model.
- **P6-5** **Approval always:** AI-suggested steps are treated as `high` risk and go through the Phase 5 approval gate, then are labeled "AI-suggested" in the UI and audit log.
- **P6-6** **Resilience:** request timeout, one retry on rate-limit errors (the SDK exposes a typed too-many-requests error), and a **fallback** to the static playbooks plus a "AI unavailable" banner.
- **P6-7** **Tier gating:** AI endpoints require the Enterprise tier.
- **P6-8** Log every AI call (masked prompt hash, latency, validated or rejected) in the audit chain.
- **P6-9** Post-mortem generator: runs when an incident resolves, saved to `/incidents/{id}/postmortem`.
- **P6-10** Optional extra: use Sarvam's translation to produce incident summaries in Indian languages for notifications.
- **P6-11** Evaluate accuracy and latency (S7-007) with a small fixed set of incident scenarios and record results in `Docs/`.

**Acceptance:** a prompt-injection attempt placed in a log line can't cause an action outside the allowlist. With the API disabled, recovery still works from static playbooks. No raw secret or hostname appears in any prompt (test with a masking unit test).

---

### Phase 7: Developer MCP server (1 day)

**Tasks**

- **P7-1** `api/_lib/mcp.ts` using `@modelcontextprotocol/sdk` with the Streamable HTTP transport, **stateless mode** (it suits serverless). Mount at `/api/v1/mcp`.
- **P7-2** Tools (reuse the same `_lib` functions as the REST API):

  | Tool | Access |
  |---|---|
  | `list_nodes`, `get_dependency_graph` | read |
  | `get_blast_radius(node_id)` | read |
  | `simulate_recovery_plan(node_id)` | read (dry run) |
  | `list_incidents`, `get_incident_timeline(id)`, `get_mttr(range)` | read |
  | `search_audit_log(query)` | read |
  | `propose_playbook(...)` | writes a **proposal** into the approval queue only |

- **P7-3** **No approve or execute tool exists**, by design (ADR-009).
- **P7-4** Auth: per-developer API keys, stored **hashed** (never plaintext) in `/apikeys`, tied to a user and role, revocable. Reject unauthenticated calls.
- **P7-5** Tier gating: read tools for Standard, simulation and proposals for Enterprise.
- **P7-6** Audit every MCP call; rate-limit per key.
- **P7-7** Document how a developer connects (URL plus key) in the README.

**Acceptance:** from an MCP client, a developer can ask for the blast radius of a node and get the same answer as the dashboard. There is no path from MCP to executing a high-risk step.

---

### Phase 8: Frontend wiring (2 days)

**Tasks**

- **P8-1** Replace demo/simulated data with hooks: `useInfrastructure`, `useIncidents`, `useAudit`, all subscribing to RTDB.
- **P8-2** `useTickDriver` (Phase 3), `useWalletAuth` (Phase 4), `useApproval` (Phase 5).
- **P8-3** Connect the approval card to the real signature flow; show the step hash being signed in readable form.
- **P8-4** Topology view: highlight blast radius and root cause from real incident data; show a **cycle visualization** when escalated.
- **P8-5** Timeline view: real timestamps, MTTR display, AI-suggested step badges.
- **P8-6** Audit table: "chain verified" badge, anchor transaction links.
- **P8-7** Subscription page: real NFT check instead of simulated minting (mint on testnet).
- **P8-8** Demo controls panel (chaos buttons), visible only when `DEMO_MODE` is on.
- **P8-9** Keep `className` props, strict TS and WCAG 2.1 AA per CONSTRAINTS; loading and error states for every data hook.
- **P8-10** Check dashboard load under 2 seconds on the Vercel production build (Lighthouse).

---

### Phase 9: Testing, security and demo (2 days)

**Tasks**

- **P9-1** Unit tests (`bun test`): graph, planner, machine, audit hash chain, masking, approval message builder, env validation. Target above 80% on engine modules (Sprint 2 DoD).
- **P9-2** Concurrency tests: two simultaneous ticks; two simultaneous audit appends.
- **P9-3** Security checklist: every route authenticated; versioned paths only; generic error bodies; no secrets in the bundle; RTDB rules deny client writes; CORS limited to your domain; rate limits on login, nonce, AI and MCP.
- **P9-4** Seed script for demo data (S8-006).
- **P9-5** Live demo script, rehearsed:
  1. Show healthy topology.
  2. Press chaos: the DB fails.
  3. Show the cascade and blast radius.
  4. Show the dependency-ordered plan (DB → cache → auth → gateway → frontend).
  5. Low-risk steps run on their own; the high-risk step pauses.
  6. Commander signs with the wallet.
  7. Recovery completes; MTTR is displayed.
  8. Show the audit log, "chain verified", and the on-chain anchor.
  9. Optional: ask the Sarvam assistant to explain the failure and show the generated post-mortem.
  10. Optional: query the same data through the MCP server.
- **P9-6** Final report and updated architecture diagram, README with deploy instructions (S8-005).

---

## 6. Environment variables (organized)

Split by **who can see them**. Only `VITE_*` values are exposed to the browser.

### Client (safe to expose)

| Variable | Purpose |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase web config |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase web config |
| `VITE_FIREBASE_DATABASE_URL` | RTDB URL |
| `VITE_FIREBASE_PROJECT_ID` | Firebase web config |
| `VITE_FIREBASE_APP_ID` | Firebase web config |
| `VITE_CHAIN_ID` | Network the wallet must be on |
| `VITE_NFT_CONTRACT` | Subscription NFT address |
| `VITE_AUDIT_VAULT_CONTRACT` | Audit vault address (display and links) |
| `VITE_API_BASE` | Defaults to `/api/v1` |
| `VITE_DEMO_MODE` | Shows chaos panel |

### Server only (never prefix with `VITE_`)

| Variable | Purpose |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Admin SDK credentials (base64-encoded JSON) |
| `FIREBASE_DATABASE_URL` | RTDB URL for Admin SDK |
| `SARVAM_API_KEY` | Sarvam AI key |
| `SARVAM_MODEL` | Model name, for example `sarvam-105b` |
| `CHAIN_RPC_URL` | RPC endpoint (use a provider key you can rotate) |
| `CHAIN_ID` | Must match the client value |
| `NFT_CONTRACT` | Subscription NFT address |
| `AUDIT_VAULT_CONTRACT` | Audit vault address |
| `AUDIT_SIGNER_PRIVATE_KEY` | Testnet-only wallet that anchors hashes |
| `TICK_SECRET` | Protects the tick endpoint from outside callers |
| `MCP_KEY_PEPPER` | Secret used when hashing MCP API keys |
| `DEMO_MODE` | Enables chaos endpoint |
| `SLACK_WEBHOOK_URL` | Optional notifications |

**Rules**

1. Commit `.env.example` only. Real values live in Vercel's environment settings and a local, git-ignored `.env.local`.
2. Server code reads env **only** through `api/_lib/env.ts`.
3. Rotate any value that has ever been committed or pasted anywhere public.
4. The signer key is for a **dedicated testnet wallet**. Production-grade key custody is out of scope and should be noted as such in the report.

---

## 7. Firebase RTDB schema additions

```
/infrastructure/{nodeId}     status, depends_on, last_ping, consecutive_failures, sim
/active_incidents/{id}       status, trigger_node, root_cause, blast_radius, plan, currentLevel, timestamps
/incidents_archive/{id}      resolved incidents + postmortem
/approvals/{incident_step}   request details, stepHash, status, signatureHash
/audit/entries/{id}          id, ts, actor, type, data, prevHash, hash, anchorTx?
/audit/head                  latest hash + sequence number
/audit/anchor_queue/{id}     pending critical hashes
/locks/tick                  holder, expiresAt
/nonces/{address}            value, expiresAt (login and approval)
/users/{uid}                 email, role, wallet_address
/apikeys/{hash}              uid, role, createdAt, revoked
```

**Security rules (principles):**

- Clients may read `/infrastructure`, `/active_incidents`, `/audit/entries` based on role. They may read nothing under `/nonces`, `/apikeys` or `/locks`.
- **No client writes** anywhere except fields you deliberately allow (none planned). All writes go through the Admin SDK in `api/`.
- Index `/audit/entries` by `ts` if you paginate.

---

## 8. Vercel configuration checklist

- Import the repo; set root and build settings as in section 4.
- Bun as the package manager (`bun install`); functions run on Vercel's default runtime unless you verify the Bun runtime option for your needs.
- `vercel.json`: SPA rewrite so React Router routes resolve to `index.html` (excluding `/api/*`); optional cron entry for `/api/v1/tick`.
- Environment variables set for Production and Preview.
- Preview deployments use a **separate Firebase project or database path** so demo chaos never touches production data.
- Add your Vercel domain to Firebase Auth authorized domains.
- Confirm plan limits: function duration, cron frequency, WebSocket beta (not used here).

---

## 9. Documentation updates (ADRs)

| ADR | Title | Supersedes |
|---|---|---|
| ADR-011 | TypeScript API on Vercel Functions, replacing the Python backend | ADR-004 |
| ADR-012 | Stateless tick engine with persisted incident state (no always-on loop) | n/a |
| ADR-013 | Wallet login via signed nonce, mapped to Firebase custom tokens | n/a |
| ADR-014 | Hash-chained audit log with batched on-chain anchoring | refines ADR-010 |
| ADR-015 | Sarvam AI is suggest-only, behind masking, schema validation and approval | refines ADR-009 |
| ADR-016 | Developer MCP server: read-only plus propose-only | n/a |

**Also update:** `CONSTRAINTS.md` (§1 backend, §3 "modular monolith, event-driven internally", §7 dependency note), `ARCHITECTURE.md`, `PRD.md` tech stack, `STATE.md`, and `AGENTS.md` scope paths.

> One honest note for the report: ADR-010 says credentials live in "blockchain-based or decentralized vault mechanisms." Secrets stored on a public chain would be exposed, so this plan puts **hashes and approvals** on-chain and keeps actual secrets in Vercel's encrypted environment settings. Reword ADR-010 to match, so the docs describe what is really built.

---

## 10. Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Overlapping ticks double-run a step | High | RTDB lock plus transactional step status (P3-3, P3-4), with a concurrency test |
| No tick fires (dashboard closed, no cron) | Medium | Cron backup; document that the simulation advances while observed; honest note in report |
| Function duration or cron limits on your plan | Medium | One short step per tick; verify limits before the demo |
| RPC or chain down at login or approval | High | Cached tier check, break-glass path, anchoring queue never blocks recovery |
| Signed approval replayed or applied to a different step | High | Nonce, expiry and step-hash binding (Phase 5A) |
| Prompt injection through logs reaching the model | High | Masking, allowlist, schema validation, mandatory approval (Phase 6) |
| Sarvam API down or rate-limited | Medium | Timeout, retry, static-playbook fallback |
| Secret leaked into bundle or repo | Critical | Env split, validation, bundle check, rotation (Phase 0) |
| Port diverges from Python behavior | Medium | Port the test suite first; keep Python as reference until parity |
| Scope too large for the time left | Medium | Priority order below |

---

## 11. Priority order if time is short

Do these in order and stop when time runs out; each step leaves a working demo.

1. **Phase 0 and 1** (secrets, schemas, docs)
2. **Phase 2 and 3** (core logic plus tick engine) → a working recovery demo
3. **Phase 4 and 5** (wallet auth, approvals, audit chain) → the differentiating security story
4. **Phase 8** (frontend wiring) → needed for the demo to look real
5. **Phase 6** (Sarvam AI)
6. **Phase 7** (MCP)
7. **Phase 9** (hardening and rehearsal); do a minimal version early, not only at the end

---

## 12. Definition of done

- [ ] Whole platform deploys from one Vercel project with no other hosting
- [ ] `.env.example` complete; server fails fast on missing config; no secrets in repo or bundle
- [ ] Killing a simulated DB produces cascade, blast radius, ordered plan, paused approval, resolution
- [ ] Wallet signature required and verified for high-risk steps; replay and swap attempts fail
- [ ] Audit chain verifies; tampering is detected; critical hashes anchored on testnet
- [ ] NFT tier gating works for web, AI and MCP
- [ ] Sarvam suggestions masked, validated, allowlisted and approval-gated, with working fallback
- [ ] MCP server answers read queries; no approve/execute path
- [ ] Unit tests above 80% on engine modules; concurrency tests pass
- [ ] Dashboard loads in under 2 seconds on production
- [ ] ADRs 011 to 016 written; PRD, ARCHITECTURE, CONSTRAINTS, STATE updated
- [ ] Demo script rehearsed end to end; final report written
