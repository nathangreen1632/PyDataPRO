from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from server.database import Base
import uuid
from datetime import datetime, timezone

class SearchTerm(Base):
    __tablename__ = "SearchTerms"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    userId = Column("userId", UUID(as_uuid=True), ForeignKey("Users.id"), nullable=False)
    query = Column(String, nullable=False)

    createdAt = Column("createdAt", DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updatedAt = Column("updatedAt", DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="search_terms")
