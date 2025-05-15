from fastapi import APIRouter, HTTPException
from sqlalchemy import create_engine, text
import os
from fastapi import Depends
from sqlalchemy.orm import Session
from server.database import get_db
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

DB_URL = f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
engine = create_engine(DB_URL, pool_pre_ping=True)

@router.get("/jobs")
def get_jobs(db: Session = Depends(get_db)):
    try:
        rows = db.execute(text("""
          SELECT 
            title, location, "salaryMin", "salaryMax"
          FROM "Jobs" 
          WHERE "salaryMin" IS NOT NULL AND "salaryMax" IS NOT NULL
        """)).all()
        return {"jobs": [dict(r._mapping) for r in rows]}
    except Exception as e:
        print("🔥 /jobs failed:", e)
        raise HTTPException(500, detail=str(e))
