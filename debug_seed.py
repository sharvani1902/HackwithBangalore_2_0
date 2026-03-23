from main import seed_data
from database import SessionLocal
import asyncio

async def test_seed():
    db = SessionLocal()
    try:
        result = await seed_data(db)
        print("Seed result:", result)
    except Exception as e:
        import traceback
        print("Seed failed with error:")
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(test_seed())
