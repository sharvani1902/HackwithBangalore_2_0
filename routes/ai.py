from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from pydantic import BaseModel
from typing import List, Optional
import db_models
from datetime import datetime, timezone
from fastapi import HTTPException
import json

router = APIRouter()

class MeetingSummaryRequest(BaseModel):
    text: str

class ActionItem(BaseModel):
    task: str
    assignee: Optional[str] = None

class MeetingSummaryResponse(BaseModel):
    summary: str
    action_items: List[ActionItem]

@router.post("/meeting-summary", response_model=MeetingSummaryResponse)
async def generate_meeting_summary(payload: MeetingSummaryRequest, db: Session = Depends(get_db)):
    """
    Uses LLM to extract action items and summarize meeting notes.
    """
    from services.chat_service import client
    if not client:
        # Fallback to simple logic if LLM not configured
        lines = payload.text.split('\n')
        action_items = []
        members = db.query(db_models.DBTeamMember).all()
        member_names = [m.name.lower() for m in members]
        for line in lines:
            lower_line = line.lower()
            if "todo" in lower_line or "action" in lower_line or "task" in lower_line:
                clean_task = line.replace("TODO:", "").replace("Action:", "").replace("Task:", "").replace("TODO", "").replace("Action", "").strip(" -:")
                if not clean_task: continue
                assignee = next((n.capitalize() for n in member_names if n in lower_line), None)
                action_items.append(ActionItem(**{"task": clean_task, "assignee": assignee}))
        return {"summary": f"Simulated extraction: {len(action_items)} tasks found.", "action_items": action_items}

    try:
        prompt = f"Extract action items from these meeting notes. Return ONLY a JSON object with 'summary' (str) and 'action_items' (list of {{'task': str, 'assignee': str|null}}). NOTES:\n{payload.text}"
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        data = json.loads(response.choices[0].message.content)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM Summary failed: {e}")

@router.get("/deadlines")
async def get_deadlines(db: Session = Depends(get_db)):
    """
    Returns structured deadline buckets for the dashboard.
    """
    now = datetime.now(timezone.utc)
    tasks = db.query(db_models.DBTask).filter(db_models.DBTask.status != "Completed").all()
    
    overdue = []
    today = []
    upcoming = []
    
    for t in tasks:
        if not t.deadline:
            continue
        days_diff = (t.deadline - now).days
        item = {"id": t.id, "task_name": t.task_name, "assigned_to": t.assigned_to, "deadline": t.deadline}
        if t.deadline < now:
            overdue.append(item)
        elif 0 <= days_diff <= 1:
            today.append(item)
        elif 1 < days_diff <= 7:
            upcoming.append(item)
            
    # Sort them
    overdue.sort(key=lambda x: x["deadline"])
    today.sort(key=lambda x: x["deadline"])
    upcoming.sort(key=lambda x: x["deadline"])
            
    return {
        "overdue": overdue,
        "today": today,
        "upcoming": upcoming
    }
