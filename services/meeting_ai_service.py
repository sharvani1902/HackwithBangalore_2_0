from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime
import json
from typing import List

import db_models
import models
from services.chat_service import client

def add_transcript_line(db: Session, transcript: models.TranscriptCreate) -> db_models.DBMeetingTranscript:
    db_transcript = db_models.DBMeetingTranscript(
        meeting_id=transcript.meeting_id,
        speaker=transcript.speaker,
        text=transcript.text
    )
    db.add(db_transcript)
    db.commit()
    db.refresh(db_transcript)
    return db_transcript

def get_meeting_transcript(db: Session, meeting_id: int) -> List[db_models.DBMeetingTranscript]:
    return db.query(db_models.DBMeetingTranscript).filter(
        db_models.DBMeetingTranscript.meeting_id == meeting_id
    ).order_by(db_models.DBMeetingTranscript.timestamp.asc()).all()

def add_recording(db: Session, recording_data: models.RecordingCreate) -> db_models.DBMeetingRecording:
    db_rec = db_models.DBMeetingRecording(
        meeting_id=recording_data.meeting_id,
        recording_url=recording_data.recording_url,
        duration=recording_data.duration
    )
    db.add(db_rec)
    db.commit()
    db.refresh(db_rec)
    return db_rec

def get_meeting_recordings(db: Session, meeting_id: int) -> List[db_models.DBMeetingRecording]:
    return db.query(db_models.DBMeetingRecording).filter(
        db_models.DBMeetingRecording.meeting_id == meeting_id
    ).all()

async def generate_meeting_summary(db: Session, meeting_id: int) -> db_models.DBMeetingSummary:
    # Check if a summary already exists
    existing = db.query(db_models.DBMeetingSummary).filter(
        db_models.DBMeetingSummary.meeting_id == meeting_id
    ).first()
    if existing:
        return existing

    # Gather transcript
    lines = get_meeting_transcript(db, meeting_id)
    if not lines:
        raise HTTPException(status_code=400, detail="Cannot generate summary for a meeting with no transcript.")

    # Combine text
    full_transcript = "\n".join([
        f"{line.timestamp.strftime('%H:%M:%S')} - {line.speaker or 'Unknown'}: {line.text}" 
        for line in lines
    ])

    # Form Prompt
    prompt = f"""
    You are an AI Meeting Assistant. Read the following meeting transcript.
    Extract the core information into a strictly formatted JSON object with the following keys:
    - "overview": a concise 2-sentence summary of what the meeting was about.
    - "key_points": a list of string bullet points highlighting the main topics.
    - "action_items": a list of dictionaries with "task" (string) and "assignee" (string). If none, an empty list.
    - "next_steps": a list of string sentences detailing what happens next.

    Return ONLY raw JSON. No markdown backticks.
    
    Transcript:
    {full_transcript}
    """

    # Call AI
    try:
        if not client:
            raise Exception("Groq client not configured")
            
        ai_response_obj = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            max_tokens=2048
        )
        ai_response = ai_response_obj.choices[0].message.content
        
        # cleanup markdown wrapping if present
        clean_resp = ai_response.replace('```json', '').replace('```', '').strip()
        parsed = json.loads(clean_resp)
        
        overview = parsed.get("overview", "No overview generated.")
        key_points = json.dumps(parsed.get("key_points", []))
        action_items = json.dumps(parsed.get("action_items", []))
        next_steps = json.dumps(parsed.get("next_steps", []))
    except Exception as e:
        # Fallback if AI fails JSON parsing
        overview = f"AI summary generation failed to parse securely: {ai_response[:200]}"
        key_points = "[]"
        action_items = "[]"
        next_steps = "[]"

    # Save to DB
    summary = db_models.DBMeetingSummary(
        meeting_id=meeting_id,
        overview=overview,
        key_points=key_points,
        action_items=action_items,
        next_steps=next_steps
    )
    db.add(summary)
    db.commit()
    db.refresh(summary)
    
    return summary

def get_meeting_summary(db: Session, meeting_id: int) -> db_models.DBMeetingSummary:
    return db.query(db_models.DBMeetingSummary).filter(
        db_models.DBMeetingSummary.meeting_id == meeting_id
    ).first()

def search_meeting_intelligence(db: Session, search_query: str):
    # Search transcripts using basic ILIKE
    # For robust full-text search, Postgres tsvector is preferred.
    like_query = f"%{search_query}%"
    
    transcript_hits = db.query(db_models.DBMeetingTranscript).filter(
        db_models.DBMeetingTranscript.text.ilike(like_query)
    ).limit(50).all()
    
    # Also search overviews
    summary_hits = db.query(db_models.DBMeetingSummary).filter(
        db_models.DBMeetingSummary.overview.ilike(like_query)
    ).limit(10).all()
    
    return {
        "transcript_matches": [
            {
                "meeting_id": t.meeting_id,
                "speaker": t.speaker,
                "text": t.text,
                "timestamp": t.timestamp
            } for t in transcript_hits
        ],
        "summary_matches": [
            {
                "meeting_id": s.meeting_id,
                "overview": s.overview
            } for s in summary_hits
        ]
    }
