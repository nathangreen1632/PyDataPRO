from openai import OpenAI
from sqlalchemy import text
import os

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def get_user_skills_from_resume(resume_content: str) -> list[str]:
    """Extract skills from 'Skills' section of resume markdown."""
    from server.services.skills import extract_skills_from_resume as extract_skills
    return extract_skills(resume_content)

def get_top_matching_roles(user_skills: list[str], db) -> list[str]:
    """Find top roles from the DB based on shared skills."""
    query = text("SELECT roleTitle, requiredSkills FROM rolesAndSkills")
    rows = db.execute(query).fetchall()

    scored_roles = []
    for row in rows:
        role_skills = row.requiredskills  # ARRAY[] from PostgreSQL
        match_score = len(set(user_skills) & set(role_skills)) / max(len(role_skills), 1)
        scored_roles.append((row.roletitle, match_score))

    scored_roles.sort(key=lambda x: x[1], reverse=True)
    return [title for title, _ in scored_roles[:5]]

def ask_openai_for_suggestions(skills: list[str], roles: list[str]) -> list[dict]:
    """Use OpenAI to personalize role suggestions."""
    prompt = (
        f"The user has the following skills:\n\n{', '.join(skills)}\n\n"
        f"Here are some potential job roles: {', '.join(roles)}.\n\n"
        "Based on the user's skills, suggest the 5 most fitting career paths and explain why.\n"
        "Use this format:\n\n1. [Role]: [Explanation]\n2. ..."
    )

    response = client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.5
    )

    reply = response.choices[0].message.content
    lines = reply.strip().split("\n")

    results = []
    for line in lines:
        if line.strip() and line[0].isdigit():
            parts = line.split(":", 1)
            if len(parts) == 2:
                results.append({
                    "role": parts[0].split(".")[1].strip(),
                    "explanation": parts[1].strip()
                })
    return results

def generate_career_suggestions(resume_content: str, db):
    user_skills = get_user_skills_from_resume(resume_content)
    matched_roles = get_top_matching_roles(user_skills, db)
    openai_suggestions = ask_openai_for_suggestions(user_skills, matched_roles)
    return openai_suggestions
