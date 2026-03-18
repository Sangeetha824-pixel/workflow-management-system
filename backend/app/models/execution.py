# app/models/execution.py
from sqlalchemy import Column, Integer, String, Text, Enum, JSON, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Execution(Base):
    __tablename__ = "executions"

    id           = Column(Integer, primary_key=True, index=True)
    workflow_id  = Column(Integer, ForeignKey("workflows.id"), nullable=False)
    triggered_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    input_data   = Column(JSON)
    status       = Column(Enum("pending","running","completed","failed","approved","rejected"), default="pending")
    result       = Column(String(255), nullable=True)
    ai_used      = Column(Boolean, default=False)
    ai_response  = Column(Text, nullable=True)
    started_at   = Column(DateTime, server_default=func.now())
    completed_at = Column(DateTime, nullable=True)

    workflow = relationship("Workflow", back_populates="executions")
    logs     = relationship("ExecutionLog", back_populates="execution", cascade="all, delete")


class ExecutionLog(Base):
    __tablename__ = "execution_logs"

    id            = Column(Integer, primary_key=True, index=True)
    execution_id  = Column(Integer, ForeignKey("executions.id"), nullable=False)
    step_id       = Column(Integer, ForeignKey("steps.id"), nullable=False)
    step_order    = Column(Integer, nullable=False)
    status        = Column(Enum("success","failed","skipped"), default="success")
    output_data   = Column(JSON, nullable=True)
    error_message = Column(Text, nullable=True)
    executed_at   = Column(DateTime, server_default=func.now())

    execution = relationship("Execution", back_populates="logs")
    step      = relationship("Step", back_populates="logs")