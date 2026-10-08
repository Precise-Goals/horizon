import uuid
from src.models.node import NodeResponse, NodeStatus
from src.models.graph import BlastRadiusResult

class DependencyGraph:
    def __init__(self) -> None:
        self.nodes: dict[str, NodeResponse] = {}
        self.edges: dict[str, list[str]] = {}  # node -> list of nodes it depends on
        self.reverse_edges: dict[str, list[str]] = {}  # node -> list of nodes that depend on it

    def add_node(self, node_id: str, metadata: dict) -> None:
        self.nodes[node_id] = NodeResponse(
            node_id=node_id,
            name=metadata.get("name", node_id),
            node_type=metadata.get("node_type", "APPLICATION"),
            status=metadata.get("status", NodeStatus.UNKNOWN),
            metadata=metadata
        )
        if node_id not in self.edges:
            self.edges[node_id] = []
        if node_id not in self.reverse_edges:
            self.reverse_edges[node_id] = []

    def add_dependency(self, dependent_id: str, depends_on_id: str) -> None:
        if dependent_id not in self.edges:
            self.edges[dependent_id] = []
        if depends_on_id not in self.reverse_edges:
            self.reverse_edges[depends_on_id] = []
        if depends_on_id not in self.edges[dependent_id]:
            self.edges[dependent_id].append(depends_on_id)
        if dependent_id not in self.reverse_edges[depends_on_id]:
            self.reverse_edges[depends_on_id].append(dependent_id)

    def has_cycle(self) -> bool:
        visited = set()
        rec_stack = set()

        def dfs(node: str) -> bool:
            visited.add(node)
            rec_stack.add(node)
            for neighbor in self.edges.get(node, []):
                if neighbor not in visited:
                    if dfs(neighbor):
                        return True
                elif neighbor in rec_stack:
                    return True
            rec_stack.remove(node)
            return False

        for node in self.nodes:
            if node not in visited:
                if dfs(node):
                    return True
        return False

    def get_topological_recovery_order(self) -> list[str]:
        # Returns nodes such that foundational dependencies come first
        visited = set()
        order = []

        def dfs(node: str) -> None:
            visited.add(node)
            for neighbor in self.reverse_edges.get(node, []):
                if neighbor not in visited:
                    dfs(neighbor)
            order.append(node)

        for node in self.nodes:
            if node not in visited:
                dfs(node)
        return order[::-1]  # reverse to get foundational first

    def compute_blast_radius(self, failed_node_id: str) -> BlastRadiusResult:
        affected = set()
        queue = [failed_node_id]
        depths = {failed_node_id: 0}
        max_depth = 0

        while queue:
            curr = queue.pop(0)
            curr_depth = depths[curr]
            affected.add(curr)
            for neighbor in self.reverse_edges.get(curr, []):
                if neighbor not in affected:
                    depths[neighbor] = curr_depth + 1
                    max_depth = max(max_depth, curr_depth + 1)
                    queue.append(neighbor)
        
        affected.remove(failed_node_id)
        
        severity = "CRITICAL" if len(affected) > 3 else "HIGH" if len(affected) > 1 else "LOW"
        return BlastRadiusResult(
            affected_nodes=list(affected),
            severity=severity,
            cascade_depth=max_depth
        )

    def identify_root_causes(self, failed_node_ids: list[str]) -> list[str]:
        failed_set = set(failed_node_ids)
        root_causes = []
        for node in failed_set:
            # A node is a root cause if none of its dependencies have failed
            dependencies = self.edges.get(node, [])
            if not any(dep in failed_set for dep in dependencies):
                root_causes.append(node)
        return root_causes

    def get_graph_dict(self) -> dict:
        nodes = [{"node": node.model_dump()} for node in self.nodes.values()]
        edges = []
        for dependent, dependencies in self.edges.items():
            for dep in dependencies:
                edges.append({"dependent_id": dependent, "depends_on_id": dep})
        return {"nodes": nodes, "edges": edges}
