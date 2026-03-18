# app/routes/user.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse
from app.middleware.auth_middleware import get_current_user, require_admin_or_hr, require_admin

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/", response_model=List[UserResponse])
def get_all(db: Session = Depends(get_db), _=Depends(require_admin_or_hr)):
    return db.query(User).all()


@router.get("/role/{role}", response_model=List[UserResponse])
def get_by_role(role: str, db: Session = Depends(get_db), _=Depends(require_admin_or_hr)):
    return db.query(User).filter(User.role == role).all()


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/{user_id}", response_model=UserResponse)
def get_one(user_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user: raise HTTPException(status_code=404, detail="Not found")
    return user


@router.put("/{user_id}", response_model=UserResponse)
def update(user_id: int, payload: dict, db: Session = Depends(get_db), _=Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user: raise HTTPException(status_code=404, detail="Not found")
    for k, v in payload.items():
        if hasattr(user, k) and k not in ["id","password","created_at"]:
            setattr(user, k, v)
    db.commit(); db.refresh(user)
    return user


@router.delete("/{user_id}")
def delete(user_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user: raise HTTPException(status_code=404, detail="Not found")
    db.delete(user); db.commit()
    return {"message": "Deleted"}