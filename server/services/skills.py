from sqlalchemy import text
import spacy
from typing import List, Dict
from sqlalchemy.orm import Session
import re

nlp = spacy.load("en_core_web_sm")

def extract_skills_section(resume_text: str) -> str:
    markdown_match = re.search(r"```markdown\n(.*?)\n```", resume_text, re.DOTALL)
    if markdown_match:
        resume_content = markdown_match.group(1)
    else:
        resume_content = resume_text

    match = re.search(
        r"##\s*Skills\s*\n(.*)(?=\n##\s*(?:Education|Experience|Certifications)|\Z)",
        resume_content,
        re.DOTALL | re.IGNORECASE
    )
    if match:
        return match.group(1).strip()
    return ""


def extract_skills_from_resume(resume_text: str) -> List[str]:
    skill_text = extract_skills_section(resume_text)
    if not skill_text:
        return []

    doc = nlp(skill_text)
    tokens = {
        token.text.lower()
        for token in doc
        if token.pos_ in {"NOUN", "PROPN"}
        and not token.is_stop
        and token.ent_type_ not in {"DATE", "PERSON"}
        and token.text.isalpha()
        and len(token.text) > 1
    }

    return list(tokens)

def suggest_roles(user_skills: List[str], db: Session) -> List[Dict]:
    stmt = text("""
        SELECT roletitle, requiredskills
        FROM rolesandskills
    """)
    result = db.execute(stmt).fetchall()

    suggestions = []
    for role_title, required_skills in result:
        overlap = len(set(user_skills).intersection(set(required_skills)))
        if overlap >= 1:
            suggestions.append({
                "roleTitle": role_title,
                "matchStrength": overlap,
            })

    suggestions.sort(key=lambda x: x["matchStrength"], reverse=True)
    return suggestions[:5]
