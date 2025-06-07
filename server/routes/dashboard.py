from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from server.database import get_db
from server.models.user import User
from server.models.resume import Resume
from server.models.favorite_job import FavoriteJob
from server.models.search_term import SearchTerm
from server.utils.auth import get_current_user
from server.helpers.skills import extract_skills_section, extract_technical_keywords

router = APIRouter()

@router.get("/dashboard")
def get_dashboard_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Load user data
    resumes = (
        db.query(Resume)
          .filter(Resume.user_id == current_user.id)
          .order_by(Resume.created_at.desc())
          .all()
    )
    favorites = (
        db.query(FavoriteJob)
          .filter(FavoriteJob.user_id == current_user.id)
          .order_by(FavoriteJob.createdAt.desc())
          .all()
    )
    recent_terms = (
        db.query(SearchTerm)
          .filter(SearchTerm.userId == current_user.id)
          .order_by(SearchTerm.createdAt.desc())
          .all()
    )

    # 2. Build skill-text & extract
    combined = "\n".join(
        s for r in resumes
        if (s := extract_skills_section(r.content or ""))
    )
    resume_keywords = extract_technical_keywords(combined)

    # 3. Interest keywords
    combined_interest = " ".join(
        f.title or "" for f in favorites
    ) + " " + " ".join(t.title or "" for t in recent_terms)
    interest_keywords = extract_technical_keywords(combined_interest)

    # 4. Prepare response
    return {
        "userName": current_user.firstName,
        "resumes": [
            {"id": r.id, "title": r.title, "content": r.content, "created_at": r.created_at.isoformat()}
            for r in resumes
        ],
        "favorites": [
            {"id": f.id, "title": f.title, "company": f.company}
            for f in favorites
        ],
        "keywords": sorted(interest_keywords),
        "resumeKeywords": sorted(resume_keywords & interest_keywords),
        "searchTerms": [t.query for t in recent_terms],
    }
