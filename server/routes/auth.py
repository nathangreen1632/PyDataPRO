from fastapi import APIRouter, HTTPException, status, Depends, Request
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from passlib.hash import bcrypt
from pydantic import BaseModel, EmailStr
from uuid import uuid4
import logging

from server.models.user import User
from server.database import get_db
from server.utils.auth import create_jwt_token, get_current_user

router = APIRouter(tags=["auth"])
logger = logging.getLogger(__name__)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

@router.post("/login")
def login_user(payload: LoginRequest, db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.email == payload.email).first()

        assert isinstance(user, User)

        if not user or not user.passwordHash:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        if not bcrypt.verify(payload.password, user.passwordHash):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        token = create_jwt_token(user)

        return {
            "token": token,
            "user": {
                "id": user.id,
                "email": user.email,
                "role": user.role,
                "lastName": user.lastName,
                "firstName": user.firstName
            }
        }

    except Exception as e:
        print("🔥 UNHANDLED ERROR:", e)
        raise HTTPException(status_code=500, detail="Internal server error", headers={"WWW-Authenticate": "Bearer"})


class RegisterRequest(BaseModel):
    firstName: str
    lastName: str
    email: EmailStr
    password: str

@router.post("/register")
def register_user(req: RegisterRequest, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == req.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered"
        )

    now = datetime.now(timezone.utc)

    new_user = User(
        id=uuid4(),
        firstName=req.firstName,
        lastName=req.lastName,
        email=str(req.email),
        passwordHash=bcrypt.hash(req.password),
        role="user",
        createdAt=now,
        updatedAt=now
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_jwt_token(new_user)

    return {
        "token": token,
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "role": new_user.role,
            "lastName": new_user.lastName,
            "firstName": new_user.firstName
        }
    }

@router.post("/refresh-token")
def refresh_token(
    request: Request,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """
    Refresh the JWT token for a currently authenticated user.
    """
    try:
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid user for token refresh.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        new_token = create_jwt_token(user)

        return {
            "token": new_token,
            "message": "Token refreshed successfully."
        }

    except HTTPException as http_err:
        logger.warning(f"Token refresh rejected: {http_err.detail}")
        raise http_err

    except Exception:
        logger.exception("Unhandled error during token refresh")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while refreshing the token.",
        )
