# server/scripts/populate_roles_and_skills.py

import os
import spacy
import psycopg2
import uuid
from collections import defaultdict
from dotenv import load_dotenv

load_dotenv()
DB_URL = os.getenv("DATABASE_URL")

nlp = spacy.load("en_core_web_trf")

def extract_skills(text: str):
    doc = nlp(text)
    return {
        token.text.lower()
        for token in doc
        if token.pos_ in {"NOUN", "PROPN"} and not token.is_stop
    }

def main():
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()

    cur.execute("SELECT title, description FROM jobs WHERE description IS NOT NULL;")
    rows = cur.fetchall()

    role_map = defaultdict(set)
    for title, desc in rows:
        skills = extract_skills(desc)
        role_map[title].update(skills)

    for title, skills in role_map.items():
        cur.execute(
            "INSERT INTO rolesandskills (id, roletitle, requiredskills) VALUES (%s, %s, %s)",
            (str(uuid.uuid4()), title, list(skills)[:30])
        )

    conn.commit()
    cur.close()
    conn.close()
    print("✅ rolesandskills table populated successfully.")

if __name__ == "__main__":
    main()
