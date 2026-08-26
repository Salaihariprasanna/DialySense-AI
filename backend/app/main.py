import logging
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.config import settings
from app.database import Base, engine, SessionLocal, get_db
import app.models # registers models
from app.models.patient import Patient
from app.models.machine import Machine
from app.models.session import DialysisSession
from app.routes import (
    patients_router,
    machines_router,
    sessions_router,
    readings_router,
    alerts_router,
    reports_router,
    simulation_router
)
from app.websocket.manager import ws_manager
from app.ai.risk_model import get_or_load_model

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("dialysense")

def seed_initial_data(db: Session):
    """Seed initial clinical test patients, machines, and sessions if empty."""
    try:
        if db.query(Patient).count() == 0:
            logger.info("Seeding initial clinical patient records...")
            p1 = Patient(
                patient_id="PAT-101",
                name="John Doe",
                age=58,
                gender="Male",
                blood_group="O+",
                disease_stage="Stage 5 CKD (ESRD)",
                doctor="Dr. Sarah Jenkins",
                contact="+1 (555) 234-5678",
                emergency_contact="+1 (555) 234-9999",
                notes="Diabetic nephropathy. Left arm AV fistula. Ultrafiltration target 2.5L."
            )
            p2 = Patient(
                patient_id="PAT-102",
                name="Eleanor Vance",
                age=64,
                gender="Female",
                blood_group="A+",
                disease_stage="Chronic Renal Failure",
                doctor="Dr. Michael Chang",
                contact="+1 (555) 876-5432",
                emergency_contact="+1 (555) 876-0000",
                notes="Hypertensive nephrosclerosis. Right jugular catheter."
            )
            p3 = Patient(
                patient_id="PAT-103",
                name="Robert Martinez",
                age=49,
                gender="Male",
                blood_group="B+",
                disease_stage="Stage 4 CKD",
                doctor="Dr. Sarah Jenkins",
                contact="+1 (555) 345-6789",
                emergency_contact="+1 (555) 345-1111",
                notes="Polycystic kidney disease."
            )
            db.add_all([p1, p2, p3])
            db.commit()

            logger.info("Seeding dialysis machine inventory...")
            m1 = Machine(
                machine_code="DIALY-01",
                model="DialySense Pro-5000",
                serial_number="DSP-2026-001",
                status="RUNNING",
                location="Ward A - Bed 1",
                ip_address="192.168.1.101"
            )
            m2 = Machine(
                machine_code="DIALY-02",
                model="DialySense Pro-5000",
                serial_number="DSP-2026-002",
                status="AVAILABLE",
                location="Ward A - Bed 2",
                ip_address="192.168.1.102"
            )
            m3 = Machine(
                machine_code="DIALY-03",
                model="DialySense Ultra-X",
                serial_number="DSX-2026-003",
                status="AVAILABLE",
                location="Ward B - Bed 1",
                ip_address="192.168.1.103"
            )
            db.add_all([m1, m2, m3])
            db.commit()

            logger.info("Seeding active dialysis session...")
            s1 = DialysisSession(
                session_code="SES-202603-001",
                patient_id=p1.id,
                machine_id=m1.id,
                status="ONGOING",
                target_duration_mins=240,
                target_uf_volume_ml=2500.0,
                prescribed_dialysate_temp=36.5,
                prescribed_blood_flow=300.0,
                notes="Standard 4-hour hemodialysis. Monitor for post-dialytic fatigue."
            )
            s2 = DialysisSession(
                session_code="SES-202603-002",
                patient_id=p2.id,
                machine_id=m2.id,
                status="SCHEDULED",
                target_duration_mins=210,
                target_uf_volume_ml=2000.0,
                prescribed_dialysate_temp=36.5,
                prescribed_blood_flow=280.0,
                notes="Scheduled for 14:00."
            )
            db.add_all([s1, s2])
            db.commit()
            logger.info("Database seeding complete.")
    except Exception as e:
        logger.error(f"Error during seeding: {e}")
        db.rollback()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schemas
    logger.info("Creating database tables if not exist...")
    Base.metadata.create_all(bind=engine)
    
    # Seed data
    db = SessionLocal()
    try:
        seed_initial_data(db)
    finally:
        db.close()

    # Pre-load AI Model
    get_or_load_model()

    logger.info("DialySense AI backend initialized successfully.")
    yield
    logger.info("DialySense AI backend shutting down.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Real-Time IoT Dialysis Monitoring, AI Risk Prediction & Smart Alert System",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount REST API Routers
app.include_router(patients_router, prefix=settings.API_PREFIX)
app.include_router(machines_router, prefix=settings.API_PREFIX)
app.include_router(sessions_router, prefix=settings.API_PREFIX)
app.include_router(readings_router, prefix=settings.API_PREFIX)
app.include_router(alerts_router, prefix=settings.API_PREFIX)
app.include_router(reports_router, prefix=settings.API_PREFIX)
app.include_router(simulation_router, prefix=settings.API_PREFIX)

# WebSocket Endpoints
@app.websocket("/ws/monitor/{session_id}")
async def websocket_session_monitor(websocket: WebSocket, session_id: int):
    await ws_manager.connect_session(websocket, session_id)
    try:
        while True:
            # Keep socket alive and accept ping/pong or client messages
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect_session(websocket, session_id)
    except Exception as e:
        logger.warning(f"Session {session_id} WebSocket error: {e}")
        ws_manager.disconnect_session(websocket, session_id)

@app.websocket("/ws/global")
async def websocket_global_feed(websocket: WebSocket):
    await ws_manager.connect_global(websocket)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect_global(websocket)
    except Exception as e:
        logger.warning(f"Global WebSocket error: {e}")
        ws_manager.disconnect_global(websocket)

@app.get("/")
def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs": "/docs",
        "description": "ESP32 IoT -> FastAPI -> PostgreSQL -> AI Risk Prediction -> WebSocket -> React Dashboard"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "database": "connected", "ai_model": "loaded"}
