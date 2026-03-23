from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from services import auth_service, integration_service, automation_service
import db_models
import models

router = APIRouter()

# --- Integrations Management ---

@router.get("/", response_model=List[models.IntegrationResponse])
def list_integrations(db: Session = Depends(get_db), current_user: db_models.DBUser = Depends(auth_service.get_current_user)):
    return integration_service.get_integrations(db)

@router.get("/user", response_model=List[models.UserIntegrationResponse])
def list_user_integrations(db: Session = Depends(get_db), current_user: db_models.DBUser = Depends(auth_service.get_current_user)):
    return integration_service.get_user_integrations(db, current_user.id)

@router.post("/{integration_id}/connect")
async def connect_app(integration_id: int, db: Session = Depends(get_db), current_user: db_models.DBUser = Depends(auth_service.get_current_user)):
    integration = db.query(db_models.DBIntegration).filter(db_models.DBIntegration.id == integration_id).first()
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
    
    # Simulates an OAuth authorization code exchange directly inline
    await integration_service.handle_oauth_callback(db, current_user.id, integration.slug, "mock_oauth_code_xyz123")
    return {"status": "success", "message": f"Connected to {integration.name}"}

@router.post("/{integration_id}/disconnect")
def disconnect_app(integration_id: int, db: Session = Depends(get_db), current_user: db_models.DBUser = Depends(auth_service.get_current_user)):
    integration_service.disconnect_integration(db, current_user.id, integration_id)
    return {"status": "success", "message": "Disconnected"}

@router.post("/sync/{slug}")
async def sync_provider(slug: str, db: Session = Depends(get_db), current_user: db_models.DBUser = Depends(auth_service.get_current_user)):
    if slug == "ms365":
        await integration_service.sync_ms365(db, current_user.id)
    elif slug == "github":
        await integration_service.sync_github(db, current_user.id)
    elif slug == "trello":
        await integration_service.sync_trello(db, current_user.id)
    else:
        raise HTTPException(status_code=400, detail="Unknown sync provider")
    return {"status": "success"}

# --- Automations Management ---

@router.get("/automations", response_model=List[models.AutomationRuleResponse])
def get_automations(db: Session = Depends(get_db), current_user: db_models.DBUser = Depends(auth_service.get_current_user)):
    return automation_service.get_rules(db, current_user.id)

@router.post("/automations", response_model=models.AutomationRuleResponse)
def create_automation(rule: models.AutomationRuleCreate, db: Session = Depends(get_db), current_user: db_models.DBUser = Depends(auth_service.get_current_user)):
    import json
    try:
        config_data = json.loads(rule.config)
    except:
        raise HTTPException(status_code=400, detail="Invalid JSON config")
        
    return automation_service.create_rule(
        db, current_user.id, rule.trigger_type, rule.action_type, config_data
    )

@router.patch("/automations/{rule_id}/toggle")
def toggle_automation(rule_id: int, active: bool, db: Session = Depends(get_db), current_user: db_models.DBUser = Depends(auth_service.get_current_user)):
    res = automation_service.toggle_rule(db, rule_id, active)
    if not res:
        raise HTTPException(status_code=404, detail="Rule not found")
    return {"status": "success", "is_active": res.is_active}
