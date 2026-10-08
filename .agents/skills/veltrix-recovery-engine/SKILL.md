---
name: veltrix-recovery-engine
description: >-
  Use this skill when implementing or modifying the infrastructure recovery engine,
  dependency graph, recovery playbooks, or failure detection systems. Covers the
  core autonomous recovery workflow of the Veltrix platform.
---

# Veltrix Recovery Engine Skill

## Overview
The recovery engine is the core logic center of Veltrix. It monitors target environments, detects infrastructure failures, maps dependencies between disparate systems, determines the absolute correct recovery order, and executes recovery playbooks autonomously.

## Recovery Workflow
1. **Detection** — Monitoring agents detect system failures via health checks or telemetry streams.
2. **Assessment** — Dependency graph (DAG) is consulted to determine the full blast radius.
3. **Planning** — Recovery order is computed using topological sorting on the dependency DAG.
4. **Approval** — High-risk or high-impact steps are queued for human approval.
5. **Execution** — Recovery playbooks execute systematically in the computed dependency order.
6. **Verification** — Each recovered system is aggressively health-checked before the engine proceeds to the next node.
7. **Reporting** — A full timeline, event trace, and audit log are generated for compliance.

## Key Components
- `apps/api/src/engine/detector.py` — Failure detection service polling/webhooks
- `apps/api/src/engine/dependency_graph.py` — DAG-based dependency mapper and topology builder
- `apps/api/src/engine/planner.py` — Recovery order planner (topological sort algorithms)
- `apps/api/src/engine/executor.py` — Playbook execution engine
- `apps/api/src/engine/playbooks/` — Recovery playbook definitions (YAML/JSON/Python DSL)
- `apps/api/src/engine/audit.py` — Audit logging and compliance tracking service

## Playbook Types
- **Failover** — Switch traffic or workloads to a standby/redundant system
- **Restart** — Restart failed service, container, or VM
- **Restore** — Restore databases or filesystems from the latest backup
- **Scale** — Scale up replacement instances to meet capacity
- **DNS** — Update DNS routing to bypass degraded zones

## Testing Strategy
- Unit test each component independently with mocked infrastructure endpoints.
- Integration test full recovery flows on isolated simulated environments.
- Chaos testing — Inject random network partitions or process crashes to test engine resilience.
- Performance test — Recovery must initiate and start the first playbook within 60s of detection.

## Important Constraints
- Recovery order MUST rigorously respect the dependency graph to prevent race conditions.
- High-risk actions (e.g., destructive restores, database failovers) MUST require human approval by default.
- Every single action, payload, and result MUST be logged to the audit trail.
- Failed recovery steps MUST automatically trigger a safe rollback or halt the pipeline safely.
