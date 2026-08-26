from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field

class SensorReadingCreate(BaseModel):
    patient_id: int = Field(..., example=1)
    session_id: int = Field(..., example=1)
    heart_rate: float = Field(..., example=78.0, description="Heart Rate in BPM")
    spo2: float = Field(..., example=98.0, description="Oxygen Saturation in %")
    temperature: float = Field(..., example=36.8, description="Body Temperature in °C")
    systolic_bp: float = Field(..., example=120.0, description="Systolic Blood Pressure in mmHg")
    diastolic_bp: float = Field(..., example=80.0, description="Diastolic Blood Pressure in mmHg")
    blood_flow_rate: float = Field(..., example=300.0, description="Dialysis Blood Flow Rate in mL/min")
    dialysis_pressure: float = Field(..., example=120.0, description="Venous/Dialysis Pressure in mmHg")
    machine_temperature: float = Field(..., example=37.0, description="Machine internal temperature in °C")
    machine_status: Optional[str] = Field(default="RUNNING", example="RUNNING")

class SensorReadingResponse(SensorReadingCreate):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True
