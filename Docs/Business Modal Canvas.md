# Horizon — Business Model Canvas (BMC)
## Sovereign Autonomous Enterprise Infrastructure Recovery Platform & Developer Engine
*Document Version: 2.0.0 | Date: October 9, 2026 | Classification: Strategic Executive Documentation*

---

## 1. Executive Summary & Business Architecture

### 1.1 The One-Line Pitch
> **Horizon is India’s sovereign AIOps platform: it detects infrastructure failures, orchestrates recovery in mathematically verified dependency order using Kahn's DAG algorithm, pauses for cryptographic human-in-the-loop approval on high-risk mutations, and anchors tamper-evident proofs on an India-built EVM blockchain (MST Testnet). Its Ask and Agent modes operate natively across Indian regional languages and global languages.**

### 1.2 Business Categorization: Core SaaS + Developer Platform
* **The Core Offering: Autonomous Recovery SaaS:**
  Horizon is fundamentally an Enterprise AIOps Software-as-a-Service (SaaS). Customers do not buy "AI agents" as a novelty; they purchase **guaranteed Mean Time to Recovery (MTTR) reduction, zero cascaded crash-loops, and automated compliance**.
* **The Strategic Moat: Developer Platform & API-as-a-Product (MCP-Native):**
  Horizon features a standard Model Context Protocol (RFC-MCP-2024-11-05) interface, allowing AI coding assistants (Claude Desktop, Cursor, Google Antigravity CLI, Windsurf) to integrate directly into active infrastructure telemetry and recovery tools. Over time, this developer platform evolves into a **Recovery Playbook Marketplace**.

### 1.3 The Horizon Autonomous Loop
Horizon replaces chaos-driven, panic-ridden 3:00 AM "war rooms" with a deterministic seven-stage recovery lifecycle:
```
  [1. Detect]  ──► Synthetic probes (3 consecutive misses = confirmed failure)
       │
  [2. Map]     ──► Real-time dependency DAG & BFS downstream blast-radius analysis
       │
  [3. Plan]    ──► Kahn’s Topological Sort O(V+E) determines strict recovery sequence
       │
  [4. Recover] ──► Autonomous execution of low-risk playbooks (Tier 1..N)
       │
  [5. Approve] ──► EIP-712 cryptographic Commander signature gate for Tier 0 (Databases)
       │
  [6. Prove]   ──► Hash-chained audit logs anchored to MST Blockchain (Chain ID 91562037)
       │
  [7. Learn]   ──► Sarvam-105B post-mortem generation & continuous playbook refinement
```

---

## 2. High-Density Business Model Canvas Matrix

