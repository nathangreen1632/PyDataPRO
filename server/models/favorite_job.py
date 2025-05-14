from sqlalchemy import Column, String, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from server.database import Base
import uuid
from datetime import datetime, timezone

class FavoriteJob(Base):
    __tablename__ = "Favorites"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # 🔥 Align casing: use "userId" in DB, but user_id in Python
    user_id = Column("userId", UUID(as_uuid=True), ForeignKey("Users.id"), nullable=False)

    title = Column(String, nullable=False)
    company = Column(String, nullable=False)
    jobId = Column(String, nullable=True)
    location = Column(String, nullable=True)
    description = Column(String, nullable=True)

    # ✅ Add missing updatedAt column (if used in dashboard)
    createdAt = Column("createdAt", DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updatedAt = Column("updatedAt", DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="favorite_jobs")
