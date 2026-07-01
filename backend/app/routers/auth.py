from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response, status

from app.config import settings
from app.deps import (
    check_rate_limit,
    create_session_token,
    get_auth_status,
    record_unlock_attempt,
)
from app.schemas import AuthStatus, UnlockRequest

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.get("/status", response_model=AuthStatus)
def auth_status(
    session: str | None = Cookie(default=None, alias=settings.session_cookie_name),
):
    return AuthStatus(authenticated=get_auth_status(session))


@router.post("/unlock")
def unlock(request: Request, response: Response, body: UnlockRequest):
    client_ip = request.client.host if request.client else "unknown"
    check_rate_limit(client_ip)

    if body.password != settings.app_access_password:
        record_unlock_attempt(client_ip)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Forkert kodeord.",
        )

    token = create_session_token()
    response.set_cookie(
        key=settings.session_cookie_name,
        value=token,
        httponly=True,
        samesite="lax",
        max_age=settings.session_max_age,
        path="/",
    )
    return {"ok": True}


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key=settings.session_cookie_name, path="/")
    return {"ok": True}
