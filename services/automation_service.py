from sqlalchemy.orm import Session
import db_models
import json
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

import asyncio

async def trigger_event(db: Session, event_type: str, user_id: int, payload: dict):
    """
    Triggers automations based on an event.
    Non-blocking execution for each rule to ensure project velocity.
    """
    rules = db.query(db_models.DBAutomationRule).filter(
        db_models.DBAutomationRule.user_id == user_id,
        db_models.DBAutomationRule.trigger_type == event_type,
        db_models.DBAutomationRule.is_active == 1
    ).all()
    
    if not rules:
        return

    # Execute rules concurrently/non-blocking
    tasks = [execute_action(db, rule, payload) for rule in rules]
    await asyncio.gather(*tasks, return_exceptions=True)

async def execute_action(db: Session, rule: db_models.DBAutomationRule, payload: dict):
    action_type = rule.action_type
    try:
        config = json.loads(rule.config) if rule.config else {}
    except:
        config = {}
    
    logger.info(f"[AutomationEngine] Executing {action_type} for rule {rule.id}")
    
    if action_type == "CHAT_NOTIFY":
        from services.socket_service import broadcast_event
        message = config.get("message", "Automation Triggered!")
        for key, val in payload.items():
            message = message.replace(f"{{{{{key}}}}}", str(val))
            
        await broadcast_event("AUTOMATION_NOTIFY", {
            "message": message,
            "rule_id": rule.id,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
    elif action_type == "CREATE_TASK":
        task_name = config.get("task_name", "Automated Follow-up")
        for key, val in payload.items():
            task_name = task_name.replace(f"{{{{{key}}}}}", str(val))
            
        new_task = db_models.DBTask(
            task_name=task_name,
            assigned_to=config.get("assigned_to") or payload.get("assignee"),
            status="To Do",
            priority="Medium",
            created_at=datetime.now(timezone.utc)
        )
        db.add(new_task)
        db.commit()
        from services.socket_service import broadcast_event
        await broadcast_event("TASK_UPDATED", {"reason": "AUTOMATION_CREATED", "id": new_task.id})

    # Update last triggered timestamp
    rule.last_triggered = datetime.now(timezone.utc)
    db.commit()

def get_rules(db: Session, user_id: int):
    return db.query(db_models.DBAutomationRule).filter(db_models.DBAutomationRule.user_id == user_id).all()

def create_rule(db: Session, user_id: int, trigger: str, action: str, config: dict):
    rule = db_models.DBAutomationRule(
        user_id=user_id,
        trigger_type=trigger,
        action_type=action,
        config=json.dumps(config)
    )
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule

def toggle_rule(db: Session, rule_id: int, active: bool):
    rule = db.query(db_models.DBAutomationRule).filter(db_models.DBAutomationRule.id == rule_id).first()
    if rule:
        rule.is_active = 1 if active else 0
        db.commit()
    return rule
