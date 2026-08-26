from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field

class AlertBase(BaseModel):
    session_id: int
    patient_id: int
    reading_id: Optional[int] = None
    alert_type: str
    severity: str # INFO, WARNING, CRITICAL
    title: str
    message: str

class AlertCreate(AlertBase):
    pass

class AlertResponse(AlertBase):
    id: int
    timestamp: datetime
    is_acknowledged: bool
    acknowledged_at: Optional[datetime] = None
    acknowledged_by: Optional[str] = None

    class Config:
        from_attributes = True

class AlertAcknowledge(BaseModel):
    acknowledged_by: str = Field(default="Clinical Staff", example="Nurse Joy")
