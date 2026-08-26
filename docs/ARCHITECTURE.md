# DialySense AI Architecture & Technical Design

## 1. Executive Summary

**DialySense AI** is an end-to-end IoT, Machine Learning, and decision-support prototype designed for real-time hemodialysis clinical monitoring. The system continuously ingests patient hemodynamics and dialysis machine telemetry, executes an explainable AI risk classification algorithm, triggers smart alarms, broadcasts low-latency updates via WebSockets, visualizes machine state on a lightweight digital twin, and generates automated clinical PDF session reports.

---

## 2. Telemetry Ingestion & Real-Time Flow

```
+-------------------+        HTTP POST /api/readings
|  ESP32 / IoT Node | ------------------------------------+
|  (Wi-Fi Stream)   |                                     |
+-------------------+                                     v
                                             +-------------------------+
                                             |     FastAPI Backend     |
                                             +-------------------------+
                                                          |
                      +-------------------+---------------+-------------------+
                      |                   |                                   |
                      v                   v                                   v
             +-----------------+ +-------------------+             +----------------------+
             |   PostgreSQL    | | Explainable AI    |             |  Smart Alert Engine  |
             |   Persistence   | | Random Forest     |             |  (Threshold & Risk)  |
             +-----------------+ +-------------------+             +----------------------+
                                          |                                   |
                                          +-----------------+-----------------+
                                                            |
                                                            v
                                             +-----------------------------+
                                             |  WebSocket Broadcast Hub    |
                                             |  /ws/monitor/{session_id}   |
                                             +-----------------------------+
                                                            |
                                                            v
                                             +-----------------------------+
                                             | React Dashboard & Twin      |
                                             | (Recharts + Live Telemetry) |
                                             +-----------------------------+
                                                            |
                                                            v
                                             +-----------------------------+
                                             | ReportLab PDF Session Rep   |
                                             +-----------------------------+
```

---

## 3. Data Schema Specifications

### Telemetry Packet (JSON over HTTP)
```json
{
  "patient_id": 1,
  "session_id": 1,
  "heart_rate": 78.0,
  "spo2": 98.0,
  "temperature": 36.8,
  "systolic_bp": 120.0,
  "diastolic_bp": 80.0,
  "blood_flow_rate": 300.0,
  "dialysis_pressure": 120.0,
  "machine_temperature": 37.0,
  "machine_status": "RUNNING"
}
```

### AI Risk Assessment Output
- **Risk Score**: `0 – 100`
- **Risk Classification**: `LOW` (0–35), `MODERATE` (36–70), `HIGH` (71–100)
- **Clinical Attributions**:
  - Critical Intradialytic Hypotension (Systolic BP < 85 mmHg)
  - Severe Hypoxemia (SpO2 < 90%)
  - Tachycardia / Bradycardia (HR > 125 or < 50 BPM)
  - Circuit High Resistance / Clotting (Pressure > 210 mmHg)
  - Pyrogenic Reaction (Temperature > 38.5°C)

---

## 4. Hardware Deployment

For physical ESP32 deployment:
1. Flash `iot/esp32_dialysense.ino` with Arduino IDE / PlatformIO.
2. Update Wi-Fi SSID and backend URL (`http://<PC_IP>:8000/api/readings`).
3. Connect pulse oximeter (MAX30102 via I2C) and pressure transducers.
