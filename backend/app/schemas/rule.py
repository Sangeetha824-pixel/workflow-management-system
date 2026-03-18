# app/schemas/rule.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class RuleCreate(BaseModel):
    step_id: int
    field: str
    operator: str = "="
    value: Optional[str] = None
    next_step_order: Optional[int] = None


class RuleResponse(BaseModel):
    id: int
    step_id: int
    field: str
    operator: str
    value: Optional[str] = None
    next_step_order: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True