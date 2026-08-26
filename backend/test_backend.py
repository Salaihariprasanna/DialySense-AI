import os
import sys

# Add backend to path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from app.main import app

def test_full_pipeline():
    with TestClient(app) as client:
        print("1. Testing Health & Root Endpoint...")
        res = client.get("/")
        assert res.status_code == 200, res.text
        print(" Root:", res.json())

        print("\n2. Testing Patient List...")
        res = client.get("/api/patients")
        assert res.status_code == 200, res.text
        patients = res.json()
        print(f" Found {len(patients)} patients:")
        for p in patients:
            print(f"   - [{p['patient_id']}] {p['name']} ({p['age']}y, {p['blood_group']})")
        assert len(patients) >= 1

        print("\n3. Testing Sessions List...")
        res = client.get("/api/sessions")
        assert res.status_code == 200, res.text
        sessions = res.json()
        print(f" Found {len(sessions)} sessions.")
        active_session_id = sessions[0]["id"]

        print("\n4. Testing IoT Reading Ingestion (NORMAL Mode)...")
        payload_normal = {
            "patient_id": 1,
            "session_id": active_session_id,
            "heart_rate": 76.0,
            "spo2": 98.5,
            "temperature": 36.8,
            "systolic_bp": 122.0,
            "diastolic_bp": 80.0,
            "blood_flow_rate": 300.0,
            "dialysis_pressure": 120.0,
            "machine_temperature": 36.9,
            "machine_status": "RUNNING"
        }
        res = client.post("/api/readings", json=payload_normal)
        assert res.status_code == 201, res.text
        norm_res = res.json()
        print(f" Ingestion (NORMAL): Risk Level={norm_res['risk_level']}, Score={norm_res['risk_score']}, Alerts={norm_res['alerts_triggered']}")
        assert norm_res["risk_level"] == "LOW"

        print("\n5. Testing IoT Reading Ingestion (RISK Mode - Critical Collapse)...")
        payload_risk = {
            "patient_id": 1,
            "session_id": active_session_id,
            "heart_rate": 138.0,
            "spo2": 84.0,
            "temperature": 38.8,
            "systolic_bp": 72.0,
            "diastolic_bp": 44.0,
            "blood_flow_rate": 120.0,
            "dialysis_pressure": 240.0,
            "machine_temperature": 37.8,
            "machine_status": "WARNING"
        }
        res = client.post("/api/readings", json=payload_risk)
        assert res.status_code == 201, res.text
        risk_res = res.json()
        print(f" Ingestion (RISK): Risk Level={risk_res['risk_level']}, Score={risk_res['risk_score']}, Alerts={risk_res['alerts_triggered']}")
        assert risk_res["risk_level"] == "HIGH"
        assert risk_res["risk_score"] >= 70
        assert risk_res["alerts_triggered"] >= 1

        print("\n6. Testing Smart Alerts Query...")
        res = client.get("/api/alerts")
        assert res.status_code == 200, res.text
        alerts = res.json()
        print(f" Total generated alerts: {len(alerts)}")
        for a in alerts[:4]:
            print(f"   - [{a['severity']}] {a['title']}: {a['message']}")

        print("\n7. Testing PDF Report Generation...")
        res = client.post(f"/api/reports/session/{active_session_id}/generate")
        assert res.status_code == 200, res.text
        rep_res = res.json()
        print(f" PDF Report Generated: {rep_res['filename']} at {rep_res['download_url']}")
        
        # Verify file exists
        download_res = client.get(rep_res['download_url'])
        assert download_res.status_code == 200
        assert len(download_res.content) > 1000
        print(f" PDF Download verified! Size = {len(download_res.content)} bytes.")

        print("\n==========================================")
        print(" ALL BACKEND & AI & REPORT TESTS PASSED!")
        print("==========================================")

if __name__ == "__main__":
    test_full_pipeline()
