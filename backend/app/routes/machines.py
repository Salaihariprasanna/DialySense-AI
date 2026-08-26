from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.machine import Machine
from app.schemas.machine import MachineCreate, MachineUpdate, MachineResponse

router = APIRouter(prefix="/machines", tags=["Machines"])

@router.get("", response_model=List[MachineResponse])
def get_all_machines(db: Session = Depends(get_db)):
    return db.query(Machine).all()

@router.post("", response_model=MachineResponse, status_code=status.HTTP_201_CREATED)
def create_machine(payload: MachineCreate, db: Session = Depends(get_db)):
    existing = db.query(Machine).filter(
        (Machine.machine_code == payload.machine_code) | 
        (Machine.serial_number == payload.serial_number)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Machine code or serial number already exists")

    machine = Machine(
        machine_code=payload.machine_code,
        model=payload.model,
        serial_number=payload.serial_number,
        status=payload.status,
        location=payload.location,
        ip_address=payload.ip_address
    )
    db.add(machine)
    db.commit()
    db.refresh(machine)
    return machine

@router.get("/{id}", response_model=MachineResponse)
def get_machine_by_id(id: int, db: Session = Depends(get_db)):
    machine = db.query(Machine).filter(Machine.id == id).first()
    if not machine:
        raise HTTPException(status_code=404, detail=f"Machine with ID {id} not found")
    return machine

@router.put("/{id}", response_model=MachineResponse)
def update_machine(id: int, payload: MachineUpdate, db: Session = Depends(get_db)):
    machine = db.query(Machine).filter(Machine.id == id).first()
    if not machine:
        raise HTTPException(status_code=404, detail=f"Machine with ID {id} not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(machine, field, value)

    db.commit()
    db.refresh(machine)
    return machine
