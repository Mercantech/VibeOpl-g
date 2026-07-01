import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import Response

from app.deps import require_auth
from app.storage import content_type_for, get_storage

router = APIRouter(prefix="/api", tags=["uploads"])

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


def validate_filename(filename: str) -> None:
    if ".." in filename or "/" in filename or "\\" in filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ugyldigt filnavn")


@router.post("/uploads/image", dependencies=[Depends(require_auth)])
async def upload_image(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ingen fil valgt")

    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Kun billeder (jpg, png, gif, webp) er tilladt.",
        )

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filen er for stor (maks 5 MB).",
        )

    filename = f"{uuid.uuid4().hex}{ext}"
    storage = get_storage()
    storage.save(filename, content, content_type_for(filename))

    return {"path": filename}


@router.get("/media/{filename}")
def serve_media(filename: str):
    validate_filename(filename)

    storage = get_storage()
    if not storage.exists(filename):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fil ikke fundet")

    try:
        content, media_type = storage.load(filename)
    except FileNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fil ikke fundet")

    return Response(content=content, media_type=media_type)