| **Key Partners (KP)** | **Key Activities (KA)** | **Value Propositions (VP)** | **Customer Relationships (CR)** | **Customer Segments (CS)** |
| :--- | :--- | :--- | :--- | :--- |
| **1. MST Blockchain**<br>&bull; India-built EVM Layer 1<br>&bull; Chain ID 91562037<br>&bull; Smart contract audit anchoring<br><br>**2. Sarvam AI**<br>&bull; Sovereign LLM (Sarvam-105B)<br>&bull; Multilingual Indic NLU<br>&bull; PII-masked copilot engine<br><br>**3. Indian Cloud / DC**<br>&bull; E2E Networks, Yotta, AWS Mumbai, GCP Delhi<br><br>**4. DevOps Integrators**<br>&bull; MSPs, SRE consultancies<br><br>**5. Incubators**<br>&bull; T-Hub, NASSCOM DeepTech | **1. Platform Engineering**<br>&bull; Kahn DAG engine<br>&bull; Distributed health probes<br>&bull; Docker/K8s bridge<br><br>**2. Security & Web3**<br>&bull; BridgeKey EIP-712 gates<br>&bull; Smart contract audits<br><br>**3. AI & Linguistics**<br>&bull; Multilingual tuning<br>&bull; Canonical safety barrier<br><br>**4. Compliance R&D**<br>&bull; CERT-In & DPDP alignment<br><br>**5. Enterprise GTM**<br>&bull; Direct sales & POC trials | **1. 95% MTTR Reduction**<br>&bull; Recovers from 45m to < 2m<br>&bull; Prevents thundering herds<br><br>**2. Zero Out-of-Order Crashes**<br>&bull; Mathematical Kahn DAG<br><br>**3. Cryptographic Governance**<br>&bull; EIP-712 human Commander approval gate for stateful Tier 0<br><br>**4. Tamper-Proof Audit**<br>&bull; MST on-chain Merkle root<br><br>**5. Multilingual Inclusivity**<br>&bull; Read-only Ask & Agent in Hindi, Tamil, Marathi, etc.<br><br>**6. Sovereign Pricing**<br>&bull; INR-denominated plans | **1. Self-Serve Product-Led**<br>&bull; Interactive visual sandbox<br>&bull; Connect cluster in < 5 mins<br><br>**2. Collaborative Co-Piloting**<br>&bull; Shared incident war rooms<br>&bull; Slack / MS Teams / Webhook<br><br>**3. Dedicated Enterprise TAM**<br>&bull; Technical Account Managers<br>&bull; Custom playbook engineering<br><br>**4. Developer Community**<br>&bull; Open MCP tools directory<br>&bull; Post-mortem teardown blogs | **1. Indian Cloud Startups**<br>&bull; Seed to Series C scale-ups<br>&bull; High microservice complexity<br><br>**2. Regulated BFSI / FinTech**<br>&bull; Payment gateways, NBFCs<br>&bull; CERT-In 6-hour mandate<br><br>**3. HealthTech & GovTech**<br>&bull; DPDP Act compliance<br>&bull; Sovereign data residency<br><br>**4. E-Commerce & Retail**<br>&bull; Flash-sale traffic surges<br><br>**5. Multilingual Ops Teams**<br>&bull; Support leads & SREs working in regional languages |
| **Key Resources (KR)** | | | **Channels (CH)** | |
| **1. Proprietary Algorithms**<br>&bull; Kahn’s DAG Topological Sequencer<br>&bull; BFS Blast Radius Graph Analyzer<br><br>**2. Sovereign AI & Blockchain IP**<br>&bull; Sarvam-105B Indian foundation integration<br>&bull; MST Smart Contracts (`HorizonSubscriptionNFT`, `HorizonAuditVault`)<br>&bull; Patent-oriented research paper on topological recovery<br><br>**3. Infrastructure Assets**<br>&bull; MCP Stdio & SSE server<br>&bull; India-region secure credential vault | | | **1. Product-Led Growth (PLG)**<br>&bull; Zero-install web sandbox & CLI (`bunx @horizon/mcp-server`)<br><br>**2. Developer IDE Ecosystem**<br>&bull; Model Context Protocol directory<br>&bull; Cursor, Claude Desktop, Antigravity CLI, Windsurf<br><br>**3. Enterprise Direct Sales**<br>&bull; Outbound to CTOs, VP of Eng, Heads of SRE<br><br>**4. Cloud Marketplaces**<br>&bull; AWS Marketplace (India), Azure, GCP, E2E Cloud | |
| **Cost Structure (CS)** | | **Revenue Streams (RS)** | | |
| **1. Compute & Infrastructure:** Vercel Edge Serverless, India-resident DB, Redis, Container daemon nodes<br>**2. Foundation Model API Costs:** Sarvam AI inference tokens for SRE copilot and architecture decoding<br>**3. Blockchain Layer:** MST Testnet & Mainnet gas fees for Merkle root anchoring (negligible via batching)<br>**4. Security & Compliance:** Smart contract formal audits, SOC2 Type II, ISO 27001 certifications<br>**5. Personnel:** Distributed systems engineers, Web3 security researchers, SRE prompt specialists, legal/patent counsel | | **1. Tiered Recurring SaaS Subscriptions (INR Fiat Default via UPI / Razorpay):**<br>&bull; **Explorer:** Free Tier (up to 5 nodes, manual playbooks, basic audit)<br>&bull; **Guardian:** ₹4,999 / month (~50 nodes, auto-recovery, approvals, multilingual Ask mode)<br>&bull; **Sentinel:** ₹24,999 / month (~500 nodes, Sarvam Agent mode, audit export, MCP access)<br>&bull; **Enterprise Commander:** Custom contract (Unlimited nodes, on-prem/dedicated residency, SLAs)<br><br>**2. Optional Web3 Subscription Pass (ZXPASS NFT):** ERC-721 token-gated access on MST Chain<br>**3. Metered Usage Add-Ons:** High-frequency Sarvam AI agent queries, on-chain Merkle batches, MCP bursts<br>**4. Marketplace Commission (Future):** 20% cut on community-published verified recovery playbooks | | |

---

## 3. Deep-Dive: The 9 Building Blocks

### Block 1: Customer Segments (CS)

Horizon addresses high-growth, high-stakes engineering organizations operating distributed microservices:

