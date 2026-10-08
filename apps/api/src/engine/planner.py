import uuid
from src.engine.dependency_graph import DependencyGraph
from src.models.recovery import RecoveryPlan
from src.models.playbook import PlaybookStep
from src.engine.playbooks.library import get_playbook_for_node

class RecoveryPlanner:
    def __init__(self, graph: DependencyGraph) -> None:
        self.graph = graph

    def generate_plan(self, failed_node_ids: list[str]) -> RecoveryPlan:
        root_causes = self.graph.identify_root_causes(failed_node_ids)
        steps = []
        
        # Recovery order should follow the topological sort
        recovery_order = self.graph.get_topological_recovery_order()
        
        for node_id in recovery_order:
            if node_id in failed_node_ids:
                node = self.graph.nodes.get(node_id)
                if node:
                    playbook = get_playbook_for_node(node)
                    if playbook:
                        for step in playbook.steps:
                            # Remap target to current node
                            step_copy = step.model_copy()
                            step_copy.step_id = str(uuid.uuid4())
                            step_copy.target_node_id = node_id
                            steps.append(step_copy)

        return RecoveryPlan(
            plan_id=str(uuid.uuid4()),
            root_cause_node_ids=root_causes,
            steps=steps
        )
