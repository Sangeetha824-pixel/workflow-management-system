# app/models/workflow.py
from sqlalchemy import Column, Integer, String, Text, Enum, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Workflow(Base):
    __tablename__ = "workflows"

    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String(255), nullable=False)
    description = Column(Text)
    category    = Column(String(100))
    status      = Column(Enum("active","inactive"), default="active")
    created_by  = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at  = Column(DateTime, server_default=func.now())
    updated_at  = Column(DateTime, server_default=func.now(), onupdate=func.now())

    steps      = relationship("Step",      back_populates="workflow", cascade="all, delete")
    executions = relationship("Execution", back_populates="workflow", cascade="all, delete")