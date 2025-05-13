from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
import pandas as pd

router = APIRouter()

# --- Models ---
class Job(BaseModel):
    title: str
    location: Optional[str]
    salary_min: Optional[float]
    salary_max: Optional[float]

class AnalyticsResponse(BaseModel):
    average_salary: float
    top_locations: Dict[str, int]
    common_titles: Dict[str, int]

# --- Endpoint ---
@router.post("/analytics/salary-summary", response_model=AnalyticsResponse)
def salary_summary(jobs: List[Job]):
    if not jobs:
        raise HTTPException(status_code=400, detail="No job data provided.")

    try:
        df = pd.DataFrame([job.model_dump() for job in jobs])

        # Midpoint salary estimate
        df["salary_mid"] = df[["salary_min", "salary_max"]].mean(axis=1)

        # ✅ Normalize location and title fields
        df["location"] = df["location"].str.strip().str.title()
        df["title"] = df["title"].str.strip().str.title()

        # Calculations
        average_salary = round(df["salary_mid"].dropna().mean(), 2)

        def extract_general_location(loc: str) -> str:
            parts = [p.strip() for p in loc.split(",")]
            if len(parts) >= 2:
                return f"{parts[-2]}, {parts[-1]}"  # e.g. "Austin, Travis County" stays the same
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
