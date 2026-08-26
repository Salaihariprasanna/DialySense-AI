import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("dialysis_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    reading_id = Column(Integer, ForeignKey("sensor_readings.id", ondelete="SET NULL"), nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    alert_type = Column(String(50), nullable=False) # SPO2_DROP, HYPOTENSION, HYPERTENSION, HIGH_PRESSURE, MACHINE_ERROR, TACHYCARDIA, FEVER
    severity = Column(String(20), nullable=False) # INFO, WARNING, CRITICAL
    title = Column(String(100), nullable=False)
    message = Column(Text, nullable=False)
    is_acknowledged = Column(Boolean, default=False)
    acknowledged_at = Column(DateTime, nullable=True)
    acknowledged_by = Column(String(100), nullable=True)

    # Relationships
    session = relationship("DialysisSession", back_populates="alerts")
    patient = relationship("Patient", back_populates="alerts")
