from collections import deque
from typing import Dict, List, Set, Tuple, Optional
from app.models import SystemNode, DependencyEdge, PlaybookStep


class TopologyEngine:
    def __init__(self):
        self._nodes: Dict[str, SystemNode] = {}
        self._incidents: List[Dict] = []
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

    def simulate_failure(self, node_id: str, reason: str = "Chaos drill outage") -> Dict:
        """Injects simulated outage on target node and degrades downstream blast radius."""
        node = self.get_node(node_id)
        if not node:
            raise ValueError(f"System node '{node_id}' not found in cluster topology.")

        blast_radius = self.compute_blast_radius(node_id)
        node.status = "down"
        node.latency_ms = 999.0
        node.error_rate = 1.0

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
        }
        self._incidents.append(incident)

        return {
            "success": True,
            "incidentId": incident_id,
            "affectedNode": node_id,
            "blastRadius": blast_radius,
            "estimatedRecoveryTimeSec": 45,
        }

    def trigger_recovery(self, target_node_id: str, auto_approve_low_risk: bool = True) -> Dict:
        """Executes Kahn's bottom-up topological recovery sequence."""
        node = self.get_node(target_node_id)
        if not node:
            raise ValueError(f"Target node '{target_node_id}' not found.")

        levels, has_cycle = self.kahn_topological_sort()
        if has_cycle:
            raise ValueError("Cannot trigger recovery: circular dependency deadlock detected in cluster graph!")

        is_gated = node.type == "database" or "ledger" in node.id
        steps: List[PlaybookStep] = [
            PlaybookStep(
                id=1,
                name="Promote Read Replica & Failover Storage" if is_gated else f"Rolling Pod Restart for {node.name}",
                action="database_failover" if is_gated else "service_restart",
                risk="high" if is_gated else "low",
                status="pending_approval" if is_gated else "completed",
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

        # Reset healthy state for demonstration
        if auto_approve_low_risk and not is_gated:
            node.status = "healthy"
            node.latency_ms = 12.0
            node.error_rate = 0.0
            for n in self._nodes.values():
                n.status = "healthy"

        job_id = f"REC-{len(self._incidents) + 9940}"
        return {
            "jobId": job_id,
            "targetNode": target_node_id,
            "status": "pending_approval" if is_gated else "completed",
            "currentTier": 0,
            "requiresGateApproval": is_gated,
            "steps": [s.model_dump() for s in steps],
        }

    def set_custom_topology(self, nodes: List[SystemNode]):
        self._nodes = {n.id: n for n in nodes}

    def reset_topology(self):
        self._reset_to_default_topology()


topology_engine = TopologyEngine()
