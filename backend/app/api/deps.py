from fastapi import Cookie, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import decode_token
from app.database import get_db
from app.models import User

ACCESS_COOKIE = "pf_access"
REFRESH_COOKIE = "pf_refresh"

_UNAUTHORIZED = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Sign in to continue.",
    headers={"WWW-Authenticate": "Bearer"},
)


def get_current_user(
    db: Session = Depends(get_db),
    pf_access: str | None = Cookie(default=None),
    authorization: str | None = Header(default=None),
) -> User:
    """Accept the HTTP-only cookie first, then a bearer header.

    The cookie path serves the admin UI; the header path keeps the API usable
    from scripts and from server-side rendering.
    """
    token = pf_access
    if not token and authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1].strip()
    if not token:
        raise _UNAUTHORIZED

    subject = decode_token(token, expected_type="access")
    if subject is None:
        raise _UNAUTHORIZED

    user = db.get(User, int(subject))
    if user is None or not user.is_active:
        raise _UNAUTHORIZED
    return user


def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This action needs an administrator account.",
        )
    return user
