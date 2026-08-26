-- ==========================================================
-- DialySense AI Seed Data (PostgreSQL)
-- ==========================================================

INSERT INTO patients (patient_id, name, age, gender, blood_group, disease_stage, doctor, contact, emergency_contact, notes)
VALUES
('PAT-101', 'John Doe', 58, 'Male', 'O+', 'Stage 5 CKD (ESRD)', 'Dr. Sarah Jenkins', '+1 (555) 234-5678', '+1 (555) 234-9999', 'Diabetic nephropathy. Left arm AV fistula. Target UF 2.5L.'),
('PAT-102', 'Eleanor Vance', 64, 'Female', 'A+', 'Chronic Renal Failure', 'Dr. Michael Chang', '+1 (555) 876-5432', '+1 (555) 876-0000', 'Hypertensive nephrosclerosis. Right jugular catheter.'),
('PAT-103', 'Robert Martinez', 49, 'Male', 'B+', 'Stage 4 CKD', 'Dr. Sarah Jenkins', '+1 (555) 345-6789', '+1 (555) 345-1111', 'Polycystic kidney disease.')
ON CONFLICT (patient_id) DO NOTHING;

INSERT INTO machines (machine_code, model, serial_number, status, location, ip_address)
VALUES
('DIALY-01', 'DialySense Pro-5000', 'DSP-2026-001', 'RUNNING', 'Ward A - Bed 1', '192.168.1.101'),
('DIALY-02', 'DialySense Pro-5000', 'DSP-2026-002', 'AVAILABLE', 'Ward A - Bed 2', '192.168.1.102'),
('DIALY-03', 'DialySense Ultra-X', 'DSX-2026-003', 'AVAILABLE', 'Ward B - Bed 1', '192.168.1.103')
ON CONFLICT (machine_code) DO NOTHING;

INSERT INTO dialysis_sessions (session_code, patient_id, machine_id, status, target_duration_mins, target_uf_volume_ml, prescribed_dialysate_temp, prescribed_blood_flow, notes)
VALUES
('SES-202603-001', 1, 1, 'ONGOING', 240, 2500.0, 36.5, 300.0, 'Standard 4-hour hemodialysis. Monitor for post-dialytic fatigue.'),
('SES-202603-002', 2, 2, 'SCHEDULED', 210, 2000.0, 36.5, 280.0, 'Scheduled for 14:00.')
ON CONFLICT (session_code) DO NOTHING;
