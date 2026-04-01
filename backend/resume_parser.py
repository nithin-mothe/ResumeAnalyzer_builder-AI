import asyncio

import fitz
from fastapi import UploadFile

from utils.errors import AppError
from utils.text import clean_text


class ResumeParser:
    async def parse_upload(self, upload: UploadFile) -> tuple[str, bytes]:
        filename = upload.filename or "resume.pdf"
        if not filename.lower().endswith(".pdf"):
            raise AppError(400, "Only PDF resumes are supported.", code="unsupported_file_type")

        if upload.content_type and upload.content_type not in {"application/pdf", "application/octet-stream"}:
            raise AppError(400, "Unsupported file type. Upload a PDF document.", code="unsupported_file_type")

        file_bytes = await upload.read()
        if not file_bytes:
            raise AppError(400, "Uploaded file is empty.", code="empty_file")

        text = await asyncio.to_thread(self._extract_text, file_bytes)
        cleaned = clean_text(text)
        if not cleaned:
            raise AppError(
                400,
                "Could not extract text from the PDF. Image-only PDFs are not supported.",
                code="empty_pdf_text",
            )

        return cleaned, file_bytes

    def _extract_text(self, file_bytes: bytes) -> str:
        try:
            with fitz.open(stream=file_bytes, filetype="pdf") as document:
                pages = [page.get_text("text") for page in document]
        except RuntimeError as exc:
            raise AppError(400, "Invalid or corrupted PDF document.", code="invalid_pdf") from exc

        return "\n".join(pages)

