from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field
from app.schemas.patient import PatientResponse
from app.schemas.machine import MachineResponse

class DialysisSessionBase(BaseModel):
    patient_id: int = Field(..., example=1)
    machine_id: Optional[int] = Field(None, example=1)
    target_duration_mins: int = Field(default=240, example=240)
    target_uf_volume_ml: float = Field(default=2500.0, example=2500.0)
    prescribed_dialysate_temp: float = Field(default=36.5, example=36.5)
    prescribed_blood_flow: float = Field(default=300.0, example=300.0)
    notes: Optional[str] = Field(None, example="Regular 4-hour hemodialysis")

class DialysisSessionCreate(DialysisSessionBase):
    session_code: Optional[str] = None
    status: Optional[str] = "SCHEDULED"

class DialysisSessionUpdate(BaseModel):
    machine_id: Optional[int] = None
    status: Optional[str] = None # SCHEDULED, ONGOING, PAUSED, COMPLETED, ABORTED
    end_time: Optional[datetime] = None
    actual_duration_mins: Optional[int] = None
    notes: Optional[str] = None

class DialysisSessionResponse(DialysisSessionBase):
    id: int
    session_code: str
    start_time: datetime
    end_time: Optional[datetime] = None
    status: str
    actual_duration_mins: int
    created_at: datetime
    patient: Optional[PatientResponse] = None
    machine: Optional[MachineResponse] = None

    class Config:
        from_attributes = True
