import os
import datetime
import json
from typing import Dict, Any, Optional
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from sqlalchemy.orm import Session
from app.models.session import DialysisSession
from app.models.patient import Patient
from app.models.reading import SensorReading
from app.models.risk import RiskPrediction
from app.models.alert import Alert
from app.models.report import Report
from app.config import settings

class PDFReportGenerator:
    @staticmethod
    def generate_session_report(db: Session, session_id: int) -> Report:
        """
        Generates a comprehensive clinical hemodialysis treatment summary report as PDF using ReportLab.
        Uses authentic hospital and nephrology clinical terminology.
        """
        session_obj = db.query(DialysisSession).filter(DialysisSession.id == session_id).first()
        if not session_obj:
            raise ValueError(f"Session with ID {session_id} not found")

        patient = session_obj.patient
        machine = session_obj.machine
        readings = db.query(SensorReading).filter(SensorReading.session_id == session_id).order_by(SensorReading.timestamp.asc()).all()
        risks = db.query(RiskPrediction).filter(RiskPrediction.session_id == session_id).order_by(RiskPrediction.timestamp.asc()).all()
        alerts = db.query(Alert).filter(Alert.session_id == session_id).order_by(Alert.timestamp.desc()).all()

        # Compute summary statistics
        hr_vals = [r.heart_rate for r in readings] if readings else [75]
        spo2_vals = [r.spo2 for r in readings] if readings else [98]
        sys_vals = [r.systolic_bp for r in readings] if readings else [120]
        dia_vals = [r.diastolic_bp for r in readings] if readings else [80]
        temp_vals = [r.temperature for r in readings] if readings else [36.8]
        flow_vals = [r.blood_flow_rate for r in readings] if readings else [300]
        press_vals = [r.dialysis_pressure for r in readings] if readings else [120]
        risk_scores = [rk.risk_score for rk in risks] if risks else [12.0]

        max_risk = max(risk_scores)
        overall_risk_level = "HIGH" if max_risk >= 70 else ("MODERATE / MEDIUM" if max_risk >= 35 else "LOW")

        summary_dict = {
            "session_code": session_obj.session_code,
            "patient_name": patient.name if patient else "N/A",
            "patient_id": patient.patient_id if patient else "N/A",
            "machine_code": machine.machine_code if machine else "N/A",
            "total_readings": len(readings),
            "hr_min_avg_max": f"{min(hr_vals):.0f} / {sum(hr_vals)/len(hr_vals):.0f} / {max(hr_vals):.0f} BPM",
            "spo2_min_avg": f"{min(spo2_vals):.1f}% / {sum(spo2_vals)/len(spo2_vals):.1f}%",
            "bp_avg": f"{sum(sys_vals)/len(sys_vals):.0f}/{sum(dia_vals)/len(dia_vals):.0f} mmHg",
            "max_risk_score": max_risk,
            "overall_risk_level": overall_risk_level,
            "total_alerts": len(alerts)
        }

        # Directory setup
        reports_dir = os.path.abspath(settings.REPORTS_DIR)
        os.makedirs(reports_dir, exist_ok=True)
        
        timestamp_str = datetime.datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        filename = f"Dialysis_Clinical_Report_{session_obj.session_code}_{timestamp_str}.pdf"
        filepath = os.path.join(reports_dir, filename)

        # Build PDF with ReportLab
        doc = SimpleDocTemplate(
            filepath,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()
        
        # Custom Typography
        title_style = ParagraphStyle(
            'ReportTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=18,
            leading=22,
            textColor=colors.HexColor('#0c4a6e')
        )
        subtitle_style = ParagraphStyle(
            'ReportSubtitle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=12,
            textColor=colors.HexColor('#475569')
        )
        section_heading = ParagraphStyle(
            'SectionHeading',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=11,
            leading=15,
            textColor=colors.HexColor('#0369a1'),
            spaceBefore=10,
            spaceAfter=5
        )
        cell_bold = ParagraphStyle(
            'CellBold',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=8.5,
            leading=11,
            textColor=colors.HexColor('#1e293b')
        )
        cell_text = ParagraphStyle(
            'CellText',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=8.5,
            leading=11,
            textColor=colors.HexColor('#334155')
        )
        alert_text = ParagraphStyle(
            'AlertText',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=8,
            leading=10,
            textColor=colors.HexColor('#1e293b')
        )

        story = []

        # 1. Header Banner
        header_data = [
            [
                Paragraph("<b>DIALYSENSE CLINICAL SYSTEM</b><br/><font size=8 color='#0284c7'>DEPARTMENT OF NEPHROLOGY & HEMODIALYSIS</font><br/><font size=7.5 color='#64748b'>Continuous Hemodynamic & Extracorporeal Telemetry Record</font>", title_style),
                Paragraph(f"<b>SESSION RECORD:</b> {session_obj.session_code}<br/><b>GENERATED:</b> {datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC<br/><b>STATUS:</b> Completed Clinical Summary", subtitle_style)
            ]
        ]
        header_table = Table(header_data, colWidths=[310, 230])
        header_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(header_table)
        story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0284c7'), spaceBefore=2, spaceAfter=10))

        # 2. Patient & Session Metadata
        story.append(Paragraph("1. Patient Profile & Prescription Parameters", section_heading))
        
        info_data = [
            [
                Paragraph("<b>Patient Name:</b>", cell_bold), Paragraph(patient.name if patient else "N/A", cell_text),
                Paragraph("<b>Treatment Status:</b>", cell_bold), Paragraph(f"<b>{session_obj.status}</b>", cell_bold)
            ],
            [
                Paragraph("<b>Medical Record No:</b>", cell_bold), Paragraph(patient.patient_id if patient else "N/A", cell_text),
                Paragraph("<b>Hemodialyzer Unit:</b>", cell_bold), Paragraph(f"{machine.machine_code} ({machine.model})" if machine else "N/A", cell_text)
            ],
            [
                Paragraph("<b>Age / Gender:</b>", cell_bold), Paragraph(f"{patient.age} yrs / {patient.gender}" if patient else "N/A", cell_text),
                Paragraph("<b>Initiation Time:</b>", cell_bold), Paragraph(str(session_obj.start_time.strftime('%Y-%m-%d %H:%M')) if session_obj.start_time else "N/A", cell_text)
            ],
            [
                Paragraph("<b>Blood Group / Diagnosis:</b>", cell_bold), Paragraph(f"{patient.blood_group} ({patient.disease_stage})" if patient else "N/A", cell_text),
                Paragraph("<b>Prescribed UF Target:</b>", cell_bold), Paragraph(f"{session_obj.target_duration_mins} min / {session_obj.target_uf_volume_ml:.0f} mL", cell_text)
            ],
            [
                Paragraph("<b>Attending Nephrologist:</b>", cell_bold), Paragraph(patient.doctor if patient else "N/A", cell_text),
                Paragraph("<b>Emergency Contact:</b>", cell_bold), Paragraph(patient.contact if patient else "N/A", cell_text)
            ]
        ]
        info_table = Table(info_data, colWidths=[115, 155, 115, 155])
        info_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 3.5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
        ]))
        story.append(info_table)
        story.append(Spacer(1, 8))

        # 3. Telemetry Statistical Analysis
        story.append(Paragraph("2. Physiological Vitals & Extracorporeal Circuit Summary", section_heading))
        vitals_data = [
            [
                Paragraph("Hemodynamic Parameter", cell_bold),
                Paragraph("Target Clinical Range", cell_bold),
                Paragraph("Min / Avg / Max Observed", cell_bold),
                Paragraph("Physiological Interpretation", cell_bold)
            ],
            [
                Paragraph("Heart Rate (Pulse)", cell_text),
                Paragraph("60 - 100 BPM", cell_text),
                Paragraph(f"{min(hr_vals):.0f} / {sum(hr_vals)/len(hr_vals):.0f} / {max(hr_vals):.0f} BPM", cell_text),
                Paragraph("NORMO-CARDIA" if min(hr_vals)>=55 and max(hr_vals)<=110 else "RATE DEVIATION", cell_bold)
            ],
            [
                Paragraph("Pulse Oximetry (SpO2)", cell_text),
                Paragraph("≥ 95.0%", cell_text),
                Paragraph(f"{min(spo2_vals):.1f}% / {sum(spo2_vals)/len(spo2_vals):.1f}% / {max(spo2_vals):.1f}%", cell_text),
                Paragraph("NORMAL SATURATION" if min(spo2_vals)>=94 else "DESATURATION EPISODE", cell_bold)
            ],
            [
                Paragraph("Non-Invasive Blood Pressure", cell_text),
                Paragraph("100-140 / 60-90 mmHg", cell_text),
                Paragraph(f"{min(sys_vals):.0f}/{min(dia_vals):.0f} - {max(sys_vals):.0f}/{max(dia_vals):.0f} mmHg", cell_text),
                Paragraph("NORMOTENSIVE" if min(sys_vals)>=90 and max(sys_vals)<=155 else "HEMODYNAMIC FLUCTUATION", cell_bold)
            ],
            [
                Paragraph("Core Body Temperature", cell_text),
                Paragraph("36.2 - 37.4 °C", cell_text),
                Paragraph(f"{min(temp_vals):.1f} / {sum(temp_vals)/len(temp_vals):.1f} / {max(temp_vals):.1f} °C", cell_text),
                Paragraph("AFEBRILE" if max(temp_vals)<=37.6 else "PYROGENIC REACTION", cell_bold)
            ],
            [
                Paragraph("Extracorporeal Blood Flow Rate", cell_text),
                Paragraph("250 - 400 mL/min", cell_text),
                Paragraph(f"{min(flow_vals):.0f} / {sum(flow_vals)/len(flow_vals):.0f} / {max(flow_vals):.0f} mL/min", cell_text),
                Paragraph("ADEQUATE CLEARANCE" if min(flow_vals)>=200 else "SUBOPTIMAL PERFUSION", cell_bold)
            ],
            [
                Paragraph("Venous Return Circuit Pressure", cell_text),
                Paragraph("80 - 160 mmHg", cell_text),
                Paragraph(f"{min(press_vals):.0f} / {sum(press_vals)/len(press_vals):.0f} / {max(press_vals):.0f} mmHg", cell_text),
                Paragraph("NORMAL PATENCY" if max(press_vals)<=180 else "ELEVATED RESISTANCE", cell_bold)
            ]
        ]
        vitals_table = Table(vitals_data, colWidths=[140, 110, 155, 135])
        vitals_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e0f2fe')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 3.5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
        ]))
        story.append(vitals_table)
        story.append(Spacer(1, 8))

        # 4. Clinical Stability & Pathophysiological Assessment
        story.append(Paragraph("3. Clinical Hemodynamic Stability & Risk Index", section_heading))
        risk_bg = colors.HexColor('#fee2e2') if "HIGH" in overall_risk_level else (colors.HexColor('#fef3c7') if "MODERATE" in overall_risk_level or "MEDIUM" in overall_risk_level else colors.HexColor('#dcfce7'))
        risk_fg = colors.HexColor('#b91c1c') if "HIGH" in overall_risk_level else (colors.HexColor('#b45309') if "MODERATE" in overall_risk_level or "MEDIUM" in overall_risk_level else colors.HexColor('#15803d'))
        
        last_factors = "All hemodynamic and circuit parameters remained within target physiological limits."
        if risks and len(risks) > 0:
            last_risk = risks[-1]
            try:
                factors_list = json.loads(last_risk.factors) if last_risk.factors.startswith("[") else last_risk.factors.split("\n")
                last_factors = "<br/>• " + "<br/>• ".join(factors_list)
            except Exception:
                last_factors = str(last_risk.factors)

        risk_data = [
            [
                Paragraph("<b>Peak Hemodynamic Risk Score:</b>", cell_bold), Paragraph(f"<b>{max_risk:.1f} / 100</b>", cell_bold),
                Paragraph("<b>Clinical Stratification:</b>", cell_bold), Paragraph(f"<b><font color='{risk_fg}'>{overall_risk_level} RISK</font></b>", cell_bold)
            ],
            [
                Paragraph("<b>Pathophysiological Findings:</b>", cell_bold),
                Paragraph(last_factors, cell_text),
                Paragraph("<b>Clinical Protocol Recommendation:</b>", cell_bold),
                Paragraph("Continuous multi-parameter monitoring for intradialytic hypotension, vascular access patency, and dialysate thermal equilibrium.", cell_text)
            ]
        ]
        risk_table = Table(risk_data, colWidths=[120, 150, 110, 160])
        risk_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
            ('BACKGROUND', (1, 0), (1, 0), risk_bg),
            ('BACKGROUND', (3, 0), (3, 0), risk_bg),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 4.5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4.5),
        ]))
        story.append(risk_table)
        story.append(Spacer(1, 8))

        # 5. Clinical Alarms Log
        story.append(Paragraph("4. Clinical Alarms & Telemetry Incident Log", section_heading))
        if alerts:
            alerts_data = [
                [
                    Paragraph("Time (UTC)", cell_bold),
                    Paragraph("Alarm Priority", cell_bold),
                    Paragraph("Diagnostic Event", cell_bold),
                    Paragraph("Clinical Findings & Instructions", cell_bold)
                ]
            ]
            for a in alerts[:8]:
                sev_color = '#dc2626' if a.severity == "CRITICAL" else ('#d97706' if a.severity == "WARNING" else '#2563eb')
                alerts_data.append([
                    Paragraph(a.timestamp.strftime('%H:%M:%S'), alert_text),
                    Paragraph(f"<b><font color='{sev_color}'>{a.severity}</font></b>", alert_text),
                    Paragraph(f"<b>{a.title}</b>", alert_text),
                    Paragraph(a.message, alert_text)
                ])
            alerts_table = Table(alerts_data, colWidths=[65, 75, 150, 250])
            alerts_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f1f5f9')),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('TOPPADDING', (0, 0), (-1, -1), 3),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
            ]))
            story.append(alerts_table)
        else:
            story.append(Paragraph("<i>No critical alarms triggered during this treatment. Normal hemodialysis course.</i>", cell_text))
        
        story.append(Spacer(1, 14))

        # 6. Sign-off Footer
        signoff_data = [
            [
                Paragraph("<b>Attending Nephrologist / Duty Clinical Nurse:</b> ___________________________", cell_text),
                Paragraph("<b>Hospital Stamp & Signature:</b> ___________________________", cell_text)
            ]
        ]
        signoff_table = Table(signoff_data, colWidths=[270, 270])
        signoff_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'BOTTOM'),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(KeepTogether(signoff_table))

        # Build PDF document
        doc.build(story)

        # Persist report record in DB
        report_code = f"RPT-{session_obj.session_code}"
        report_rec = db.query(Report).filter(Report.session_id == session_id).first()
        if not report_rec:
            report_rec = Report(
                report_code=report_code,
                session_id=session_id,
                patient_id=session_obj.patient_id,
                pdf_filename=filename,
                pdf_filepath=filepath,
                summary_data=json.dumps(summary_dict)
            )
            db.add(report_rec)
        else:
            report_rec.pdf_filename = filename
            report_rec.pdf_filepath = filepath
            report_rec.summary_data = json.dumps(summary_dict)
            report_rec.generated_at = datetime.datetime.utcnow()

        db.commit()
        db.refresh(report_rec)
        return report_rec
