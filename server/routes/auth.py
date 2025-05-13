from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from passlib.hash import bcrypt
from pydantic import BaseModel, EmailStr
from uuid import uuid4


from server.models.user import User
from server.database import get_db
from server.utils.auth import create_jwt_token

router = APIRouter(tags=["auth"])  # ❌ no prefix here

# ------------------------
# Login Route
# ------------------------
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

@router.post("/login")
def login_user(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()

    if not user or not bcrypt.verify(payload.password, user.passwordHash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_jwt_token({"sub": str(user.id)})
    return {"token": token}


# ------------------------
# Register Route
# ------------------------

class RegisterRequest(BaseModel):
    firstName: str  # ✅ match model exactly
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

    token = create_jwt_token({"sub": str(new_user.id)})
    return {"token": token}

