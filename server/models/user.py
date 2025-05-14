import uuid
from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from server.database import Base

class User(Base):
    __tablename__ = "Users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    firstName = Column(String, nullable=False)
    lastName = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True)
    passwordHash = Column(String, nullable=False)
    role = Column(String, nullable=False, default="user")
    createdAt = Column(DateTime(timezone=True), nullable=False)
    updatedAt = Column(DateTime(timezone=True), nullable=False)

    # ✅ Relationship fields
    resumes = relationship("Resume", back_populates="user")
    favorite_jobs = relationship("FavoriteJob", back_populates="user")
    search_terms = relationship("SearchTerm", back_populates="user")
