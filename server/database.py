from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Load .env file variables
load_dotenv()

# Reads from your .env file
DATABASE_URL = os.getenv("DATABASE_URL")

# Use default options for PostgreSQL (no sqlite-specific args)
engine = create_engine(DATABASE_URL)

# SessionLocal gives us DB sessions per request
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Declarative base class
Base = declarative_base()

# Dependency for routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
