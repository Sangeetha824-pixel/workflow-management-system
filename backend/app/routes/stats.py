# app/routes/stats.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.workflow import Workflow
from app.models.execution import Execution
from app.models.rule import Rule
from app.middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/stats", tags=["Stats"])


@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db), _=Depends(get_current_user)):
    total_wf   = db.query(func.count(Workflow.id)).scalar() or 0
    active_wf  = db.query(func.count(Workflow.id)).filter(Workflow.status=="active").scalar() or 0
    total_exec = db.query(func.count(Execution.id)).scalar() or 0
    completed  = db.query(func.count(Execution.id)).filter(Execution.status.in_(["completed","approved"])).scalar() or 0
    pending    = db.query(func.count(Execution.id)).filter(Execution.status.in_(["pending","running"])).scalar() or 0
    rules      = db.query(func.count(Rule.id)).scalar() or 0

    recent_wf = db.query(Workflow).order_by(Workflow.created_at.desc()).limit(5).all()
    recent_ex = db.query(Execution).order_by(Execution.started_at.desc()).limit(6).all()

    return {
        "stats": {
            "total_workflows": total_wf, "active_workflows": active_wf,
            "total_executions": total_exec, "completed": completed,
            "pending": pending, "rules": rules,
        },
        "recent_workflows":  [{"id":w.id,"name":w.name,"category":w.category,"status":w.status,"created_at":str(w.created_at)} for w in recent_wf],
        "recent_executions": [{"id":e.id,"workflow_id":e.workflow_id,"status":e.status,"result":e.result,"started_at":str(e.started_at)} for e in recent_ex],
    }