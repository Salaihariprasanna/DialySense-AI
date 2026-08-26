"""
DialySense AI - Standalone IoT Hardware Simulator Client
Streams telemetry packets to FastAPI backend (POST /api/readings) every 2–4 seconds.
Interactive keyboard shortcuts:
  [N] = Normal Mode
  [R] = Risk Collapse Mode
  [E] = Machine Error Mode
  [Q] = Quit
"""

import time
import requests
import random
import sys

API_URL = "http://localhost:8000/api/readings"
SESSION_ID = 1
PATIENT_ID = 1
MODE = "NORMAL"

def generate_payload(mode: str):
    if mode == "NORMAL":
        return {
            "patient_id": PATIENT_ID,
            "session_id": SESSION_ID,
            "heart_rate": round(75.0 + random.uniform(-4, 4), 1),
            "spo2": round(min(100.0, 98.0 + random.uniform(-1, 1.5)), 1),
            "temperature": round(36.8 + random.uniform(-0.2, 0.3), 1),
            "systolic_bp": round(122.0 + random.uniform(-5, 6), 1),
            "diastolic_bp": round(78.0 + random.uniform(-4, 4), 1),
            "blood_flow_rate": round(300.0 + random.uniform(-10, 10), 1),
            "dialysis_pressure": round(120.0 + random.uniform(-8, 8), 1),
            "machine_temperature": round(36.8 + random.uniform(-0.2, 0.2), 1),
            "machine_status": "RUNNING"
        }
    elif mode == "RISK":
        return {
            "patient_id": PATIENT_ID,
            "session_id": SESSION_ID,
            "heart_rate": round(135.0 + random.uniform(-5, 6), 1),
            "spo2": round(84.5 + random.uniform(-3, 2), 1),
            "temperature": round(38.8 + random.uniform(-0.2, 0.4), 1),
            "systolic_bp": round(76.0 + random.uniform(-4, 4), 1),
            "diastolic_bp": round(46.0 + random.uniform(-4, 4), 1),
            "blood_flow_rate": round(130.0 + random.uniform(-10, 10), 1),
            "dialysis_pressure": round(235.0 + random.uniform(-5, 15), 1),
            "machine_temperature": round(37.8 + random.uniform(-0.2, 0.3), 1),
            "machine_status": "WARNING"
        }
    elif mode == "ERROR":
        return {
            "patient_id": PATIENT_ID,
            "session_id": SESSION_ID,
            "heart_rate": round(80.0 + random.uniform(-3, 3), 1),
            "spo2": round(96.0 + random.uniform(-1, 1), 1),
            "temperature": round(37.0 + random.uniform(-0.1, 0.1), 1),
            "systolic_bp": round(116.0 + random.uniform(-4, 4), 1),
            "diastolic_bp": round(76.0 + random.uniform(-3, 3), 1),
            "blood_flow_rate": 0.0,
            "dialysis_pressure": 255.0,
            "machine_temperature": 39.4,
            "machine_status": "ERROR"
        }

def run_simulator():
    global MODE
    print("=" * 60)
    print(" DialySense AI - Real-Time IoT Telemetry Simulator")
    print(" Target API:", API_URL)
    print(" Active Mode:", MODE)
    print("=" * 60)

    tick = 0
    try:
        while True:
            tick += 1
            payload = generate_payload(MODE)
            try:
                start_t = time.time()
                res = requests.post(API_URL, json=payload, timeout=3.0)
                latency = int((time.time() - start_t) * 1000)
                if res.status_code == 201:
                    data = res.json()
                    print(f"[{tick:04d}] Mode={MODE:<6} | HR={payload['heart_rate']:<5} | SpO2={payload['spo2']:<4}% | BP={payload['systolic_bp']:.0f}/{payload['diastolic_bp']:.0f} | Flow={payload['blood_flow_rate']:<4} | Press={payload['dialysis_pressure']:<4} | AI Risk={data['risk_level']:<8} (Score:{data['risk_score']:<4}) | Alerts={data['alerts_triggered']} | {latency}ms")
                else:
                    print(f"[{tick:04d}] HTTP Error {res.status_code}: {res.text}")
            except Exception as e:
                print(f"[{tick:04d}] Connection error: {e}")

            time.sleep(3.0)
    except KeyboardInterrupt:
        print("\nSimulator stopped by user.")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        MODE = sys.argv[1].upper()
    run_simulator()