1. **High-Growth Indian Tech Startups & Scale-ups (Series A to Pre-IPO):**
   * *Profile:* Running 20 to 200+ Kubernetes microservices on AWS/GCP, scaling rapidly with lean DevOps teams.
   * *Pain Point:* Every outage requires waking the entire engineering team. A single junior engineer restarting services in the wrong sequence creates 40-minute downtime cascades.
2. **Regulated BFSI, FinTech & Neobanks:**
   * *Profile:* Payment orchestrators, lending engines, core banking APIs operating under strict regulatory oversight.
   * *Regulatory Driver:* **CERT-In (Indian Computer Emergency Response Team) Directions** mandate cyber and infrastructure incident reporting within 6 hours. Horizon's MST-anchored cryptographic timeline provides undeniable proof of detection, escalation, and resolution.
3. **HealthTech & Public-Facing Citizen Platforms:**
   * *Profile:* Electronic Health Records (EHR), telemedicine, and state digital utilities.
   * *Regulatory Driver:* **Digital Personal Data Protection (DPDP) Act 2023** requires robust operational resilience and strictly local data handling.
4. **Multilingual Operations & Tier-1 Support Teams:**
   * *Profile:* Distributed network operations centers (NOCs) and support teams across India where engineers and duty managers are more fluent in Hindi, Marathi, Tamil, or Telugu than complex technical English runbooks.

---

### Block 2: Value Propositions (VP)

Horizon delivers measurable operational and financial ROI across four primary pillars:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   HORIZON VALUE PROPOSITION PILLARS                    │
├────────────────────────────────┬───────────────────────────────────────┤
│ 1. MATHEMATICAL RESILIENCE     │ 2. CRYPTOGRAPHIC GOVERNANCE           │
│ • MTTR reduced from 45m to <2m │ • EIP-712 hardware-backed signatures  │
│ • O(V+E) Kahn topological sort │ • Zero rogue agent cutovers           │
│ • Reverse BFS blast radius     │ • Immutably anchored on MST Testnet   │
├────────────────────────────────┼───────────────────────────────────────┤
│ 3. REGULATORY COMPLIANCE       │ 4. SOVEREIGN & ACCESSIBLE             │
│ • Instant CERT-In audit proofs │ • Billed in INR (UPI / Net Banking)   │
│ • Zero unencrypted credential  │ • Sarvam-105B Indian Foundation Model │
│   storage on public chain      │ • Multilingual Ask & Agent Modes      │
└────────────────────────────────┴───────────────────────────────────────┘
```

1. **Autonomous, Correct-Order Recovery (Zero Thundering Herds):**
   * Eliminates the fatal error of bringing dependent APIs back before foundational databases are ready.
   * Services recover in strict dependency stages: Tier 0 (PostgreSQL/MySQL Master) &rarr; Tier 1 (Redis Cache / Kafka) &rarr; Tier 2 (Auth & Worker APIs) &rarr; Tier 3 (Ingress / Envoy).
2. **Human-in-the-Loop Cryptographic Governance:**
   * Autonomous AI agents can be unpredictable. Horizon enforces safety: low-risk actions (pod restart, cache purge) execute automatically; destructive actions (database failover, volume rollback, DNS traffic switch) pause for an authorized Commander's Web3 wallet signature.
3. **Tamper-Evident On-Chain Incident Audit Ledger:**
   * Every incident transition, state probe, and approval signature is hashed into a SHA-256 Merkle tree and anchored onto the MST Blockchain. Auditors can independently verify that post-mortem timelines have not been doctored.
4. **Multilingual Operational Equality (Ask & Agent):**
   * **Ask Mode (Read-Only):** Non-destructive, conversational SRE assistant. Support managers can ask in Hindi: *"चेकआउट एपीआई क्यों फेल हो रही है?"* and receive a clear, accurate explanation derived from live telemetry.
   * **Agent Mode (Action-Proposing):** SREs receive generated recovery playbooks explained in their chosen language, but tied to canonical English commands to ensure cryptographic precision.

---

### Block 3: Channels (CH)

Horizon adopts a hybrid GTM approach combining **Product-Led Growth (PLG)** with **Enterprise Direct Sales**:

```
[Awareness]   ──► MCP Server Directory / Open-Source CLI (`bunx @horizon/mcp-server`)
     │
[Evaluation]  ──► Zero-install interactive web sandbox & Miro DAG visualizer
     │
[Adoption]    ──► Self-serve UPI/Card onboarding for Guardian & Sentinel tiers
     │
