from src.engine.dependency_graph import DependencyGraph

def test_graph_cycle_detection():
    graph = DependencyGraph()
    graph.add_node("A", {})
    graph.add_node("B", {})
    graph.add_dependency("B", "A")
    assert not graph.has_cycle()

    graph.add_dependency("A", "B")
    assert graph.has_cycle()

def test_topological_sort():
    graph = DependencyGraph()
    graph.add_node("db", {})
    graph.add_node("api", {})
    graph.add_node("web", {})
    
    graph.add_dependency("api", "db")
    graph.add_dependency("web", "api")
    
    order = graph.get_topological_recovery_order()
    assert order == ["db", "api", "web"]

def test_blast_radius():
    graph = DependencyGraph()
    graph.add_node("db", {})
    graph.add_node("api", {})
    graph.add_node("web", {})
    
    graph.add_dependency("api", "db")
    graph.add_dependency("web", "api")
    
    radius = graph.compute_blast_radius("db")
    assert "api" in radius.affected_nodes
    assert "web" in radius.affected_nodes
    assert radius.cascade_depth == 2
