import io
from abc import ABC, abstractmethod
from pathlib import Path

from minio import Minio
from minio.error import S3Error

from app.config import settings

CONTENT_TYPES = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
}


def content_type_for(filename: str) -> str:
    ext = Path(filename).suffix.lower()
    return CONTENT_TYPES.get(ext, "application/octet-stream")


class StorageBackend(ABC):
    @abstractmethod
    def save(self, filename: str, content: bytes, content_type: str) -> str:
        pass

    @abstractmethod
    def load(self, filename: str) -> tuple[bytes, str]:
        pass

    @abstractmethod
    def exists(self, filename: str) -> bool:
        pass


class LocalStorage(StorageBackend):
    def _path(self, filename: str) -> Path:
        return Path(settings.upload_dir) / filename

    def ensure_ready(self) -> None:
        Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)

    def save(self, filename: str, content: bytes, content_type: str) -> str:
        self.ensure_ready()
        self._path(filename).write_bytes(content)
        return filename

    def load(self, filename: str) -> tuple[bytes, str]:
        return self._path(filename).read_bytes(), content_type_for(filename)

    def exists(self, filename: str) -> bool:
        return self._path(filename).exists()


class MinioStorage(StorageBackend):
    def __init__(self) -> None:
        self.client = Minio(
            settings.minio_endpoint,
            access_key=settings.minio_access_key,
            secret_key=settings.minio_secret_key,
            secure=settings.minio_secure,
        )
        self.bucket = settings.minio_bucket

    def ensure_ready(self) -> None:
        if not self.client.bucket_exists(self.bucket):
            self.client.make_bucket(self.bucket)

    def save(self, filename: str, content: bytes, content_type: str) -> str:
        self.client.put_object(
            self.bucket,
            filename,
            io.BytesIO(content),
            len(content),
            content_type=content_type,
        )
        return filename

    def load(self, filename: str) -> tuple[bytes, str]:
        try:
            response = self.client.get_object(self.bucket, filename)
        except S3Error as exc:
            if exc.code == "NoSuchKey":
                raise FileNotFoundError(filename) from exc
            raise
        try:
            data = response.read()
            content_type = response.headers.get("Content-Type") or content_type_for(filename)
            return data, content_type
        finally:
            response.close()
            response.release_conn()

    def exists(self, filename: str) -> bool:
        try:
            self.client.stat_object(self.bucket, filename)
            return True
        except S3Error:
            return False


_storage: StorageBackend | None = None


def get_storage() -> StorageBackend:
    global _storage
    if _storage is None:
        if settings.storage_backend == "minio":
            _storage = MinioStorage()
        else:
            _storage = LocalStorage()
    return _storage


def init_storage() -> None:
    storage = get_storage()
    if hasattr(storage, "ensure_ready"):
        storage.ensure_ready()
