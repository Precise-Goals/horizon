import asyncio
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from src.models.recovery import RecoveryPlan, RecoveryJob, ApprovalRequest
from src.engine.state import state

router = APIRouter()

class PlanRequest(BaseModel):
    failed_node_ids: list[str]

class ExecuteRequest(BaseModel):
    plan_id: str
    root_cause_node_id: str
    steps: list

@router.post("/plan", response_model=RecoveryPlan)
async def generate_plan(request: PlanRequest) -> RecoveryPlan:
    return state.planner.generate_plan(request.failed_node_ids)

@router.post("/execute", response_model=RecoveryJob)
async def execute_job(request: ExecuteRequest, background_tasks: BackgroundTasks) -> RecoveryJob:
    job = state.executor.create_job(request.root_cause_node_id, request.steps)
    background_tasks.add_task(state.executor.execute_job, job.job_id)
    return job

@router.get("/jobs", response_model=list[RecoveryJob])
async def list_jobs() -> list[RecoveryJob]:
    return list(state.executor.jobs.values())

@router.get("/jobs/{job_id}", response_model=RecoveryJob)
async def get_job(job_id: str) -> RecoveryJob:
    if job_id not in state.executor.jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    return state.executor.jobs[job_id]

@router.post("/jobs/{job_id}/steps/{step_id}/approve")
async def approve_step(job_id: str, step_id: str, request: ApprovalRequest) -> dict:
    if request.action == "APPROVE":
        state.executor.approve_step(job_id, step_id, request.approver)
    return {"status": "approved"}

@router.post("/jobs/{job_id}/steps/{step_id}/reject")
async def reject_step(job_id: str, step_id: str, request: ApprovalRequest) -> dict:
    if request.action == "REJECT":
        state.executor.reject_step(job_id, step_id, request.reason or "Rejected")
    return {"status": "rejected"}
