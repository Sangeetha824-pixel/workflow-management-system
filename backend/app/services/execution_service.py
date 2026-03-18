# app/services/execution_service.py
from sqlalchemy.orm import Session
from app.models.execution import Execution
from app.models.workflow import Workflow
from app.schemas.execution import ExecutionCreate, ExecutionStatusUpdate
from datetime import datetime

APPROVAL_CATEGORIES = ["leave", "expense", "fund"]

def needs_approval(db: Session, workflow_id: int) -> bool:
    wf = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if not wf:
        return False
    cat  = (wf.category or "").lower()
    name = (wf.name or "").lower()
    return any(c in cat or c in name for c in APPROVAL_CATEGORIES)

def run_workflow(db: Session, payload: ExecutionCreate):
    wf = db.query(Workflow).filter(Workflow.id == payload.workflow_id).first()
    print(f"DEBUG: workflow_id={payload.workflow_id}, found={wf}")
    if not wf:
        return None
    execution = Execution(
        workflow_id  = payload.workflow_id,
        triggered_by = payload.triggered_by,
        input_data   = payload.input_data,
        status       = "pending" if needs_approval(db, payload.workflow_id) else "running"
    )
    db.add(execution)
    db.commit()
    db.refresh(execution)
    return execution

def get_all_executions(db: Session):
    return db.query(Execution).order_by(Execution.started_at.desc()).all()

def get_executions(db: Session, workflow_id: int):
    return db.query(Execution).filter(
        Execution.workflow_id == workflow_id
    ).order_by(Execution.started_at.desc()).all()

def get_execution(db: Session, execution_id: int):
    return db.query(Execution).filter(Execution.id == execution_id).first()

def update_execution_status(db: Session, execution_id: int, payload: ExecutionStatusUpdate):
    ex = db.query(Execution).filter(Execution.id == execution_id).first()
    if not ex:
        return None
    ex.status = payload.status
    if payload.result:
        ex.result = payload.result
    if payload.status in ["approved","rejected","completed","failed"]:
        ex.completed_at = datetime.utcnow()
    db.commit()
    db.refresh(ex)
    return ex