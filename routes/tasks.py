from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from models import TaskItemCreate, TaskItem, TaskItemUpdate
from services import task_service
from database import get_db

router = APIRouter()

@router.post("/", response_model=TaskItem)
async def create_task(task: TaskItemCreate, db: Session = Depends(get_db)):
    """
    Create a new task.
    """
    return await task_service.create_task(db, task)

@router.get("/", response_model=list[TaskItem])
async def get_all_tasks(db: Session = Depends(get_db)):
    """
    Get all tasks.
    """
    return task_service.get_all_tasks(db)

@router.patch("/{task_id}/complete", response_model=TaskItem)
async def mark_task_completed(task_id: int, db: Session = Depends(get_db)):
    """
    Mark a task as completed.
    """
    return await task_service.mark_task_completed(db, task_id)

@router.put("/{task_id}", response_model=TaskItem)
async def update_task(task_id: int, task_update: TaskItemUpdate, db: Session = Depends(get_db)):
    """
    Update a task (all fields or status).
    """
    return await task_service.update_task(db, task_id, task_update)

@router.delete("/{task_id}")
async def delete_task(task_id: int, db: Session = Depends(get_db)):
    """
    Delete a task.
    """
    return await task_service.delete_task(db, task_id)
