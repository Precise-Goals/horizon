# Horizon: Project Brief for Judges

*Autonomous Enterprise Infrastructure Recovery Platform. Prepared 9 October 2026.*

## Quick answer: SaaS or PaaS?

**Horizon is an agentic AIOps SaaS with a developer platform on the side.**

- **The core product is SaaS.** Customers subscribe and get autonomous incident recovery. The Sarvam-powered agent is a *feature* that delivers the outcome (faster recovery). We are not selling "agents" as a product, we are selling lower downtime.
- **The MCP server is not strictly PaaS.** PaaS means customers build and run their own apps on our infrastructure. The MCP server is an **integration and API layer**. Call it a **developer platform** or "API-as-a-product." It could grow into real PaaS later if others can deploy their own agents or playbooks on Horizon.

Say "SaaS + developer platform" to be accurate and still ambitious.

## One-line pitch

> **Horizon is India's sovereign AIOps platform: it detects failures, restores systems in the correct dependency order, pauses for cryptographic human approval on risky steps, and proves every action on an India-built blockchain. Its Ask and Agent modes work in Indian languages.**

## Problem

When a company's systems fail, recovery is manual, slow and out of order. A database crash cascades into login, gateway and app failures. Teams gather in a "war room," restart things in the wrong order, and cause crash loops. The cost shows up as **downtime**, **SLA penalties**, a high **MTTR** (mean time to recovery), and no trustworthy **audit trail**.

Indian startups face extra problems: global AIOps tools are priced in USD, send telemetry abroad, and are not built around India's regulatory context. India's CERT-In directions require certain cyber incidents to be reported within hours, and the DPDP Act raises data-handling duties (verify current rules with a lawyer). A timestamped, tamper-evident incident record directly supports this.

Language is a further gap. Incident tools are English-first, yet many operations teams, managers and support staff in India work more comfortably in Hindi, Tamil, Marathi and other regional languages. During an outage, a misread instruction costs minutes.

## Solution

Horizon runs one loop: **Detect, Map, Plan, Recover, Approve, Prove, Learn.**

| Stage | What it does |
| --- | --- |
| Detect | Probes nodes and declares failure after 3 consecutive misses (avoids false alarms) |
| Map | A dependency graph gives the **blast radius** and separates root cause from symptoms |
| Plan | **Topological sort** gives the correct recovery order |
| Recover | Runs **playbooks**; low-risk steps run automatically, and each step waits for *verified healthy* before the next |
| Approve | High-risk steps pause for a wallet-signed human approval (**human-in-the-loop**) |
| Prove | Hash-chained audit log, with key hashes anchored on-chain |
| Learn | The Sarvam agent explains failures, drafts post-mortems and suggests playbook improvements |
| Connect | An MCP server lets developers query Horizon from their own tools |

## Ask mode and Agent mode

Horizon's assistant works in two modes, and both answer in the user's own Indian language or in English. **Ask mode** is read-only and explains what is happening. **Agent mode** proposes recovery steps, which still need signed human approval.

|  | Ask mode | Agent mode |
| --- | --- | --- |
| Purpose | Understand: "why did the login service fail?" | Act: "propose how to recover from this incident" |
| Reads | Nodes, dependency graph, incidents, timelines, audit log | The same, plus the playbook library |
| Can change infrastructure | No. Read-only by design | No. It can only propose; every proposal needs a signed human approval |
| Language | Question and answer in the user's chosen language | Proposals explained in the operator's language, shown beside the canonical step |
| Typical user | Managers, support leads, junior engineers | SREs and Incident Commanders |
| Suggested tier | Guardian and above | Sentinel and above |

Example: a support lead asks in Hindi why checkout is slow, and Ask mode answers in Hindi from live incident data without being able to touch anything. An SRE then switches to Agent mode, reads the proposed recovery in their own language, and signs the approval.

**How multilingual stays safe (design rule):** the language layer only changes presentation. Action names, node IDs and playbook steps stay in one canonical English form internally, the approval signature covers that canonical step, and the approval card shows the translated explanation next to the exact canonical command. A mistranslation can then never change what is approved or executed.

## Innovation

The individual pieces are known, so patent and paper claims should focus on the **integration**:

