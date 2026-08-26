from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field

class RiskPredictionResponse(BaseModel):
    id: int
    reading_id: int
    session_id: int
    patient_id: int
    timestamp: datetime
    risk_level: str # LOW, MODERATE, HIGH, CRITICAL
    risk_score: float # 0 to 100
    factors: List[str]
    recommendation: Optional[str] = None

    class Config:
        from_attributes = True

class RiskEvaluationRequest(BaseModel):
    patient_id: int
    age: int
    heart_rate: float
    spo2: float
    temperature: float
    systolic_bp: float
    diastolic_bp: float
    blood_flow_rate: float
    dialysis_pressure: float
    machine_status: Optional[str] = "RUNNING"
