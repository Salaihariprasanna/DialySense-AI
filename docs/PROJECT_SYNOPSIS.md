# PROJECT SYNOPSIS

---

## 📌 Project Title
**DialySense AI – Smart IoT-Based Dialysis Monitoring & AI Risk Prediction System**

---

## 📝 Simple Overview
**DialySense AI** is an intelligent IoT and Artificial Intelligence healthcare platform designed to continuously monitor chronic kidney disease (CKD) patients and dialysis machines during hemodialysis treatment in real time. 

An **ESP32 microcontroller** collects physiological vitals (Heart Rate, Oxygen Saturation $SpO_2$, Blood Pressure, Body Temperature) and extracorporeal machine telemetry (Blood Flow Rate, Venous Circuit Pressure, Dialysate Temperature). This telemetry is transmitted over **Wi-Fi** to a **FastAPI backend**, persisted in a **PostgreSQL database**, and displayed on an interactive **React dashboard**. 

A **Machine Learning module** evaluates incoming readings to classify patient condition into **Low, Medium, or High Risk** states. If acute abnormalities (such as Intradialytic Hypotension or circuit clotting) are detected, the system triggers instant visual and auditory alerts, synchronizes an animated **Virtual Digital Twin**, and compiles official **ReportLab clinical PDF reports** for nephrologists.

---

## 💻 Technologies Used

| Layer | Technologies & Tools |
| :--- | :--- |
| **Frontend** | React 18, Vite, JavaScript, Tailwind CSS, Recharts, Axios, Lucide Icons, WebSockets |
| **Backend** | Python 3.13, FastAPI, SQLAlchemy, Pydantic, Uvicorn, WebSocket (RFC 6455) |
| **Database** | PostgreSQL (with automatic zero-configuration SQLite local fallback) |
| **AI / Machine Learning** | Python, Scikit-learn (Random Forest Classifier), Pandas, NumPy |
| **IoT & Embedded** | ESP32 Development Board, Wi-Fi (802.11 b/g/n), MAX30102 (PPG), DS18B20 (Temp), Pressure Transducer ADC |
| **Reports** | ReportLab (Automated Medical PDF Generation Engine) |
| **Tools & Environment** | VS Code, Arduino IDE, Git |

---

## 🎯 Scope of the Project

1. **Patient & Fleet Management**:
   - Register patient demographics, chronic disease stages, and emergency contacts.
   - Maintain hemodialysis machine fleet inventory, bed assignments, and operational states (`AVAILABLE`, `RUNNING`, `ERROR`).
   - Launch and schedule individual dialysis prescription sessions.

2. **Real-Time IoT Telemetry Monitoring**:
   - Continuous multi-sensor data acquisition every 2–5 seconds.
   - Live dual-axis time-series visualization using Recharts (Heart Rate, $SpO_2$, Blood Pressure area curves, Blood Flow vs. Venous Pressure).

3. **Explainable AI Risk Stratification**:
   - Hybrid machine learning ensembling (Random Forest + deterministic clinical safety rules).
   - Generates a **0–100 Clinical Instability Index** with transparent pathophysiological factor attribution.

4. **Extracorporeal Digital Twin**:
   - Software-based virtual machine modeling patient arterial blood draw, dynamically synchronized blood pump rotor RPM ($0.85 \times \text{Flow Rate}$), dialyzer hollow-fiber filtration, and venous bubble trap resistance.

5. **Smart Alerts & Incident Response**:
   - Prioritized clinical alarm dispatch (`CRITICAL`, `WARNING`, `INFO`) with 20-second deduplication and nursing sign-off acknowledgment.

6. **Automated Clinical Documentation**:
   - Instant 1-click compilation of medical session summaries into official PDF format with statistical telemetry analysis (Min / Avg / Max) and attending doctor signature section.
