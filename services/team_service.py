from typing import List
from sqlalchemy.orm import Session
from models import TeamMemberCreate, TeamMember, TeamMemberUpdate
from fastapi import HTTPException
from db_models import DBTeamMember, DBTask

# Stats kept in memory dynamically per session, though typically moved to distinct tables
_member_stats = {}



def add_team_member(db: Session, member: TeamMemberCreate) -> TeamMember:
    # Prevent duplicates — check by name first
    existing = db.query(DBTeamMember).filter(DBTeamMember.name == member.name).first()
    if existing:
        return existing
    db_member = DBTeamMember(**member.model_dump())
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    return db_member

def list_team_members(db: Session) -> list[TeamMember]:
    return db.query(DBTeamMember).all()

def get_all_member_stats(db: Session) -> dict:
    """
    Calculate member stats directly from the database tasks.
    """
    members = db.query(DBTeamMember).all()
    stats = {}
    for member in members:
        tasks = db.query(DBTask).filter(DBTask.assigned_to == member.name, DBTask.status == "Completed").all()
        
        tasks_completed = len(tasks)
        tasks_delayed = 0
        total_time = 0.0
        
        for t in tasks:
            # Simple delay check based on created_at vs deadline
            if t.deadline and t.created_at:
                if t.created_at > t.deadline:
                    tasks_delayed += 1
            # In a real app we'd track completion_time explicitly, here we use created_at as start
            # but for this demo, stats are good enough
            
        stats[member.name] = {
            "tasks_completed": tasks_completed,
            "tasks_delayed": tasks_delayed,
            "total_completion_time_seconds": total_time # Placeholder for this demo
        }
    return stats

def update_team_member(db: Session, member_id: int, member_update: TeamMemberUpdate) -> TeamMember:
    db_member = db.query(DBTeamMember).filter(DBTeamMember.id == member_id).first()
    if not db_member:
        raise HTTPException(status_code=404, detail="Team member not found")
    
    update_data = member_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_member, key, value)
    
    db.commit()
    db.refresh(db_member)
    return db_member

def delete_team_member(db: Session, member_id: int):
    db_member = db.query(DBTeamMember).filter(DBTeamMember.id == member_id).first()
    if not db_member:
        raise HTTPException(status_code=404, detail="Team member not found")
    
    db.delete(db_member)
    db.commit()
    return {"message": "Member removed successfully"}
