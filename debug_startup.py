import sys
import os

# Add current directory to sys.path
sys.path.append(os.getcwd())

try:
    print("Attempting to import database...")
    from database import engine, Base
    print("Database imported.")

    print("Attempting to create tables...")
    import db_models
    Base.metadata.create_all(bind=engine)
    print("Tables created.")

    print("Attempting to import app...")
    from main import app
    print("App imported successfully.")
except Exception as e:
    print(f"FAILED with error: {e}")
    import traceback
    traceback.print_exc()
