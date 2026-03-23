from sqlalchemy.orm import Session
import db_models
import models
from datetime import datetime, timezone, timedelta
from services.socket_service import broadcast_event
import re

async def handle_bot_command(db: Session, user: db_models.DBUser, command_text: str):
    """
    Parses and executes commands like:
    /create-task [name] [assignee]
    /schedule-meeting [title] [time]
    /project-status
    """
    if not command_text.startswith("/"):
        return None
    
    parts = command_text.split(" ", 1)
    cmd = parts[0].lower()
    args = parts[1] if len(parts) > 1 else ""
    
    if cmd == "/create-task":
        # Simple parsing: /create-task [name]
        task_name = args.strip() or "New Task"
        new_task = db_models.DBTask(
            task_name=task_name,
            assigned_to=user.username,
            status="To Do"
        )
        db.add(new_task)
        db.commit()
        await broadcast_event("TASK_UPDATED", {"reason": "BOT_CREATED", "id": new_task.id})
        return f"Bot: Created task '**{task_name}**' for you."
    
    elif cmd == "/schedule-meeting":
        # Simple parsing: /schedule-meeting [title]
        title = args.strip() or "Sync Meeting"
        new_mtg = db_models.DBMeeting(
            title=title,
            start_time=datetime.now() + timedelta(days=1),
            end_time=datetime.now() + timedelta(days=1, hours=1),
            created_by=user.username
        )
        db.add(new_mtg)
        db.commit()
        return f"Bot: Scheduled meeting '**{title}**' for tomorrow."
    
    elif cmd == "/project-status":
        total_tasks = db.query(db_models.DBTask).count()
        completed_tasks = db.query(db_models.DBTask).filter(db_models.DBTask.status == "Completed").count()
        upcoming_meetings = db.query(db_models.DBMeeting).filter(db_models.DBMeeting.start_time > datetime.now()).count()
        
        status_msg = f"**Project Status Update**:\n"
        status_msg += f"- Tasks: {completed_tasks}/{total_tasks} completed\n"
        status_msg += f"- Upcoming Meetings: {upcoming_meetings} scheduled\n"
        status_msg += f"- Pulse: System is running smoothly!"
        return status_msg
        
    return f"Bot: Unknown command '{cmd}'. Available: `/create-task`, `/schedule-meeting`, `/project-status`"
