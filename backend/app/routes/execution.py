# app/routes/execution.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.execution import ExecutionCreate, ExecutionResponse, ExecutionStatusUpdate
from app.services import execution_service
from app.middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/executions", tags=["Executions"])

VALID_STATUSES = ["pending","running","completed","failed","approved","rejected"]


@router.post("/run", response_model=ExecutionResponse)
def run(data: ExecutionCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    result = execution_service.run_workflow(db, data)
    if not result: raise HTTPException(status_code=404, detail="Workflow not found")
    return result


@router.get("/", response_model=List[ExecutionResponse])
def get_all(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return execution_service.get_all_executions(db)


@router.get("/workflow/{workflow_id}", response_model=List[ExecutionResponse])
def get_by_workflow(workflow_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    return execution_service.get_executions(db, workflow_id)


@router.get("/{execution_id}", response_model=ExecutionResponse)
def get_one(execution_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    ex = execution_service.get_execution(db, execution_id)
    if not ex: raise HTTPException(status_code=404, detail="Not found")
    return ex


@router.patch("/{execution_id}/status", response_model=ExecutionResponse)
def update_status(execution_id: int, data: ExecutionStatusUpdate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    if data.status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status. Use: {', '.join(VALID_STATUSES)}")
    ex = execution_service.update_execution_status(db, execution_id, data)
    if not ex: raise HTTPException(status_code=404, detail="Not found")
    return ex