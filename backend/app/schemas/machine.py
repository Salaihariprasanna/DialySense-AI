from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field

class MachineBase(BaseModel):
    machine_code: str = Field(..., example="DIALY-01")
    model: str = Field(default="DialySense Pro-5000")
    serial_number: str = Field(..., example="SN-DSP-2026-001")
    status: str = Field(default="AVAILABLE", example="AVAILABLE")
    location: str = Field(default="Dialysis Ward A - Bed 1")
    ip_address: Optional[str] = Field(None, example="192.168.1.101")

class MachineCreate(MachineBase):
    pass

class MachineUpdate(BaseModel):
    machine_code: Optional[str] = None
    model: Optional[str] = None
    serial_number: Optional[str] = None
    status: Optional[str] = None
    location: Optional[str] = None
    ip_address: Optional[str] = None

class MachineResponse(MachineBase):
    id: int
    last_maintenance: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
