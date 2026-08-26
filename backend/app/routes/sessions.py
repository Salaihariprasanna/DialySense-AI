import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models.session import DialysisSession
from app.models.patient import Patient
from app.models.machine import Machine
from app.schemas.session import DialysisSessionCreate, DialysisSessionUpdate, DialysisSessionResponse

router = APIRouter(prefix="/sessions", tags=["Dialysis Sessions"])

@router.get("", response_model=List[DialysisSessionResponse])
def get_all_sessions(status_filter: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(DialysisSession).options(
        joinedload(DialysisSession.patient),
        joinedload(DialysisSession.machine)
    )
    if status_filter:
        query = query.filter(DialysisSession.status == status_filter.upper())
    return query.order_by(DialysisSession.start_time.desc()).all()

@router.get("/active/current", response_model=Optional[DialysisSessionResponse])
def get_current_active_session(db: Session = Depends(get_db)):
    session = db.query(DialysisSession).options(
        joinedload(DialysisSession.patient),
        joinedload(DialysisSession.machine)
    ).filter(DialysisSession.status == "ONGOING").order_by(DialysisSession.start_time.desc()).first()
    
    if not session:
        # Fallback to latest scheduled or any session
        session = db.query(DialysisSession).options(
            joinedload(DialysisSession.patient),
            joinedload(DialysisSession.machine)
        ).order_by(DialysisSession.id.desc()).first()
    
    return session

@router.post("", response_model=DialysisSessionResponse, status_code=status.HTTP_201_CREATED)
def create_session(payload: DialysisSessionCreate, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == payload.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient {payload.patient_id} not found")

    session_code = payload.session_code
    if not session_code:
        count = db.query(DialysisSession).count() + 1
        date_str = datetime.datetime.utcnow().strftime("%Y%m")
        session_code = f"SES-{date_str}-{count:03d}"

    session = DialysisSession(
        session_code=session_code,
        patient_id=payload.patient_id,
        machine_id=payload.machine_id,
        status=payload.status or "SCHEDULED",
        target_duration_mins=payload.target_duration_mins,
        target_uf_volume_ml=payload.target_uf_volume_ml,
        prescribed_dialysate_temp=payload.prescribed_dialysate_temp,
        prescribed_blood_flow=payload.prescribed_blood_flow,
        notes=payload.notes,
        start_time=datetime.datetime.utcnow()
    )
    db.add(session)

    # If machine assigned and session ongoing, update machine status
    if payload.machine_id and session.status == "ONGOING":
        machine = db.query(Machine).filter(Machine.id == payload.machine_id).first()
        if machine:
            machine.status = "RUNNING"

    db.commit()
    db.refresh(session)
    return session

@router.get("/{id}", response_model=DialysisSessionResponse)
def get_session_by_id(id: int, db: Session = Depends(get_db)):
    session = db.query(DialysisSession).options(
        joinedload(DialysisSession.patient),
        joinedload(DialysisSession.machine)
    ).filter(DialysisSession.id == id).first()
    if not session:
        raise HTTPException(status_code=404, detail=f"Session with ID {id} not found")
    return session

@router.put("/{id}", response_model=DialysisSessionResponse)
def update_session(id: int, payload: DialysisSessionUpdate, db: Session = Depends(get_db)):
    session = db.query(DialysisSession).filter(DialysisSession.id == id).first()
    if not session:
        raise HTTPException(status_code=404, detail=f"Session with ID {id} not found")

    update_data = payload.model_dump(exclude_unset=True)
    
    if "status" in update_data and update_data["status"] == "COMPLETED" and not session.end_time:
        session.end_time = datetime.datetime.utcnow()
        if session.start_time:
            delta = session.end_time - session.start_time
            session.actual_duration_mins = int(delta.total_seconds() / 60)
        
        # Free the machine
        if session.machine_id:
            machine = db.query(Machine).filter(Machine.id == session.machine_id).first()
            if machine:
                machine.status = "AVAILABLE"

    for field, value in update_data.items():
        setattr(session, field, value)

    db.commit()
    db.refresh(session)
    return session
