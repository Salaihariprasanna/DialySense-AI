# 🎓 DialySense AI: 5-Minute Viva Practical Demonstration Script

Use this exact script and step-by-step action plan during your college project presentation and viva evaluation.

---

## ⏱️ The 5-Minute Viva Demonstration Flow

```
[00:00 - 01:00]  1. Login & System Architecture Introduction
[01:00 - 02:00]  2. Test Case 1: Normal Baseline Dialysis (LOW Risk)
[02:00 - 03:30]  3. Test Case 2: Acute Hemodynamic Collapse (HIGH Risk & Live Alerts)
[03:30 - 04:15]  4. Test Case 3: Pump Hardware Failure & Digital Twin
[04:15 - 05:00]  5. Test Case 4: Clinical PDF Report Export & Sign-Off
```

---

## 🎬 Step-by-Step Script & Actions

### 📍 Act 1: Login & System Architecture (1 Minute)

#### 🖥️ Your Action on Screen:
1. Open **[http://localhost:5173](http://localhost:5173)**.
2. The **Clinical Staff Authentication** login page appears.
3. Click the blue **`Dr. Sarah Jenkins (Lead Nephrologist)`** 1-click login button.
4. You are immediately taken to the **Dashboard**.

#### 🗣️ What to Say to the Examiner:
> *"Respected Examiners, this is **DialySense AI**, an IoT and Artificial Intelligence decision-support system for real-time hemodialysis monitoring.*
>
> *During hemodialysis, patients risk fatal sudden complications like blood pressure collapse and filter clotting. Our system connects an **ESP32 IoT sensor node** over **Wi-Fi** to a **FastAPI backend**, persists data in **PostgreSQL**, evaluates patient risk using a **Random Forest ML model**, and streams updates in **sub-10ms via WebSockets** to this React dashboard."*

---

### 📍 Act 2: Test Case 1 — Normal Baseline Telemetry (1 Minute)

#### 🖥️ Your Action on Screen:
1. In the top toolbar, click the green **`NORMAL`** button.
2. Click **`Auto Stream (3s)`** to start live streaming.
3. Navigate to the **`Live Monitoring`** tab.

#### 🔍 Point to These Numbers on Screen:
- **Heart Rate**: `76 BPM` (Green / Normal range: 60–100)
- **$SpO_2$**: `98%` (Normal saturation)
- **Blood Pressure**: `122/78 mmHg` (Normotensive)
- **Blood Flow**: `300 mL/min` | **Circuit Pressure**: `120 mmHg`
- **Clinical Risk Index**: **`LOW RISK (Score: 8–12 / 100)`**
- **Live Recharts**: Show the steady, smooth parallel lines drawing in real time.

#### 🗣️ What to Say to the Examiner:
> *"Here, the system is ingesting stable patient telemetry every 3 seconds. The Recharts graphs draw live physiological curves, and our AI model classifies the hemodynamic state as **LOW RISK** with a score of 8/100. No alarms are triggered because all vitals are within safe nephrology limits."*

---

### 📍 Act 3: Test Case 2 — Acute Hemodynamic Collapse (1.5 Minutes)

#### 🖥️ Your Action on Screen:
1. In the top toolbar, click the red **`RISK COLLAPSE`** button.
2. **Do NOT refresh the page** — watch the screen react instantly.

#### 🔍 Point to These Real-Time Changes on Screen:
- **Red Emergency Alert Banner**: Flashes across the top of the entire screen (`CRITICAL PATIENT ALERT`).
- **Heart Rate**: Spikes to **`136 BPM`** (Severe Tachycardia).
- **$SpO_2$**: Crashes to **`84%`** (Critical Hypoxemia).
- **Blood Pressure**: Collapses to **`74/45 mmHg`** (Severe Intradialytic Hypotension).
- **Venous Pressure**: Spikes to **`235 mmHg`** (Clotting Resistance).
- **Clinical Risk Index Box**: Surges to **`HIGH RISK (Score: 100 / 100)`**.
- **Pathophysiological Findings**: The AI lists the exact reasons:
  - *Critical Intradialytic Hypotension (Sys BP 74 mmHg)*
  - *Severe Hypoxemia (SpO2 84.5%)*
  - *Extracorporeal Venous High Pressure (235 mmHg)*
3. Switch to the **`Clinical Alerts`** tab to show the 4 generated alarms, and click **`Acknowledge`** on one of them.

#### 🗣️ What to Say to the Examiner:
> *"Now, I have simulated a sudden Intradialytic Hypotension and Hypoxemic crisis. Notice that without refreshing the page, the WebSocket hub immediately pushed the crisis state to the dashboard.*
>
> *The AI model instantly surged the Instability Index to **100/100 (HIGH RISK)** and provided explainable medical findings. The Smart Alert Engine created critical incident flags so nursing staff can immediately suspend ultrafiltration and administer oxygen."*

---

### 📍 Act 4: Test Case 3 — Hardware Pump Failure & Digital Twin (1 Minute)

#### 🖥️ Your Action on Screen:
1. In the top toolbar, click the amber **`MACHINE ERROR`** button.
2. Click the **`Digital Twin`** tab.

#### 🔍 Point to These Elements on Screen:
- **Machine State**: Displays **`ERROR`** in flashing red.
- **Blood Flow Rate**: Drops to **`0 mL/min`**.
- **Virtual Peristaltic Blood Pump Rotor**: Completely stops rotating (0 RPM).
- **Circuit Safety Diagnostics**: The Transmembrane Pressure (TMP) flags a warning.

#### 🗣️ What to Say to the Examiner:
> *"Here, we demonstrate our **Lightweight Digital Twin**. When a hardware blood pump trips or stalls, the software digital twin dynamically stops its animated peristaltic rotor (0 RPM) and alerts the biomedical engineering team to prevent blood line rupture."*

---

### 📍 Act 5: Test Case 4 — Generating the Clinical PDF Report (0.5 Minutes)

#### 🖥️ Your Action on Screen:
1. Click the **`Clinical Reports`** tab.
2. Click **`Generate PDF`** on Session `SES-202603-001`.
3. Click **`Download Official PDF`**.
4. Open the downloaded PDF in your browser.

#### 🔍 Point to These Sections in the PDF:
- Official Header: *Department of Nephrology & Hemodialysis*.
- Patient Demographics & Prescription table.
- Telemetry Summary table (Min / Avg / Max observed values).
- Clinical Risk Assessment & Pathophysiological Findings.
- Attending Nephrologist signature & hospital stamp section.

#### 🗣️ What to Say to the Examiner:
> *"Finally, the system compiles a complete medical record using Python's **ReportLab** library. It calculates statistical minimums, averages, and maximums across all telemetry readings, formats the AI findings into authentic clinical hospital terminology, and creates a sign-off sheet for the attending nephrologist."*

---

## 📊 Summary Table of Test Cases (For Presentation Handout)

| Test Case | Simulated Condition | Input Telemetry | Expected Software Response |
| :--- | :--- | :--- | :--- |
| **TC-01** | **Normal Stable Treatment** | HR: 76 BPM, SpO2: 98%, BP: 122/78 mmHg, Flow: 300 mL/min, Press: 120 mmHg | **LOW RISK (Score: 8/100)**, steady Recharts curves, no alarms, smooth pump rotation. |
| **TC-02** | **Intradialytic Hypotension (IDH)** | HR: 136 BPM, SpO2: 84%, BP: 74/45 mmHg, Flow: 130 mL/min, Press: 235 mmHg | **HIGH RISK (Score: 100/100)**, top flashing Red Emergency Banner, 4 Critical Alarms generated. |
| **TC-03** | **Pump Motor Failure** | Flow: 0 mL/min, Machine State: ERROR, Press: 255 mmHg | **Machine ERROR state**, Digital Twin pump stops (0 RPM), Pump Malfunction Critical Alarm. |
| **TC-04** | **PDF Session Report Generation** | Session ID: 1 | Multi-page ReportLab PDF compiled with min/avg/max telemetry tables and doctor sign-off. |
