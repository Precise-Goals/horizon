import uuid
import asyncio
from datetime import datetime, timezone
import structlog
from src.models.recovery import RecoveryJob, RecoveryStepState, RecoveryStatus

logger = structlog.get_logger()

class PlaybookExecutor:
    def __init__(self) -> None:
        self.jobs: dict[str, RecoveryJob] = {}
        self._events: dict[str, asyncio.Event] = {}

    def create_job(self, root_cause_node_id: str, steps: list) -> RecoveryJob:
        job_id = str(uuid.uuid4())
        job = RecoveryJob(
            job_id=job_id,
            root_cause_node_id=root_cause_node_id,
            ordered_steps=[
                RecoveryStepState(step=step, status=RecoveryStatus.PENDING) for step in steps
            ],
            status=RecoveryStatus.PENDING
        )
        self.jobs[job_id] = job
        return job

    async def execute_job(self, job_id: str) -> None:
        job = self.jobs.get(job_id)
        if not job:
            return
            
        job.status = RecoveryStatus.RUNNING
        job.start_time = datetime.now(timezone.utc)
        
        for step_state in job.ordered_steps:
            step_state.status = RecoveryStatus.RUNNING
            step_state.start_time = datetime.now(timezone.utc)
            
            if step_state.step.is_high_risk:
                step_state.status = RecoveryStatus.PAUSED_APPROVAL
                job.status = RecoveryStatus.PAUSED_APPROVAL
                logger.info("job_paused_for_approval", job_id=job_id, step_id=step_state.step.step_id)
                
                event = asyncio.Event()
                self._events[f"{job_id}_{step_state.step.step_id}"] = event
                await event.wait()
                
                if step_state.status == RecoveryStatus.FAILED:
                    # Rejected
                    job.status = RecoveryStatus.FAILED
                    job.end_time = datetime.now(timezone.utc)
                    return
                
                step_state.status = RecoveryStatus.RUNNING
                job.status = RecoveryStatus.RUNNING

            # Simulate step execution
            await asyncio.sleep(0.1)
            step_state.status = RecoveryStatus.COMPLETED
            step_state.end_time = datetime.now(timezone.utc)
            step_state.logs.append("Executed successfully")

        job.status = RecoveryStatus.COMPLETED
        job.end_time = datetime.now(timezone.utc)

    def approve_step(self, job_id: str, step_id: str, approver: str) -> None:
        key = f"{job_id}_{step_id}"
        if key in self._events:
            job = self.jobs[job_id]
            for step in job.ordered_steps:
                if step.step.step_id == step_id:
                    step.logs.append(f"Approved by {approver}")
                    break
            self._events[key].set()
            del self._events[key]

    def reject_step(self, job_id: str, step_id: str, reason: str) -> None:
        key = f"{job_id}_{step_id}"
        if key in self._events:
            job = self.jobs[job_id]
            for step in job.ordered_steps:
                if step.step.step_id == step_id:
                    step.status = RecoveryStatus.FAILED
                    step.logs.append(f"Rejected: {reason}")
                    break
            self._events[key].set()
            del self._events[key]
