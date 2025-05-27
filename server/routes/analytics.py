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

    # Drop rows where either salaryMin or salaryMax is missing
    df = df.dropna(subset=["salaryMin", "salaryMax"])

    # Clean any potentially unsafe float values (like inf or nan)
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
    query: str

@router.post("/search-history", status_code=status.HTTP_204_NO_CONTENT)
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

@router.delete("/search-history/{query}", status_code=204)
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