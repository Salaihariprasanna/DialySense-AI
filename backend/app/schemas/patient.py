from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field

class PatientBase(BaseModel):
    name: str = Field(..., example="John Doe")
    age: int = Field(..., ge=1, le=120, example=58)
    gender: str = Field(..., example="Male")
    blood_group: str = Field(..., example="O+")
    disease_stage: str = Field(..., example="Stage 5 CKD / ESRD")
    doctor: str = Field(..., example="Dr. Sarah Jenkins")
    contact: str = Field(..., example="+1-555-0192")
    emergency_contact: Optional[str] = Field(None, example="+1-555-0199")
    notes: Optional[str] = Field(None, example="Diabetic nephropathy, fistula on left forearm")

class PatientCreate(PatientBase):
    patient_id: Optional[str] = Field(None, example="PAT-101")

class PatientUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    disease_stage: Optional[str] = None
    doctor: Optional[str] = None
    contact: Optional[str] = None
    emergency_contact: Optional[str] = None
    notes: Optional[str] = None

class PatientResponse(PatientBase):
    id: int
    patient_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
