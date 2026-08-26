# DialySense AI: Complete Deep-Dive of Every Unit, Module & Graph

This document provides a comprehensive technical and clinical explanation of every physical parameter, software module, backend service, frontend component, and live chart in **DialySense AI**.

---

## 📑 TABLE OF CONTENTS
1. [Physical Telemetry Parameters & Sensor Units](#1-physical-telemetry-parameters--sensor-units)
2. [Detailed Graph & Chart Explanations (Recharts)](#2-detailed-graph--chart-explanations)
3. [Virtual Machine Digital Twin Breakdown](#3-virtual-machine-digital-twin-breakdown)
4. [Backend Modules & Architecture Deep Dive](#4-backend-modules--architecture-deep-dive)
5. [AI Risk Prediction & Clinical Scoring Engine](#5-ai-risk-prediction--clinical-scoring-engine)
6. [Frontend UI Components Deep Dive](#6-frontend-ui-components-deep-dive)

---

# 1. Physical Telemetry Parameters & Sensor Units

DialySense AI monitors **8 critical real-time parameters** divided into **Patient Physiological Vitals** and **Dialysis Machine Extracorporeal Circuit Telemetry**:

### A. Patient Physiological Vitals

#### 1. Heart Rate (Pulse)
- **Unit**: Beats Per Minute (**BPM**)
- **Hardware Sensor**: MAX30102 / MAX30100 Optical Photoplethysmography (PPG) sensor via I2C (GPIO 21, 22).
- **Normal Clinical Range**: `60 – 100 BPM`
- **Clinical Significance**:
  - **Tachycardia (> 120 BPM)** indicates hypovolemic stress, rapid blood volume loss from high ultrafiltration rate, or pyrogenic fever.
  - **Bradycardia (< 50 BPM)** warns of dangerous hyperkalemia (high potassium) or vagal reactions.

#### 2. Oxygen Saturation ($SpO_2$)
- **Unit**: Percentage (**%**)
- **Hardware Sensor**: MAX30102 dual-wavelength (Red 660nm and Infrared 880nm LEDs).
- **Normal Clinical Range**: `95.0% – 100.0%`
- **Clinical Significance**:
  - Drops below **90.0%** indicate acute hypoxemic desaturation, pulmonary congestion, or fluid overload.

#### 3. Blood Pressure (Systolic / Diastolic)
- **Unit**: Millimeters of Mercury (**mmHg**)
- **Hardware Interface**: NIBP (Non-Invasive Blood Pressure) cuff transducer or continuous arterial pulse waveform approximation.
- **Normal Clinical Range**: `100–140 / 60–90 mmHg` (Standard: `120/80 mmHg`)
- **Clinical Significance**:
  - **Intradialytic Hypotension (Systolic < 85 mmHg)** is the #1 acute killer during dialysis. It occurs when fluid is filtered faster than the vascular space can refill.
  - **Hypertensive Emergency (Systolic > 180 mmHg)** increases stroke and cardiovascular event risk.

#### 4. Patient Core Body Temperature
- **Unit**: Degrees Celsius (**°C**)
- **Hardware Sensor**: DS18B20 digital waterproof probe / NTC thermistor (GPIO 4).
- **Normal Clinical Range**: `36.5°C – 37.2°C`
- **Clinical Significance**:
  - **Fever (> 38.5°C)** signals a pyrogenic reaction from dialysate contamination or bacteremia (access infection).

---

### B. Machine & Extracorporeal Circuit Telemetry

#### 5. Extracorporeal Blood Flow Rate ($Q_b$)
- **Unit**: Milliliters per Minute (**mL/min**)
- **Hardware Sensor**: Hall-effect pulse flow sensor or peristaltic pump motor encoder feedback (GPIO 35).
- **Normal Clinical Range**: `250 – 400 mL/min` (Standard Target: `300 mL/min`)
- **Clinical Significance**:
  - Measures the volume of blood delivered to the dialyzer filter. A drop below **180 mL/min** indicates poor vascular access blood draw or catheter thrombosis. `0 mL/min` indicates pump trip.

#### 6. Dialysis Venous Return Pressure ($P_v$)
- **Unit**: Millimeters of Mercury (**mmHg**)
- **Hardware Sensor**: Piezoresistive pressure transducer / strain gauge ADC (GPIO 34).
- **Normal Clinical Range**: `80 – 160 mmHg` (Safety Upper Limit: `210 mmHg`)
- **Clinical Significance**:
  - Measures the pressure required to return purified blood through the venous needle. If pressure exceeds **210 mmHg**, it indicates dialyzer fiber clotting, line kinking, or venous needle obstruction.

#### 7. Dialysate Temperature ($T_d$)
- **Unit**: Degrees Celsius (**°C**)
- **Hardware Sensor**: Internal temperature probe in the dialysate heating bath.
- **Normal Clinical Range**: `36.5°C – 37.0°C`
- **Clinical Significance**:
  - Dialysate fluid directly exchanges heat with blood across the membrane. Overheating (> 38.0°C) causes vasodilation and worsens hypotension.

#### 8. Machine Operational Status
- **Values**: `RUNNING` | `WARNING` | `ERROR` | `MAINTENANCE` | `AVAILABLE`
- **Clinical Significance**: Indicates whether the physical blood pump and hydraulic balance systems are running safely.

---

# 2. Detailed Graph & Chart Explanations (Recharts)

The **Live Monitoring** tab displays **4 live time-series Recharts graphs** updating in real time. Here is what each graph shows:

---

### 📈 Chart 1: Heart Rate (BPM) & $SpO_2$ (%) Dual-Axis Line Graph

```
  BPM                                                       %
  160 ┼                                                   ┼ 100
      │       /─── Heart Rate (Rose Red Line)             │
  100 ┼──────/────────────────────────────────────────────┼─── 95 Target
      │                                                   │
   60 ┼───────────────────────────────────────────────────┼─── 90 Danger
      │                  \___ SpO2 (Cyan Blue Line)       │
   40 ┼                                                   ┼  70
      └───────────────────────────────────────────────────┘
```

- **Visual Elements**:
  - **Left Y-Axis (Rose Red)**: Measures Heart Rate from `40 to 160 BPM`.
  - **Right Y-Axis (Cyan Blue)**: Measures Oxygen Saturation from `70% to 100%`.
  - **X-Axis**: Real-time timestamps (keeps last 40 time-series observations).
- **Clinical Interaction**:
  - During **NORMAL mode**, Heart Rate stays near ~75 BPM and SpO2 stays at ~98%.
  - During **RISK mode**, you visually see the **Rose Red curve shoot upward (Tachycardia)** while the **Cyan Blue curve dives downward (Hypoxia)**, highlighting cardiorespiratory distress.

---

### 📈 Chart 2: Blood Pressure Dynamics (Area Chart)

```
  mmHg
  200 ┼
      │    ┌──────────────────────────────────┐  <-- Systolic BP (Sky Blue Area)
  120 ┼────┴──────────────────────────────────┴────
      │    ┌──────────────────────────────────┐  <-- Diastolic BP (Indigo Line)
   80 ┼────┴──────────────────────────────────┴────
      │                     \
   50 ┼                      \___ Sudden IDH Drop
      └────────────────────────────────────────────
```

- **Visual Elements**:
  - **Sky Blue Area**: Systolic Blood Pressure with soft gradient fill.
  - **Indigo Line**: Diastolic Blood Pressure.
  - **Y-Axis Range**: `30 to 200 mmHg`.
- **Clinical Interaction**:
  - Shows hemodynamic stability over the course of the 4-hour treatment.
  - When Intradialytic Hypotension occurs, the Sky Blue mountain shape collapses down to 74 mmHg, visually demonstrating sudden volume depletion.

---

### 📈 Chart 3: Blood Flow Rate & Circuit Venous Pressure

```
  mL/min                                                 mmHg
  450 ┼                                                   ┼ 300
      │   ════════ Blood Flow (Indigo Line)               │
  300 ┼───────────────────────────────────────────────────┼─── 210 Alarm Limit
      │                                    /── Pressure   │
  150 ┼───────────────────────────────────/───────────────┼─── 120 Normal
      │                                                   │
    0 ┼                                                   ┼   0
      └───────────────────────────────────────────────────┘
```

- **Visual Elements**:
  - **Left Y-Axis (Indigo)**: Blood Flow Rate (`0 to 450 mL/min`).
  - **Right Y-Axis (Teal)**: Venous Circuit Pressure (`0 to 300 mmHg`).
- **Clinical Interaction**:
  - Detects vascular line occlusion and fiber clotting.
  - If Venous Pressure rises above the **210 mmHg line**, it reveals that the machine is fighting high resistance in the return cannula.

---

### 📈 Chart 4: Patient Body Temp vs Dialysate Temp

```
  °C
  41.0 ┼
       │               /─── Patient Temp (Amber Solid Line)
  38.5 ┼──────────────/───────────────────────────────────────── (Fever Threshold)
       │  - - - - - - - - - - Dialysate Temp (Sky Blue Dashed)
  36.5 ┼──────────────────────────────────────────────────────── (Baseline)
  34.0 ┼
       └────────────────────────────────────────────────────────
```

- **Visual Elements**:
  - **Amber Solid Line**: Patient's core body temperature.
  - **Sky Blue Dashed Line**: Internal dialysate temperature bath.
  - **Y-Axis Range**: `34.0°C to 41.0°C`.
- **Clinical Interaction**:
  - Evaluates thermal equilibrium. A sudden rise in patient temp without an increase in dialysate temp confirms a biological pyrogenic or infectious reaction.

---

# 3. Virtual Machine Digital Twin Breakdown

The **Lightweight Digital Twin** (`DigitalTwin.jsx`) is a software model of the physical hemodialysis machine.

```
       [ PATIENT ARTERIAL ACCESS ]
                  │
                  ▼ (Red Blood Line - Animated Flow)
       ┌────────────────────────┐
       │ PERISTALTIC BLOOD PUMP │  <-- Rotates dynamically at:
       │  Rotor RPM = Flow×0.85 │      RPM = (Blood Flow × 0.85)
       └────────────────────────┘
                  │
                  ▼
       ┌────────────────────────┐  <-- Fresh Dialysate (Cyan Line In)
       │    DIALYZER CYLINDER   │
       │ (Hollow Fiber Membrane)│
       └────────────────────────┘  <-- Effluent / Waste (Yellow Line Out)
                  │
                  ▼
       ┌────────────────────────┐
       │  VENOUS BUBBLE TRAP    │  <-- Color turns RED if Pressure > 210 mmHg
       │  & PRESSURE TRANSDUCER │
       └────────────────────────┘
                  │
                  ▼ (Blue Venous Line - Cleaned Blood Return)
       [ PATIENT VENOUS RETURN ]
```

### Digital Twin Components:
1. **Patient Vascular Access Box**: Represents the AV Fistula or Central Venous Catheter.
2. **Arterial Blood Line (Red Tube)**: Uses SVG `stroke-dashoffset` animation to show blood moving toward the pump.
3. **Peristaltic Blood Pump Rotor**: An animated 4-blade rotor whose CSS rotation speed matches the actual flow rate (e.g. at 300 mL/min, rotates at ~255 RPM; at 0 mL/min on Machine Error, stops completely).
4. **Dialyzer Cylinder**: Renders semi-permeable hollow fiber capillaries where toxins diffuse across membranes.
5. **Dialysate Circuit**: Cyan stream flowing counter-current into the dialyzer, and yellow effluent line draining urea, creatinine, and ultrafiltered water.
6. **Venous Return Bubble Trap & Sensor**: Monitors air removal and venous pressure. The digital readout and box border flash red during pressure alarms.

---

# 4. Backend Modules & Architecture Deep Dive

### 📂 Directory Architecture
```
backend/
├── app/
│   ├── ai/
│   │   └── risk_model.py         # AI inference & explainability engine
│   ├── models/
│   │   ├── patient.py            # Patient SQL schema
│   │   ├── machine.py            # Machine inventory SQL schema
│   │   ├── session.py            # Dialysis session lifecycle schema
│   │   ├── reading.py            # Telemetry stream SQL schema
│   │   ├── risk.py               # Risk predictions schema
│   │   ├── alert.py              # Clinical alarms schema
│   │   └── report.py             # PDF reports schema
│   ├── routes/
│   │   ├── patients.py           # Patient CRUD API
│   │   ├── machines.py           # Machine fleet API
│   │   ├── sessions.py           # Session management API
│   │   ├── readings.py           # IoT Ingestion & WebSocket broadcasting API
│   │   ├── alerts.py             # Alarms & acknowledgment API
│   │   ├── reports.py            # PDF report generator API
│   │   └── simulation.py         # 3-Mode simulator API
│   ├── schemas/                  # Pydantic validation schemas
│   ├── services/
│   │   ├── alert_engine.py       # Threshold alarm evaluator & deduplicator
│   │   ├── report_generator.py   # ReportLab PDF compiler
│   │   └── simulator.py          # Synthetic telemetry generator
│   ├── websocket/
│   │   └── manager.py            # ConnectionManager & low-latency broadcasting
│   ├── config.py                 # Pydantic settings & DB configs
│   ├── database.py               # SQLAlchemy engine with SQLite fallback
│   └── main.py                   # FastAPI application entrypoint & lifespan
└── test_backend.py               # Automated integration test harness
```

---

# 5. AI Risk Prediction & Clinical Scoring Engine

### 🧠 Model Architecture:
1. **Classifier**: Scikit-Learn `RandomForestClassifier` (100 Decision Trees, Max Depth = 10, Balanced class weights).
2. **Training Corpus**: 6,000 synthesized hemodialysis treatment sessions calibrated against nephrology clinical distributions (`ml/train_model.py`).
3. **Feature Vector**:
   $$\vec{x} = [\text{HR}, \text{SpO}_2, \text{Temp}, \text{SysBP}, \text{DiaBP}, \text{BloodFlow}, \text{CircuitPressure}, \text{Age}]$$

### 📐 Ensembling & Scoring Formula:
The system combines ML prediction probabilities with deterministic clinical safety penalties:

$$\text{Risk Score} = 0.60 \times \text{Clinical Penalty} + 0.40 \times \text{ML Probability Score}$$

Where:
- **Clinical Penalty** accumulates points for severe physiological deviations:
  - $\text{SpO}_2 < 88\%$: $+35\text{ pts}$
  - $\text{Systolic BP} < 85\text{ mmHg}$: $+38\text{ pts}$
  - $\text{Venous Pressure} > 220\text{ mmHg}$: $+35\text{ pts}$
  - $\text{Heart Rate} > 130\text{ or } < 50\text{ BPM}$: $+30\text{ pts}$
  - $\text{Machine Error State}$: $+45\text{ pts}$

### 🚦 Risk Classification Bands:
- **`LOW RISK`** (`0.0 – 34.9`): Hemodynamics stable. Standard dialysis protocol.
- **`MODERATE / MEDIUM RISK`** (`35.0 – 69.9`): Mild hemodynamic instability. Increase monitoring frequency.
- **`HIGH RISK`** (`70.0 – 100.0`): Critical collapse or machine failure. Immediate nursing/nephrologist intervention required.

---

# 6. Frontend UI Components Deep Dive

| Component File | Role & Key Functions |
| :--- | :--- |
| **`Navbar.jsx`** | Header navigation bar, active session selector dropdown, green/red live WebSocket pulse badge, and real-time treatment clock. |
| **`DemoControls.jsx`** | Top toolbar with **`NORMAL`**, **`RISK`**, **`MACHINE ERROR`**, **`Step Tick`**, and **`Auto Stream (3s)`** buttons for live demonstrations. |
| **`Dashboard.jsx`** | Executive overview screen showing 6 KPI metric boxes, active patient card, vital matrix, and recent alarm incident table. |
| **`LiveMonitor.jsx`** | Primary telemetry monitor featuring 8 live vital cards and 4 real-time Recharts graphs. |
| **`DigitalTwin.jsx`** | Interactive virtual hemodialysis machine with animated blood lines, pump rotor, and dialyzer filter. |
| **`Patients.jsx`** | Patient directory table with search filtering, Add New Patient modal, and Start Dialysis Session modal. |
| **`Machines.jsx`** | Dialysis machine inventory grid with operational status badges and **Add New Machine** modal. |
| **`Alerts.jsx`** | Smart incident resolution center with severity filters (`ALL`, `CRITICAL`, `WARNING`, `INFO`), audit logs, and 1-click alarm acknowledgment. |
| **`Reports.jsx`** | Session report portal with 1-click **Generate PDF** button and direct download link. |
