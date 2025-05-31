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

    favorites_titles = [str(f.title or "") for f in favorites]
    search_queries = [str(t[0]) for t in recent_terms]
    combined_text = " ".join(favorites_titles + search_queries).lower()

    keywords= [
        "python", "react", "developer", "project", "manager", "engineer", "ai", "full-stack", "node", "typescript",
        "aws", "docker", "kubernetes", "sql", "nosql", "cloud", "devops", "agile", "scrum", "ci/cd",
        "microservices", "graphql", "rest", "api", "ux/ui", "design", "testing", "automation", "data", "analytics",
        "business", "intelligence", "machine", "learning", "deep", "big", "etl", "pipeline", "visualization",
        "dashboard", "reporting", "kanban", "leadership", "communication", "teamwork", "collaboration", "problem-solving",
        "critical-thinking", "creativity", "innovation", "adaptability", "flexibility", "time-management",
        "organization", "prioritization", "attention-to-detail", "customer-service", "sales", "marketing",
        "strategy", "business-development", "negotiation", "presentation", "public-speaking", "networking",
        "relationship-building", "conflict-resolution", "empathy", "emotional-intelligence", "cultural-competence",
        "diversity-inclusion", "sustainability", "social-responsibility", "ethics", "integrity", "professionalism",
        "work-ethic", "motivation", "initiative", "self-starter", "entrepreneurship", "risk-management",
        "compliance", "regulations", "policies", "procedures", "quality-assurance", "quality-control",
        "continuous-improvement", "lean", "six-sigma", "project-management", "program-management",
        "portfolio-management", "change-management", "stakeholder-management", "resource-management",
        "budgeting", "forecasting", "financial-analysis", "cost-management", "performance-management",
        "key-performance-indicators", "metrics", "data-analysis", "data-mining", "data-visualization",
        "data-governance", "data-quality", "data-security", "data-privacy", "data-compliance",
        "data-architecture", "data-modeling", "data-integration", "data-migration", "data-warehousing",
        "data-lakes", "data-streaming", "data-pipelines", "data-processing", "data-transformation",
        "data-cleaning", "data-preparation", "data-enrichment", "data-analytics", "data-science",
        "data-engineering", "data-management", "data-strategy", "html", "css", "tailwind", "sass",
        "responsive-design", "cross-browser", "accessibility", "web-performance", "express", "django",
        "flask", "fastapi", "spring", "postgresql", "mysql", "mongodb", "redis", "restful", "gcp",
        "azure-devops", "cloudwatch", "cloudfront", "amplify", "serverless", "lambda", "s3", "ec2",
        "eks", "rds", "jenkins", "github-actions", "gitlab-ci", "circleci", "terraform", "ansible",
        "helm", "monitoring", "alerting", "java", "c#", "c++", "go", "ruby", "php", "swift", "rust",
        "bash", "shell", "matlab", "jest", "mocha", "cypress", "pytest", "unit-testing",
        "integration-testing", "e2e-testing", "tdd", "bdd", "nlp", "transformers", "huggingface",
        "openai", "chatgpt", "llm", "prompt-engineering", "langchain", "fine-tuning", "tokenization", "product-management",
        "user-research", "user-journey", "kpis", "roi", "market-analysis", "go-to-market", "jira",
        "confluence", "slack", "notion", "miro", "figma", "zoom", "asynchronous", "remote-work",
        "pair-programming", "resilience", "ownership", "accountability", "mentorship", "curiosity",
        "growth-mindset", "self-awareness", "bias-for-action", "software"
    ]

    keywords = [kw for kw in keywords if kw in combined_text]

    # Resume keyword logic
    resume_text = " ".join([r.content or "" for r in resumes]).lower()
    resume_keywords = [kw for kw in keywords if kw in resume_text]

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
        "resumeKeywords": resume_keywords,
        "searchTerms": [t[0] for t in recent_terms]
    }
