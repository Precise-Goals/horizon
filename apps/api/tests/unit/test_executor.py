import pytest
import asyncio
from src.engine.executor import PlaybookExecutor
from src.models.playbook import PlaybookStep, PlaybookAction
from src.models.recovery import RecoveryStatus

@pytest.mark.asyncio
async def test_executor_approval():
    executor = PlaybookExecutor()
    steps = [
        PlaybookStep(step_id="1", name="step1", action=PlaybookAction.RESTART, target_node_id="db", is_high_risk=True, timeout_seconds=60)
    ]
    job = executor.create_job("db", steps)
    
    task = asyncio.create_task(executor.execute_job(job.job_id))
    
    # Wait for pause
    await asyncio.sleep(0.1)
    assert job.status == RecoveryStatus.PAUSED_APPROVAL
    
    executor.approve_step(job.job_id, "1", "admin")
    await task
    
    assert job.status == RecoveryStatus.COMPLETED