1. **Dependency-ordered recovery with a health-verification gate**, not just alerts or scripts.
2. **Risk-tiered autonomy:** the platform decides which steps run alone and which need a human.
3. **Cryptographic approval bound to a specific step.** The signature covers the step hash, a nonce and an expiry, so it cannot be replayed or swapped.
4. **Tamper-evident audit trail:** hash chain plus on-chain anchoring.
5. **Safe agentic AI:** the agent can only *suggest*. Output is masked, schema-validated, allowlisted and approval-gated.
6. **MCP-native design**, so AI developer tools can talk to the recovery platform without being able to execute risky actions.

**7. Multilingual Ask and Agent modes.** A read-only Ask mode lets anyone on the team question live incident data in their own language, while Agent mode keeps every proposal approval-gated. Translation changes only how a step is shown, never what is signed or executed.

## USPs, and how to word them

I checked these claims against public sources. Several are strong but need sharper wording so judges cannot poke holes.

| Claim | The risk | Say this instead |
| --- | --- | --- |
| "India's one and only MST L1 EVM chain" | MST describes itself as India's first public EVM-compatible Layer 1, built by India-based Masterstroke Technosoft. But Shardeum also launched an India-first EVM mainnet aimed at Indian startups and enterprises. "Only" is easy to disprove. | "Built on **MST, an India-built EVM Layer 1**, so audit anchoring stays in the Indian ecosystem." |
| "Entire credential data kept safe inside the blockchain" | MST is a **public** chain, so anything stored raw is readable by anyone. Security-minded judges will challenge this. | "Credentials stay **encrypted off-chain in an India-region vault**; the chain stores **integrity proofs, access policies and approval signatures**." This is stronger, not weaker. |
| "Data sovereignty stays in India" | Holds only if every component runs in India. I believe Firebase Realtime Database has no India region (Firestore does), so check this. | "Data **residency in India by design**," backed by a table of where each component runs. |
| "Sarvam, India's flagship model, as the agent" | Strong. The risk is data leaving to the model API. | "Agent runs on **Sarvam, an Indian foundation model**, with PII masking before every call." Confirm Sarvam's data-handling terms. |
| "Patent research paper curated" | "Patent pending" is a legal status that applies only after filing. | "**Patent-oriented research paper prepared; filing in progress**" (or "filed," once true). Do not publish publicly before filing. |
| "Entire AI Ops ecosystem" | Datadog and Dynatrace are far broader, so overclaiming invites comparison. | "A focused **AIOps suite for incident recovery**: detect, map, recover, audit, assist, connect." |
| "MCP for monitoring their active networks" | Today the environment is simulated, and MCP exposes data to developers; it does not collect telemetry from live networks. | Present two things: (a) **today:** MCP lets developers query Horizon; (b) **roadmap:** connectors and agents to ingest real infrastructure. |

Extra credibility point: MST markets a post-quantum security layer. Cite that as MST's claim, not ours.

**Multilingual claim:** say "Ask and Agent modes work in Indian languages through Sarvam," and name only the languages you have tested. Never say "all Indian languages." Technical terms such as failover and blast radius can lose accuracy in translation, so show the canonical English term beside the translated one.

## Market and competition

Global AIOps market estimates for 2025 vary widely depending on how each firm defines the category:

- Fortune Business Insights: about $2.2B in 2025, growing 20.4% a year.
- Global Market Insights: $6.7B in 2025, 22.1% CAGR.
- The Business Research Company: about $11.1B in 2025, 30.2% CAGR.
- IMARC Group: $32.5B in 2025, 16.9% CAGR.

For judges, quote a **range** and name the sources. A conservative claim ("a multi-billion dollar market growing roughly 15 to 30% a year") is more credible than one huge number.

**Competitors:** IBM, Splunk, Dynatrace, Datadog, ServiceNow and New Relic are the established AIOps names. In incident management, also PagerDuty, Rootly and incident.io.

**Positioning:** incumbents are broad observability tools, priced in USD, with data mostly outside India. Horizon is **narrow and deep on recovery**, India-resident and verifiable.

**Bottom-up sizing (fill in with sourced numbers):** target customers multiplied by average annual contract value. Purely illustrative: if 10,000 Indian startups and SMEs run multi-service cloud systems and 5% adopt at ₹3 lakh a year, that is about ₹150 crore. Replace every assumption with a sourced figure before presenting.

## Pricing and cost

**Plans** (illustrative; the existing contracts already define the tiers Explorer, Guardian, Sentinel and Enterprise):

