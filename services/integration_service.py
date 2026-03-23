import os
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
import db_models
import models
import json

# Placeholder secrets (In a real app, these would be in .env)
CLIENT_CONFIGS = {
    "ms365": {
        "client_id": os.getenv("MS_CLIENT_ID", "mock_ms_id"),
        "client_secret": os.getenv("MS_CLIENT_SECRET", "mock_ms_secret"),
        "auth_url": "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
        "token_url": "https://login.microsoftonline.com/common/oauth2/v2.0/token"
    },
    "github": {
        "client_id": os.getenv("GITHUB_CLIENT_ID", "mock_github_id"),
        "client_secret": os.getenv("GITHUB_CLIENT_SECRET", "mock_github_secret"),
        "auth_url": "https://github.com/login/oauth/authorize",
        "token_url": "https://github.com/login/oauth/access_token"
    },
    "trello": {
        "client_id": os.getenv("TRELLO_API_KEY", "mock_trello_key"),
        "client_secret": os.getenv("TRELLO_TOKEN", "mock_trello_token"),
        "auth_url": "https://trello.com/1/authorize",
        "token_url": "" # Trello uses a different flow usually
    }
}

def get_integrations(db: Session):
    return db.query(db_models.DBIntegration).filter(db_models.DBIntegration.is_active == 1).all()

def get_user_integrations(db: Session, user_id: int):
    return db.query(db_models.DBUserIntegration).filter(db_models.DBUserIntegration.user_id == user_id).all()

def connect_integration(db: Session, user_id: int, integration_id: int, metadata: dict = None):
    # Check if exists
    ui = db.query(db_models.DBUserIntegration).filter(
        db_models.DBUserIntegration.user_id == user_id,
        db_models.DBUserIntegration.integration_id == integration_id
    ).first()
    
    if not ui:
        ui = db_models.DBUserIntegration(
            user_id=user_id,
            integration_id=integration_id,
            is_connected=1,
            connection_metadata=json.dumps(metadata) if metadata else None
        )
        db.add(ui)
    else:
        ui.is_connected = 1
        ui.connection_metadata = json.dumps(metadata) if metadata else None
        
    db.commit()
    db.refresh(ui)
    return ui

def disconnect_integration(db: Session, user_id: int, integration_id: int):
    ui = db.query(db_models.DBUserIntegration).filter(
        db_models.DBUserIntegration.user_id == user_id,
        db_models.DBUserIntegration.integration_id == integration_id
    ).first()
    if ui:
        ui.is_connected = 0
        db.commit()
    return True

# --- OAuth Stubs ---

def get_auth_url(slug: str, redirect_uri: str):
    config = CLIENT_CONFIGS.get(slug)
    if not config:
        return None
    
    # Simplified OAuth URL construction
    return f"{config['auth_url']}?client_id={config['client_id']}&redirect_uri={redirect_uri}&response_type=code&scope=offline_access"

async def handle_oauth_callback(db: Session, user_id: int, slug: str, code: str):
    # In a real app, this would exchange 'code' for tokens via token_url
    # For this prototype, we'll simulate a successful exchange
    
    mock_token = f"mock_access_token_{slug}_{user_id}"
    mock_refresh = f"mock_refresh_token_{slug}"
    
    # Save token
    token_obj = db.query(db_models.DBIntegrationToken).filter(
        db_models.DBIntegrationToken.user_id == user_id,
        db_models.DBIntegrationToken.integration_slug == slug
    ).first()
    
    if not token_obj:
        token_obj = db_models.DBIntegrationToken(
            user_id=user_id,
            integration_slug=slug,
            access_token=mock_token,
            refresh_token=mock_refresh,
            expires_at=datetime.now(timezone.utc) + timedelta(hours=1)
        )
        db.add(token_obj)
    else:
        token_obj.access_token = mock_token
        token_obj.refresh_token = mock_refresh
        token_obj.expires_at = datetime.now(timezone.utc) + timedelta(hours=1)

    # Mark user integration as connected
    integration = db.query(db_models.DBIntegration).filter(db_models.DBIntegration.slug == slug).first()
    if integration:
        connect_integration(db, user_id, integration.id, metadata={"connected_at": str(datetime.now())})
        
    db.commit()
    return True

# --- Sync Logic Stubs ---

async def sync_ms365(db: Session, user_id: int):
    print(f"Syncing MS365 for user {user_id}...")
    user = db.query(db_models.DBUser).filter(db_models.DBUser.id == user_id).first()
    uname = user.username if user else "user"
    
    existing = db.query(db_models.DBMeeting).filter(db_models.DBMeeting.project_association == "MS365 Sync").first()
    if not existing:
        mtg = db_models.DBMeeting(
            title="Design Review (Imported from Outlook)",
            description="Discuss the latest user flows.",
            start_time=datetime.now(timezone.utc) + timedelta(days=2),
            end_time=datetime.now(timezone.utc) + timedelta(days=2, hours=1),
            created_by=uname,
            project_association="MS365 Sync"
        )
        db.add(mtg)
        db.commit()
        from services.socket_service import broadcast_event
        from services.automation_service import trigger_event
        await broadcast_event("MEETING_UPDATED", {"reason": "MS365_SYNC", "id": mtg.id})
        await trigger_event(db, "MEETING_SCHEDULED", user_id, {"title": mtg.title})
    return True

async def sync_github(db: Session, user_id: int):
    print(f"Syncing GitHub for user {user_id}...")
    user = db.query(db_models.DBUser).filter(db_models.DBUser.id == user_id).first()
    uname = user.username if user else "user"
    
    existing = db.query(db_models.DBTask).filter(db_models.DBTask.task_name == "Fix OAuth GitHub Bug").first()
    if not existing:
        task = db_models.DBTask(
            task_name="Fix OAuth GitHub Bug",
            assigned_to=uname,
            status="To Do",
            priority="High",
            difficulty="Medium",
            ai_rationale="Imported from GitHub Issues #42"
        )
        db.add(task)
        db.commit()
    return True

async def sync_trello(db: Session, user_id: int):
    print(f"Syncing Trello for user {user_id}...")
    user = db.query(db_models.DBUser).filter(db_models.DBUser.id == user_id).first()
    uname = user.username if user else "user"
    
    existing = db.query(db_models.DBTask).filter(db_models.DBTask.task_name == "Review Trello Board Sync").first()
    if not existing:
        task = db_models.DBTask(
            task_name="Review Trello Board Sync",
            assigned_to=uname,
            status="To Do",
            priority="Low",
            ai_rationale="Imported from Trello 'To Do' list"
        )
        db.add(task)
        db.commit()
    return True
