# Architecture Decision Records (ADRs)

This document tracks major architectural decisions for the Veltrix platform.

## ADR-001: Use React + Vite + Bun for Frontend

*   **Status:** Accepted
*   **Context:** Need a fast, modern, and type-safe frontend toolchain.
*   **Decision:** We will use React with Vite for fast builds and Bun as the package manager and runtime to maximize performance and developer experience.
*   **Consequences:** Faster build times, but requires team familiarity with Bun. Incompatible with standard npm/yarn workflows.
*   **Alternatives Considered:** Next.js (overkill for SPA needs), Webpack (too slow).

## ADR-002: Use Shadcn UI as Primary Component Library

*   **Status:** Accepted
*   **Context:** Need a highly customizable, accessible component foundation.
*   **Decision:** Use Shadcn UI as the primary component library, augmented by Aceternity UI, Magic UI, and DaisyUI for specific complex or animated components.
*   **Consequences:** High customization flexibility as we own the code, but requires manual updates if upstream components change.
*   **Alternatives Considered:** Material UI, Chakra UI (both too opinionated and harder to fully customize to our neo-brutalistic theme).

## ADR-003: Use Firebase for Auth and Realtime DB

*   **Status:** Accepted
*   **Context:** Need rapid implementation for authentication and real-time state synchronization for the recovery dashboard.
*   **Decision:** Utilize Firebase Authentication and Firebase Realtime Database.
*   **Consequences:** Vendor lock-in to Google Cloud, but drastically reduces backend setup time for core features.
*   **Alternatives Considered:** Supabase (migrating would take too long given current setup), Custom PostgreSQL + WebSocket server (high initial overhead).

## ADR-004: Use Python for Backend Services

*   **Status:** Accepted
*   **Context:** Backend needs robust ecosystem for orchestration, monitoring, and AI agent integration.
*   **Decision:** Use Python (FastAPI/Flask) for the backend workflow engine and monitoring services.
*   **Consequences:** Excellent AI/ML library support, though potentially slower raw performance than Go or Rust.
*   **Alternatives Considered:** Node.js (less ideal for heavy orchestration/ML tasks), Go (higher learning curve for AI integrations).

## ADR-005: Use Docker for Infrastructure Simulation

*   **Status:** Accepted
*   **Context:** Need reproducible environments to simulate infrastructure failures and recoveries.
*   **Decision:** Standardize on Docker (and Kubernetes) for all infrastructure modeling and execution.
*   **Consequences:** Ensures consistency between dev and prod, requires Docker knowledge across the team.
*   **Alternatives Considered:** Vagrant, manual VM provisioning.

## ADR-006: Use Web3/NFT for SaaS Subscription Plans

*   **Status:** Accepted
*   **Context:** Innovative pricing model required for the Web3 target audience.
*   **Decision:** Implement SaaS subscription tiers as utility NFTs via Web3 integrations.
*   **Consequences:** Requires users to have wallets, introduces blockchain transaction latency/fees, but opens unique secondary market possibilities for subscriptions.
*   **Alternatives Considered:** Stripe/Fiat only (retained as fallback, but Web3 is primary for tier gating).

## ADR-007: Use Neo-brutalistic Design with Cream/Black/Cobalt Blue Theme

*   **Status:** Accepted
*   **Context:** Veltrix needs a distinct, modern, and striking visual identity.
*   **Decision:** Adopt a light theme (Cream `#FFF8F0`, Black `#1A1A1A`, Cobalt Blue `#0047AB`) utilizing neo-brutalistic design principles (bento grids, strong borders, glassmorphism).
*   **Consequences:** Strong brand identity, might require custom CSS rather than relying on out-of-the-box utility classes.
*   **Alternatives Considered:** Standard corporate clean design (too generic).

## ADR-008: Use Dependency Graph for Recovery Ordering

*   **Status:** Accepted
*   **Context:** Complex infrastructures have inter-dependent services (e.g., DB must start before API).
*   **Decision:** Represent infrastructure as a Directed Acyclic Graph (DAG) to determine optimal, safe recovery sequences.
*   **Consequences:** Ensures correct order of operations but adds complexity to the workflow engine.
*   **Alternatives Considered:** Sequential hardcoded scripts (unscalable).

## ADR-009: Human-in-the-Loop for High-Risk Recovery Steps

*   **Status:** Accepted
*   **Context:** Automated recovery can be dangerous if it makes incorrect assumptions about data integrity.
*   **Decision:** High-risk actions (e.g., dropping/restoring databases, DNS changes) MUST require explicit human approval via the dashboard before execution.
*   **Consequences:** Increases recovery time slightly but prevents catastrophic automated errors.
*   **Alternatives Considered:** Fully autonomous recovery (too risky for MVP).

## ADR-010: Blockchain for Credential Security

*   **Status:** Accepted
*   **Context:** Need highly secure, tamper-proof storage for infrastructure credentials used by the recovery agents.
*   **Decision:** Utilize blockchain-based or decentralized vault mechanisms for sensitive credential storage.
*   **Consequences:** High security but increased complexity in retrieval and key management.
*   **Alternatives Considered:** Standard cloud secret managers (AWS Secrets Manager/HashiCorp Vault - may be used as intermediaries).
