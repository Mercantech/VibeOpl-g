import time
from collections import defaultdict

from fastapi import Cookie, HTTPException, Request, status
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer

from app.config import settings

serializer = URLSafeTimedSerializer(settings.secret_key, salt="vibeoplg-auth")

_unlock_attempts: dict[str, list[float]] = defaultdict(list)
MAX_ATTEMPTS = 5
WINDOW_SECONDS = 60


def create_session_token() -> str:
    return serializer.dumps({"authenticated": True})


def verify_session_token(token: str) -> bool:
    try:
        data = serializer.loads(token, max_age=settings.session_max_age)
        return bool(data.get("authenticated"))
    except (BadSignature, SignatureExpired):
        return False


def check_rate_limit(client_ip: str) -> None:
    now = time.time()
    attempts = _unlock_attempts[client_ip]
    _unlock_attempts[client_ip] = [t for t in attempts if now - t < WINDOW_SECONDS]
    if len(_unlock_attempts[client_ip]) >= MAX_ATTEMPTS:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="For mange forsøg. Prøv igen om et øjeblik.",
        )


def record_unlock_attempt(client_ip: str) -> None:
    _unlock_attempts[client_ip].append(time.time())


def require_auth(
    request: Request,
    session: str | None = Cookie(default=None, alias=settings.session_cookie_name),
) -> None:
    if session and verify_session_token(session):
        return
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Adgang nægtet. Indtast kodeord for at fortsætte.",
    )


def get_auth_status(
    session: str | None = Cookie(default=None, alias=settings.session_cookie_name),
) -> bool:
    return bool(session and verify_session_token(session))
