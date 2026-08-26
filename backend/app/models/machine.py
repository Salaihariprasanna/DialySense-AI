import datetime
from sqlalchemy import Column, Integer, String, DateTime, Float
from sqlalchemy.orm import relationship
from app.database import Base

class Machine(Base):
    __tablename__ = "machines"

    id = Column(Integer, primary_key=True, index=True)
    machine_code = Column(String(30), unique=True, index=True, nullable=False) # e.g. DIALY-01
    model = Column(String(50), default="DialySense Pro-5000")
    serial_number = Column(String(50), unique=True, nullable=False)
    status = Column(String(20), default="AVAILABLE") # AVAILABLE, RUNNING, PAUSED, MAINTENANCE, ERROR
    location = Column(String(50), default="Dialysis Ward A - Bed 1")
    ip_address = Column(String(50), nullable=True)
    last_maintenance = Column(DateTime, default=datetime.datetime.utcnow)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    sessions = relationship("DialysisSession", back_populates="machine")
