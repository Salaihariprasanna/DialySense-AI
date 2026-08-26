import datetime
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class RiskPrediction(Base):
    __tablename__ = "risk_predictions"

    id = Column(Integer, primary_key=True, index=True)
    reading_id = Column(Integer, ForeignKey("sensor_readings.id", ondelete="CASCADE"), nullable=False, unique=True)
    session_id = Column(Integer, ForeignKey("dialysis_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    risk_level = Column(String(20), nullable=False) # LOW, MODERATE, HIGH, CRITICAL
    risk_score = Column(Float, nullable=False) # 0 to 100
    factors = Column(Text, nullable=False) # JSON or newline separated clinical factors
    recommendation = Column(Text, nullable=True) # Clinical decision support guidance

    # Relationships
    reading = relationship("SensorReading", back_populates="risk_prediction")
    session = relationship("DialysisSession", back_populates="risk_predictions")
    patient = relationship("Patient", back_populates="risk_predictions")
