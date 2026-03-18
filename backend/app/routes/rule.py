# app/routes/rule.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.rule import Rule
from app.schemas.rule import RuleCreate, RuleResponse
from app.middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/rules", tags=["Rules"])


@router.post("/", response_model=RuleResponse, status_code=201)
def create(data: RuleCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    rule = Rule(**data.model_dump())
    db.add(rule); db.commit(); db.refresh(rule)
    return rule


@router.get("/step/{step_id}", response_model=List[RuleResponse])
def get_rules(step_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(Rule).filter(Rule.step_id == step_id).all()


@router.delete("/{rule_id}")
def delete(rule_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    rule = db.query(Rule).filter(Rule.id == rule_id).first()
    if not rule: raise HTTPException(status_code=404, detail="Not found")
    db.delete(rule); db.commit()
    return {"message": "Deleted"}