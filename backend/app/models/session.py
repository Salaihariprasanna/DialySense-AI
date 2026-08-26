import datetime
from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class DialysisSession(Base):
    __tablename__ = "dialysis_sessions"

    id = Column(Integer, primary_key=True, index=True)
    session_code = Column(String(30), unique=True, index=True, nullable=False) # e.g. SES-202603-001
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    machine_id = Column(Integer, ForeignKey("machines.id", ondelete="SET NULL"), nullable=True)
    
    start_time = Column(DateTime, default=datetime.datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    status = Column(String(20), default="SCHEDULED") # SCHEDULED, ONGOING, PAUSED, COMPLETED, ABORTED
    
    target_duration_mins = Column(Integer, default=240) # 4 hours standard
    actual_duration_mins = Column(Integer, default=0)
    target_uf_volume_ml = Column(Float, default=2500.0) # Ultrafiltration target
    prescribed_dialysate_temp = Column(Float, default=36.5)
    prescribed_blood_flow = Column(Float, default=300.0)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    patient = relationship("Patient", back_populates="sessions")
    machine = relationship("Machine", back_populates="sessions")
    readings = relationship("SensorReading", back_populates="session", cascade="all, delete-orphan")
    risk_predictions = relationship("RiskPrediction", back_populates="session", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="session", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="session", cascade="all, delete-orphan")
