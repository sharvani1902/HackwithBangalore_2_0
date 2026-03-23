from sqlalchemy.orm import Session
from db_models import DBTask, DBTeamMember
from models import ReportResponse, ReportDataPoint
from datetime import datetime, timezone, timedelta

def get_global_report(db: Session):
    total_tasks = db.query(DBTask).count()
    completed_tasks = db.query(DBTask).filter(DBTask.status == "Completed").count()
    active_members = db.query(DBTeamMember).count()
    
    completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
    
    # Mock daily velocity for the last 7 days
    daily_velocity = []
    now = datetime.now(timezone.utc)
    for i in range(6, -1, -1):
        day = now - timedelta(days=i)
        label = day.strftime("%a")
        # In a real app, query tasks completed on this day
        value = db.query(DBTask).filter(
            DBTask.status == "Completed",
            DBTask.created_at >= day.replace(hour=0, minute=0, second=0),
            DBTask.created_at <= day.replace(hour=23, minute=59, second=59)
        ).count()
        daily_velocity.append({"label": label, "value": float(value)})

    # Structured data for the frontend
    report_data = [
        {"type": "velocity", "points": daily_velocity},
        {"type": "composition", "total": total_tasks, "completed": completed_tasks}
    ]
    
    summary = {
        "completion_rate": round(completion_rate, 1),
        "total_tasks": total_tasks,
        "active_members": active_members
    }
    
    return {
        "success": True,
        "data": report_data,
        "summary": summary
    }
