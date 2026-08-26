import asyncio
import random
import datetime
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class DialysisSimulator:
    def __init__(self):
        self.current_mode: str = "NORMAL" # NORMAL, RISK, MACHINE_ERROR
        self.is_running: bool = False
        self.session_id: int = 1
        self.patient_id: int = 1
        self.tick_count: int = 0

    def set_mode(self, mode: str):
        mode = mode.upper()
        if mode in ["NORMAL", "RISK", "MACHINE_ERROR", "ERROR"]:
            self.current_mode = "MACHINE_ERROR" if mode == "ERROR" else mode
            logger.info(f"Simulator mode switched to: {self.current_mode}")
            return True
        return False

    def generate_reading(
        self,
        session_id: Optional[int] = None,
        patient_id: Optional[int] = None,
        mode_override: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generates realistic IoT sensor and machine readings according to active mode.
        """
        sid = session_id or self.session_id
        pid = patient_id or self.patient_id
        mode = (mode_override or self.current_mode).upper()
        self.tick_count += 1

        # Smooth periodic wave to simulate biological rhythms
        time_phase = (self.tick_count % 30) / 30.0

        if mode == "NORMAL":
            hr = round(74.0 + 5.0 * (random.random() - 0.5) + 3.0 * random.uniform(-1, 1), 1)
            spo2 = round(98.0 + random.uniform(-0.8, 1.2), 1)
            spo2 = min(100.0, max(96.0, spo2))
            temp = round(36.7 + random.uniform(-0.2, 0.3), 1)
            sys_bp = round(122.0 + 6.0 * (random.random() - 0.5), 1)
            dia_bp = round(78.0 + 4.0 * (random.random() - 0.5), 1)
            flow = round(300.0 + random.uniform(-10.0, 15.0), 1)
            pressure = round(120.0 + random.uniform(-8.0, 10.0), 1)
            machine_temp = round(36.8 + random.uniform(-0.2, 0.2), 1)
            machine_status = "RUNNING"

        elif mode == "RISK":
            # Hemodynamic collapse & circuit obstruction
            hr = round(132.0 + random.uniform(-5.0, 8.0), 1) # Tachycardia
            spo2 = round(86.5 + random.uniform(-3.0, 2.0), 1) # Hypoxemia
            temp = round(38.6 + random.uniform(-0.3, 0.4), 1) # Fever
            sys_bp = round(78.0 + random.uniform(-4.0, 5.0), 1) # Critical Hypotension
            dia_bp = round(48.0 + random.uniform(-4.0, 4.0), 1)
            flow = round(135.0 + random.uniform(-15.0, 15.0), 1) # Reduced flow
            pressure = round(235.0 + random.uniform(-10.0, 20.0), 1) # Venous high pressure alarm
            machine_temp = round(37.6 + random.uniform(-0.2, 0.5), 1)
            machine_status = "WARNING"

        elif mode in ["MACHINE_ERROR", "ERROR"]:
            hr = round(82.0 + random.uniform(-4.0, 4.0), 1)
            spo2 = round(95.0 + random.uniform(-1.0, 1.0), 1)
            temp = round(37.0 + random.uniform(-0.2, 0.2), 1)
            sys_bp = round(115.0 + random.uniform(-5.0, 5.0), 1)
            dia_bp = round(75.0 + random.uniform(-4.0, 4.0), 1)
            flow = 0.0 # Blood pump stopped
            pressure = round(255.0 + random.uniform(0.0, 15.0), 1) # Occlusion / high resistance
            machine_temp = round(39.2 + random.uniform(-0.2, 0.4), 1) # Pump motor overheat
            machine_status = "ERROR"

        else:
            # Default fallback
            hr, spo2, temp, sys_bp, dia_bp, flow, pressure, machine_temp, machine_status = (
                75.0, 98.0, 36.8, 120.0, 80.0, 300.0, 120.0, 37.0, "RUNNING"
            )

        return {
            "patient_id": pid,
            "session_id": sid,
            "heart_rate": hr,
            "spo2": spo2,
            "temperature": temp,
            "systolic_bp": sys_bp,
            "diastolic_bp": dia_bp,
            "blood_flow_rate": flow,
            "dialysis_pressure": pressure,
            "machine_temperature": machine_temp,
            "machine_status": machine_status,
            "timestamp": datetime.datetime.utcnow().isoformat()
        }

simulator = DialysisSimulator()
