from typing import Any


class AppError(Exception):
    def __init__(
        self,
        status_code: int,
        message: str,
        *,
        code: str = "application_error",
        details: dict[str, Any] | None = None,
    ) -> None:
        self.status_code = status_code
        self.message = message
        self.code = code
        self.details = details or {}
        super().__init__(message)

