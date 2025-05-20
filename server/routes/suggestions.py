from sqlalchemy import text
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from typing import List
from server.database import get_db
from server.services.skills import extract_skills_from_resume, suggest_roles
from server.services.career_path import generate_career_suggestions

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
    # 1. Extract skills from resume
    skills = extract_skills_from_resume(payload.resume)
    if not skills:
        raise HTTPException(400, "No skills could be extracted from resume")

    # 2. Use OpenAI to generate suggestions
    ai_suggestions = generate_career_suggestions(payload.resume, db)

    # 3. Store in DB
    insert_stmt = text("""
        INSERT INTO careerSuggestions (userId, suggestedRoles, skillsExtracted)
        VALUES (:userId, :roles, :skills)
    """)

    roles_only = [s["role"] for s in ai_suggestions]

    db.execute(
        insert_stmt,
        {"userId": payload.userId, "roles": roles_only, "skills": skills}
    )
    db.commit()

    # 4. Return AI suggestions
    return {"skillsExtracted": skills, "suggestedRoles": ai_suggestions}
