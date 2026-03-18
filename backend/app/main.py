# app/main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import create_tables
from app.routes.auth      import router as auth_router
from app.routes.workflow  import router as workflow_router
from app.routes.step      import router as step_router
from app.routes.rule      import router as rule_router
from app.routes.execution import router as execution_router
from app.routes.user      import router as user_router
from app.routes.stats     import router as stats_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    yield


app = FastAPI(
    title="Workflow Automation API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router,      prefix="/auth",       tags=["Auth"])
app.include_router(workflow_router,  prefix="/workflows",  tags=["Workflows"])
app.include_router(step_router,      prefix="/steps",      tags=["Steps"])
app.include_router(rule_router,      prefix="/rules",      tags=["Rules"])
app.include_router(execution_router, prefix="/executions", tags=["Executions"])
app.include_router(user_router,      prefix="/users",      tags=["Users"])
app.include_router(stats_router,     prefix="/stats",      tags=["Stats"])


@app.get("/")
def root():
    return {"message": "Workflow Automation API is running"}