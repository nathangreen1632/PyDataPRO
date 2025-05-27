from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from server.database import get_db
from server.utils.auth import get_current_user
from server.models.user import User
from server.models.resume import Resume
from server.services.skills import extract_skills_from_resume
from server.services.career_path import get_top_matching_roles
import requests
from random import shuffle
import langid
from openai import OpenAI
import json
import re

client = OpenAI()

router = APIRouter()


def rotate_skills_into_queries(skills: list[str], per_query: int = 2, max_queries: int = 6) -> list[str]:
    shuffle(skills)
    used = set()
    queries = []
    for i in range(0, len(skills), per_query):
        group = skills[i:i + per_query]
        if any(skill in used for skill in group):
            continue
        queries.append(" ".join(group))
        used.update(group)
        if len(queries) >= max_queries:
            break
    return queries if queries else [" ".join(skills[:2])]


@router.get("/learning-resources")
def get_learning_resources(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = (
        db.query(Resume)
        .filter(Resume.user_id == user.id)
        .order_by(Resume.updated_at.desc())
        .first()
    )
    if not resume:
        raise HTTPException(status_code=404, detail="No resume found for user")
    return _generate_course_recommendations(resume.content or "", db)


class LearningRequest(BaseModel):
    resume: str


@router.post("/learning-resources")
def get_learning_resources_from_resume(
    payload: LearningRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return _generate_course_recommendations(payload.resume, db)


def _generate_course_recommendations(resume_text: str, db: Session):
    skills = extract_skills_from_resume(resume_text or "")
    if not skills:
        raise HTTPException(status_code=400, detail="No skills found in resume")

    top_roles = get_top_matching_roles(skills, db)
    print("🎯 Top roles:", top_roles)

    relevant_skills = skills[:12]
    queries = rotate_skills_into_queries(relevant_skills)

    print("🔍 Extracted skills:", skills)
    print("🔁 Coursera queries:", queries)

    seen_ids = set()
    all_courses = []

    for query in queries:
        print(f"🚀 Querying Coursera: {query}")
        courses = fetch_courses_from_coursera(query)

        for course in courses:
            if not is_valid_course(course, seen_ids):
                continue
            formatted = format_course(course)
            seen_ids.add(formatted["id"])
            all_courses.append(formatted)

        if len(all_courses) >= 10:
            break

    return {
        "courses": all_courses,
        "skillsExtracted": skills
    }


def fetch_courses_from_coursera(query: str) -> list[dict]:
    try:
        response = requests.get(
            "https://api.coursera.org/api/courses.v1",
            params={
                "q": "search",
                "query": query,
                "limit": 10,
                "fields": "id,name,slug,description",
            },
        )
        response.raise_for_status()
        courses = response.json().get("elements", [])

        # Filter out courses with empty or useless descriptions
        return [
            course for course in courses
            if course.get("description") and len(course["description"].strip()) > 40
        ]

    except Exception as e:
        print(f"❌ Coursera query failed: {query} — {e}")
        return []



def is_valid_course(course: dict, seen_ids: set) -> bool:
    course_id = course.get("id")
    slug = course.get("slug")
    description = course.get("description", "")
    lang, _ = langid.classify(description)

    if lang != "en":
        print(f"⚠️ Skipping non-English course (lang={lang}) - ID: {course_id}")
        return False

    if not course_id or not slug:
        print(f"⚠️ Skipping course - ID: {course_id}, Slug: {slug}")
        return False

    if course_id in seen_ids:
        return False

    return True

def format_course(course: dict) -> dict:
    full_description = course.get("description", "No description provided.").strip()

    # Soft cap to ~1000 characters, cut at nearest sentence boundary if possible
    if len(full_description) > 1000:
        sentences = full_description.split(".")
        trimmed = ""
        for sentence in sentences:
            if len(trimmed) + len(sentence) + 1 > 1000:
                break
            trimmed += sentence.strip() + ". "
        description = trimmed.strip()
    else:
        description = full_description

    condensed = condense_description(description)

    return {
        "id": course["id"],
        "title": course.get("name", "No Title"),
        "description": full_description,
        "shortDescription": condensed,
        "url": f"https://www.coursera.org/learn/{course['slug']}",
        "platform": "Coursera",
    }

def condense_description(text: str) -> str:
    if not text or len(text.strip()) < 40:
        return "No condensed summary available."

    try:
        response = client.chat.completions.create(
            model="gpt-4.1",
            temperature=0.5,
            max_tokens=4500,
            response_format={"type": "json_object"},
            messages=[
                {
                    "role": "system",
                    "content":
                        "You are a professional summarization/condensing assistant. "
                        "Your summaries must strictly follow user constraints and must **NEVER EXCEED 500 CHARACTERS**."
                },
                {
                    "role": "user",
                    "content":
                        "Condense the following **text** into two **SINGLE PARAGRAPHS of NO MORE THAN 250 characters** each.\n"
                        "⚠️ HARD LIMIT: Your total output must be UNDER 500 characters.\n"
                        "🎯 Audience: Software developers browsing a course catalog.\n\n"
                        "✅ FORMAT:\n"
                        "Respond in this exact JSON format:\n"
                        '{ "summary": "Final result here (under 500 characters)." }\n\n'
                        "✅ Do:\n"
                        "- Be brief, technical, and insightful\n"
                        "- Use plain language\n"
                        "- Focus on developer-relevant takeaways\n"
                        "- Use key terms, frameworks, or technical language\n"
                        "- Verify the total character count is under 500 before responding\n\n"
                        "❌ Do NOT:\n"
                        "- Use markdown, bullet points, titles, or emojis\n"
                        "- Include course metadata, instructor names, dates, or structure\n"
                        "- Exceed 500 characters total\n\n"
                        "✅ GOOD EXAMPLE:\n"
                        '{ \"summary\": \"Build functional web apps using HTML, CSS, and JavaScript. Learn to debug, refine, and prototype with AI guidance. Finish with projects and practical skills to build confidently.\" }\n\n'
                        "❌ BAD EXAMPLE:\n"
                        "This course walks you through building your own personalized AI assistant with HTML, CSS, JavaScript, and Supabase. You'll build a chatbot interface, integrate APIs, and deploy with custom voice interaction. Includes labs, docs, quizzes, and assignments...\n\n"
                        "- Ensure your result fits the JSON format and is under 500 characters before returning.\n"
                        "TEXT TO SUMMARIZE:\n\n"
                        f"{text}"
                }
            ]
        )

        raw_output = response.choices[0].message.content.strip()

        try:
            match = re.search(r'{\s*"summary"\s*:\s*".{10,}?"\s*}', raw_output, re.DOTALL)
            if not match:
                raise ValueError("Could not extract JSON object from response.")

            data = json.loads(match.group())
            summary = data.get("summary", "").strip()

            if not summary:
                raise ValueError("Missing 'summary' in JSON.")

            if len(summary) > 500:
                print(f"⚠️ Summary too long: {len(summary)} characters. Truncating.")
                summary = summary[:497].rsplit(" ", 1)[0] + "..."

            return summary

        except ValueError as e:
            print(f"⚠️ Failed to parse JSON, falling back to raw truncation: {e}")
            if len(raw_output) > 500:
                raw_output = raw_output[:497].rsplit(" ", 1)[0] + "..."
            return raw_output

    except Exception as e:
        print(f"❌ OpenAI summarization failed — {e}")
        return "No condensed summary available."

