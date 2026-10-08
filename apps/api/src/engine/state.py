from src.engine.dependency_graph import DependencyGraph
from src.engine.detector import FailureDetector
from src.engine.planner import RecoveryPlanner
from src.engine.executor import PlaybookExecutor
from src.engine.audit import AuditLogger
from src.models.node import NodeType

class SystemState:
    def __init__(self) -> None:
        self.graph = DependencyGraph()
        self.detector = FailureDetector()
        self.planner = RecoveryPlanner(self.graph)
        self.executor = PlaybookExecutor()
        self.audit = AuditLogger()
        self._initialize_seed_data()

    def _initialize_seed_data(self) -> None:
        self.graph.add_node("db-primary", {"name": "PostgreSQL Primary", "node_type": NodeType.DATABASE})
        self.graph.add_node("db-replica", {"name": "PostgreSQL Replica", "node_type": NodeType.DATABASE})
        self.graph.add_node("redis-cache", {"name": "Redis Cache", "node_type": NodeType.CACHE})
        self.graph.add_node("auth-service", {"name": "Auth Service", "node_type": NodeType.APPLICATION})
        self.graph.add_node("api-gateway", {"name": "API Gateway", "node_type": NodeType.GATEWAY})
        self.graph.add_node("web-frontend", {"name": "Horizon Web UI", "node_type": NodeType.APPLICATION})
        self.graph.add_node("payment-service", {"name": "Payment Service", "node_type": NodeType.APPLICATION})

        self.graph.add_dependency("db-replica", "db-primary")
        self.graph.add_dependency("redis-cache", "db-primary")
        self.graph.add_dependency("auth-service", "db-primary")
        self.graph.add_dependency("auth-service", "redis-cache")
        self.graph.add_dependency("api-gateway", "auth-service")
        self.graph.add_dependency("api-gateway", "redis-cache")
        self.graph.add_dependency("web-frontend", "api-gateway")
        self.graph.add_dependency("payment-service", "db-primary")
        self.graph.add_dependency("payment-service", "auth-service")

state = SystemState()
