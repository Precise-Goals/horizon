import uuid
from src.models.playbook import PlaybookDefinition, PlaybookStep, PlaybookAction
from src.models.node import NodeResponse, NodeType

DATABASE_FAILOVER = PlaybookDefinition(
    playbook_id="database_failover",
    name="Database Failover",
    description="Promote read replica and switch connection pool",
    steps=[
        PlaybookStep(step_id="step1", name="Promote Replica", action=PlaybookAction.FAILOVER, target_node_id="", is_high_risk=True, timeout_seconds=300),
        PlaybookStep(step_id="step2", name="Update DNS/Pool", action=PlaybookAction.DNS_UPDATE, target_node_id="", is_high_risk=True, timeout_seconds=120)
    ]
)

SERVICE_RESTART = PlaybookDefinition(
    playbook_id="service_restart",
    name="Service Restart",
    description="Graceful restart with post-check",
    steps=[
        PlaybookStep(step_id="step1", name="Restart Service", action=PlaybookAction.RESTART, target_node_id="", is_high_risk=False, timeout_seconds=60)
    ]
)

CACHE_PURGE = PlaybookDefinition(
    playbook_id="cache_purge",
    name="Cache Purge",
    description="Flush keys and reconnect",
    steps=[
        PlaybookStep(step_id="step1", name="Purge Keys", action=PlaybookAction.CACHE_PURGE, target_node_id="", is_high_risk=False, timeout_seconds=30)
    ]
)

TRAFFIC_REROUTE = PlaybookDefinition(
    playbook_id="traffic_reroute",
    name="Traffic Reroute",
    description="Reroute traffic to standby region",
    steps=[
        PlaybookStep(step_id="step1", name="Reroute DNS", action=PlaybookAction.DNS_UPDATE, target_node_id="", is_high_risk=True, timeout_seconds=60)
    ]
)

def get_playbook_for_node(node: NodeResponse) -> PlaybookDefinition | None:
    if node.node_type == NodeType.DATABASE:
        return DATABASE_FAILOVER
    elif node.node_type == NodeType.CACHE:
        return CACHE_PURGE
    elif node.node_type == NodeType.GATEWAY:
        return TRAFFIC_REROUTE
    elif node.node_type == NodeType.APPLICATION:
        return SERVICE_RESTART
    return SERVICE_RESTART
