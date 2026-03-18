# app/models/step.py
from sqlalchemy import Column, Integer, String, Text, Enum, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Step(Base):
    __tablename__ = "steps"

    id          = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(Integer, ForeignKey("workflows.id"), nullable=False)
    name        = Column(String(255), nullable=False)
    step_order  = Column(Integer, nullable=False)
    step_type   = Column(Enum("approval","notification","condition","action"), default="approval")
    assigned_to = Column(Enum("employee","manager","hr","admin"), nullable=True)
    description = Column(Text, nullable=True)
    created_at  = Column(DateTime, server_default=func.now())

    workflow = relationship("Workflow", back_populates="steps")
    rules    = relationship("Rule", back_populates="step", cascade="all, delete")
    logs     = relationship("ExecutionLog", back_populates="step")