[Expansion]   ──► Outbound Enterprise sales to CTOs & SRE Directors (Dedicated Vaults)
```

1. **The Model Context Protocol (MCP) Ecosystem (Developer Flywheel):**
   * Horizon’s native MCP server (`@horizon/mcp-server@latest`) integrates into Claude Desktop, Cursor, Google Antigravity CLI, and Windsurf. Developers run diagnostics and trigger recovery directly from their IDE chat window.
2. **Direct B2B Enterprise Sales:**
   * Outbound engagement targeting CTOs, VP of Engineering, and Heads of SRE at top 500 Indian tech enterprises, focusing on SLA risk reduction and CERT-In compliance automation.
3. **Cloud & Marketplace Partnerships:**
   * Listing on AWS Marketplace (India Region), Google Cloud, and homegrown cloud providers (E2E Networks, Yotta Datacenters) as a pre-packaged disaster recovery add-on.
4. **Technical Content & Post-Mortem Engineering:**
   * In-depth engineering teardowns of famous global outages (e.g., CrowdStrike, AWS us-east-1 outages) illustrating how Horizon’s topological DAG would have prevented cascading failure.

---

### Block 4: Customer Relationships (CR)

1. **Product-Led, Self-Serve Onboarding:**
   * Engineering teams can connect a simulated cluster or export Kubernetes CRD manifests in under 5 minutes without talking to a salesperson.
2. **Shared Incident Slack & Teams Connect:**
   * Automated war room bot that posts blast-radius diagrams, recovery milestones, and one-click BridgeKey approval links directly into the organization's incident response channel.
3. **Dedicated Enterprise Technical Account Management (TAM):**
   * Sentinel and Enterprise tiers receive dedicated SRE specialists who audit existing architectural graphs, build customized disaster playbooks, and run automated chaos injection drills quarterly.
4. **Transparent, Trustless Verification:**
   * Customers never have to trust Horizon's internal database for recovery logs; they can verify cryptographic roots directly on the MST Block Explorer (`https://testnet.mstscan.com`).

---

### Block 5: Revenue Streams (RS)

Horizon captures value through a predictable, multi-tiered subscription model supplemented by metered platform usage:

#### Subscription Tiers Matrix

| Plan Tier | Pricing | Nodes Covered | Key Capabilities Included | Payment Method |
| :--- | :--- | :--- | :--- | :--- |
| **Explorer** | **₹0 (Free Forever)** | Up to 5 Nodes | Manual DAG visualization, basic Kahn sorting, community playbooks, local audit trail | Free / Open Sign-up |
| **Guardian** | **₹4,999 / month**<br>(₹49,990 / year) | Up to 50 Nodes | Autonomous recovery execution, EIP-712 human gates, Slack/Teams notifications, **Multilingual Ask Mode** | UPI / Credit Card / NetBanking |
| **Sentinel** | **₹24,999 / month**<br>(₹2,49,990 / year) | Up to 500 Nodes | **Sarvam Agent Mode**, dynamic natural-language YAML pipeline synthesis, MST on-chain audit anchoring, full MCP access | UPI / Corporate Invoicing / Razorpay |
| **Enterprise Commander** | **Custom**<br>(Starts ₹10 Lakhs/yr) | Unlimited Nodes | Dedicated India-region deployment, on-prem agent connectors, 99.95% SLA guarantee, CERT-In compliance exports | Annual Invoicing / MST Smart Contract NFT |

#### Additional Monetization Levers
1. **Usage-Based Metering:** High-volume Sarvam-105B architectural generation bursts, excessive on-chain Merkle batch attestations beyond quota.
2. **Web3 Native Enterprise NFT Pass (ZXPASS):** Global or Web3-native DAOs can purchase and hold the `HorizonSubscriptionNFT` on MST Testnet (Chain ID 91562037) for token-gated API authorization.
3. **Future Playbook Marketplace (20% Take Rate):** Third-party verified SRE specialists publish certified recovery playbooks (e.g., "Kafka Partition Rebalance Under Split-Brain") and monetize per recovery execution.

---

### Block 6: Key Resources (KR)

1. **Algorithmic & Mathematical IP:**
   * Proprietary Kahn Topological Sequencer implementing cycle-safe $O(V+E)$ DAG evaluation.
   * Breadth-First Search (BFS) reverse-adjacency blast-radius computation engine.
2. **Sovereign Foundation AI (Sarvam AI Partnership):**
   * Integrated access to Sarvam-105B with customized prompt templates for technical entity extraction, topological dependency decoding, and multilingual conversational SRE assistance.
