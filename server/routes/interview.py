from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


class JobRequest(BaseModel):
    title: str

@router.post("/generate-questions")
async def generate_questions(req: JobRequest):
    try:
        prompt = f"Generate 5 job interview questions for a {req.title} role."

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{ "role": "user", "content": prompt }],
            temperature=0.7,
            max_tokens=500
        )

        import re

        raw_output = response.choices[0].message.content.strip()

        raw_questions = re.findall(r"(.*?\?)", raw_output)

        questions = []
        for q in raw_questions:
            cleaned = re.sub(r"[*_`#>-]", "", q).strip()
            cleaned = re.sub(r"\d+\.\s*", "", cleaned)
            if len(cleaned) > 20:
                questions.append(cleaned)

        return {"questions": questions}


    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
