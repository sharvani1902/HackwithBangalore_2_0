from sqlalchemy.orm import Session
from database import SessionLocal
import db_models

def seed_integrations():
    db = SessionLocal()
    integrations = [
        {"name": "Microsoft 365", "slug": "ms365", "description": "Sync Outlook calendar, OneDrive files, and contacts.", "icon": "microsoft"},
        {"name": "GitHub", "slug": "github", "description": "Link repositories, track commits, issues, and pull requests.", "icon": "github"},
        {"name": "Trello", "slug": "trello", "description": "Sync boards and tasks with Trello.", "icon": "trello"},
        {"name": "Zoom", "slug": "zoom", "description": "Schedule and manage Zoom meetings directly from ProPilot.", "icon": "video"}
    ]
    
    for item in integrations:
        existing = db.query(db_models.DBIntegration).filter(db_models.DBIntegration.slug == item["slug"]).first()
        if not existing:
            new_int = db_models.DBIntegration(**item)
            db.add(new_int)
    
    db.commit()
    db.close()
    print("Integrations seeded successfully!")

if __name__ == "__main__":
    seed_integrations()
