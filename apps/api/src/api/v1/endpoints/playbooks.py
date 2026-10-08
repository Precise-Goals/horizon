from fastapi import APIRouter, HTTPException
from src.models.playbook import PlaybookDefinition
from src.engine.playbooks.library import DATABASE_FAILOVER, SERVICE_RESTART, CACHE_PURGE, TRAFFIC_REROUTE

router = APIRouter()

playbooks = {
    "database_failover": DATABASE_FAILOVER,
    "service_restart": SERVICE_RESTART,
    "cache_purge": CACHE_PURGE,
    "traffic_reroute": TRAFFIC_REROUTE
}

@router.get("/", response_model=list[PlaybookDefinition])
async def list_playbooks() -> list[PlaybookDefinition]:
    return list(playbooks.values())

@router.get("/{playbook_id}", response_model=PlaybookDefinition)
async def get_playbook(playbook_id: str) -> PlaybookDefinition:
    if playbook_id not in playbooks:
        raise HTTPException(status_code=404, detail="Playbook not found")
    return playbooks[playbook_id]
