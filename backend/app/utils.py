import re

import bleach

ALLOWED_TAGS: list[str] = []
ALLOWED_ATTRIBUTES: dict[str, list[str]] = {}


def sanitize_text(text: str) -> str:
    cleaned = bleach.clean(text, tags=ALLOWED_TAGS, attributes=ALLOWED_ATTRIBUTES, strip=True)
    return cleaned.strip()


def is_valid_url(url: str | None) -> bool:
    if not url:
        return True
    return bool(re.match(r"^https?://", url, re.IGNORECASE))
