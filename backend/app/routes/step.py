# app/routes/step.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.step import Step
from app.schemas.step import StepCreate, StepResponse
from app.middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/steps", tags=["Steps"])


@router.post("/", response_model=StepResponse, status_code=201)
def create(data: StepCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    step = Step(**data.model_dump())
    db.add(step); db.commit(); db.refresh(step)
    return step


@router.get("/workflow/{workflow_id}", response_model=List[StepResponse])
def get_steps(workflow_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(Step).filter(Step.workflow_id == workflow_id).order_by(Step.step_order).all()


@router.delete("/{step_id}")
def delete(step_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    step = db.query(Step).filter(Step.id == step_id).first()
    if not step: raise HTTPException(status_code=404, detail="Not found")
    db.delete(step); db.commit()
    return {"message": "Deleted"}