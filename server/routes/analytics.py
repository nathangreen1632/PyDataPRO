import uuid
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from typing import List, Optional, Dict
from sqlalchemy.orm import Session
from sqlalchemy import text
import pandas as pd
from datetime import datetime, timezone
import math

from server.database import get_db
from server.utils.auth import get_current_user
from server.models.user import User

router = APIRouter()

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


@router.get("/salary-summary", response_model=AnalyticsResponse)
def salary_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = db.execute(
        text("""
            SELECT "title", "location", "salaryMin", "salaryMax"
            FROM "user_analytics"
            WHERE "userId" = :userId AND "action" = 'favorite'
        """),
        {"userId": str(current_user.id)}
    )

    rows = result.fetchall()
    if not rows:
        raise HTTPException(status_code=404, detail="No jobs found for user.")

    df = pd.DataFrame(rows, columns=["title", "location", "salaryMin", "salaryMax"])

    print("\n=== Fetched Jobs for Analytics ===")
    print(df.to_string(index=False))
    print("==================================\n")

    df = df.dropna(subset=["salaryMin", "salaryMax"])

    df["salaryMin"] = df["salaryMin"].apply(lambda x: x if math.isfinite(x) else None)
    df["salaryMax"] = df["salaryMax"].apply(lambda x: x if math.isfinite(x) else None)

    df["salary_mid"] = df[["salaryMin", "salaryMax"]].mean(axis=1)
    df["location"] = df["location"].str.strip().str.title()
    df["title"] = df["title"].str.strip().str.title()
    average_salary = round(df["salary_mid"].dropna().mean(), 2)

    if not math.isfinite(average_salary):
        average_salary = 0.0

    def extract_general_location(loc: str) -> str:
        parts = [p.strip() for p in loc.split(",")]
        return f"{parts[-2]}, {parts[-1]}" if len(parts) >= 2 else loc

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

class SearchLog(BaseModel):
    title: Optional[str] = None
    location: Optional[str] = None
    query: Optional[str] = None

@router.get("/applied-jobs", response_model=List[str])
def get_applied_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = db.execute(
        text("""
            SELECT DISTINCT ON ("title") "title"
            FROM "user_analytics"
            WHERE "userId" = :userId AND "action" = 'applied'
            ORDER BY "title", "timestamp" DESC
        """),
        {"userId": str(current_user.id)}
    )

    titles = [row[0] for row in result.fetchall() if row[0]]
    return titles


@router.post("/search-history", status_code=status.HTTP_204_NO_CONTENT)
def log_search_term(
    payload: SearchLog,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    title = (payload.title or "").strip()
    location = (payload.location or "").strip()
    query = (payload.query or f"{title} {location}").strip()

    if not query:
        return  # Nothing to log

    now = datetime.now(timezone.utc)

    db.execute(
        text("""
            INSERT INTO "SearchTerms" ("id", "userId", "title", "location", "query", "createdAt", "updatedAt")
            VALUES (:id, :userId, :title, :location, :query, :createdAt, :updatedAt)
        """),
        {
            "id": str(uuid.uuid4()),
            "userId": str(current_user.id),
            "title": title or None,
            "location": location or None,
            "query": query,
            "createdAt": now,
            "updatedAt": now
        }
    )

    db.commit()

@router.delete("/search-history/{query}", status_code=status.HTTP_204_NO_CONTENT)
def delete_search_term(
    query: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db.execute(
        text("""
            DELETE FROM "SearchTerms"
            WHERE "userId" = :userId AND "query" = :query
        """),
        {
            "userId": str(current_user.id),
            "query": query,
        }
    )
    db.commit()

@router.delete("/applied-jobs/{title}", status_code=status.HTTP_204_NO_CONTENT)
def delete_applied_job(
    title: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db.execute(
        text("""
            DELETE FROM "user_analytics"
            WHERE "userId" = :userId AND "action" = 'applied' AND "title" = :title
        """),
        {
            "userId": str(current_user.id),
            "title": title,
        }
    )
    db.commit()
