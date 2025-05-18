from sqlalchemy import text
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from typing import List

from server.database import get_db
from server.services.skills import extract_skills_from_resume, suggest_roles

router = APIRouter()

class SuggestionRequest(BaseModel):
    resume: str = Field(..., description="Full resume text (markdown or plain)")
    userId: str = Field(..., description="UUID of the current user")


class SuggestionResponse(BaseModel):
    skillsExtracted: List[str]
    suggestedRoles: List[dict]


@router.post(
    "/career-suggestions",
    response_model=SuggestionResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate and store AI career suggestions"
)
def career_suggestions(
    payload: SuggestionRequest,
    db: Session = Depends(get_db),
):
    # 1. Extract skills
    skills = extract_skills_from_resume(payload.resume)
    if not skills:
        raise HTTPException(400, "No skills could be extracted from resume")

    # 2. Generate role suggestions
    matches = suggest_roles(skills, db)
    roles = [m["roleTitle"] for m in matches]

    # 3. Store in careerSuggestions table
    insert_stmt = text("""
        INSERT INTO careerSuggestions (userId, suggestedRoles, skillsExtracted)
        VALUES (:userId, :roles, :skills)
    """)

    db.execute(
        insert_stmt,
        {"userId": payload.userId, "roles": roles, "skills": skills}
    )
    db.commit()

    # 4. Return structured response
    return {"skillsExtracted": skills, "suggestedRoles": matches}
