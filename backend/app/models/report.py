import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    report_code = Column(String(50), unique=True, index=True, nullable=False) # e.g. RPT-SES-001
    session_id = Column(Integer, ForeignKey("dialysis_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    generated_at = Column(DateTime, default=datetime.datetime.utcnow)
    pdf_filename = Column(String(255), nullable=False)
    pdf_filepath = Column(String(500), nullable=False)
    summary_data = Column(Text, nullable=True) # JSON summary of session statistics

    # Relationships
    session = relationship("DialysisSession", back_populates="reports")
    patient = relationship("Patient", back_populates="reports")
