from fastapi import FastAPI
from dotenv import load_dotenv
from routes import interview

load_dotenv()
app = FastAPI()

app.include_router(interview.router)
