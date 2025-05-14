from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from server.database import Base
import uuid

class Resume(Base):
    __tablename__ = "Resumes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("Users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False)

    user = relationship("User", back_populates="resumes")
