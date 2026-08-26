import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.alert import Alert
from app.schemas.alert import AlertResponse, AlertAcknowledge

router = APIRouter(prefix="/alerts", tags=["Smart Alerts"])

@router.get("", response_model=List[AlertResponse])
def get_alerts(
    session_id: Optional[int] = None,
    severity: Optional[str] = None,
    unacknowledged_only: bool = False,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(Alert)
    if session_id:
        query = query.filter(Alert.session_id == session_id)
    if severity:
        query = query.filter(Alert.severity == severity.upper())
    if unacknowledged_only:
        query = query.filter(Alert.is_acknowledged == False)
    
    return query.order_by(Alert.timestamp.desc()).limit(limit).all()

@router.get("/session/{session_id}", response_model=List[AlertResponse])
def get_alerts_by_session(session_id: int, db: Session = Depends(get_db)):
    return db.query(Alert).filter(Alert.session_id == session_id).order_by(Alert.timestamp.desc()).limit(50).all()

@router.put("/{id}/acknowledge", response_model=AlertResponse)
def acknowledge_alert(id: int, payload: AlertAcknowledge, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == id).first()
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert {id} not found")

    alert.is_acknowledged = True
    alert.acknowledged_at = datetime.datetime.utcnow()
    alert.acknowledged_by = payload.acknowledged_by

    db.commit()
    db.refresh(alert)
    return alert

@router.post("/acknowledge-all")
def acknowledge_all_alerts(db: Session = Depends(get_db)):
    db.query(Alert).filter(Alert.is_acknowledged == False).update({
        "is_acknowledged": True,
        "acknowledged_at": datetime.datetime.utcnow(),
        "acknowledged_by": "Clinical Staff"
    })
    db.commit()
    return {"status": "success", "message": "All alerts acknowledged"}
