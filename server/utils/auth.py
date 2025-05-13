from datetime import datetime, timedelta, timezone
import jwt

SECRET_KEY = "your-secret"  # 🔒 use env var in production
ALGORITHM = "HS256"
EXPIRATION_MINUTES = 90

def create_jwt_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=EXPIRATION_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
