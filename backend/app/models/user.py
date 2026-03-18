# app/models/user.py
from sqlalchemy import Column, Integer, String, Enum, DateTime
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id             = Column(Integer, primary_key=True, index=True)
    name           = Column(String(255), nullable=False)
    email          = Column(String(255), nullable=False, unique=True)
    password       = Column(String(255), nullable=False, default="")
    role           = Column(Enum("employee","manager","hr","admin"), default="employee")
    department     = Column(String(100), nullable=True)
    leave_balance  = Column(Integer, default=20)
    created_at     = Column(DateTime, server_default=func.now())