import uuid
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from typing import List, Optional, Dict
from sqlalchemy.orm import Session
from sqlalchemy import text
import pandas as pd
from datetime import datetime, timezone

from server.database import get_db
from server.utils.auth import get_current_user
from server.models.user import User

router = APIRouter()

# --- Models for Salary Summary ---
class Job(BaseModel):
    title: str
    location: Optional[str]
    salaryMin: Optional[float]
    salaryMax: Optional[float]


class JobPayload(BaseModel):
    jobs: List[Job]


class AnalyticsResponse(BaseModel):
    average_salary: float
    top_locations: Dict[str, int]
    common_titles: Dict[str, int]


@router.post("/analytics/salary-summary", response_model=AnalyticsResponse)
def salary_summary(payload: JobPayload):
    jobs = payload.jobs

    if not jobs:
        raise HTTPException(status_code=400, detail="No job data provided.")

    try:
        # 👇 no aliasing, now camelCase
        df = pd.DataFrame([job.dict() for job in jobs])

        df["salary_mid"] = df[["salaryMin", "salaryMax"]].mean(axis=1)
        df["location"] = df["location"].str.strip().str.title()
        df["title"] = df["title"].str.strip().str.title()
        average_salary = round(df["salary_mid"].dropna().mean(), 2)

        def extract_general_location(loc: str) -> str:
            parts = [p.strip() for p in loc.split(",")]
            if len(parts) >= 2:
                return f"{parts[-2]}, {parts[-1]}"
            return loc

        df["normalized_location"] = df["location"].dropna().apply(extract_general_location)

        top_locations = (
            df["location"]
            .dropna()
            .str.strip()
            .str.title()
            .value_counts()
            .head(5)
            .to_dict()
        )

        common_titles = (
            df["title"]
            .dropna()
            .value_counts()
            .head(7)
            .to_dict()
        )

        return {
            "average_salary": average_salary,
            "top_locations": top_locations,
            "common_titles": common_titles,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- Search Term Logger Endpoint ---
class SearchLog(BaseModel):
    query: str


@router.post("/analytics/search-history", status_code=status.HTTP_204_NO_CONTENT)
def log_search_term(
    payload: SearchLog,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    now = datetime.now(timezone.utc)

    db.execute(
        text("""
            INSERT INTO "SearchTerms" ("id", "userId", "query", "createdAt", "updatedAt")
            VALUES (:id, :userId, :query, :createdAt, :updatedAt)
        """),
        {
            "id": str(uuid.uuid4()),
            "userId": str(current_user.id),
            "query": payload.query.strip(),
            "createdAt": now,
            "updatedAt": now
        }
    )

    db.commit()
