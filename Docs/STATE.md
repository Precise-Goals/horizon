# Horizon Platform — Project State

**1. Current Phase**: Sprint 0 - Sprint 6 Implemented (Core Foundation, Recovery Engine, UI & Web3)
**2. Project Remote**: `https://github.com/Precise-Goals/horizon.git`

**3. Completed**:
- **Branding & Architecture Rename**:
  - Global rename from Veltrix to **Horizon** across all docs, configs, code, UI tokens, and skills.
  - Linked workspace directory `D:\Workspace\Projects\Horizon` via NTFS directory junction.
  - Set remote git repository to `https://github.com/Precise-Goals/horizon.git`.
- **Sprint 0: Foundation**:
  - Monorepo folder layout (`apps/web`, `apps/api`, `packages/shared`, `infra`, `contracts`, `Docs`).
  - `.gitignore`, `.editorconfig`, and root `README.md`.
  - GitHub Actions CI workflow in `.github/workflows/ci.yml`.
  - Custom AGY skills in `.agents/skills/` (`horizon-recovery-engine`, `horizon-ui-design`, `horizon-blockchain`) and `.agents/GEMINI.md`.
- **Sprint 1 & 2: Core Infrastructure & Monitoring**:
  - FastAPI backend skeleton with Pydantic v2 data models for nodes, telemetry, playbooks, recovery plans, and audit logs.
  - Failure detection engine (`FailureDetector`) with threshold logic and probe recording.
  - Simulated infrastructure in `infra/simulated/` (`docker-compose.sim.yml` and `chaos_monkey.py`).
- **Sprint 3: Dependency Mapping**:
  - Directed Acyclic Graph (`DependencyGraph`) implementation with Tarjan/DFS cycle detection.
  - Blast radius computation identifying all downstream cascaded services.
  - Root cause analysis distinguishing primary failures from secondary symptoms.
- **Sprint 4: Autonomous Recovery Engine**:
  - `RecoveryPlanner` utilizing topological sort (e.g. database -> cache -> auth -> gateway -> frontend).
  - `PlaybookExecutor` with async step execution, human approval gates (`PAUSED_APPROVAL`), and approval actions (`approve_step`, `reject_step`).
  - Pre-configured playbook library (`database_failover`, `service_restart`, `cache_purge`, `traffic_reroute`).
  - Structured audit logging service (`AuditLogger`).
  - Unit test suite in `apps/api/tests/unit/` (100% passing).
- **Sprint 5: Dashboard & UI**:
  - React 19 + Vite + Bun frontend in `apps/web` with Tailwind CSS v4 and DaisyUI.
  - Neo-brutalistic design system: cream background (`#FFF8F0`), deep black (`#1A1A1A`), cobalt blue (`#0047AB`).
  - Bento Grid Dashboard with live metrics, active incidents counter, and status badges.
  - Interactive Dependency Topology graph component with blast radius visual simulation.
  - Live Recovery Timeline component with collapsible steps and interactive Human Approval Gate cards.
  - Searchable and filterable Audit Trail table.
  - Firebase Auth context with demo login and accessible auth modal.
  - Full route integration in `App.tsx` (`/`, `/dashboard`, `/topology`, `/recovery`, `/audit`, `/subscription`).
  - Zero-error production build verified (`bun run build`).
- **Sprint 6: Blockchain & NFT**:
  - `contracts/HorizonSubscriptionNFT.sol`: ERC-721 smart contract for subscription tiers (Explorer, Guardian, Sentinel, Enterprise).
  - `contracts/HorizonAuditVault.sol`: On-chain tamper-proof recovery audit hash anchoring.
  - Frontend Web3 subscription plan cards with simulated NFT minting.

**4. In Progress**:
- Continuous enhancement and live deployment preparation.

**5. Blocked**:
- None.

**6. Next Up**:
- Sprint 7: LLM Agent & Intelligence (dynamic runbook generation & AI post-mortems).
- Sprint 8: End-to-end integration demo execution and deployment.

**7. Decision Log**:
- ADR-001 through ADR-010 active in `Docs/DECISIONS.md`.
- Renamed project identity and directory link to Horizon.

**8. Last Updated**: 2026-10-08
