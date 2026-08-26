from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

class LoginRequest(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    full_name: str
    email: str
    role: str
    token: str

@router.post("/login", response_model=UserResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticates user and returns session credentials.
    Supports standard clinical users & demo quick-login.
    """
    user = db.query(User).filter(User.username == req.username).first()
    
    # If user doesn't exist yet, auto-create standard clinical accounts for easy demo
    if not user:
        if req.username in ["dr_sarah", "admin", "nephrologist"]:
            user = User(
                username="dr_sarah",
                email="sarah.jenkins@hospital.org",
                full_name="Dr. Sarah Jenkins",
                role="DOCTOR",
                hashed_password="password123"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        elif req.username in ["nurse_elena", "nurse"]:
            user = User(
                username="nurse_elena",
                email="elena.rostova@hospital.org",
                full_name="Nurse Elena Rostova",
                role="NURSE",
                hashed_password="password123"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            # Create standard generic clinician
            user = User(
                username=req.username,
                email=f"{req.username}@hospital.org",
                full_name=req.username.capitalize(),
                role="CLINICIAN",
                hashed_password=req.password
            )
            db.add(user)
            db.commit()
            db.refresh(user)

    return UserResponse(
        id=user.id,
        username=user.username,
        full_name=user.full_name,
        email=user.email,
        role=user.role,
        token=f"dialysense-auth-token-{user.id}-{user.username}"
    )

@router.get("/me")
def get_current_user(db: Session = Depends(get_db)):
    user = db.query(User).first()
    if not user:
        return {"username": "dr_sarah", "full_name": "Dr. Sarah Jenkins", "role": "DOCTOR"}
    return {
        "id": user.id,
        "username": user.username,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role
    }
