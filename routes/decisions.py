from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from services import auth_service
from models import DecisionCreate, Decision
import db_models

router = APIRouter()


@router.get("/", response_model=list[Decision])
async def list_decisions(
    db: Session = Depends(get_db),
    current_user: str = Depends(auth_service.get_current_user)
):
    """Get all past decisions, newest first."""
    return db.query(db_models.DBDecision).order_by(db_models.DBDecision.created_at.desc()).all()


@router.post("/", response_model=Decision)
async def create_decision(
    payload: DecisionCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(auth_service.get_current_user)
):
    """Log a new team decision."""
    decision = db_models.DBDecision(**payload.model_dump())
    db.add(decision)
    db.commit()
    db.refresh(decision)
    return decision


@router.delete("/{decision_id}")
async def delete_decision(
    decision_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(auth_service.get_current_user)
):
    """Remove a logged decision."""
    d = db.query(db_models.DBDecision).filter(db_models.DBDecision.id == decision_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Decision not found")
    db.delete(d)
    db.commit()
    return {"status": "deleted"}
