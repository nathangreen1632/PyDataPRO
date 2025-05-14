from pydantic import BaseModel
from typing import List

class ResumeOut(BaseModel):
    id: int
    title: str
    created_at: str

class FavoriteOut(BaseModel):
    id: int
    title: str
    company: str

class DashboardData(BaseModel):
    userName: str
    resumes: List[ResumeOut]
    favorites: List[FavoriteOut]
    keywords: List[str]
