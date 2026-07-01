from fastapi import APIRouter

from app.config import settings
from app.schemas import ConfigRead

router = APIRouter(prefix="/api", tags=["config"])


@router.get("/config", response_model=ConfigRead)
def get_config():
    return ConfigRead(discord_url=settings.discord_url)
