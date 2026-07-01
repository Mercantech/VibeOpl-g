from datetime import datetime

from pydantic import BaseModel, Field, field_validator

from app.utils import is_valid_url, sanitize_text


class SectionBase(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    body: str = ""
    image_path: str | None = None
    sort_order: int = 0

    @field_validator("title", "body", mode="before")
    @classmethod
    def sanitize_fields(cls, v: str) -> str:
        return sanitize_text(v) if isinstance(v, str) else v


class SectionCreate(SectionBase):
    pass


class SectionRead(SectionBase):
    id: int

    model_config = {"from_attributes": True}


class ProjectBase(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str = ""
    usage_guide: str = ""
    app_url: str | None = None
    cover_image_path: str | None = None
    author_name: str = Field(min_length=1, max_length=255)
    author_school: str = Field(default="", max_length=255)
    author_email: str = Field(default="", max_length=255)

    @field_validator("title", "description", "usage_guide", "author_name", "author_school", "author_email", mode="before")
    @classmethod
    def sanitize_text_fields(cls, v: str) -> str:
        return sanitize_text(v) if isinstance(v, str) else v

    @field_validator("app_url")
    @classmethod
    def validate_app_url(cls, v: str | None) -> str | None:
        if v and not is_valid_url(v):
            raise ValueError("App-link skal starte med http:// eller https://")
        return v


class ProjectCreate(ProjectBase):
    sections: list[SectionCreate] = []


class ProjectUpdate(ProjectBase):
    sections: list[SectionCreate] = []


class ProjectListItem(BaseModel):
    id: int
    title: str
    description: str
    cover_image_path: str | None
    author_name: str
    author_school: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ProjectRead(ProjectBase):
    id: int
    created_at: datetime
    updated_at: datetime
    sections: list[SectionRead] = []

    model_config = {"from_attributes": True}


class CommentCreate(BaseModel):
    author_name: str = Field(min_length=1, max_length=255)
    author_school: str = Field(default="", max_length=255)
    author_email: str = Field(default="", max_length=255)
    body: str = Field(min_length=1, max_length=5000)

    @field_validator("author_name", "author_school", "author_email", "body", mode="before")
    @classmethod
    def sanitize_fields(cls, v: str) -> str:
        return sanitize_text(v) if isinstance(v, str) else v


class CommentRead(BaseModel):
    id: int
    project_id: int
    author_name: str
    author_school: str
    author_email: str
    body: str
    created_at: datetime

    model_config = {"from_attributes": True}


class UnlockRequest(BaseModel):
    password: str = Field(min_length=1)


class AuthStatus(BaseModel):
    authenticated: bool


class ConfigRead(BaseModel):
    discord_url: str
