# app/schemas/step.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class StepCreate(BaseModel):
    workflow_id: int
    name: str
    step_order: int
    step_type: Optional[str] = "approval"
    assigned_to: Optional[str] = None
    description: Optional[str] = None


class StepResponse(BaseModel):
    id: int
    workflow_id: int
    name: str
    step_order: int
    step_type: str
    assigned_to: Optional[str] = None
    description: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True