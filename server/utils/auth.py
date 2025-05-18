from datetime import datetime, timedelta, timezone
import jwt
import uuid
import os

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from server.database import get_db
from server.models.user import User
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET")
if not SECRET_KEY:
    raise RuntimeError("JWT_SECRET not set in .env")

ALGORITHM = "HS256"
EXPIRATION_MINUTES = 90

def create_jwt_token(user: User) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=EXPIRATION_MINUTES)
    payload = {
        "id": str(user.id),
        "email": user.email,
        "role": user.role,
        "iat": datetime.now(timezone.utc),
        "exp": expire,
        "aud": "pydatapro_user",
        "iss": "PyDataPro",
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


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
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM], audience="pydatapro_user", issuer="PyDataPro")

        user_id = payload.get("sub") or payload.get("id")
        if user_id is None:
            raise credentials_exception

        user_uuid = uuid.UUID(user_id)

    except (jwt.PyJWTError, ValueError):
        raise credentials_exception

    user = db.query(User).filter(User.id == user_uuid).first()
    if user is None:
        raise credentials_exception

    return user

