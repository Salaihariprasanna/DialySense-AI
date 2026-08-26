import asyncio
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db, SessionLocal
from app.services.simulator import simulator
from app.routes.readings import ingest_iot_reading
from app.schemas.reading import SensorReadingCreate
from app.models.session import DialysisSession

router = APIRouter(prefix="/simulation", tags=["IoT Simulation & Demo Mode"])

# Global background worker state
simulation_worker_task = None
simulation_running = False

class ModeChangeRequest(BaseModel):
    mode: str # NORMAL, RISK, MACHINE_ERROR, ERROR
    session_id: Optional[int] = None
    patient_id: Optional[int] = None

class SimulationControlRequest(BaseModel):
    action: str # start, stop, tick
    interval_seconds: Optional[float] = 3.0
    session_id: Optional[int] = None

async def background_simulation_loop(interval: float = 3.0):
    global simulation_running
    while simulation_running:
        try:
            db = SessionLocal()
            try:
                # Find active session or default to 1
                active_session = db.query(DialysisSession).filter(
                    DialysisSession.status == "ONGOING"
                ).order_by(DialysisSession.start_time.desc()).first()
                
                sid = active_session.id if active_session else simulator.session_id
                pid = active_session.patient_id if active_session else simulator.patient_id

                reading_data = simulator.generate_reading(session_id=sid, patient_id=pid)
                reading_create = SensorReadingCreate(
                    patient_id=reading_data["patient_id"],
                    session_id=reading_data["session_id"],
                    heart_rate=reading_data["heart_rate"],
                    spo2=reading_data["spo2"],
                    temperature=reading_data["temperature"],
                    systolic_bp=reading_data["systolic_bp"],
                    diastolic_bp=reading_data["diastolic_bp"],
                    blood_flow_rate=reading_data["blood_flow_rate"],
                    dialysis_pressure=reading_data["dialysis_pressure"],
                    machine_temperature=reading_data["machine_temperature"],
                    machine_status=reading_data["machine_status"]
                )
                await ingest_iot_reading(reading_create, db)
            finally:
                db.close()
        except Exception as e:
            print(f"Error in background simulator loop: {e}")
        
        await asyncio.sleep(interval)

@router.post("/mode")
def set_simulation_mode(payload: ModeChangeRequest):
    success = simulator.set_mode(payload.mode)
    if not success:
        raise HTTPException(status_code=400, detail="Invalid mode. Choose NORMAL, RISK, or MACHINE_ERROR")
    if payload.session_id:
        simulator.session_id = payload.session_id
    if payload.patient_id:
        simulator.patient_id = payload.patient_id

    return {
        "status": "success",
        "current_mode": simulator.current_mode,
        "session_id": simulator.session_id,
        "patient_id": simulator.patient_id
    }

@router.post("/tick")
async def trigger_simulation_tick(
    session_id: Optional[int] = None,
    patient_id: Optional[int] = None,
    mode: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Manually triggers one single IoT reading step (useful for immediate demo transitions).
    """
    sid = session_id or simulator.session_id
    pid = patient_id or simulator.patient_id
    reading_data = simulator.generate_reading(session_id=sid, patient_id=pid, mode_override=mode)
    
    reading_create = SensorReadingCreate(
        patient_id=reading_data["patient_id"],
        session_id=reading_data["session_id"],
        heart_rate=reading_data["heart_rate"],
        spo2=reading_data["spo2"],
        temperature=reading_data["temperature"],
        systolic_bp=reading_data["systolic_bp"],
        diastolic_bp=reading_data["diastolic_bp"],
        blood_flow_rate=reading_data["blood_flow_rate"],
        dialysis_pressure=reading_data["dialysis_pressure"],
        machine_temperature=reading_data["machine_temperature"],
        machine_status=reading_data["machine_status"]
    )
    result = await ingest_iot_reading(reading_create, db)
    return {
        "status": "tick_processed",
        "mode": mode or simulator.current_mode,
        "telemetry": reading_data,
        "result": result
    }

@router.post("/control")
async def control_simulator(payload: SimulationControlRequest):
    global simulation_running, simulation_worker_task

    if payload.action == "start":
        if not simulation_running:
            simulation_running = True
            simulation_worker_task = asyncio.create_task(background_simulation_loop(payload.interval_seconds or 3.0))
        return {"status": "started", "interval": payload.interval_seconds, "mode": simulator.current_mode}

    elif payload.action == "stop":
        simulation_running = False
        if simulation_worker_task:
            simulation_worker_task.cancel()
            simulation_worker_task = None
        return {"status": "stopped", "mode": simulator.current_mode}

    else:
        raise HTTPException(status_code=400, detail="Action must be 'start' or 'stop'")

@router.get("/status")
def get_simulation_status():
    return {
        "is_running": simulation_running,
        "current_mode": simulator.current_mode,
        "session_id": simulator.session_id,
        "patient_id": simulator.patient_id,
        "tick_count": simulator.tick_count
    }
