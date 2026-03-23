from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional

from models import MeetingCreate, MeetingResponse, MeetingUpdate
from services import meeting_service, auth_service
import db_models
from database import get_db

router = APIRouter()

def _format_meeting_response(db, m: db_models.DBMeeting):
    parts = meeting_service.get_meeting_participants(db, m.id)
    return {
        "id": m.id,
        "title": m.title,
        "description": m.description,
        "start_time": m.start_time,
        "end_time": m.end_time,
        "reminder_time": m.reminder_time,
        "project_association": m.project_association,
        "created_by": m.created_by,
        "outlook_event_id": m.outlook_event_id,
        "created_at": m.created_at,
        "participants": parts
    }

@router.post("/", response_model=MeetingResponse)
async def create_meeting(meeting: MeetingCreate, db: Session = Depends(get_db), current_user: db_models.DBUser = Depends(auth_service.get_current_user)):
    m = meeting_service.create_meeting(db, meeting, current_user.username)
    from services.automation_service import trigger_event
    await trigger_event(db, "MEETING_SCHEDULED", current_user.id, {"title": m.title})
    return _format_meeting_response(db, m)

@router.get("/", response_model=List[MeetingResponse])
def get_meetings(start_date: Optional[datetime] = None, end_date: Optional[datetime] = None, db: Session = Depends(get_db), current_user: db_models.DBUser = Depends(auth_service.get_current_user)):
    db_meetings = meeting_service.get_meetings(db, start_date, end_date)
    return [_format_meeting_response(db, m) for m in db_meetings]

@router.get("/{meeting_id}", response_model=MeetingResponse)
def get_meeting(meeting_id: int, db: Session = Depends(get_db), current_user: db_models.DBUser = Depends(auth_service.get_current_user)):
    m = meeting_service.get_meeting(db, meeting_id)
    return _format_meeting_response(db, m)

@router.put("/{meeting_id}", response_model=MeetingResponse)
def update_meeting(meeting_id: int, meeting_update: MeetingUpdate, db: Session = Depends(get_db), current_user: db_models.DBUser = Depends(auth_service.get_current_user)):
    m = meeting_service.update_meeting(db, meeting_id, meeting_update)
    return _format_meeting_response(db, m)

@router.delete("/{meeting_id}")
def delete_meeting(meeting_id: int, db: Session = Depends(get_db), current_user: db_models.DBUser = Depends(auth_service.get_current_user)):
    meeting_service.delete_meeting(db, meeting_id)
    return {"message": "Meeting deleted successfully"}

# --- Outlook Sync Endpoints ---

@router.get("/sync/outlook/auth")
def get_outlook_auth_url(current_user: db_models.DBUser = Depends(auth_service.get_current_user)):
    """Provides the OAuth URL for the user to auth with Microsoft."""
    try:
        from services.outlook_sync_service import get_ms_auth_url
        return {"auth_url": get_ms_auth_url()}
    except Exception as e:
        return {"error": str(e), "message": "Outlook App not configured."}

@router.post("/sync/outlook/pull")
def pull_from_outlook(access_token: str, current_user: db_models.DBUser = Depends(auth_service.get_current_user)):
    """Pulls events from Outlook to ProPilot."""
    try:
        from services.outlook_sync_service import fetch_outlook_events
        events = fetch_outlook_events(access_token)
        return {"status": "success", "fetched_events_count": len(events)}
    except Exception as e:
        return {"error": str(e)}

@router.post("/{meeting_id}/sync/outlook/push")
def push_to_outlook(meeting_id: int, access_token: str, db: Session = Depends(get_db), current_user: db_models.DBUser = Depends(auth_service.get_current_user)):
    """Pushes a specific local meeting to Outlook."""
    try:
        from services.outlook_sync_service import push_meeting_to_outlook
        m = meeting_service.get_meeting(db, meeting_id)
        
        meeting_data = {
            "title": m.title,
            "description": m.description,
            "start_time": m.start_time,
            "end_time": m.end_time
        }
        res = push_meeting_to_outlook(access_token, meeting_data)
        
        # update the db model to store the outlook event id
        if "id" in res:
            m.outlook_event_id = res["id"]
            db.commit()
            
        return {"status": "success", "outlook_event_id": m.outlook_event_id}
    except Exception as e:
        return {"error": str(e)}

# --- Meeting Intelligence Endpoints ---

from services import meeting_ai_service
from models import TranscriptCreate, TranscriptResponse, SummaryResponse, RecordingCreate, RecordingResponse

@router.post("/{meeting_id}/transcript", response_model=TranscriptResponse)
def add_transcript(meeting_id: int, transcript: TranscriptCreate, db: Session = Depends(get_db)):
    # Ensure meeting_id matches URL
    transcript.meeting_id = meeting_id
    return meeting_ai_service.add_transcript_line(db, transcript)

@router.get("/{meeting_id}/transcript", response_model=List[TranscriptResponse])
def get_transcript(meeting_id: int, db: Session = Depends(get_db)):
    return meeting_ai_service.get_meeting_transcript(db, meeting_id)

@router.post("/{meeting_id}/generate-summary", response_model=SummaryResponse)
async def generate_summary_endpoint(meeting_id: int, db: Session = Depends(get_db)):
    # This automatically returns existing if already generated to preserve tokens/time
    summary = await meeting_ai_service.generate_meeting_summary(db, meeting_id)
    # Parse the stringified JSON back to lists for the pydantic model response
    import json
    return {
        "id": summary.id,
        "meeting_id": summary.meeting_id,
        "overview": summary.overview,
        "key_points": json.loads(summary.key_points),
        "action_items": json.loads(summary.action_items),
        "next_steps": json.loads(summary.next_steps),
        "created_at": summary.created_at
    }

@router.get("/{meeting_id}/summary", response_model=Optional[SummaryResponse])
def get_summary_endpoint(meeting_id: int, db: Session = Depends(get_db)):
    summary = meeting_ai_service.get_meeting_summary(db, meeting_id)
    if not summary:
        return None
        
    import json
    return {
        "id": summary.id,
        "meeting_id": summary.meeting_id,
        "overview": summary.overview,
        "key_points": json.loads(summary.key_points),
        "action_items": json.loads(summary.action_items),
        "next_steps": json.loads(summary.next_steps),
        "created_at": summary.created_at
    }

@router.post("/{meeting_id}/recording", response_model=RecordingResponse)
def add_recording_endpoint(meeting_id: int, recording: RecordingCreate, db: Session = Depends(get_db)):
    recording.meeting_id = meeting_id
    return meeting_ai_service.add_recording(db, recording)

@router.get("/search/intelligence")
def search_meetings_intelligence(query: str, db: Session = Depends(get_db)):
    """Search intelligent meeting data including transcripts and summaries."""
    return meeting_ai_service.search_meeting_intelligence(db, query)

