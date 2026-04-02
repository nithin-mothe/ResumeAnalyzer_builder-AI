from functools import lru_cache
from typing import Annotated

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


DEFAULT_CORS_ORIGINS = [
    "https://resumeforgeai.online",
    "https://www.resumeforgeai.online",
]


class Settings(BaseSettings):
    groq_api_key: str | None = None
    groq_model: str = "llama-3.3-70b-versatile"
    supabase_url: str | None = None
    supabase_key: str | None = None
    cors_origins: Annotated[list[str], NoDecode] = Field(
        default_factory=lambda: DEFAULT_CORS_ORIGINS.copy()
    )
    storage_bucket: str = "resume-files"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_origins(cls, value: str | list[str]) -> list[str]:
        if isinstance(value, str):
            value = [origin.strip() for origin in value.split(",") if origin.strip()]

        merged_origins = [*value, *DEFAULT_CORS_ORIGINS]
        return list(dict.fromkeys(merged_origins))

    @property
    def supabase_enabled(self) -> bool:
        return bool(self.supabase_url and self.supabase_key)


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    if not settings.groq_api_key:
        raise RuntimeError("Provide GROQ_API_KEY in backend/.env before starting the API.")
    return settings
