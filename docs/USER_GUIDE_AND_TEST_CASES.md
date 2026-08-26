# DialySense AI: User Guide, Clinical Use Cases & Demo Test Cases

---

## 📖 1. How to Properly Use the Application

### Step 1: Open the Application
- Open your browser at **[http://localhost:5173](http://localhost:5173)**.
- Observe the top status bar:
  - **`Session: SES-202603-001 - John Doe (ONGOING)`**
  - **`ESP32 STREAMING`** (Green live WebSocket indicator)
  - **Live Treatment Clock**

---

### Step 2: The 7 Navigation Tabs

| Tab Name | Purpose & How to Use |
| :--- | :--- |
| **1. Dashboard** | **Overview Screen**: Shows 6 vital KPI cards (Patients, Sessions, Units), summary of the active patient, current vitals, AI Risk Gauge, and the 5 most recent incident alerts. |
| **2. Live Monitoring** | **Real-Time Telemetry Screen**: Displays 8 live metric cards and 4 real-time Recharts graphs (Heart Rate + SpO2, Blood Pressure Dynamics, Blood Flow + Circuit Pressure, Patient vs Dialysate Temp). |
| **3. Digital Twin** | **Virtual Machine Visualizer**: Animated fluid flow showing the patient's arterial line (red), the peristaltic blood pump rotating at matching RPM, dialyzer hollow fiber cleansing, fresh dialysate (cyan), effluent waste (yellow), and venous return (blue). |
| **4. Patients & Sessions** | **Registry & Treatment Dispatcher**: View registered patients, add new CKD patients, and click *"Start Session"* to assign an available machine and begin treatment. |
| **5. Machines** | **Hardware Fleet Monitor**: Displays machine inventory, serial numbers, IP addresses, and operational status (`RUNNING`, `AVAILABLE`, `ERROR`). |
| **6. Smart Alerts** | **Incident Resolution Center**: Review triggered alerts, filter by severity (`CRITICAL`, `WARNING`, `INFO`), and click *"Acknowledge"* to sign off on alarms. |
| **7. Session Reports** | **ReportLab PDF Generator**: Click *"Generate PDF"* next to any session to instantly compile a formatted medical session report and download it. |

---

## 🏥 2. Real-World Clinical Use Cases

### 🔹 Use Case 1: Early Detection of Intradialytic Hypotension (IDH)
- **Problem**: During dialysis, rapid fluid removal (ultrafiltration) often causes blood pressure to crash suddenly, leading to nausea, loss of consciousness, or cardiovascular shock.
- **DialySense AI Solution**: Continuous BP monitoring and AI risk scoring detect downward trends before systolic BP falls below critical limits (< 85 mmHg), triggering an immediate **HIGH RISK (Score 80+)** flag and **CRITICAL HYPOTENSION** alert so nurses can pause ultrafiltration and adjust dialysate temperature.

### 🔹 Use Case 2: Dialyzer Circuit Occlusion & Clotting
- **Problem**: Blood can clot inside the dialyzer fibers or needles can kink, creating high venous line pressure.
- **DialySense AI Solution**: Pressure sensors flag venous resistance when pressure exceeds 180–210 mmHg, activating the **CIRCUIT HIGH PRESSURE** alarm and updating the Digital Twin gauge.

### 🔹 Use Case 3: Pyrogenic / Hypoxemic Reaction
- **Problem**: Dialysate contamination or underlying infection can trigger a sudden fever (> 38.5°C) and oxygen desaturation (SpO2 < 90%).
- **DialySense AI Solution**: Multimodal AI evaluates the combined drop in oxygen and spike in temperature, alerting staff to supply supplemental oxygen.

---

## 🧪 3. Sample Demo Test Cases (Step-by-Step for Presentation)

### 📌 Test Case 1: Normal Hemodialysis Treatment (Baseline)
- **Objective**: Verify stable baseline vitals and LOW risk classification.
- **Action**: Click the green **`NORMAL`** button (or turn on **`Auto Stream (3s)`**).
- **Expected Results**:
  - Heart Rate: ~75 BPM (Normal)
  - SpO2: ~98% (Healthy)
  - Blood Pressure: ~122/78 mmHg
  - Blood Flow: ~300 mL/min
  - Circuit Pressure: ~120 mmHg
  - **AI Risk Gauge**: **`LOW RISK`** (Score: **8 – 15 / 100**)
  - **Alerts**: None (Clean green state)
  - **Digital Twin**: Smooth fluid circulation, rotor spinning steadily at ~255 RPM.

---

### 📌 Test Case 2: Hemodynamic Collapse & High Risk Alert Surge
- **Objective**: Demonstrate instant AI risk escalation and smart alert generation without refreshing.
- **Action**: Click the red **`RISK`** button in the top toolbar.
- **Expected Results**:
  - Heart Rate: Spikes to **~135 BPM** (Tachycardia)
  - SpO2: Drops to **~84%** (Severe Hypoxemia)
  - Blood Pressure: Collapses to **~76/46 mmHg** (Intradialytic Hypotension)
  - Circuit Pressure: Jumps to **~235 mmHg** (High resistance alarm)
  - **AI Risk Gauge**: Surges instantly to **`HIGH RISK`** (Score: **80 – 100 / 100**)
  - **AI Factor Explanations**: Lists *"Critical Intradialytic Hypotension"*, *"Severe Hypoxemia"*, *"Circuit High Pressure"*.
  - **Top Banner**: Red emergency flashing banner appears with sound/visual cue.
  - **Smart Alerts Tab**: Adds 4+ Critical/Warning alerts to the incident queue.

---

### 📌 Test Case 3: Machine Pump Failure & Digital Twin Response
- **Objective**: Demonstrate virtual machine synchronization upon hardware fault.
- **Action**: Click the amber **`MACHINE ERROR`** button in the toolbar, then switch to the **`Digital Twin`** tab.
- **Expected Results**:
  - Machine Status changes from `RUNNING` to **`ERROR`** (Flashing red badge).
  - Blood Flow Rate drops to **0 mL/min**.
  - Digital Twin pump rotor stops spinning.
  - Generates a **`CRITICAL: Dialysis Machine Malfunction`** incident alarm.

---

### 📌 Test Case 4: Generating Clinical PDF Session Report
- **Objective**: Export an official documentation report for medical records.
- **Action**: 
  1. Click on the **`Session Reports`** tab.
  2. Click the **`Generate PDF`** button for Session `SES-202603-001`.
  3. Click **`Download Official PDF`**.
- **Expected Results**:
  - ReportLab compiles a PDF document.
  - The PDF includes:
    1. Patient demographics (John Doe, Age 58, Stage 5 CKD).
    2. Min / Avg / Max tables for Heart Rate, SpO2, and Blood Pressure.
    3. Peak AI Risk Score and Clinical Attribution Factors.
    4. Time-stamped incident alerts log.
    5. Attending Nephrologist signature & stamp section.
