from src.engine.dependency_graph import DependencyGraph
from src.engine.planner import RecoveryPlanner
from src.models.node import NodeType

def test_generate_plan():
    graph = DependencyGraph()
    graph.add_node("db-primary", {"node_type": NodeType.DATABASE})
    graph.add_node("api-gateway", {"node_type": NodeType.GATEWAY})
    graph.add_dependency("api-gateway", "db-primary")
    
    planner = RecoveryPlanner(graph)
    plan = planner.generate_plan(["db-primary", "api-gateway"])
    
    assert plan.root_cause_node_ids == ["db-primary"]
    # DB steps first, then gateway steps
    assert len(plan.steps) > 0
    assert plan.steps[0].target_node_id == "db-primary"
    assert plan.steps[0].is_high_risk == True  # DATABASE_FAILOVER step 1
