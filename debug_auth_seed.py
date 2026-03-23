import traceback
from sqlalchemy.orm import Session
from database import SessionLocal, Base, engine
import db_models
from main import seed_data
import asyncio

async def test_seed():
    db = SessionLocal()
    try:
        # We need to await it because seed_data is async in main.py
        await seed_data(db)
        print("Seed successful!")
    except Exception:
        print("SEED FAILED!")
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(test_seed())
