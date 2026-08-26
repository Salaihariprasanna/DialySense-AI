from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class ReportResponse(BaseModel):
    id: int
    report_code: str
    session_id: int
    patient_id: int
    generated_at: datetime
    pdf_filename: str
    pdf_filepath: str
    download_url: str
    summary_data: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True
