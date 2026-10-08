from src.models.node import NodeStatus

class FailureDetector:
    def __init__(self, failure_threshold: int = 3) -> None:
        self.failure_threshold = failure_threshold
        self.probe_history: dict[str, list[bool]] = {}

    def record_probe(self, node_id: str, success: bool, latency_ms: float, status_code: int) -> NodeStatus:
        if node_id not in self.probe_history:
            self.probe_history[node_id] = []
        
        # Determine success based on params
        is_success = success and latency_ms < 5000 and status_code < 500
        
        self.probe_history[node_id].append(is_success)
        
        # Keep only the latest N probes up to the threshold
        if len(self.probe_history[node_id]) > self.failure_threshold:
            self.probe_history[node_id].pop(0)
            
        recent_probes = self.probe_history[node_id]
        if len(recent_probes) == self.failure_threshold and not any(recent_probes):
            return NodeStatus.DOWN
        elif not is_success:
            return NodeStatus.DEGRADED
            
        return NodeStatus.HEALTHY
