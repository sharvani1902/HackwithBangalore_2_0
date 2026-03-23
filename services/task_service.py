from sqlalchemy.orm import Session
from models import TaskItemCreate, TaskItem, TaskItemUpdate
from db_models import DBTask
from fastapi import HTTPException
from services.memory import store_memory
from services.socket_service import broadcast_event
from services.automation_service import trigger_event
from datetime import datetime, timezone

async def create_task(db: Session, task: TaskItemCreate) -> TaskItem:
    db_task = DBTask(**task.model_dump())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)

    memory_payload = {
        "event": "task_created",
        "task_id": db_task.id,
        "task_name": db_task.task_name,
        "assigned_to": db_task.assigned_to,
        "priority": db_task.priority,
        "difficulty": db_task.difficulty,
        "ai_rationale": db_task.ai_rationale,
        "deadline": str(db_task.deadline) if getattr(db_task, 'deadline', None) else None,
        "created_at": str(db_task.created_at) if db_task.created_at else None
    }
    await store_memory(memory_payload)
    await broadcast_event("TASK_UPDATED", {"reason": "TASK_CREATED", "id": db_task.id})
    return db_task

def get_all_tasks(db: Session) -> list[TaskItem]:
    return db.query(DBTask).all()

async def mark_task_completed(db: Session, task_id: int) -> TaskItem:
    db_task = db.query(DBTask).filter(DBTask.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    db_task.status = "Completed"
    db.commit()
    db.refresh(db_task)

    now = datetime.now(timezone.utc)
    time_taken = None
    if db_task.created_at:
        try:
            task_created = db_task.created_at.replace(tzinfo=None)
            time_taken = (now - task_created).total_seconds()
        except Exception:
            pass

    completed_on_time = None
    if db_task.deadline:
        try:
            task_deadline = db_task.deadline.replace(tzinfo=None)
            completed_on_time = now <= task_deadline
        except Exception:
            pass

    memory_payload = {
        "event": "task_completed",
        "task_id": db_task.id,
        "task_name": db_task.task_name,
        "assigned_to": db_task.assigned_to,
        "priority": db_task.priority,
        "difficulty": db_task.difficulty,
        "completed_on_time": completed_on_time,
        "time_taken_seconds": time_taken
    }
    await store_memory(memory_payload)
    await broadcast_event("TASK_UPDATED", {"reason": "TASK_COMPLETED", "id": db_task.id})
    
    # Trigger Automation
    user = db.query(db_models.DBUser).first() # Simulating current user context
    await trigger_event(db, "TASK_COMPLETED", user.id, {"task_name": db_task.task_name, "assignee": db_task.assigned_to})

    return db_task

async def update_task(db: Session, task_id: int, task_update: TaskItemUpdate) -> TaskItem:
    db_task = db.query(DBTask).filter(DBTask.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    update_data = task_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_task, key, value)
    
    db.commit()
    db.refresh(db_task)
    await broadcast_event("TASK_UPDATED", {"reason": "TASK_UPDATED", "id": db_task.id})
    return db_task

async def delete_task(db: Session, task_id: int):
    db_task = db.query(DBTask).filter(DBTask.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db.delete(db_task)
    db.commit()
    await broadcast_event("TASK_UPDATED", {"reason": "TASK_DELETED", "id": task_id})
    return {"message": "Task deleted successfully"}
