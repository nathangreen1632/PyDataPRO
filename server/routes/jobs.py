from fastapi import APIRouter, HTTPException
from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# DB connection string
DB_URL = f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
engine = create_engine(DB_URL, pool_pre_ping=True)

@router.get("/jobs")
def get_jobs():
    try:
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT 
                    title, 
                    location, 
                    "salaryMin" AS salary_min, 
                    "salaryMax" AS salary_max
                FROM "Jobs"
                WHERE "salaryMin" IS NOT NULL AND "salaryMax" IS NOT NULL
            """))

            jobs = [dict(row) for row in result.mappings()]
            return {"jobs": jobs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))