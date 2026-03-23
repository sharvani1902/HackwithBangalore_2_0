from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from db_models import DBTeamMember, DBTask

SQLALCHEMY_DATABASE_URL = "sqlite:///./sql_app.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

def check():
    db = SessionLocal()
    teams = db.query(DBTeamMember).all()
    tasks = db.query(DBTask).all()
    print(f"Found {len(teams)} teams and {len(tasks)} tasks.")
    for t in teams:
        print(f"Team: {t.name}")
    for tk in tasks:
        print(f"Task: {tk.task_name} (assigned to: {tk.assigned_to})")
    db.close()

if __name__ == "__main__":
    check()
