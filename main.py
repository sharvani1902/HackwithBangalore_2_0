from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session

# Local imports
from database import engine, Base, get_db
import db_models
import models
from routes import projects, teams, tasks, auth, decisions as decisions_router, ai as ai_router, meetings, integrations, reports
from services.suggestion_service import suggest_assignee
from services.insights_service import get_insights
from services import auth_service
from services.team_service import add_team_member
from services.task_service import create_task, mark_task_completed
from services.chat_service import process_chat_query

load_dotenv()

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Project Manager API",
    description="Backend for an AI-powered team project manager",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(projects.router, prefix="/api/v1/projects", tags=["projects"])
app.include_router(teams.router, prefix="/api/v1/teams", tags=["teams"])
app.include_router(tasks.router, prefix="/api/v1/tasks", tags=["tasks"])
app.include_router(decisions_router.router, prefix="/api/v1/decisions", tags=["decisions"])
app.include_router(ai_router.router, prefix="/api/v1/ai", tags=["ai"])
app.include_router(meetings.router, prefix="/api/v1/meetings", tags=["meetings"])
app.include_router(integrations.router, prefix="/api/v1/integrations", tags=["integrations"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["reports"])

@app.get("/")
async def root():
    """
    Root endpoint returning a simple JSON message.
    """
    return {"message": "Welcome to the AI Project Manager API"}


@app.get("/suggest-member", response_model=models.TaskSuggestionResponse)
async def suggest_member(task_name: str, db: Session = Depends(get_db)):
    """
    Suggest the best team member for a task based on past history.
    """
    return suggest_assignee(db, task_name)


@app.get("/insights", response_model=models.InsightsResponse)
async def fetch_insights(
    db: Session = Depends(get_db), 
    current_user: db_models.DBUser = Depends(auth_service.get_current_user)
):
    """
    Extract global team performance and memory-derived project risks.
    """
    return await get_insights(db)


@app.post("/chat")
async def chat_with_ai(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: db_models.DBUser = Depends(auth_service.get_current_user)
):
    """
    Premium chat endpoint for project interrogation.
    """
    query = payload.get("query", "")
    if not query:
        return {"response": "I didn't receive a query. How can I assist you today?", "context_ref": "NONE"}
    
    return await process_chat_query(db, query)


@app.post("/seed")
async def seed_data(db: Session = Depends(get_db)):
    """
    Seed the application with sample team members and tasks for demonstration.
    """
    # Create default admin user
    admin_user = db.query(db_models.DBUser).filter(db_models.DBUser.username == "admin").first()
    if not admin_user:
        hashed_pw = auth_service.get_password_hash("admin123")
        db.add(db_models.DBUser(username="admin", hashed_password=hashed_pw, role="admin"))
        db.commit()

    # 3 members with specialized skills and roles
    add_team_member(db, models.TeamMemberCreate(name="Alice", skills="Backend, Python, API, Database, SQLAlchemy", role="Backend Engineer"))
    add_team_member(db, models.TeamMemberCreate(name="Bob", skills="Frontend, React, CSS, JavaScript, UI/UX", role="Frontend Developer"))
    add_team_member(db, models.TeamMemberCreate(name="Charlie", skills="DevOps, Docker, Documentation, Review, QA", role="DevOps & QA Lead"))
        
    now = datetime.now(timezone.utc)
    
    # Alice - 2 Backend tasks, On time
    t1 = await create_task(db, models.TaskItemCreate(
        task_name="Build setup database API backend", 
        assigned_to="Alice", 
        deadline=now + timedelta(days=1),
        priority="High",
        difficulty="Hard",
        ai_rationale="Alice has extensive experience with SQLAlchemy and API design, making her ideal for this core architectural task."
    ))
    await mark_task_completed(db, t1.id)
    t2 = await create_task(db, models.TaskItemCreate(
        task_name="Optimize database queries", 
        assigned_to="Alice", 
        deadline=now + timedelta(days=1),
        priority="Medium",
        difficulty="Medium",
        ai_rationale="Alignment with Alice's performance optimization skills."
    ))
    await mark_task_completed(db, t2.id)
    
    # Alice - 1 UI task, Delayed
    t3 = await create_task(db, models.TaskItemCreate(
        task_name="Fix UI dashboard bug", 
        assigned_to="Alice", 
        deadline=now - timedelta(days=1),
        priority="Low",
        difficulty="Easy",
        ai_rationale="Assigned To Alice during High-Load phase to balance team throughput."
    ))
    await mark_task_completed(db, t3.id)
    
    # Bob - 2 Frontend UI tasks, On time
    t4 = await create_task(db, models.TaskItemCreate(
        task_name="Create react frontend", 
        assigned_to="Bob", 
        deadline=now + timedelta(days=1),
        priority="High",
        difficulty="Hard",
        ai_rationale="Bob is our UI lead; his React expertise ensures a premium design foundation."
    ))
    await mark_task_completed(db, t4.id)
    t5 = await create_task(db, models.TaskItemCreate(
        task_name="Polish frontend design", 
        assigned_to="Bob", 
        deadline=now + timedelta(days=1),
        priority="Medium",
        difficulty="Medium",
        ai_rationale="Fine-tuning aesthetics requires Bob's specific eye for detail."
    ))
    await mark_task_completed(db, t5.id)
    
    # Bob - 1 backend task, Delayed
    t6 = await create_task(db, models.TaskItemCreate(task_name="Migrate database schema", assigned_to="Bob", deadline=now - timedelta(days=1)))
    await mark_task_completed(db, t6.id)
    
    # Charlie - 1 completed, 1 delayed
    t7 = await create_task(db, models.TaskItemCreate(task_name="Review backend PR", assigned_to="Charlie", deadline=now + timedelta(days=1)))
    await mark_task_completed(db, t7.id)
    t8 = await create_task(db, models.TaskItemCreate(task_name="Update documentation", assigned_to="Charlie", deadline=now - timedelta(days=1)))
    await mark_task_completed(db, t8.id)

    # --- Seed Past Decisions ---
    existing_decisions = db.query(db_models.DBDecision).count()
    if existing_decisions == 0:
        db.add(db_models.DBDecision(title="Adopt FastAPI for Backend", content="Team decided to use FastAPI over Django REST for its async performance and auto-generated OpenAPI docs.", decided_by="Alice", category="Architecture"))
        db.add(db_models.DBDecision(title="Use React + Vite for Frontend", content="React chosen for its component ecosystem; Vite selected over CRA for faster HMR and build times.", decided_by="Bob", category="Architecture"))
        db.add(db_models.DBDecision(title="Freeze Friday Deployments", content="After 3 incidents, team agreed no production deployments on Fridays. Releases to happen Tuesday-Thursday only.", decided_by="Charlie", category="Process"))
        db.commit()

    return {"message": "Seed active! 3 Members (with roles), 8 demo tasks, and 3 past decisions injected."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
