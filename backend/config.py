from functools import lru_cache
from typing import Annotated

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


DEFAULT_CORS_ORIGINS = [
    "https://resumeforgeai.online",
    "https://www.resumeforgeai.online",
]
DEFAULT_AI_MODEL = "google/gemini-2.0-flash-exp:free"
DEFAULT_AI_BASE_URL = "https://openrouter.ai/api/v1"


class Settings(BaseSettings):
    ai_api_key: str | None = None
    ai_model: str = DEFAULT_AI_MODEL
    ai_base_url: str = DEFAULT_AI_BASE_URL
    supabase_url: str | None = None
    supabase_key: str | None = None
    cors_origins: Annotated[list[str], NoDecode] = Field(
        default_factory=lambda: DEFAULT_CORS_ORIGINS.copy()
    )
    storage_bucket: str = "resume-files"
    upload_max_bytes: int = 5 * 1024 * 1024
    upload_max_pages: int = 8
    rate_limit_enabled: bool = True
    rate_limit_requests: int = 90
    rate_limit_window_seconds: int = 60

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
    if not settings.ai_api_key:
        raise RuntimeError("Provide AI_API_KEY in backend/.env before starting the API.")
    return settings
