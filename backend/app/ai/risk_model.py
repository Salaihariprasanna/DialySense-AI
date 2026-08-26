import os
import logging
from typing import Dict, List, Tuple, Any
import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

# Fallback in-memory weights if model file is not yet generated
MODEL_ARTIFACT = None

def get_or_load_model():
    global MODEL_ARTIFACT
    if MODEL_ARTIFACT is not None:
        return MODEL_ARTIFACT
    
    model_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "ml", "dialysis_risk_model.joblib")
    if os.path.exists(model_path):
        try:
            import joblib
            MODEL_ARTIFACT = joblib.load(model_path)
            logger.info(f"Loaded trained AI risk model from {model_path}")
            return MODEL_ARTIFACT
        except Exception as e:
            logger.warning(f"Failed to load joblib model: {e}")
    return None

def evaluate_dialysis_risk(
    heart_rate: float,
    spo2: float,
    temperature: float,
    systolic_bp: float,
    diastolic_bp: float,
    blood_flow_rate: float,
    dialysis_pressure: float,
    age: int = 55,
    machine_status: str = "RUNNING"
) -> Dict[str, Any]:
    """
    Evaluates real-time dialysis telemetry using AI classifier + Clinical Rule Engine.
    Returns:
      - risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'
      - risk_score: 0.0 to 100.0
      - factors: List[str] explainable clinical factors
      - recommendation: str
    """
    factors: List[str] = []
    clinical_penalty = 0.0

    # 1. Oxygen Saturation (SpO2) Analysis
    if spo2 < 88.0:
        factors.append(f"Severe Hypoxemia: SpO2 critical at {spo2:.1f}% (< 88%)")
        clinical_penalty += 35.0
    elif spo2 < 93.0:
        factors.append(f"Low Oxygen Saturation: SpO2 at {spo2:.1f}% (< 93%)")
        clinical_penalty += 20.0
    elif spo2 < 95.0:
        factors.append(f"Borderline Oxygen Saturation: SpO2 at {spo2:.1f}%")
        clinical_penalty += 8.0

    # 2. Blood Pressure (Intradialytic Hypotension / Hypertensive Crisis)
    if systolic_bp < 85.0:
        factors.append(f"Critical Intradialytic Hypotension: Systolic BP {systolic_bp:.0f} mmHg (< 85)")
        clinical_penalty += 38.0
    elif systolic_bp < 95.0:
        factors.append(f"Moderate Hypotension: Systolic BP {systolic_bp:.0f} mmHg (< 95)")
        clinical_penalty += 22.0
    elif systolic_bp > 180.0 or diastolic_bp > 110.0:
        factors.append(f"Severe Hypertensive Spike: BP {systolic_bp:.0f}/{diastolic_bp:.0f} mmHg")
        clinical_penalty += 30.0
    elif systolic_bp > 160.0 or diastolic_bp > 98.0:
        factors.append(f"Elevated Blood Pressure: BP {systolic_bp:.0f}/{diastolic_bp:.0f} mmHg")
        clinical_penalty += 12.0

    # 3. Heart Rate (Arrhythmia / Tachycardia / Bradycardia)
    if heart_rate < 50.0:
        factors.append(f"Severe Bradycardia: Heart Rate {heart_rate:.0f} BPM (< 50)")
        clinical_penalty += 28.0
    elif heart_rate < 58.0:
        factors.append(f"Mild Bradycardia: Heart Rate {heart_rate:.0f} BPM")
        clinical_penalty += 10.0
    elif heart_rate > 130.0:
        factors.append(f"Severe Tachycardia: Heart Rate {heart_rate:.0f} BPM (> 130)")
        clinical_penalty += 30.0
    elif heart_rate > 105.0:
        factors.append(f"Elevated Heart Rate: Heart Rate {heart_rate:.0f} BPM (> 105)")
        clinical_penalty += 12.0

    # 4. Dialysis Circuit & Venous Pressure
    if dialysis_pressure > 220.0:
        factors.append(f"Critical Venous Circuit High Pressure: {dialysis_pressure:.0f} mmHg (> 220)")
        clinical_penalty += 35.0
    elif dialysis_pressure > 175.0:
        factors.append(f"Elevated Circuit Pressure: {dialysis_pressure:.0f} mmHg (> 175)")
        clinical_penalty += 16.0
    elif dialysis_pressure < 50.0 and machine_status == "RUNNING":
        factors.append(f"Low Venous Pressure (Possible Needle Dislodgement): {dialysis_pressure:.0f} mmHg")
        clinical_penalty += 25.0

    # 5. Blood Flow Rate
    if blood_flow_rate < 150.0 and machine_status == "RUNNING":
        factors.append(f"Severely Inadequate Blood Flow: {blood_flow_rate:.0f} mL/min (< 150)")
        clinical_penalty += 20.0
    elif blood_flow_rate < 220.0 and machine_status == "RUNNING":
        factors.append(f"Suboptimal Blood Flow: {blood_flow_rate:.0f} mL/min (< 220)")
        clinical_penalty += 10.0

    # 6. Body Temperature
    if temperature > 38.5:
        factors.append(f"High Pyrogenic / Febrile Reaction: Temp {temperature:.1f} °C (> 38.5°C)")
        clinical_penalty += 22.0
    elif temperature > 37.6:
        factors.append(f"Mild Temperature Elevation: Temp {temperature:.1f} °C")
        clinical_penalty += 8.0
    elif temperature < 35.2:
        factors.append(f"Hypothermia: Temp {temperature:.1f} °C (< 35.2°C)")
        clinical_penalty += 15.0

    # 7. Machine Status
    if machine_status == "ERROR":
        factors.append("Dialysis Machine Error State Reported")
        clinical_penalty += 45.0
    elif machine_status == "WARNING":
        factors.append("Machine Warning State Active")
        clinical_penalty += 18.0

    # 8. Machine Learning Model Ingestion (if available)
    ml_score = 0.0
    artifact = get_or_load_model()
    if artifact and "model" in artifact:
        try:
            model = artifact["model"]
            features = [
                heart_rate, spo2, temperature, systolic_bp,
                diastolic_bp, blood_flow_rate, dialysis_pressure, age
            ]
            probs = model.predict_proba([features])[0]
            classes = artifact["classes"] # e.g. ['HIGH', 'LOW', 'MODERATE']
            
            prob_map = dict(zip(classes, probs))
            high_p = prob_map.get("HIGH", 0.0)
            mod_p = prob_map.get("MODERATE", 0.0)
            low_p = prob_map.get("LOW", 0.0)
            
            ml_score = (high_p * 85.0) + (mod_p * 45.0) + (low_p * 8.0)
        except Exception as e:
            logger.debug(f"ML inference fallback: {e}")
            ml_score = 0.0

    # Hybrid Ensembled Risk Score
    if ml_score > 0:
        composite_score = (0.60 * clinical_penalty) + (0.40 * ml_score)
    else:
        composite_score = clinical_penalty

    # Base baseline fluctuation for normal stability
    if len(factors) == 0:
        composite_score = float(np.clip(composite_score + 8.0, 5.0, 18.0))
        factors.append("All hemodynamic and machine parameters within target physiological ranges.")
    
    risk_score = round(float(np.clip(composite_score, 0.0, 100.0)), 1)

    # Classify Risk Level
    if risk_score >= 70.0 or machine_status == "ERROR" or (systolic_bp < 85 and spo2 < 90):
        risk_level = "HIGH"
        recommendation = "CRITICAL: Immediate nursing and nephrologist evaluation recommended. Inspect vascular access, adjust ultrafiltration rate, verify oxygen delivery, and check dialysate temperature."
    elif risk_score >= 35.0:
        risk_level = "MODERATE"
        recommendation = "WARNING: Moderate hemodynamic instability detected. Increase vital sign check frequency and verify dialyzer line stability."
    else:
        risk_level = "LOW"
        recommendation = "Parameters stable. Continue standard hemodialysis monitoring protocol."

    return {
        "risk_level": risk_level,
        "risk_score": risk_score,
        "factors": factors,
        "recommendation": recommendation
    }
