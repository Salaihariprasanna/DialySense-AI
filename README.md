# DialySense AI: Real-Time IoT Dialysis Monitoring, AI Risk Prediction & Smart Alert System

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg?logo=react)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF.svg?logo=vite)](https://vitejs.dev)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.4-F7931E.svg?logo=scikit-learn)](https://scikit-learn.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%2B-336791.svg?logo=postgresql)](https://www.postgresql.org)
[![ESP32](https://img.shields.io/badge/ESP32-IoT-E7352C.svg?logo=espressif)](https://www.espressif.com)

---

## 📌 Project Overview

**DialySense AI** is a working college-level healthcare prototype demonstrating the complete pipeline:

```
ESP32 / Simulation  -->  FastAPI Ingestion  -->  PostgreSQL DB  -->  AI Risk Prediction  -->  Smart Alert Engine  -->  WebSocket Hub  -->  React Dashboard  -->  ReportLab PDF Reports
```

---

## 🚀 Key Features

1. **Patient Management & Dialysis Sessions**: CRUD for patient profiles, medical history, and treatment status (`SCHEDULED`, `ONGOING`, `PAUSED`, `COMPLETED`).
2. **Real-Time IoT Ingestion (`POST /api/readings`)**: Handles 2–5s telemetry intervals from ESP32 microcontrollers or the built-in simulator.
3. **Real-Time WebSocket Hub (`/ws/monitor/{session_id}`)**: Low-latency reactive telemetry broadcast directly into React Recharts.
4. **Explainable AI Risk Model**: Random Forest classifier + clinical heuristics outputting a `0–100 Risk Score`, categorical risk (`LOW`, `MODERATE`, `HIGH`), and factor explanations (e.g. *Intradialytic Hypotension*, *SpO2 Crash*).
5. **Smart Incident Alerts**: Instant flags (`INFO`, `WARNING`, `CRITICAL`) with 1-click clinical acknowledgment.
6. **Lightweight Digital Twin**: Animated visual virtual hemodialysis machine showing real-time blood pump rotor RPM, dialyzer semi-permeable fiber cleansing, and circuit pressure sensors.
7. **Clinical PDF Session Reports**: One-click ReportLab PDF generation with statistical telemetry summaries and doctor sign-off.
8. **Interactive 3-Mode Demo Controller**:
   - 🟢 `NORMAL`: Stable baseline parameters.
   - 🔴 `RISK`: Immediate hemodynamic collapse (SpO2 drop, hypotension, risk score 80+, critical alarm).
   - 🟡 `MACHINE ERROR`: Machine malfunction and fluid pump trip.

---

## 🛠️ Quick Start Guide

### Prerequisites
- Python 3.10+ (Python 3.13 supported)
- Node.js 18+ and npm
- PostgreSQL (or automated built-in SQLite fallback for instant zero-config testing)

---

### Step 1: Start Backend Server

```powershell
# In project root:
backend\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

Backend API Swagger Docs: `http://localhost:8000/docs`

---

### Step 2: Start React Frontend

```powershell
cd frontend
npm run dev
```

Open your browser at: `http://localhost:5173`

---

### Step 3: Run Standalone IoT Hardware Simulator (Optional)

```powershell
backend\venv\Scripts\python.exe iot\simulator_client.py
```

---

## 🧪 Verification & Testing

Run full end-to-end integration test suite:

```powershell
backend\venv\Scripts\python.exe backend\test_backend.py
```

---

## 📂 Project Structure

```
AI_DIALYSIS/
├── backend/
│   ├── app/
│   │   ├── ai/            # Scikit-Learn risk model & explainability
│   │   ├── models/        # SQLAlchemy PostgreSQL schemas
│   │   ├── routes/        # REST & IoT endpoints
│   │   ├── schemas/       # Pydantic validation schemas
│   │   ├── services/      # Alert engine, ReportLab PDF generator, Simulator
│   │   ├── websocket/     # Real-time WebSocket broadcasting manager
│   │   ├── config.py      # App configurations
│   │   ├── database.py    # PostgreSQL connection with SQLite fallback
│   │   └── main.py        # FastAPI entrypoint
│   ├── requirements.txt
│   └── test_backend.py    # Automated integration test suite
├── frontend/
│   ├── src/
│   │   ├── components/    # Dashboard, LiveMonitor, DigitalTwin, Patients, Machines, Alerts, Reports
│   │   ├── services/      # Axios API & WebSocket client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── tailwind.config.js
├── iot/
│   ├── esp32_dialysense.ino   # ESP32 C++ firmware
│   └── simulator_client.py    # Standalone terminal IoT client
├── ml/
│   ├── train_model.py         # AI dataset generator & model trainer
│   └── dialysis_risk_model.joblib
├── database/
│   ├── schema.sql
│   └── seed_data.sql
├── reports/               # Generated clinical PDF reports
└── README.md
```
