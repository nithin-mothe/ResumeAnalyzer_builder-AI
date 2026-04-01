import asyncio
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

import httpx
from supabase import Client, create_client

from config import Settings
from utils.errors import AppError


class DatabaseClient:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.client: Client | None = None
        if settings.supabase_enabled:
            self.client = create_client(settings.supabase_url, settings.supabase_key)

    @property
    def enabled(self) -> bool:
        return self.client is not None

    async def resolve_user_id(self, authorization_header: str | None) -> str | None:
        if not self.enabled or not authorization_header:
            return None
        if not authorization_header.startswith("Bearer "):
            raise AppError(401, "Authorization header must use Bearer token format.", code="invalid_authorization")

        token = authorization_header.removeprefix("Bearer ").strip()
        if not token:
            raise AppError(401, "Missing access token.", code="missing_token")

        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(
                f"{self.settings.supabase_url}/auth/v1/user",
                headers={
                    "apikey": self.settings.supabase_key or "",
                    "Authorization": f"Bearer {token}",
                },
            )

        if response.status_code != 200:
            raise AppError(401, "Supabase access token is invalid or expired.", code="invalid_token")

        payload = response.json()
        return payload.get("id")

    async def save_resume(
        self,
        *,
        user_id: str,
        title: str,
        content: dict[str, Any],
        storage_path: str | None = None,
    ) -> dict[str, Any]:
        self._ensure_enabled()
        payload = {
            "user_id": user_id,
            "title": title,
            "content": content,
            "storage_path": storage_path,
        }
        return await asyncio.to_thread(self._insert_row, "resumes", payload)

    async def get_resume(self, *, resume_id: str, user_id: str) -> dict[str, Any]:
        self._ensure_enabled()
        return await asyncio.to_thread(self._select_resume, resume_id, user_id)

    async def save_analysis(
        self,
        *,
        resume_id: str,
        score: int,
        suggestions: list[str],
        problems: list[str],
        strengths: list[str],
    ) -> dict[str, Any]:
        self._ensure_enabled()
        payload = {
            "resume_id": resume_id,
            "score": score,
            "suggestions": suggestions,
            "problems": problems,
            "strengths": strengths,
        }
        return await asyncio.to_thread(self._insert_row, "analysis_results", payload)

    async def upload_resume_file(self, *, user_id: str, filename: str, file_bytes: bytes) -> str | None:
        self._ensure_enabled()
        extension = filename.rsplit(".", 1)[-1].lower()
        timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
        object_path = f"{user_id}/{timestamp}-{uuid4().hex}.{extension}"

        def _upload() -> str | None:
            try:
                assert self.client is not None
                self.client.storage.from_(self.settings.storage_bucket).upload(
                    path=object_path,
                    file=file_bytes,
                    file_options={"content-type": "application/pdf", "upsert": "true"},
                )
                return object_path
            except Exception:
                return None

        return await asyncio.to_thread(_upload)

    def _insert_row(self, table: str, payload: dict[str, Any]) -> dict[str, Any]:
        assert self.client is not None
        response = self.client.table(table).insert(payload).execute()
        if not response.data:
            raise AppError(502, f"Failed to persist data to Supabase table '{table}'.", code="supabase_write_failed")
        return response.data[0]

    def _select_resume(self, resume_id: str, user_id: str) -> dict[str, Any]:
        assert self.client is not None
        response = (
            self.client.table("resumes")
            .select("*")
            .eq("id", resume_id)
            .eq("user_id", user_id)
            .limit(1)
            .execute()
        )
        if not response.data:
            raise AppError(404, "Resume not found.", code="resume_not_found")
        return response.data[0]

    def _ensure_enabled(self) -> None:
        if not self.enabled:
            raise AppError(
                503,
                "Supabase is not configured. Add SUPABASE_URL and SUPABASE_KEY to backend/.env.",
                code="supabase_not_configured",
            )

