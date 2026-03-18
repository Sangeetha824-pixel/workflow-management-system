# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer

from app.routes.auth import router as auth_router
from app.routes.workflow import router as workflow_router
from app.routes.user import router as user_router
from app.routes.stats import router as stats_router
from app.routes.execution import router as execution_router

from app.database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FlowMate - Workflow Management System",
    version="0.1.0",
    swagger_ui_parameters={"persistAuthorization": True},
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(workflow_router)
app.include_router(user_router)
app.include_router(stats_router)
app.include_router(execution_router)

@app.get("/")
def root():
    return {"status": "FlowMate backend is running!"}