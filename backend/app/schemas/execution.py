# app/schemas/execution.py
from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime


class ExecutionCreate(BaseModel):
    workflow_id: int
    triggered_by: Optional[int] = None
    input_data: Optional[Any] = None


class ExecutionStatusUpdate(BaseModel):
    status: str
    result: Optional[str] = None


class ExecutionResponse(BaseModel):
    id: int
    workflow_id: int
    triggered_by: Optional[int] = None
    input_data: Optional[Any] = None
    status: str
    result: Optional[str] = None
    ai_used: bool = False
    ai_response: Optional[str] = None
    started_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True