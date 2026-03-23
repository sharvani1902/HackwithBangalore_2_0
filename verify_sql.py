from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import engine, Base
from db_models import DBTeamMember, DBTask

# Ensure tables are created in this session too
Base.metadata.create_all(bind=engine)
SessionLocal = sessionmaker(bind=engine)

def check():
    db = SessionLocal()
    teams = db.query(DBTeamMember).all()
    tasks = db.query(DBTask).all()
    print(f"Audit: Found {len(teams)} teams and {len(tasks)} tasks.")
    db.close()

if __name__ == "__main__":
    check()
