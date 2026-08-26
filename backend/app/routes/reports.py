import os
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.report import Report
from app.models.session import DialysisSession
from app.services.report_generator import PDFReportGenerator
from app.config import settings

router = APIRouter(prefix="/reports", tags=["PDF Reports"])

@router.post("/session/{session_id}/generate")
def generate_pdf_report(session_id: int, db: Session = Depends(get_db)):
    session = db.query(DialysisSession).filter(DialysisSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found")

    try:
        report = PDFReportGenerator.generate_session_report(db, session_id)
        return {
            "status": "success",
            "report_id": report.id,
            "report_code": report.report_code,
            "filename": report.pdf_filename,
            "download_url": f"/api/reports/download/{report.pdf_filename}",
            "generated_at": report.generated_at.isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate report: {str(e)}")

@router.get("/session/{session_id}")
def get_session_report_info(session_id: int, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.session_id == session_id).first()
    if not report:
        raise HTTPException(status_code=404, detail=f"No generated report found for session {session_id}")

    return {
        "report_id": report.id,
        "report_code": report.report_code,
        "filename": report.pdf_filename,
        "download_url": f"/api/reports/download/{report.pdf_filename}",
        "generated_at": report.generated_at.isoformat()
    }

@router.get("/download/{filename}")
def download_report_file(filename: str):
    reports_dir = os.path.abspath(settings.REPORTS_DIR)
    filepath = os.path.join(reports_dir, filename)

    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Requested report PDF file does not exist")

    return FileResponse(
        path=filepath,
        filename=filename,
        media_type="application/pdf"
    )
