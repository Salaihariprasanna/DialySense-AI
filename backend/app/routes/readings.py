import json
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.reading import SensorReading
from app.models.session import DialysisSession
from app.models.patient import Patient
from app.models.risk import RiskPrediction
from app.models.machine import Machine
from app.schemas.reading import SensorReadingCreate, SensorReadingResponse
from app.ai.risk_model import evaluate_dialysis_risk
from app.services.alert_engine import AlertEngine
from app.websocket.manager import ws_manager

router = APIRouter(prefix="/readings", tags=["IoT Readings & Telemetry"])

@router.post("", status_code=status.HTTP_201_CREATED)
async def ingest_iot_reading(payload: SensorReadingCreate, db: Session = Depends(get_db)):
    """
    Core IoT Endpoint:
    1. Validates & receives ESP32 telemetry.
    2. Stores reading in database.
    3. Runs AI risk prediction & persists risk score.
    4. Evaluates and creates smart alerts.
    5. Broadcasts real-time packet via WebSocket.
    """
    # Verify session
    session_obj = db.query(DialysisSession).filter(DialysisSession.id == payload.session_id).first()
    if not session_obj:
        # Create an ad-hoc or fallback session if not existing
        patient = db.query(Patient).filter(Patient.id == payload.patient_id).first()
        if not patient:
            patient = Patient(
                patient_id=f"PAT-{payload.patient_id:03d}",
                name=f"Patient #{payload.patient_id}",
                age=58,
                gender="Male",
                blood_group="O+",
                disease_stage="Stage 5 CKD",
                doctor="Dr. Sarah Jenkins",
                contact="+1-555-0192"
            )
            db.add(patient)
            db.commit()
            db.refresh(patient)
        
        session_obj = DialysisSession(
            session_code=f"SES-LIVE-{payload.session_id:03d}",
            patient_id=patient.id,
            status="ONGOING",
            start_time=datetime.datetime.utcnow()
        )
        db.add(session_obj)
        db.commit()
        db.refresh(session_obj)

    # 1. Save Sensor Reading
    reading = SensorReading(
        session_id=session_obj.id,
        patient_id=session_obj.patient_id,
        timestamp=datetime.datetime.utcnow(),
        heart_rate=payload.heart_rate,
        spo2=payload.spo2,
        temperature=payload.temperature,
        systolic_bp=payload.systolic_bp,
        diastolic_bp=payload.diastolic_bp,
        blood_flow_rate=payload.blood_flow_rate,
        dialysis_pressure=payload.dialysis_pressure,
        machine_temperature=payload.machine_temperature,
        machine_status=payload.machine_status or "RUNNING"
    )
    db.add(reading)
    db.commit()
    db.refresh(reading)

    # Update machine status if attached
    if session_obj.machine_id and payload.machine_status:
        machine = db.query(Machine).filter(Machine.id == session_obj.machine_id).first()
        if machine:
            machine.status = payload.machine_status
            db.commit()

    # 2. Run AI Risk Prediction
    patient = session_obj.patient
    patient_age = patient.age if patient else 55
    risk_res = evaluate_dialysis_risk(
        heart_rate=payload.heart_rate,
        spo2=payload.spo2,
        temperature=payload.temperature,
        systolic_bp=payload.systolic_bp,
        diastolic_bp=payload.diastolic_bp,
        blood_flow_rate=payload.blood_flow_rate,
        dialysis_pressure=payload.dialysis_pressure,
        age=patient_age,
        machine_status=payload.machine_status or "RUNNING"
    )

    risk_rec = RiskPrediction(
        reading_id=reading.id,
        session_id=session_obj.id,
        patient_id=session_obj.patient_id,
        timestamp=datetime.datetime.utcnow(),
        risk_level=risk_res["risk_level"],
        risk_score=risk_res["risk_score"],
        factors=json.dumps(risk_res["factors"]),
        recommendation=risk_res["recommendation"]
    )
    db.add(risk_rec)
    db.commit()
    db.refresh(risk_rec)

    # 3. Evaluate and persist Smart Alerts
    new_alerts = AlertEngine.evaluate_and_create_alerts(db, reading, risk_rec)
    alerts_data = [
        {
            "id": a.id,
            "severity": a.severity,
            "alert_type": a.alert_type,
            "title": a.title,
            "message": a.message,
            "timestamp": a.timestamp.isoformat(),
            "is_acknowledged": a.is_acknowledged
        }
        for a in new_alerts
    ]

    # 4. Broadcast to WebSocket clients
    broadcast_payload = {
        "type": "TELEMETRY_UPDATE",
        "session_id": session_obj.id,
        "patient_id": session_obj.patient_id,
        "patient_name": patient.name if patient else "N/A",
        "timestamp": reading.timestamp.isoformat(),
        "telemetry": {
            "id": reading.id,
            "heart_rate": reading.heart_rate,
            "spo2": reading.spo2,
            "temperature": reading.temperature,
            "systolic_bp": reading.systolic_bp,
            "diastolic_bp": reading.diastolic_bp,
            "blood_flow_rate": reading.blood_flow_rate,
            "dialysis_pressure": reading.dialysis_pressure,
            "machine_temperature": reading.machine_temperature,
            "machine_status": reading.machine_status
        },
        "risk": {
            "risk_level": risk_rec.risk_level,
            "risk_score": risk_rec.risk_score,
            "factors": risk_res["factors"],
            "recommendation": risk_rec.recommendation
        },
        "new_alerts": alerts_data
    }
    await ws_manager.broadcast_session(session_obj.id, broadcast_payload)

    return {
        "status": "success",
        "reading_id": reading.id,
        "risk_level": risk_rec.risk_level,
        "risk_score": risk_rec.risk_score,
        "alerts_triggered": len(new_alerts)
    }

@router.get("/session/{session_id}", response_model=List[SensorReadingResponse])
def get_readings_history(session_id: int, limit: int = 50, db: Session = Depends(get_db)):
    readings = db.query(SensorReading).filter(
        SensorReading.session_id == session_id
    ).order_by(SensorReading.timestamp.desc()).limit(limit).all()
    # Return in chronological order
    return list(reversed(readings))

@router.get("/session/{session_id}/latest")
def get_latest_reading(session_id: int, db: Session = Depends(get_db)):
    reading = db.query(SensorReading).filter(
        SensorReading.session_id == session_id
    ).order_by(SensorReading.timestamp.desc()).first()
    
    if not reading:
        return None
    
    risk = db.query(RiskPrediction).filter(RiskPrediction.reading_id == reading.id).first()
    
    return {
        "reading": reading,
        "risk": {
            "risk_level": risk.risk_level if risk else "LOW",
            "risk_score": risk.risk_score if risk else 10.0,
            "factors": json.loads(risk.factors) if (risk and risk.factors.startswith("[")) else ([risk.factors] if risk else []),
            "recommendation": risk.recommendation if risk else "Normal"
        } if risk else None
    }
