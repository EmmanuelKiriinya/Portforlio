from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import ACCESS_COOKIE, REFRESH_COOKIE, get_current_user
from app.config import settings
from app.core.security import create_token, decode_token, hash_password, verify_password
from app.database import get_db
from app.models import User
from app.schemas import LoginRequest, PasswordChange, TokenPair, UserOut

router = APIRouter()


def _set_auth_cookies(response: Response, user_id: int) -> str:
    access = create_token(user_id, "access")
    refresh = create_token(user_id, "refresh")
    common = {
        "httponly": True,
        "secure": settings.COOKIE_SECURE,
        "samesite": settings.COOKIE_SAMESITE,
        "domain": settings.COOKIE_DOMAIN,
        "path": "/",
    }
    response.set_cookie(
        ACCESS_COOKIE, access, max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60, **common
    )
    response.set_cookie(
        REFRESH_COOKIE,
        refresh,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        **common,
    )
    return access


@router.post("/login", response_model=TokenPair)
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == payload.email.lower()))
    # Same message either way — don't reveal which addresses have accounts.
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="That email and password don't match an account.",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated.",
        )

    access = _set_auth_cookies(response, user.id)
    return TokenPair(
        access_token=access, expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )


@router.post("/refresh", response_model=TokenPair)
def refresh_session(
    response: Response,
    db: Session = Depends(get_db),
    pf_refresh: str | None = Cookie(default=None),
):
    if not pf_refresh:
        raise HTTPException(status_code=401, detail="Your session has ended. Sign in again.")
    subject = decode_token(pf_refresh, expected_type="refresh")
    if subject is None:
        raise HTTPException(status_code=401, detail="Your session has ended. Sign in again.")

    user = db.get(User, int(subject))
    if user is None or not user.is_active:
        raise HTTPException(status_code=401, detail="Your session has ended. Sign in again.")

    access = _set_auth_cookies(response, user.id)
    return TokenPair(
        access_token=access, expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(response: Response):
    for name in (ACCESS_COOKIE, REFRESH_COOKIE):
        response.delete_cookie(
            name,
            path="/",
            domain=settings.COOKIE_DOMAIN,
            secure=settings.COOKIE_SECURE,
            samesite=settings.COOKIE_SAMESITE,
            httponly=True,
        )


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user


@router.post("/change-password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(
    payload: PasswordChange,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if not verify_password(payload.current_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Your current password is incorrect.",
        )
    user.hashed_password = hash_password(payload.new_password)
    db.commit()
