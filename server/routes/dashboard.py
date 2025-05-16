from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from server.database import get_db
from server.models.user import User
from server.models.resume import Resume
from server.models.favorite_job import FavoriteJob
from server.models.search_term import SearchTerm
from server.utils.auth import get_current_user

router = APIRouter()

@router.get("/dashboard")
def get_dashboard_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
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
        db.query(SearchTerm.query)
        .filter(SearchTerm.userId == current_user.id)
        .order_by(SearchTerm.createdAt.desc())
        .all()
    )

    titles = [str(r.title or "") for r in resumes] + [str(f.title or "") for f in favorites]
    combined_text = " ".join(titles).lower()
    keywords = [
        kw for kw in ["python", "react", "developer", "project", "manager", "engineer", "ai", "full-stack", "node", "typescript", "aws", "docker", "kubernetes", "sql", "nosql",
                      "cloud", "devops", "agile", "scrum", "ci/cd", "microservices", "graphql", "rest", "api", "ux/ui", "design", "testing", "automation", "data", "analytics",
                      "business", "intelligence", "machine", "learning", "deep", "learning", "big", "data", "etl", "pipeline", "visualization", "dashboard", "reporting", "scrum",
                      "kanban", "leadership", "communication", "teamwork", "collaboration", "problem-solving", "critical-thinking", "creativity", "innovation", "adaptability",
                      "flexibility", "time-management", "organization", "prioritization", "attention-to-detail", "customer-service", "sales", "marketing", "strategy", "business-development",
                      "negotiation", "presentation", "public-speaking", "networking", "relationship-building", "conflict-resolution", "empathy", "emotional-intelligence", "cultural-competence",
                      "diversity-inclusion", "sustainability", "social-responsibility", "ethics", "integrity", "professionalism", "work-ethic", "motivation", "initiative", "self-starter", "entrepreneurship"]
        if kw in combined_text
    ]

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
        "keywords": keywords,
        "searchTerms": [t[0] for t in recent_terms]
    }