3. **Sovereign Blockchain Infrastructure (MST Layer 1):**
   * Deployed smart contracts (`HorizonSubscriptionNFT`, `HorizonAuditVault`) on MST Testnet (`0x3EDad230dCFc6Dd3C357490b9feDa49639646BB7`).
4. **Engineering Talent & Research Base:**
   * Core team with deep expertise across distributed consensus, Linux container internals, Site Reliability Engineering, and cryptography.
   * Patent-oriented research paper on *Autonomous Topological Infrastructure Recovery via Cryptographic Verification*.

---

### Block 7: Key Activities (KA)

```
[Platform R&D]       ──► Core DAG engine, health probing daemons, Docker/K8s connectors
[AI Alignment]       ──► Sarvam-105B prompt engineering, PII masking, canonical translation guard
[Security Auditing]  ──► EIP-712 typed signature verification, smart contract re-entrancy audits
[Compliance Mapping] ──► Mapping telemetry exports to CERT-In 6-hour incident disclosure rules
[GTM & Evangelism]   ──► MCP ecosystem distribution, developer tutorials, enterprise POC delivery
```

1. **Core Platform Engineering:** Continuously expanding the automated playbook library (PostgreSQL failover, Redis eviction, Kafka rebalance, NGINX dynamic traffic cutover).
2. **AI Safety & Canonical Isolation:** Ensuring the multilingual translation layer never alters canonical execution commands, maintaining absolute safety during outages.
3. **Smart Contract Maintenance & Gas Optimization:** Batching cryptographic Merkle roots to ensure on-chain anchoring costs remain fractions of a rupee per incident.
4. **Customer Success & Chaos Engineering:** Running non-destructive chaos simulations on customer sandbox environments to validate recovery plans prior to real-world outages.

---

### Block 8: Key Partners (KP)

1. **Masterstroke Technosoft (MST Blockchain):**
   * Primary EVM Layer 1 infrastructure partner, providing the high-throughput, low-fee public ledger for immutable audit anchoring and post-quantum cryptographic roadmaps.
2. **Sarvam AI:**
   * Strategic foundation AI partner, powering Horizon’s natural language architecture architect and multilingual SRE copilot.
3. **Indian Cloud & Data Center Providers:**
   * E2E Networks, Yotta Infrastructure, and Web Werks, ensuring that telemetry, compute, and backup storage remain within Indian sovereign geographic borders.
4. **DevOps & IT Service Management Consultancies:**
   * Regional system integrators who implement Horizon as part of digital transformation and cloud-migration contracts for enterprise clients.

---

### Block 9: Cost Structure (CS)

