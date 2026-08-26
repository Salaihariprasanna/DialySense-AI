-- ==========================================================
-- DialySense AI Database Schema (PostgreSQL)
-- ==========================================================

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'NURSE',
    hashed_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Patients
CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    patient_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    age INTEGER NOT NULL,
    gender VARCHAR(10) NOT NULL,
    blood_group VARCHAR(5) NOT NULL,
    disease_stage VARCHAR(50) NOT NULL,
    doctor VARCHAR(100) NOT NULL,
    contact VARCHAR(20) NOT NULL,
    emergency_contact VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Machines
CREATE TABLE IF NOT EXISTS machines (
    id SERIAL PRIMARY KEY,
    machine_code VARCHAR(30) UNIQUE NOT NULL,
    model VARCHAR(50) DEFAULT 'DialySense Pro-5000',
    serial_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'AVAILABLE',
    location VARCHAR(50) DEFAULT 'Ward A - Bed 1',
    ip_address VARCHAR(50),
    last_maintenance TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Dialysis Sessions
CREATE TABLE IF NOT EXISTS dialysis_sessions (
    id SERIAL PRIMARY KEY,
    session_code VARCHAR(30) UNIQUE NOT NULL,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    machine_id INTEGER REFERENCES machines(id) ON DELETE SET NULL,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    status VARCHAR(20) DEFAULT 'SCHEDULED',
    target_duration_mins INTEGER DEFAULT 240,
    actual_duration_mins INTEGER DEFAULT 0,
    target_uf_volume_ml DOUBLE PRECISION DEFAULT 2500.0,
    prescribed_dialysate_temp DOUBLE PRECISION DEFAULT 36.5,
    prescribed_blood_flow DOUBLE PRECISION DEFAULT 300.0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Sensor Readings (Telemetry Stream)
CREATE TABLE IF NOT EXISTS sensor_readings (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES dialysis_sessions(id) ON DELETE CASCADE,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    heart_rate DOUBLE PRECISION NOT NULL,
    spo2 DOUBLE PRECISION NOT NULL,
    temperature DOUBLE PRECISION NOT NULL,
    systolic_bp DOUBLE PRECISION NOT NULL,
    diastolic_bp DOUBLE PRECISION NOT NULL,
    blood_flow_rate DOUBLE PRECISION NOT NULL,
    dialysis_pressure DOUBLE PRECISION NOT NULL,
    machine_temperature DOUBLE PRECISION NOT NULL,
    machine_status VARCHAR(30) DEFAULT 'RUNNING'
);

-- 6. Risk Predictions (AI Outputs)
CREATE TABLE IF NOT EXISTS risk_predictions (
    id SERIAL PRIMARY KEY,
    reading_id INTEGER UNIQUE NOT NULL REFERENCES sensor_readings(id) ON DELETE CASCADE,
    session_id INTEGER NOT NULL REFERENCES dialysis_sessions(id) ON DELETE CASCADE,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    risk_level VARCHAR(20) NOT NULL,
    risk_score DOUBLE PRECISION NOT NULL,
    factors TEXT NOT NULL,
    recommendation TEXT
);

-- 7. Smart Alerts
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES dialysis_sessions(id) ON DELETE CASCADE,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    reading_id INTEGER REFERENCES sensor_readings(id) ON DELETE SET NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    is_acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_at TIMESTAMP,
    acknowledged_by VARCHAR(100)
);

-- 8. PDF Reports
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    report_code VARCHAR(50) UNIQUE NOT NULL,
    session_id INTEGER NOT NULL REFERENCES dialysis_sessions(id) ON DELETE CASCADE,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    pdf_filename VARCHAR(255) NOT NULL,
    pdf_filepath VARCHAR(500) NOT NULL,
    summary_data TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_readings_session ON sensor_readings(session_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_alerts_session ON alerts(session_id, is_acknowledged);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON dialysis_sessions(status);
