from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.alert import Alert
from app.models.reading import SensorReading
from app.models.risk import RiskPrediction
import datetime

class AlertEngine:
    @staticmethod
    def evaluate_and_create_alerts(
        db: Session,
        reading: SensorReading,
        risk: Optional[RiskPrediction] = None
    ) -> List[Alert]:
        """
        Evaluates incoming sensor reading and clinical risk against physiological thresholds.
        Persists newly generated alarms using authentic clinical medical terminology.
        """
        new_alerts: List[Alert] = []

        # Avoid duplicate alarms within a 20-second window
        recent_threshold = datetime.datetime.utcnow() - datetime.timedelta(seconds=20)
        
        def is_duplicate(alert_type: str) -> bool:
            existing = db.query(Alert).filter(
                Alert.session_id == reading.session_id,
                Alert.alert_type == alert_type,
                Alert.timestamp >= recent_threshold
            ).first()
            return existing is not None

        # 1. SpO2 Hypoxemia
        if reading.spo2 < 90.0:
            if not is_duplicate("CRITICAL_HYPOXIA"):
                new_alerts.append(Alert(
                    session_id=reading.session_id,
                    patient_id=reading.patient_id,
                    reading_id=reading.id,
                    alert_type="CRITICAL_HYPOXIA",
                    severity="CRITICAL",
                    title="Critical Oxygen Desaturation (Hypoxemia)",
                    message=f"Patient SpO2 desaturated acutely to {reading.spo2:.1f}% (< 90.0%). Initiate supplemental O2 and verify airway patency."
                ))
        elif reading.spo2 < 94.0:
            if not is_duplicate("LOW_SPO2"):
                new_alerts.append(Alert(
                    session_id=reading.session_id,
                    patient_id=reading.patient_id,
                    reading_id=reading.id,
                    alert_type="LOW_SPO2",
                    severity="WARNING",
                    title="Suboptimal Oxygen Saturation",
                    message=f"SpO2 diminished to {reading.spo2:.1f}%. Perform respiratory assessment."
                ))

        # 2. Blood Pressure (Intradialytic Hypotension / Hypertensive Emergency)
        if reading.systolic_bp < 85.0:
            if not is_duplicate("CRITICAL_HYPOTENSION"):
                new_alerts.append(Alert(
                    session_id=reading.session_id,
                    patient_id=reading.patient_id,
                    reading_id=reading.id,
                    alert_type="CRITICAL_HYPOTENSION",
                    severity="CRITICAL",
                    title="Severe Intradialytic Hypotension (IDH)",
                    message=f"Systolic arterial pressure collapsed to {reading.systolic_bp:.0f} mmHg (< 85 mmHg). Risk of cerebral/myocardial hypoperfusion. Suspend ultrafiltration and place patient in Trendelenburg position."
                ))
        elif reading.systolic_bp < 95.0:
            if not is_duplicate("MODERATE_HYPOTENSION"):
                new_alerts.append(Alert(
                    session_id=reading.session_id,
                    patient_id=reading.patient_id,
                    reading_id=reading.id,
                    alert_type="MODERATE_HYPOTENSION",
                    severity="WARNING",
                    title="Intradialytic Blood Pressure Drop",
                    message=f"Blood pressure lowering observed: {reading.systolic_bp:.0f}/{reading.diastolic_bp:.0f} mmHg."
                ))
        elif reading.systolic_bp > 175.0 or reading.diastolic_bp > 105.0:
            if not is_duplicate("HYPERTENSION"):
                new_alerts.append(Alert(
                    session_id=reading.session_id,
                    patient_id=reading.patient_id,
                    reading_id=reading.id,
                    alert_type="HYPERTENSION",
                    severity="WARNING",
                    title="Hypertensive Urgency",
                    message=f"Acute systemic arterial pressure elevation: {reading.systolic_bp:.0f}/{reading.diastolic_bp:.0f} mmHg."
                ))

        # 3. Heart Rate (Bradycardia / Tachycardia)
        if reading.heart_rate < 50.0:
            if not is_duplicate("CRITICAL_BRADYCARDIA"):
                new_alerts.append(Alert(
                    session_id=reading.session_id,
                    patient_id=reading.patient_id,
                    reading_id=reading.id,
                    alert_type="CRITICAL_BRADYCARDIA",
                    severity="CRITICAL",
                    title="Critical Sinus Bradycardia",
                    message=f"Severe cardiac deceleration: {reading.heart_rate:.0f} BPM (< 50 BPM). Evaluate for hyperkalemia."
                ))
        elif reading.heart_rate > 125.0:
            if not is_duplicate("CRITICAL_TACHYCARDIA"):
                new_alerts.append(Alert(
                    session_id=reading.session_id,
                    patient_id=reading.patient_id,
                    reading_id=reading.id,
                    alert_type="CRITICAL_TACHYCARDIA",
                    severity="CRITICAL",
                    title="Critical Sinus Tachycardia",
                    message=f"Severe cardiac acceleration: {reading.heart_rate:.0f} BPM (> 125 BPM). Assess for volume depletion or pyrogenic stress."
                ))

        # 4. Dialysis Extracorporeal Circuit Pressure (Venous Resistance / Clotting Risk)
        if reading.dialysis_pressure > 210.0:
            if not is_duplicate("CRITICAL_HIGH_PRESSURE"):
                new_alerts.append(Alert(
                    session_id=reading.session_id,
                    patient_id=reading.patient_id,
                    reading_id=reading.id,
                    alert_type="CRITICAL_HIGH_PRESSURE",
                    severity="CRITICAL",
                    title="Extracorporeal Venous High Pressure Alarm",
                    message=f"Venous return circuit pressure peaked at {reading.dialysis_pressure:.0f} mmHg (> 210 mmHg). Inspect for dialyzer fiber clotting or venous cannula displacement."
                ))
        elif reading.dialysis_pressure > 175.0:
            if not is_duplicate("ELEVATED_PRESSURE"):
                new_alerts.append(Alert(
                    session_id=reading.session_id,
                    patient_id=reading.patient_id,
                    reading_id=reading.id,
                    alert_type="ELEVATED_PRESSURE",
                    severity="WARNING",
                    title="Elevated Venous Circuit Resistance",
                    message=f"Venous return pressure elevated: {reading.dialysis_pressure:.0f} mmHg."
                ))

        # 5. Machine State Alarm
        if reading.machine_status == "ERROR":
            if not is_duplicate("MACHINE_ERROR"):
                new_alerts.append(Alert(
                    session_id=reading.session_id,
                    patient_id=reading.patient_id,
                    reading_id=reading.id,
                    alert_type="MACHINE_ERROR",
                    severity="CRITICAL",
                    title="Hemodialysis Machine Hydraulic / Pump Malfunction",
                    message="Dialyzer unit reported blood pump or hydraulic malfunction. Verify line integrity and switch to manual blood return if necessary."
                ))
        elif reading.machine_status == "WARNING":
            if not is_duplicate("MACHINE_WARNING"):
                new_alerts.append(Alert(
                    session_id=reading.session_id,
                    patient_id=reading.patient_id,
                    reading_id=reading.id,
                    alert_type="MACHINE_WARNING",
                    severity="WARNING",
                    title="Extracorporeal Circuit Warning Flag",
                    message="Machine telemetry reported a circuit fluidics warning condition."
                ))

        # 6. Clinical Hemodynamic Instability Surge
        if risk and risk.risk_level == "HIGH" and risk.risk_score >= 80.0:
            if not is_duplicate("HEMODYNAMIC_INSTABILITY_SURGE"):
                new_alerts.append(Alert(
                    session_id=reading.session_id,
                    patient_id=reading.patient_id,
                    reading_id=reading.id,
                    alert_type="HEMODYNAMIC_INSTABILITY_SURGE",
                    severity="CRITICAL",
                    title="Acute Hemodynamic Instability Surge",
                    message=f"Composite clinical risk score reached {risk.risk_score:.0f}/100. Immediate nephrology and bedside nursing review recommended."
                ))

        # Persist alerts
        for a in new_alerts:
            db.add(a)
        
        if new_alerts:
            db.commit()
            for a in new_alerts:
                db.refresh(a)

        return new_alerts
