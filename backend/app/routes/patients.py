from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.patient import Patient
from app.schemas.patient import PatientCreate, PatientUpdate, PatientResponse

router = APIRouter(prefix="/patients", tags=["Patients"])

@router.get("", response_model=List[PatientResponse])
def get_all_patients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    patients = db.query(Patient).offset(skip).limit(limit).all()
    return patients

@router.post("", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
def create_patient(payload: PatientCreate, db: Session = Depends(get_db)):
    # Auto-generate patient_id if omitted
    patient_id_val = payload.patient_id
    if not patient_id_val:
        count = db.query(Patient).count() + 1
        patient_id_val = f"PAT-{count:03d}"
    
    # Check duplicate patient_id
    existing = db.query(Patient).filter(Patient.patient_id == patient_id_val).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Patient ID {patient_id_val} already exists")

    patient = Patient(
        patient_id=patient_id_val,
        name=payload.name,
        age=payload.age,
        gender=payload.gender,
        blood_group=payload.blood_group,
        disease_stage=payload.disease_stage,
        doctor=payload.doctor,
        contact=payload.contact,
        emergency_contact=payload.emergency_contact,
        notes=payload.notes
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient

@router.get("/{id}", response_model=PatientResponse)
def get_patient_by_id(id: int, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == id).first()
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient with ID {id} not found")
    return patient

@router.put("/{id}", response_model=PatientResponse)
def update_patient(id: int, payload: PatientUpdate, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == id).first()
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient with ID {id} not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(patient, field, value)

    db.commit()
    db.refresh(patient)
    return patient

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_patient(id: int, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == id).first()
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient with ID {id} not found")

    db.delete(patient)
    db.commit()
    return None
