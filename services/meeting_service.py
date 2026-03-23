from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime
from typing import List, Optional

import db_models
import models

def create_meeting(db: Session, meeting_data: models.MeetingCreate, username: str) -> db_models.DBMeeting:
    new_meeting = db_models.DBMeeting(
        title=meeting_data.title,
        description=meeting_data.description,
        start_time=meeting_data.start_time,
        end_time=meeting_data.end_time,
        reminder_time=meeting_data.reminder_time,
        project_association=meeting_data.project_association,
        created_by=username
    )
    db.add(new_meeting)
    db.commit()
    db.refresh(new_meeting)

    # Add participants
    if meeting_data.participants:
        for participant in meeting_data.participants:
            db_participant = db_models.DBMeetingParticipant(
                meeting_id=new_meeting.id,
                participant_name=participant
            )
            db.add(db_participant)
        db.commit()

    return new_meeting

def get_meetings(db: Session, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> List[db_models.DBMeeting]:
    query = db.query(db_models.DBMeeting)
    if start_date:
        query = query.filter(db_models.DBMeeting.start_time >= start_date)
    if end_date:
        query = query.filter(db_models.DBMeeting.start_time <= end_date)
    return query.all()

def get_meeting(db: Session, meeting_id: int) -> db_models.DBMeeting:
    meeting = db.query(db_models.DBMeeting).filter(db_models.DBMeeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting

def update_meeting(db: Session, meeting_id: int, meeting_data: models.MeetingUpdate) -> db_models.DBMeeting:
    meeting = get_meeting(db, meeting_id)
    
    update_data = meeting_data.model_dump(exclude_unset=True)
    
    # Handle participants update separately if provided
    if "participants" in update_data:
        participants = update_data.pop("participants")
        # Remove old participants
        db.query(db_models.DBMeetingParticipant).filter(db_models.DBMeetingParticipant.meeting_id == meeting_id).delete()
        # Add new participants
        for participant in participants:
            db_participant = db_models.DBMeetingParticipant(
                meeting_id=meeting.id,
                participant_name=participant
            )
            db.add(db_participant)

    for key, value in update_data.items():
        setattr(meeting, key, value)
        
    db.commit()
    db.refresh(meeting)
    return meeting

def delete_meeting(db: Session, meeting_id: int):
    meeting = get_meeting(db, meeting_id)
    # Delete participants first (cascade could also be configured on the relationship)
    db.query(db_models.DBMeetingParticipant).filter(db_models.DBMeetingParticipant.meeting_id == meeting_id).delete()
    db.delete(meeting)
    db.commit()

def get_meeting_participants(db: Session, meeting_id: int) -> List[str]:
    participants = db.query(db_models.DBMeetingParticipant).filter(db_models.DBMeetingParticipant.meeting_id == meeting_id).all()
    return [p.participant_name for p in participants]
