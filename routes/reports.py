from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from services import report_service, auth_service
import db_models
from models import ReportResponse

router = APIRouter()

@router.get("/", response_model=ReportResponse)
async def get_report(
    db: Session = Depends(get_db),
    current_user: db_models.DBUser = Depends(auth_service.get_current_user)
):
    """
    Get aggregated project reports.
    """
    return report_service.get_global_report(db)
