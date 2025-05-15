from datetime import datetime, timedelta, timezone
import jwt as pyjwt
import uuid
import os

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from server.database import get_db
from server.models.user import User
from dotenv import load_dotenv

# 🔐 Load environment variables
load_dotenv()

# ✅ Pull secret from environment (NOT hardcoded)
SECRET_KEY = os.getenv("JWT_SECRET")
if not SECRET_KEY:
    raise RuntimeError("JWT_SECRET not set in .env")

ALGORITHM = "HS256"
EXPIRATION_MINUTES = 90

# ------------------------
# ✅ Token creation
# ------------------------
def create_jwt_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=EXPIRATION_MINUTES)
    to_encode.update({"exp": expire})
    return pyjwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# ------------------------
# ✅ Token validation
# ------------------------
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = pyjwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        # ✅ Check for either sub or id
        user_id = payload.get("sub") or payload.get("id")
        if user_id is None:
            raise credentials_exception

        user_uuid = uuid.UUID(user_id)

    except (pyjwt.PyJWTError, ValueError):
        raise credentials_exception

    user = db.query(User).filter(User.id == user_uuid).first()
    if user is None:
        raise credentials_exception

    return user

