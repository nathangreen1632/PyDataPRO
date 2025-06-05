from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from server.database import get_db
from server.models.user import User
from server.models.resume import Resume
from server.models.favorite_job import FavoriteJob
from server.models.search_term import SearchTerm
from server.utils.auth import get_current_user

import spacy
import re

nlp = spacy.load("en_core_web_trf")
router = APIRouter()

def extract_skills_section(markdown: str) -> str:
    skills_pattern = r"(?:^|\n)(?:#+|\*\*)\s*Skills[:\s]*\**\s*\n(.*?)(?=\n[#\*]{1,3}|\n##|\Z)"
    match = re.search(skills_pattern, markdown, re.IGNORECASE | re.DOTALL)
    if match:
        return match.group(1).strip(" \n*")
    return ""

def extract_technical_keywords(text: str) -> set:
    doc = nlp(text)
    raw_phrases = set()

    # Blacklists to reduce noise
    weak_words = {
        "senior", "junior", "full", "stack", "software", "engineer", "developer",
        "account", "sector", "public", "solutions", "customer", "manager",
        "technology", "specialist", "executive", "graduate", "intern", "prompt", "citi",
        "commodities", "remote", "application", "computer", "(typescript", "houston", "austin",
        "chicago", "new york", "nyc", "boston", "san francisco", "sf", "la", "los angeles",
        "dallas", "denver", "seattle", "washington", "atlanta", "miami", "phoenix",
        "portland", "pittsburgh", "philadelphia", "baltimore", "charlotte", "raleigh",
        "nashville", "orlando", "san diego", "sacramento", "salt lake city", "st. louis",
        "minneapolis", "kansas city", "cincinnati", "columbus", "indianapolis",
        "detroit", "cleveland", "milwaukee", "tampa", "houston", "dallas", "austin",
        "san jose", "las vegas", "albuquerque", "tucson", "fresno", "long beach",
        "mesa", "scottsdale", "irvine", "santa clara", "oakland", "bakersfield",
        "anaheim", "santa ana", "riverside", "stockton", "chula vista", "irvine",
        "san bernardino", "modesto", "fontana", "moreno valley", "glendale",
        "huntington beach", "garden grove", "santa rosa", "ontario", "rancho cucamonga",
        "oxnard", "palmdale", "salinas", "pomona", "escondido", "torrance",
        "pasadena", "hayward", "fullerton", "orange", "el monte", "thousand oaks",
        "visalia", "simi valley", "concord", "roseville", "santa clara", "sunnyvale",
        "santa cruz", "san mateo", "san francisco bay area", "silicon valley"
    }

    def is_valuable_phrase(phrase: str) -> bool:
        words = phrase.split()
        if len(words) == 1:
            return words[0].lower() not in weak_words and words[0].istitle()
        return all(w.lower() not in weak_words for w in words) and 1 <= len(words) <= 3

    def add_cleaned_phrase(raw: str):
        # Split by common delimiters like commas or slashes
        parts = re.split(r"[\/,|•]", raw)
        for p in parts:
            p = p.strip()
            if is_valuable_phrase(p):
                raw_phrases.add(p)

    # Step 1: Named entities (multi-word ORG/PRODUCT/SKILL)
    for ent in doc.ents:
        if ent.label_ in {"ORG", "PRODUCT", "SKILL", "LANGUAGE", "WORK_OF_ART"}:
            add_cleaned_phrase(ent.text)

    # Step 2: Noun chunks like "React Native"
    for chunk in doc.noun_chunks:
        add_cleaned_phrase(chunk.text)

    # Step 3: Strong standalone tokens (not already captured)
    for token in doc:
        word = token.text.strip()
        if (
            token.pos_ in {"PROPN", "NOUN"}
            and len(word) > 2
            and not token.is_stop
            and word.lower() not in weak_words
        ):
            raw_phrases.add(word)

    # Step 4: Deduplicate - ignore shorter substrings if longer exists
    final_keywords = set()
    seen = set()

    for kw in sorted(raw_phrases, key=len):  # shortest first
        lower_kw = kw.lower()
        if not any(lower_kw in s for s in seen):
            final_keywords.add(kw.title())
            seen.add(lower_kw)

    return final_keywords



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
        db.query(SearchTerm)
        .filter(SearchTerm.userId == current_user.id)
        .order_by(SearchTerm.createdAt.desc())
        .all()
    )

    # Step 1: Extract Skills Section from Resumes
    all_skills_text = []
    for r in resumes:
        skills_section = extract_skills_section(r.content or "")
        if skills_section:
            all_skills_text.append(skills_section)
    combined_skills = "\n".join(all_skills_text)
    resume_keywords = extract_technical_keywords(combined_skills)

    # Step 2: Combine search titles and favorite titles
    favorite_titles = [f.title or "" for f in favorites]
    search_titles = [t.title or "" for t in recent_terms]
    combined_interest_text = " ".join(favorite_titles + search_titles)
    favorited_keywords = extract_technical_keywords(combined_interest_text)

    # Step 3: Overlap resume skills with user interest keywords
    relevant_resume_keywords = sorted(resume_keywords & favorited_keywords)
    sorted_favorited_keywords = sorted(favorited_keywords)

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
        "keywords": sorted_favorited_keywords,      # From search + favorite titles
        "resumeKeywords": relevant_resume_keywords,  # Skills matching user interest
        "searchTerms": [t.query for t in recent_terms],  # Full raw search bar entries
    }
