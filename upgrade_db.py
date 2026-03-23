from database import engine, Base
import db_models

print("Creating new database models...")
Base.metadata.create_all(bind=engine)
print("Database schema synchronized successfully!")
