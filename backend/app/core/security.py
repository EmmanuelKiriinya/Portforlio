from datetime import datetime, timedelta, timezone
from typing import Any, Literal

import bcrypt
from jose import JWTError, jwt

from app.config import settings

TokenType = Literal["access", "refresh"]

# bcrypt silently ignores anything past 72 bytes. Truncating explicitly means a
# long passphrase behaves predictably instead of matching on its first 72 bytes
# by accident.
_MAX_PASSWORD_BYTES = 72


def _encode(plain: str) -> bytes:
    return plain.encode("utf-8")[:_MAX_PASSWORD_BYTES]


def hash_password(plain: str) -> str:
    return bcrypt.hashpw(_encode(plain), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(_encode(plain), hashed.encode("utf-8"))
    except (ValueError, TypeError):
        # Malformed hash in the database — treat as a failed login, never a 500.
        return False


def create_token(subject: str | int, token_type: TokenType = "access") -> str:
    now = datetime.now(timezone.utc)
    if token_type == "access":
        expires = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    else:
        expires = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

    payload: dict[str, Any] = {
        "sub": str(subject),
        "type": token_type,
        "iat": now,
        "exp": expires,
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str, expected_type: TokenType = "access") -> str | None:
    """Return the subject, or None when the token is invalid, expired, or of
    the wrong type. Never raises — callers decide the HTTP response."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None
    if payload.get("type") != expected_type:
        return None
    return payload.get("sub")
