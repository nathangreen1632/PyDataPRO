from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from openai import OpenAI, OpenAIError
import os
import json
import logging
from dotenv import load_dotenv
import re

load_dotenv()

router = APIRouter()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


class JobRequest(BaseModel):
    title: str


@router.post("/generate-questions")
async def generate_questions(req: JobRequest):
    try:
        prompt = (
            "Return a JSON array of exactly 10 interview questions for a "
            f"{req.title} role. Each question should be a single string. "
            "The list must contain exactly 10 questions—no more, no less. "
            "Include a mix of behavioral, technical, and situational types. "
            "Make the questions clear, concise, and relevant to the job title. "
            "Increase difficulty gradually. Do not include any explanations or extra formatting. "
            "Compound terms like 'full-time', 'object-oriented', or 'results-oriented' must be hyphenated. "
            "Output ONLY the JSON array and nothing else."
        )

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=800
        )

        raw_output = response.choices[0].message.content.strip()

        # Remove Markdown code block syntax if it exists
        if raw_output.startswith("```"):
            raw_output = re.sub(r"^```(?:json)?\n?", "", raw_output)
            raw_output = re.sub(r"\n?```$", "", raw_output)

        try:
            questions = json.loads(raw_output)

            if not isinstance(questions, list):
                raise ValueError("Response is not a JSON array.")
            if len(questions) != 10:
                raise ValueError("Expected exactly 10 questions.")

            return {"questions": questions}


        except json.JSONDecodeError:
            logging.error(f"OpenAI did not return valid JSON:\n{raw_output}")
            raise HTTPException(status_code=500, detail="OpenAI returned invalid JSON.")

        except ValueError as ve:
            logging.error(f"Validation error: {ve}\nResponse:\n{raw_output}")
            raise HTTPException(status_code=500, detail=str(ve))

    except OpenAIError as oe:
        logging.error(f"OpenAI API error: {oe}")
        raise HTTPException(status_code=502, detail="Error from OpenAI API.")

    except Exception:
        logging.exception("Unexpected server error")
        raise HTTPException(status_code=500, detail="Internal server error.")
