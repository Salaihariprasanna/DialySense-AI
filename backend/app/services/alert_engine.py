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
        Evaluates incoming sensor reading and risk prediction against clinical thresholds.
        Persists newly generated alerts and returns the list of new alerts.
        """
        new_alerts: List[Alert] = []

        # Helper to avoid flooding duplicate alerts within a 20-second window
        recent_threshold = datetime.datetime.utcnow() - datetime.timedelta(seconds=20)
        
        def is_duplicate(alert_type: str) -> bool:
            existing = db.query(Alert).filter(
                Alert.session_id == reading.session_id,
                Alert.alert_type == alert_type,
                Alert.timestamp >= recent_threshold
            ).first()
            return existing is not None

        # 1. SpO2 Critical Drop
        if reading.spo2 < 90.0:
            if not is_duplicate("CRITICAL_HYPOXIA"):
                new_alerts.append(Alert(
                    session_id=reading.session_id,
                    patient_id=reading.patient_id,
                    reading_id=reading.id,
                    alert_type="CRITICAL_HYPOXIA",
                    severity="CRITICAL",
                    title="Critical Oxygen Desaturation",
                    message=f"Patient SpO2 dropped dangerously to {reading.spo2:.1f}% (< 90%). Provide supplemental O2 immediately."
                ))
        elif reading.spo2 < 94.0:
            if not is_duplicate("LOW_SPO2"):
                new_alerts.append(Alert(
                    session_id=reading.session_id,
                    patient_id=reading.patient_id,
                    reading_id=reading.id,
                    alert_type="LOW_SPO2",
                    severity="WARNING",
                    title="Low SpO2 Detected",
                    message=f"SpO2 is low at {reading.spo2:.1f}%. Monitor patient breathing."
                ))

        # 2. Blood Pressure (Intradialytic Hypotension / Hypertension)
        if reading.systolic_bp < 85.0:
            if not is_duplicate("CRITICAL_HYPOTENSION"):
                new_alerts.append(Alert(
                    session_id=reading.session_id,
                    patient_id=reading.patient_id,
                    reading_id=reading.id,
                    alert_type="CRITICAL_HYPOTENSION",
                    severity="CRITICAL",
                    title="Severe Intradialytic Hypotension",
                    message=f"Systolic BP dropped to {reading.systolic_bp:.0f} mmHg (< 85 mmHg). Risk of hypovolemic shock. Suspend ultrafiltration."
                ))
        elif reading.systolic_bp < 95.0:
            if not is_duplicate("MODERATE_HYPOTENSION"):
                new_alerts.append(Alert(
                    session_id=reading.session_id,
                    patient_id=reading.patient_id,
                    reading_id=reading.id,
                    alert_type="MODERATE_HYPOTENSION",
                    severity="WARNING",
                    title="Hypotension Warning",
                    message=f"Blood pressure lowering: {reading.systolic_bp:.0f}/{reading.diastolic_bp:.0f} mmHg."
                ))
        elif reading.systolic_bp > 175.0 or reading.diastolic_bp > 105.0:
            if not is_duplicate("HYPERTENSION"):
                new_alerts.append(Alert(
                    session_id=reading.session_id,
                    patient_id=reading.patient_id,
                    reading_id=reading.id,
                    alert_type="HYPERTENSION",
                    severity="WARNING",
                    title="Hypertensive Elevation",
                    message=f"Elevated blood pressure: {reading.systolic_bp:.0f}/{reading.diastolic_bp:.0f} mmHg."
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
                    title="Critical Bradycardia",
                    message=f"Severe low heart rate: {reading.heart_rate:.0f} BPM (< 50 BPM)."
                ))
        elif reading.heart_rate > 125.0:
            if not is_duplicate("CRITICAL_TACHYCARDIA"):
                new_alerts.append(Alert(
                    session_id=reading.session_id,
                    patient_id=reading.patient_id,
                    reading_id=reading.id,
                    alert_type="CRITICAL_TACHYCARDIA",
                    severity="CRITICAL",
                    title="Severe Tachycardia",
                    message=f"High heart rate: {reading.heart_rate:.0f} BPM (> 125 BPM)."
                ))

        # 4. Dialysis Circuit High Pressure (Venous Resistance / Clotting Risk)
        if reading.dialysis_pressure > 210.0:
            if not is_duplicate("CRITICAL_HIGH_PRESSURE"):
                new_alerts.append(Alert(
                    session_id=reading.session_id,
                    patient_id=reading.patient_id,
                    reading_id=reading.id,
                    alert_type="CRITICAL_HIGH_PRESSURE",
                    severity="CRITICAL",
                    title="Circuit High Pressure Alarm",
                    message=f"Venous line pressure reached {reading.dialysis_pressure:.0f} mmHg (> 210 mmHg). Check for needle kink or dialyzer clotting."
                ))
        elif reading.dialysis_pressure > 175.0:
            if not is_duplicate("ELEVATED_PRESSURE"):
                new_alerts.append(Alert(
                    session_id=reading.session_id,
                    patient_id=reading.patient_id,
                    reading_id=reading.id,
                    alert_type="ELEVATED_PRESSURE",
                    severity="WARNING",
                    title="Elevated Venous Pressure",
                    message=f"Venous pressure elevated at {reading.dialysis_pressure:.0f} mmHg."
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
                    title="Dialysis Machine Malfunction",
                    message="Dialysis machine reported critical hardware/pump error. Inspect machine and switch to manual bypass if required."
                ))
        elif reading.machine_status == "WARNING":
            if not is_duplicate("MACHINE_WARNING"):
                new_alerts.append(Alert(
                    session_id=reading.session_id,
                    patient_id=reading.patient_id,
                    reading_id=reading.id,
                    alert_type="MACHINE_WARNING",
                    severity="WARNING",
                    title="Machine Telemetry Warning",
                    message="Machine telemetry reported a warning condition."
                ))

        # 6. AI High Risk Trigger
        if risk and risk.risk_level == "HIGH" and risk.risk_score >= 80.0:
            if not is_duplicate("AI_HIGH_RISK_SURGE"):
                new_alerts.append(Alert(
                    session_id=reading.session_id,
                    patient_id=reading.patient_id,
                    reading_id=reading.id,
                    alert_type="AI_HIGH_RISK_SURGE",
                    severity="CRITICAL",
                    title="AI Clinical Risk Spike",
                    message=f"AI Risk Score surged to {risk.risk_score:.0f}/100. Immediate clinical review recommended."
                ))

        # Persist alerts
        for a in new_alerts:
            db.add(a)
        
        if new_alerts:
            db.commit()
            for a in new_alerts:
                db.refresh(a)

        return new_alerts
