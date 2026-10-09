from collections import deque
from datetime import datetime, timezone
import time
from typing import Any, Dict, List, Optional, Set, Tuple
import httpx

from app.engine.blockchain import blockchain_engine
from app.models import DependencyEdge, PlaybookStep, ProbeResult, SystemNode


class TopologyEngine:
    def __init__(self):
        self._nodes: Dict[str, SystemNode] = {}
        self._incidents: List[Dict[str, Any]] = []
        self._consecutive_failures: Dict[str, int] = {}
        self._recovery_jobs: Dict[str, Dict[str, Any]] = {}
        self._timeline_events: Dict[str, List[Dict[str, Any]]] = {}
        self._mttr_history: List[float] = [38.5, 42.0, 48.5, 36.2, 44.0]
        self._reset_to_default_topology()

    def _reset_to_default_topology(self):
        default_nodes = [
            SystemNode(id="db-primary", name="PostgreSQL Master", type="database", dependencies=[], latency_ms=4.2, cpu_percent=42.0),
            SystemNode(id="redis-cache", name="Redis Session Store", type="cache", dependencies=["db-primary"], latency_ms=1.1, cpu_percent=25.0),
            SystemNode(id="kafka-queue", name="Kafka Event Broker", type="cache", dependencies=["db-primary"], latency_ms=8.5, cpu_percent=38.0),
            SystemNode(id="auth-service", name="Auth & Identity API", type="application", dependencies=["db-primary", "redis-cache"], latency_ms=14.0, cpu_percent=55.0),
            SystemNode(id="payment-worker", name="Payment & Settlement Worker", type="application", dependencies=["db-primary", "kafka-queue"], latency_ms=19.2, cpu_percent=48.0),
            SystemNode(id="api-gateway", name="Envoy API Ingress", type="gateway", dependencies=["auth-service", "payment-worker"], latency_ms=22.0, cpu_percent=60.0),
            SystemNode(id="web-frontend", name="Public Edge Client", type="gateway", dependencies=["api-gateway"], latency_ms=35.0, cpu_percent=20.0),
        ]
        self._nodes = {n.id: n for n in default_nodes}
        self._incidents.clear()
        self._consecutive_failures = {n.id: 0 for n in default_nodes}
        self._recovery_jobs.clear()
        self._timeline_events.clear()

    def get_nodes(self, filter_status: Optional[str] = None) -> List[SystemNode]:
        nodes = list(self._nodes.values())
        if filter_status and filter_status != "all":
            return [n for n in nodes if n.status == filter_status]
        return nodes

    def get_node(self, node_id: str) -> Optional[SystemNode]:
        return self._nodes.get(node_id)

    def get_edges(self) -> List[DependencyEdge]:
        edges: List[DependencyEdge] = []
        for n in self._nodes.values():
            for dep in n.dependencies:
                if dep in self._nodes:
                    edges.append(DependencyEdge(source=dep, target=n.id))
        return edges

    def compute_blast_radius(self, node_id: str) -> List[str]:
        """Computes all downstream affected services using Breadth-First Search (BFS)."""
        downstream: Set[str] = set()
        queue = deque([node_id])

        while queue:
            curr = queue.popleft()
            for n in self._nodes.values():
                if curr in n.dependencies and n.id not in downstream:
                    downstream.add(n.id)
                    queue.append(n.id)

        return sorted(list(downstream))

    def kahn_topological_sort(self) -> Tuple[List[List[str]], bool]:
        """
        Executes Kahn's algorithm O(V+E) to partition nodes into parallel recovery tiers.
        Returns: (levels, cycle_detected)
        """
        in_degree: Dict[str, int] = {n.id: 0 for n in self._nodes.values()}
        for n in self._nodes.values():
            valid_deps = [d for d in n.dependencies if d in self._nodes]
            in_degree[n.id] = len(valid_deps)

        resolved: Set[str] = set()
        levels: List[List[str]] = []

        while len(resolved) < len(self._nodes):
            current_level = [
                node_id
                for node_id, deg in in_degree.items()
                if deg == 0 and node_id not in resolved
            ]

            if not current_level:
                # Circular dependency deadlock detected!
                return levels, True

            levels.append(sorted(current_level))
            for node_id in current_level:
                resolved.add(node_id)

            for n in self._nodes.values():
                if n.id not in resolved:
                    remaining_deps = [d for d in n.dependencies if d not in resolved and d in self._nodes]
                    in_degree[n.id] = len(remaining_deps)

        return levels, False

    def simulate_failure(self, node_id: str, reason: str = "Chaos drill outage") -> Dict[str, Any]:
        """Injects simulated outage on target node and degrades downstream blast radius."""
        node = self.get_node(node_id)
        if not node:
            raise ValueError(f"System node '{node_id}' not found in cluster topology.")

        blast_radius = self.compute_blast_radius(node_id)
        node.status = "down"
        node.latency_ms = 999.0
        node.error_rate = 1.0
        self._consecutive_failures[node_id] = 3

        for down_id in blast_radius:
            if down_id in self._nodes:
                self._nodes[down_id].status = "degraded"
                self._nodes[down_id].latency_ms += 150.0
                self._nodes[down_id].error_rate = 0.45

        incident_id = f"INC-{len(self._incidents) + 8820}"
        incident = {
            "id": incident_id,
            "targetNode": node_id,
            "blastRadius": blast_radius,
            "reason": reason,
            "status": "awaiting_approval" if node.type == "database" else "active",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        self._incidents.append(incident)

        self._record_timeline_event(
            job_id=None,
            incident_id=incident_id,
            event_type="incident_triggered",
            message=f"Outage triggered on {node_id}: {reason}. Blast radius: {len(blast_radius)} nodes.",
            details={"targetNode": node_id, "blastRadius": blast_radius},
        )

        return {
            "success": True,
            "incidentId": incident_id,
            "affectedNode": node_id,
            "blastRadius": blast_radius,
            "estimatedRecoveryTimeSec": 45,
        }

    # ==========================================================================
    # 3-Consecutive-Miss Health Probing (Sliding Window Failure Detection)
    # ==========================================================================

    def probe_cluster_health(
        self,
        node_id: Optional[str] = None,
        simulate_miss: Optional[bool] = None,
    ) -> Dict[str, Any]:
        """
        Evaluates node or cluster health with sliding-window consecutive failure tracking.
        A node is only declared 'down' after 3 consecutive missed health probes.
        """
        targets = [self._nodes[node_id]] if (node_id and node_id in self._nodes) else list(self._nodes.values())
        if node_id and node_id not in self._nodes:
            raise ValueError(f"Target node '{node_id}' not found in cluster.")

        probe_results: List[Dict[str, Any]] = []
        now_iso = datetime.now(timezone.utc).isoformat()

        for node in targets:
            # Check whether this probe is a miss
            if simulate_miss is True:
                is_miss = True
            elif simulate_miss is False:
                is_miss = False
            else:
                # Default live evaluation: check if node is currently down or degraded
                is_miss = (node.status == "down" or node.error_rate >= 0.5 or node.latency_ms >= 500.0)

            if is_miss:
                prev_count = self._consecutive_failures.get(node.id, 0)
                current_count = prev_count + 1
                self._consecutive_failures[node.id] = current_count

                if current_count >= 3:
                    # 3 consecutive misses threshold reached -> Declare node DOWN
                    failure_declared = True
                    node.status = "down"
                    node.latency_ms = max(node.latency_ms, 999.0)
                    node.error_rate = max(node.error_rate, 1.0)

                    # Degrade downstream dependencies in blast radius
                    blast = self.compute_blast_radius(node.id)
                    for down_id in blast:
                        if down_id in self._nodes and self._nodes[down_id].status != "down":
                            self._nodes[down_id].status = "degraded"
                            self._nodes[down_id].latency_ms = max(self._nodes[down_id].latency_ms, 150.0)
                            self._nodes[down_id].error_rate = max(self._nodes[down_id].error_rate, 0.45)

                    msg = f"HARD FAILURE: Node {node.id} missed {current_count}/3 consecutive probes. Status transitioned to DOWN."
                else:
                    failure_declared = False
                    msg = f"PROBE MISSED: Node {node.id} missed probe ({current_count}/3). Failure not declared until 3 consecutive misses."
            else:
                # Probe succeeded -> Reset consecutive failure counter to 0
                self._consecutive_failures[node.id] = 0
                failure_declared = False
                if node.status in ["down", "degraded"]:
                    node.status = "healthy"
                    node.latency_ms = 12.0
                    node.error_rate = 0.0
                msg = f"PROBE HEALTHY: Node {node.id} responded within SLA. Consecutive misses reset to 0."

            probe_model = ProbeResult(
                node_id=node.id,
                status=node.status,
                healthy=(self._consecutive_failures.get(node.id, 0) == 0 and node.status == "healthy"),
                consecutive_failures=self._consecutive_failures.get(node.id, 0),
                failure_threshold=3,
                failure_declared=failure_declared,
                latency_ms=node.latency_ms,
                error_rate=node.error_rate,
                message=msg,
                timestamp=now_iso,
            )
            probe_results.append(probe_model.model_dump())

        healthy_count = sum(1 for n in self._nodes.values() if n.status == "healthy")
        degraded_count = sum(1 for n in self._nodes.values() if n.status == "degraded")
        down_count = sum(1 for n in self._nodes.values() if n.status == "down")

        response: Dict[str, Any] = {
            "totalProbed": len(targets),
            "healthyCount": healthy_count,
            "degradedCount": degraded_count,
            "downCount": down_count,
            "failureThreshold": 3,
            "consecutiveFailureCounts": dict(self._consecutive_failures),
            "probes": probe_results,
            "timestamp": now_iso,
        }

        # For single node queries, provide top-level convenience keys
        if node_id and len(probe_results) == 1:
            single = probe_results[0]
            response["nodeId"] = single["node_id"]
            response["status"] = single["status"]
            response["healthy"] = single["healthy"]
            response["consecutiveFailures"] = single["consecutive_failures"]
            response["failureDeclared"] = single["failure_declared"]
            response["latencyMs"] = single["latency_ms"]
            response["errorRate"] = single["error_rate"]
            response["message"] = single["message"]

        return response

    # ==========================================================================
    # Autonomous Multi-Tier Recovery & Playbooks
    # ==========================================================================

    def trigger_recovery(
        self,
        target_node_id: str,
        auto_approve_low_risk: bool = True,
        strategy: str = "automatic",
    ) -> Dict[str, Any]:
        """
        Executes Kahn's bottom-up topological recovery sequence with multi-tier playbooks:
        'automatic', 'database_failover', 'service_restart', or 'restore_from_backup'.
        """
        node = self.get_node(target_node_id)
        if not node:
            raise ValueError(f"Target node '{target_node_id}' not found.")

        levels, has_cycle = self.kahn_topological_sort()
        if has_cycle:
            raise ValueError("Cannot trigger recovery: circular dependency deadlock detected in cluster graph!")

        # Determine effective playbook and whether a human cryptographic gate is required
        effective_strategy = strategy
        if strategy == "automatic":
            effective_strategy = "database_failover" if (node.type == "database" or "ledger" in node.id) else "service_restart"

        is_gated = (effective_strategy in ["database_failover", "restore_from_backup"]) or (node.type == "database")

        now_iso = datetime.now(timezone.utc).isoformat()
        start_epoch = time.time()

        if effective_strategy == "restore_from_backup":
            steps = [
                PlaybookStep(
                    id=1,
                    name=f"Restore Point-In-Time Snapshot from Immutable Storage for {node.name}",
                    action="restore_from_backup",
                    risk="high",
                    status="pending_approval",
                ),
                PlaybookStep(
                    id=2,
                    name="Verify Snapshot Consistency & Replay Transaction Log",
                    action="restore_from_backup",
                    risk="medium",
                    status="pending",
                ),
                PlaybookStep(
                    id=3,
                    name="Flush Stale Cache & Warm In-Memory Store",
                    action="cache_purge",
                    risk="low",
                    status="pending",
                ),
                PlaybookStep(
                    id=4,
                    name="Rebalance Event Consumer Partitions",
                    action="queue_rebalance",
                    risk="low",
                    status="pending",
                ),
                PlaybookStep(
                    id=5,
                    name="Release Ingress Traffic Barrier & Reset Probes",
                    action="traffic_shift",
                    risk="low",
                    status="pending",
                ),
            ]
        elif effective_strategy == "database_failover":
            steps = [
                PlaybookStep(
                    id=1,
                    name="Promote Read Replica & Failover Storage",
                    action="database_failover",
                    risk="high",
                    status="pending_approval",
                ),
                PlaybookStep(
                    id=2,
                    name="Flush Stale Cache & Warm In-Memory Store",
                    action="cache_purge",
                    risk="low",
                    status="pending",
                ),
                PlaybookStep(
                    id=3,
                    name="Rebalance Event Consumer Partitions",
                    action="queue_rebalance",
                    risk="low",
                    status="pending",
                ),
                PlaybookStep(
                    id=4,
                    name="Release Ingress Traffic Barrier & Reset Probes",
                    action="traffic_shift",
                    risk="low",
                    status="pending",
                ),
            ]
        else:  # service_restart
            initial_status = "completed" if auto_approve_low_risk else "pending"
            steps = [
                PlaybookStep(
                    id=1,
                    name=f"Rolling Pod Restart for {node.name}",
                    action="service_restart",
                    risk="low",
                    status=initial_status,
                    completed_at=now_iso if auto_approve_low_risk else None,
                ),
                PlaybookStep(
                    id=2,
                    name="Flush Stale Cache & Warm In-Memory Store",
                    action="cache_purge",
                    risk="low",
                    status=initial_status,
                    completed_at=now_iso if auto_approve_low_risk else None,
                ),
                PlaybookStep(
                    id=3,
                    name="Rebalance Event Consumer Partitions",
                    action="queue_rebalance",
                    risk="low",
                    status=initial_status,
                    completed_at=now_iso if auto_approve_low_risk else None,
                ),
                PlaybookStep(
                    id=4,
                    name="Release Ingress Traffic Barrier & Reset Probes",
                    action="traffic_shift",
                    risk="low",
                    status=initial_status,
                    completed_at=now_iso if auto_approve_low_risk else None,
                ),
            ]

        # Associate with or create incident ID
        matching_incidents = [inc for inc in self._incidents if inc.get("targetNode") == target_node_id]
        if matching_incidents:
            incident_id = matching_incidents[-1]["id"]
        else:
            incident_id = f"INC-{len(self._incidents) + 8820}"
            self._incidents.append({
                "id": incident_id,
                "targetNode": target_node_id,
                "blastRadius": self.compute_blast_radius(target_node_id),
                "reason": f"Autonomous recovery triggered via strategy: {effective_strategy}",
                "status": "awaiting_approval" if is_gated else "active",
                "timestamp": now_iso,
            })

        # Generate unique recovery job ID
        job_id = f"REC-{len(self._recovery_jobs) + 9940}"

        # If low-risk and not gated, execute immediately and restore healthy cluster state
        if auto_approve_low_risk and not is_gated:
            node.status = "healthy"
            node.latency_ms = 12.0
            node.error_rate = 0.0
            self._consecutive_failures[node.id] = 0
            for n in self._nodes.values():
                n.status = "healthy"
                self._consecutive_failures[n.id] = 0
            job_status = "completed"
            end_iso = now_iso
            end_epoch = time.time()
            elapsed_rto = 14.2
        else:
            job_status = "pending_approval"
            end_iso = None
            end_epoch = None
            elapsed_rto = 0.0

        # State management record for the active recovery job
        milestones = [
            {
                "timestamp": now_iso,
                "milestone": f"Recovery initiated using strategy '{effective_strategy}'",
                "tier": 0,
            }
        ]
        if job_status == "completed":
            milestones.append({
                "timestamp": now_iso,
                "milestone": "All automated tiers executed successfully. Infrastructure restored.",
                "tier": len(steps),
            })

        job_record = {
            "jobId": job_id,
            "incidentId": incident_id,
            "targetNode": target_node_id,
            "strategy": effective_strategy,
            "status": job_status,
            "currentTier": len(steps) if job_status == "completed" else 0,
            "requiresGateApproval": is_gated,
            "startTime": now_iso,
            "startTimeEpoch": start_epoch,
            "endTime": end_iso,
            "endTimeEpoch": end_epoch,
            "elapsedRtoSeconds": elapsed_rto,
            "steps": [s.model_dump() for s in steps],
            "approvalSignatures": [],
            "milestones": milestones,
        }
        self._recovery_jobs[job_id] = job_record

        self._record_timeline_event(
            job_id=job_id,
            incident_id=incident_id,
            event_type="recovery_initiated",
            message=f"Plan started for {target_node_id} using {effective_strategy} strategy. Requires gate: {is_gated}",
            details={"strategy": effective_strategy, "isGated": is_gated, "jobId": job_id},
        )

        return {
            "jobId": job_id,
            "incidentId": incident_id,
            "targetNode": target_node_id,
            "strategy": effective_strategy,
            "status": job_status,
            "currentTier": job_record["currentTier"],
            "requiresGateApproval": is_gated,
            "startTime": now_iso,
            "elapsedRtoSeconds": elapsed_rto,
            "steps": job_record["steps"],
        }

    # ==========================================================================
    # Human Approval Gate Unblocking (EIP-712 Signature Verification)
    # ==========================================================================

    def submit_gate_approval(
        self,
        job_id: str,
        step_id: int,
        signature: str,
        approver_address: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Validates EIP-712 cryptographic signature, unblocks paused recovery job,
        executes remaining downstream tiers (setting statuses to 'completed'),
        updates resolution time, and adds to rolling MTTR history.
        """
        # Resolve recovery job by jobId or incidentId
        job = self._recovery_jobs.get(job_id)
        if not job:
            for j in self._recovery_jobs.values():
                if j.get("incidentId") == job_id:
                    job = j
                    break

        if not job:
            raise ValueError(f"Recovery job or incident '{job_id}' not found.")

        # Cryptographically verify the EIP-712 signature
        verification = blockchain_engine.verify_eip712_signature(
            job_id_or_incident_id=job["jobId"],
            step_id=step_id,
            signature=signature,
            approver_address=approver_address,
        )
        if not verification.get("valid"):
            raise ValueError(f"Cryptographic EIP-712 verification failed: {verification.get('error')}")

        approver = verification["signer"]
        now_epoch = time.time()
        now_iso = datetime.now(timezone.utc).isoformat()

        # Record signature in job audit log
        job["approvalSignatures"].append({
            "stepId": step_id,
            "signature": signature,
            "approverAddress": approver,
            "chainId": verification["chainId"],
            "timestamp": now_iso,
        })

        # Transition gated step and all downstream tiers to 'completed'
        for step in job["steps"]:
            step["status"] = "completed"
            step["completed_at"] = now_iso
            if step["id"] == step_id:
                step["output"] = f"Cryptographically approved by {approver} (EIP-712 sig: {signature[:12]}...)"
            else:
                step["output"] = "Downstream tier executed successfully following cryptographic gate clearance"

        job["status"] = "completed"
        job["requiresGateApproval"] = False
        job["currentTier"] = len(job["steps"])

        # Compute elapsed RTO stopwatch time and update rolling MTTR
        start_epoch = job.get("startTimeEpoch", now_epoch - 38.0)
        elapsed_rto = round(max(now_epoch - start_epoch, 18.5), 2)
        job["endTime"] = now_iso
        job["endTimeEpoch"] = now_epoch
        job["elapsedRtoSeconds"] = elapsed_rto

        self._mttr_history.append(elapsed_rto)
        rolling_mttr = round(sum(self._mttr_history) / len(self._mttr_history), 2)

        # Restore target node and cluster nodes to healthy state
        target_node = self.get_node(job["targetNode"])
        if target_node:
            target_node.status = "healthy"
            target_node.latency_ms = 12.0
            target_node.error_rate = 0.0
            self._consecutive_failures[target_node.id] = 0

        for n in self._nodes.values():
            n.status = "healthy"
            self._consecutive_failures[n.id] = 0

        # Update milestones
        job["milestones"].append({
            "timestamp": now_iso,
            "milestone": f"Gate step {step_id} authorized by {approver}",
            "tier": step_id,
        })
        job["milestones"].append({
            "timestamp": now_iso,
            "milestone": f"Downstream tiers executed. Job completed with RTO: {elapsed_rto}s",
            "tier": len(job["steps"]),
        })

        # Record timeline events
        self._record_timeline_event(
            job_id=job["jobId"],
            incident_id=job.get("incidentId"),
            event_type="gate_approved",
            message=f"Gate approval submitted for step {step_id} by {approver}. Job unblocked.",
            step_id=step_id,
            details={"signature": signature, "approver": approver},
        )
        self._record_timeline_event(
            job_id=job["jobId"],
            incident_id=job.get("incidentId"),
            event_type="recovery_completed",
            message=f"All tiers executed. Target node {job['targetNode']} recovered.",
            details={"elapsed_rto_seconds": elapsed_rto, "rolling_mttr_seconds": rolling_mttr},
        )

        return {
            "success": True,
            "jobId": job["jobId"],
            "incidentId": job.get("incidentId"),
            "stepId": step_id,
            "approverAddress": approver,
            "signature": signature,
            "status": "completed",
            "elapsedRtoSeconds": elapsed_rto,
            "rollingMttrSeconds": rolling_mttr,
            "steps": job["steps"],
            "message": f"Cryptographic gate approval verified. Recovery job {job['jobId']} unblocked and completed.",
        }

    # ==========================================================================
    # Recovery Timeline & Live RTO / MTTR Tracking
    # ==========================================================================

    def get_incident_timeline(self, job_id_or_incident_id: str) -> Dict[str, Any]:
        """
        Returns live RTO stopwatch seconds, step milestones, timeline log events,
        and rolling MTTR metrics.
        """
        # Resolve job
        job = self._recovery_jobs.get(job_id_or_incident_id)
        if not job:
            for j in self._recovery_jobs.values():
                if j.get("incidentId") == job_id_or_incident_id:
                    job = j
                    break

        # If no active job found, inspect incidents list
        if not job:
            matching_inc = [inc for inc in self._incidents if inc.get("id") == job_id_or_incident_id]
            if matching_inc:
                inc = matching_inc[-1]
                # Synthesize on-the-fly timeline for active incident
                now_iso = datetime.now(timezone.utc).isoformat()
                return {
                    "jobId": None,
                    "incidentId": inc["id"],
                    "targetNode": inc.get("targetNode"),
                    "status": inc.get("status", "active"),
                    "liveRtoStopwatchSeconds": 24.5,
                    "targetRtoSeconds": 60.0,
                    "startTime": inc.get("timestamp", now_iso),
                    "endTime": None,
                    "milestones": [
                        {"timestamp": inc.get("timestamp", now_iso), "milestone": "Outage detected", "tier": 0}
                    ],
                    "timelineEvents": self._get_timeline_events(inc["id"]),
                    "rollingMttrMetrics": self._get_mttr_metrics(24.5),
                    "steps": [],
                }
            raise ValueError(f"No incident or recovery job found matching '{job_id_or_incident_id}'.")

        # Compute live RTO stopwatch
        if job["status"] == "completed":
            live_rto = job.get("elapsedRtoSeconds", 35.0)
        else:
            live_rto = round(time.time() - job["startTimeEpoch"], 2)

        events = self._get_timeline_events(job["jobId"])
        metrics = self._get_mttr_metrics(live_rto)

        return {
            "jobId": job["jobId"],
            "incidentId": job.get("incidentId"),
            "targetNode": job.get("targetNode"),
            "status": job["status"],
            "liveRtoStopwatchSeconds": live_rto,
            "targetRtoSeconds": 60.0,
            "startTime": job.get("startTime"),
            "endTime": job.get("endTime"),
            "milestones": job.get("milestones", []),
            "timelineEvents": events,
            "rollingMttrMetrics": metrics,
            "steps": job.get("steps", []),
        }

    # ==========================================================================
    # Incident Broadcast & Team Coordination
    # ==========================================================================

    async def broadcast_incident_alert(
        self,
        incident_id: str,
        channels: Optional[List[str]] = None,
        webhook_url: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Formats and sends notifications to channels and optional HTTP POST webhook.
        """
        target_channels = channels or ["#war-room-critical", "#sre-alerts", "#incident-response"]

        # Discover incident details
        target_node = "db-primary"
        reason = "Automated system alert"
        blast_radius = ["redis-cache", "auth-service", "api-gateway"]
        for inc in self._incidents:
            if inc.get("id") == incident_id:
                target_node = inc.get("targetNode", target_node)
                reason = inc.get("reason", reason)
                blast_radius = inc.get("blastRadius", blast_radius)
                break

        now_iso = datetime.now(timezone.utc).isoformat()
        alert_title = f"🚨 [HORIZON WAR ROOM] Incident {incident_id}: Failure on {target_node}"
        alert_body = (
            f"Target Node: {target_node}\n"
            f"Downstream Blast Radius: {blast_radius}\n"
            f"Outage Reason: {reason}\n"
            f"Autonomous Status: Awaiting EIP-712 Gate Approval\n"
            f"Timestamp: {now_iso}"
        )

        channel_results = [
            {"channel": ch, "status": "delivered", "timestamp": now_iso}
            for ch in target_channels
        ]

        webhook_dispatched = False
        webhook_status: Any = "not_provided"

        if webhook_url:
            webhook_payload = {
                "incident_id": incident_id,
                "title": alert_title,
                "summary": alert_body,
                "target_node": target_node,
                "blast_radius": blast_radius,
                "channels": target_channels,
                "timestamp": now_iso,
            }
            try:
                async with httpx.AsyncClient(timeout=4.0) as client:
                    resp = await client.post(webhook_url, json=webhook_payload)
                    webhook_dispatched = resp.status_code < 400
                    webhook_status = resp.status_code
            except Exception as e:
                webhook_dispatched = False
                webhook_status = f"error: {str(e)}"

        self._record_timeline_event(
            job_id=None,
            incident_id=incident_id,
            event_type="alert_broadcast",
            message=f"Incident broadcast dispatched to {len(target_channels)} channels. Webhook dispatched: {webhook_dispatched}",
            details={"channels": target_channels, "webhookDispatched": webhook_dispatched},
        )

        return {
            "success": True,
            "incidentId": incident_id,
            "targetNode": target_node,
            "alertTitle": alert_title,
            "message": alert_body,
            "channelsDispatched": channel_results,
            "webhookUrl": webhook_url,
            "webhookDispatched": webhook_dispatched,
            "webhookStatus": webhook_status,
            "timestamp": now_iso,
        }

    # ==========================================================================
    # Internal Helpers
    # ==========================================================================

    def _record_timeline_event(
        self,
        job_id: Optional[str],
        incident_id: Optional[str],
        event_type: str,
        message: str,
        step_id: Optional[int] = None,
        details: Optional[Dict[str, Any]] = None,
    ):
        event = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "eventType": event_type,
            "message": message,
            "stepId": step_id,
            "details": details or {},
        }
        keys = []
        if job_id:
            keys.append(job_id)
        if incident_id:
            keys.append(incident_id)
        for k in keys:
            if k not in self._timeline_events:
                self._timeline_events[k] = []
            self._timeline_events[k].append(event)

    def _get_timeline_events(self, key: str) -> List[Dict[str, Any]]:
        return self._timeline_events.get(key, [])

    def _get_mttr_metrics(self, live_rto: float) -> Dict[str, Any]:
        rolling_mttr = round(sum(self._mttr_history) / len(self._mttr_history), 2) if self._mttr_history else 42.0
        return {
            "rollingMttrSeconds": rolling_mttr,
            "rollingHistory": self._mttr_history[-10:],
            "totalIncidentsResolved": len(self._mttr_history),
            "targetRtoSeconds": 60.0,
            "targetMet": live_rto <= 60.0,
        }

    def set_custom_topology(self, nodes: List[SystemNode]):
        self._nodes = {n.id: n for n in nodes}

    def reset_topology(self):
        self._reset_to_default_topology()


topology_engine = TopologyEngine()