Horizon maintains an asset-light, high-gross-margin software model:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   HORIZON COST STRUCTURE BREAKDOWN                     │
├────────────────────────────────┬───────────────────────────────────────┤
│ INFRASTRUCTURE & COMPUTE (18%) │ AI & FOUNDATION INFERENCE (22%)       │
│ • Vercel Edge Serverless       │ • Sarvam AI API token consumption     │
│ • India-region PostgreSQL/DB   │ • Prompt evaluation & fine-tuning     │
│ • Docker monitoring nodes      │ • Multilingual translation pipeline   │
├────────────────────────────────┼───────────────────────────────────────┤
│ RESEARCH & PERSONNEL (45%)     │ AUDIT & LEGAL / COMPLIANCE (15%)      │
│ • Distributed systems engineers│ • Smart contract security audits      │
│ • SRE and Web3 developers      │ • Patent filing & IP maintenance      │
│ • Customer success specialists │ • SOC2 & CERT-In compliance audits    │
└────────────────────────────────┴───────────────────────────────────────┘
```

* **Gross Margin Target:** **78% to 84%** across SaaS tiers.
* **Marginal Cost per Incident Recovered:** Less than ₹12 in compute, AI tokens, and batched blockchain gas.

---

## 4. Competitive Landscape & Defensibility

### 4.1 Competitive Positioning Matrix

| Capability / Metric | Traditional APM (Datadog, Dynatrace) | Incident Response (PagerDuty, Rootly) | Generic LLM Agents (Devin, AutoGPT) | **Horizon (Our Platform)** |
| :--- | :--- | :--- | :--- | :--- |
| **Core Focus** | Observability & Alerting | On-Call Paging & Scheduling | General Code Generation | **Autonomous Topological Recovery** |
| **Recovery Ordering** | None (Manual Runbooks) | None (Manual Checklists) | Unpredictable / Hallucinatory | **Mathematical Kahn Sort O(V+E)** |
| **Blast Radius Calculation**| Static dependency maps | None | None | **Live Dynamic BFS Graph Traversal** |
| **Human-in-the-Loop** | Slack approval buttons | Basic UI clicks | Uncontrolled execution | **Cryptographic EIP-712 Web3 Signatures** |
| **Post-Mortem Proof** | Internal database logs | Plain text export | None | **MST Blockchain Merkle Root Anchoring** |
| **Data Sovereignty** | US/EU data residency | US-hosted SaaS | US API gateways | **India-Resident by Design** |
| **Pricing Currency** | USD ($$$ per host/metric) | USD ($$$ per user) | USD (Per seat/token) | **INR Sovereign Pricing (UPI Native)** |
| **Multilingual Support**| English Only | English Only | General Translation | **Native Multilingual SRE (Sarvam AI)** |

### 4.2 Defensible Moats
1. **The Seven-Part Integrated IP:** Individual pieces (DAGs, alerts, Web3, LLMs) exist in isolation, but Horizon is the first platform to mathematically synthesize them into a closed-loop self-healing pipeline.
2. **Canonical Language Barrier:** Our architecture guarantees that multilingual NLU is safe: translation applies only to human-facing explanations, while machine-executable commands remain canonical, English-standard, and hash-locked.
3. **First Mover on MST Indian EVM Chain:** Deep integration with MST Blockchain positions Horizon as the premier infrastructure tool within the emerging Indian Web3 enterprise ecosystem.

---

## 5. Market Sizing & Financial Model

### 5.1 Addressable Market (Global & India)
* **Total Addressable Market (TAM):** Global AIOps market valued between **$6.7 Billion and $11.1 Billion in 2025**, expanding at a **22.1% to 30.2% CAGR** to reach over $32 Billion by 2030 (Fortune Business Insights, IMARC, The Business Research Company).
* **Serviceable Addressable Market (SAM):** Indian Cloud Infrastructure & Enterprise DevOps Market &rarr; Estimated at **$1.8 Billion** across 10,000+ technology scale-ups, BFSI institutions, and IT services firms.
* **Serviceable Obtainable Market (SOM) — 3-Year Target:** **₹150 Crore (~$18 Million)**, capturing 5% of Indian cloud-native startups and mid-market enterprises.

### 5.2 18-Month Projections

```
Year 1 (Launch & PLG Ramp):
• Paying Customers: 120 (85 Guardian, 30 Sentinel, 5 Enterprise)
• Annual Recurring Revenue (ARR): ₹1.82 Crore
• Gross Margin: 76%

Year 2 (Scale & Enterprise Direct):
• Paying Customers: 540 (350 Guardian, 150 Sentinel, 40 Enterprise)
• Annual Recurring Revenue (ARR): ₹9.45 Crore
• Gross Margin: 82%
• Operating Cash Flow: Net Positive / Self-Sustaining
```

---

## 6. Regulatory & Data Residency Compliance Table

| Component | Technology | Hosting Location & Provider | Sovereign Compliance Status |
| :--- | :--- | :--- | :--- |
| **Web Dashboard & Edge API** | React 18, Vite, Hono Edge | Pinned to Mumbai Edge Region | Compliant |
| **Orchestration & Probing Engine** | TypeScript, Bun Runtime | India-Resident Cloud Container | Compliant |
| **Credential & Secret Vault** | AES-256 GCM Encrypted Vault | India Region (Encrypted at rest) | Strict DPDP Compliance |
| **Audit Ledger Anchor** | Smart Contracts (`0x3EDad2...`) | MST EVM Blockchain (Testnet 91562037) | Public Verification / Zero Raw PII |
| **LLM Inference Engine** | Sarvam AI (Sarvam-105B) | Sovereign Indian Model API | PII Masked Before Transmission |

---

## 7. Roadmap & Horizon Beyond

1. **Q4 2026:** Launch `@horizon/cli` and publish official Model Context Protocol server on Claude Desktop and Cursor extensions directories.
2. **Q1 2027:** Roll out one-click **CERT-In Compliance Export Packs** generating automated 6-hour incident disclosures with MST blockchain proofs.
3. **Q2 2027:** Transition from simulated chaos drills to **Native Kubernetes Operator (CRD)** agents running in customer production clusters.
4. **Q3 2027:** Launch the **Horizon Playbook Marketplace**, enabling enterprise SRE teams to publish, license, and monetize community-audited self-healing playbooks.

---
*Authored by the Horizon Platform Architecture & Core Strategy Team.*
