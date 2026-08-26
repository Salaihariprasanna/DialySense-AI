import datetime
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("dialysis_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    # Vitals
    heart_rate = Column(Float, nullable=False) # BPM
    spo2 = Column(Float, nullable=False) # %
    temperature = Column(Float, nullable=False) # °C
    systolic_bp = Column(Float, nullable=False) # mmHg
    diastolic_bp = Column(Float, nullable=False) # mmHg
    
    # Machine Telemetry
    blood_flow_rate = Column(Float, nullable=False) # mL/min
    dialysis_pressure = Column(Float, nullable=False) # mmHg (Venous / Transmembrane)
    machine_temperature = Column(Float, nullable=False) # °C
    machine_status = Column(String(30), default="RUNNING") # RUNNING, PAUSED, WARNING, ERROR, OFFLINE

    # Relationships
    session = relationship("DialysisSession", back_populates="readings")
    patient = relationship("Patient", back_populates="readings")
    risk_prediction = relationship("RiskPrediction", back_populates="reading", uselist=False, cascade="all, delete-orphan")
