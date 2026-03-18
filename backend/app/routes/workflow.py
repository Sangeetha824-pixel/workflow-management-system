# app/routes/workflow.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.workflow import Workflow
from app.schemas.workflow import WorkflowCreate, WorkflowUpdate, WorkflowResponse
from app.middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/workflows", tags=["Workflows"])


@router.get("/", response_model=List[WorkflowResponse])
def get_all(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(Workflow).order_by(Workflow.created_at.desc()).all()


@router.post("/", response_model=WorkflowResponse, status_code=201)
def create(data: WorkflowCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    wf = Workflow(**data.model_dump())
    db.add(wf); db.commit(); db.refresh(wf)
    return wf


@router.get("/{workflow_id}", response_model=WorkflowResponse)
def get_one(workflow_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    wf = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if not wf: raise HTTPException(status_code=404, detail="Not found")
    return wf


@router.put("/{workflow_id}", response_model=WorkflowResponse)
def update(workflow_id: int, data: WorkflowUpdate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    wf = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if not wf: raise HTTPException(status_code=404, detail="Not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(wf, k, v)
    db.commit(); db.refresh(wf)
    return wf


@router.delete("/{workflow_id}")
def delete(workflow_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    wf = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if not wf: raise HTTPException(status_code=404, detail="Not found")
    db.delete(wf); db.commit()
    return {"message": "Deleted"}