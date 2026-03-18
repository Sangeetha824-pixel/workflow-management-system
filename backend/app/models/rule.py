# app/models/rule.py
from sqlalchemy import Column, Integer, String, Enum, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Rule(Base):
    __tablename__ = "rules"

    id             = Column(Integer, primary_key=True, index=True)
    step_id        = Column(Integer, ForeignKey("steps.id"), nullable=False)
    field          = Column(String(255), nullable=False)
    operator       = Column(Enum("=","!=",">","<",">=","<=","contains"), default="=")
    value          = Column(String(255), nullable=True)
    next_step_order= Column(Integer, nullable=True)
    created_at     = Column(DateTime, server_default=func.now())

    step = relationship("Step", back_populates="rules")