from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from models import TeamMemberCreate, TeamMember, TeamMemberUpdate
from services import team_service
from database import get_db

router = APIRouter()

@router.post("/", response_model=TeamMember)
async def add_team_member(member: TeamMemberCreate, db: Session = Depends(get_db)):
    """
    Add a new team member.
    """
    return team_service.add_team_member(db, member)

@router.get("/", response_model=list[TeamMember])
async def list_team_members(db: Session = Depends(get_db)):
    """
    List all team members.
    """
    return team_service.list_team_members(db)

@router.put("/{member_id}", response_model=TeamMember)
async def update_team_member(member_id: int, member_update: TeamMemberUpdate, db: Session = Depends(get_db)):
    """
    Update a team member's role or skills.
    """
    return team_service.update_team_member(db, member_id, member_update)

@router.delete("/{member_id}")
async def delete_team_member(member_id: int, db: Session = Depends(get_db)):
    """
    Delete a team member.
    """
    return team_service.delete_team_member(db, member_id)
