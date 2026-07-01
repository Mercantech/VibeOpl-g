from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_access_password: str = "skift-mig"
    discord_url: str = "https://discord.gg/7XU65xmWb5"
    database_url: str = "postgresql://vibeoplg:vibeoplg@db:5432/vibeoplg"
    secret_key: str = "change-me-in-production"
    cors_origins: str = "http://localhost:5173,http://localhost"
    upload_dir: str = "/data/uploads"
    storage_backend: str = "local"  # "local" eller "minio"
    minio_endpoint: str = "minio:9000"
    minio_access_key: str = "vibeoplg"
    minio_secret_key: str = "vibeoplgsecret"
    minio_bucket: str = "vibeoplg"
    minio_secure: bool = False
    session_cookie_name: str = "vibeoplg_session"
    session_max_age: int = 60 * 60 * 24 * 7  # 7 days

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