| Tier | Price (illustrative) | Includes |
| --- | --- | --- |
| Explorer | Free | Up to about 5 nodes, manual playbooks, basic audit |
| Guardian | About ₹4,999/month | About 50 nodes, automated recovery, approvals, notifications, multilingual read-only Ask mode |
| Sentinel | About ₹24,999/month | About 500 nodes, Sarvam Agent mode with multilingual proposals, audit export, MCP read access |
| Enterprise | Custom | Unlimited nodes, India-region dedicated deployment, MCP write/propose, SLA, compliance reports |

Add **usage-based extras:** agent calls, MCP API calls and on-chain anchoring batches.

**Payments:** make **fiat (UPI or Razorpay) the default** and NFT access an option. Indian crypto and VDA taxation, and the regulatory stance on crypto payments, can make enterprise procurement hard. This is not legal advice, so consult a lawyer. Fiat as default also strengthens the "enterprise ready" story.

**Main cost drivers:** hosting (Vercel plus database), Sarvam API usage, RPC and anchoring fees on MST (batching keeps these low), a security audit of the smart contracts, the team, and legal costs for IP and crypto compliance. Estimate each from current pricing pages and record gross margin per tier.

## Business Model Canvas

| Block | Horizon |
| --- | --- |
| **Customer segments** | Indian startups and SMEs on multi-service cloud; SRE and DevOps teams; regulated sectors (fintech, healthtech), teams that work in regional languages; later enterprises and government with sovereignty needs |
| **Value propositions** | Lower MTTR, correct-order recovery, fewer human errors, tamper-proof compliance evidence, India-resident data, INR pricing, multilingual Ask and Agent modes |
| **Channels** | Direct sales to CTOs, developer community and MCP listings, cloud and startup-ecosystem partnerships, hackathons and case studies |
| **Customer relationships** | Self-serve onboarding, playbook templates, Slack and Teams support, dedicated success for Enterprise |
| **Revenue streams** | Tiered subscriptions, usage-based AI and API fees, enterprise contracts, compliance-report add-ons, future playbook marketplace commission |
| **Key resources** | Recovery engine and graph algorithms, MST-anchored audit design, Sarvam integration, patent-oriented research, MCP server |
| **Key activities** | Product development, playbook library growth, security and contract audits, patent filing, customer onboarding |
| **Key partners** | MST Blockchain, Sarvam AI, Indian cloud and colocation providers, system integrators, startup incubators |
| **Cost structure** | Cloud hosting, AI API usage, chain fees, security audits, engineering, legal |

## Future scope

1. **Real infrastructure connectors** (Kubernetes, cloud APIs) using agents, or Horizon acting as an MCP *client* to customers' own MCP servers.
2. **Predictive recovery:** learn failure patterns and act before total failure.
3. **Playbook marketplace** where partners publish and sell vetted playbooks (this is where PaaS becomes real).
4. **Compliance packs:** one-click incident reports for CERT-In, RBI and SEBI-style reporting.
5. **Voice and wider language coverage** for Ask mode, beyond the languages launched today, using Sarvam's speech and translation capabilities.
6. **Dedicated India-region and on-prem deployments** for government and BFSI.
7. **Multi-region failover** across Indian data centres.

## Fix before presenting

- **Residency table:** list each component and where it runs. Vercel function region can be pinned (check that a Mumbai region is available to you), and the Realtime Database region question needs an answer or a different store.
- **Move the contracts to MST.** The roadmap and improvement plan currently target Sepolia or Polygon testnets. Deploy `HorizonSubscriptionNFT` and `HorizonAuditVault` on MST's network, and confirm its chain ID, RPC and explorer.
- **Reword ADR-010** so the docs say "encrypted vault plus on-chain proofs."
- **Have one live number** from the simulation, such as MTTR with and without Horizon. Judges remember evidence more than claims.

* **Test the languages you claim.** Check accuracy of technical terms, latency and cost per language, and confirm which languages and speech features Sarvam currently supports and how it handles data.
* **Keep Ask mode truly read-only.** Give it no tool that can write, and test that a request like "restart the database" in any language gets an explanation or a pointer to Agent mode, never an action.

## Sources

- MST Blockchain: press coverage of its Da Nang summit appearance (Coin Edition, TechAnnouncer) and its 2026 roadmap release.
- Shardeum EVM mainnet launch coverage (MEXC News).
- AIOps market sizing: IMARC Group, Global Market Insights, Fortune Business Insights, The Business Research Company.

* Sarvam AI developer documentation: SDKs and quickstart pages.
