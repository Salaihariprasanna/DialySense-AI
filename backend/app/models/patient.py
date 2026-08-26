import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String(20), unique=True, index=True, nullable=False) # e.g. PAT-101
    name = Column(String(100), nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String(10), nullable=False) # Male, Female, Other
    blood_group = Column(String(5), nullable=False) # A+, O+, etc.
    disease_stage = Column(String(50), nullable=False) # e.g., Stage 5 CKD, ESRD
    doctor = Column(String(100), nullable=False)
    contact = Column(String(20), nullable=False)
    emergency_contact = Column(String(20), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    sessions = relationship("DialysisSession", back_populates="patient", cascade="all, delete-orphan")
    readings = relationship("SensorReading", back_populates="patient", cascade="all, delete-orphan")
    risk_predictions = relationship("RiskPrediction", back_populates="patient", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="patient", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="patient", cascade="all, delete-orphan")
