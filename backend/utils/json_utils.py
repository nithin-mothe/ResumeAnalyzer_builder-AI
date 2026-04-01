import json
import re
from typing import Any

from utils.errors import AppError


CODE_BLOCK_PATTERN = re.compile(r"```(?:json)?\s*(\{.*?\}|\[.*?\])\s*```", re.DOTALL | re.IGNORECASE)


def extract_json_payload(raw_output: str) -> Any:
    if not raw_output or not raw_output.strip():
        raise AppError(502, "AI returned an empty response.", code="ai_empty")

    fenced_match = CODE_BLOCK_PATTERN.search(raw_output)
    if fenced_match:
        return _load_json(fenced_match.group(1))

    start_index = _find_json_start(raw_output)
    if start_index is None:
        raise AppError(
            502,
            "AI did not return a JSON payload that could be extracted safely.",
            code="ai_invalid_json",
        )

    candidate = _extract_balanced_json(raw_output[start_index:])
    return _load_json(candidate)


def _find_json_start(content: str) -> int | None:
    object_index = content.find("{")
    array_index = content.find("[")
    indexes = [index for index in [object_index, array_index] if index != -1]
    return min(indexes) if indexes else None


def _extract_balanced_json(content: str) -> str:
    opening = content[0]
    closing = "}" if opening == "{" else "]"
    depth = 0
    in_string = False
    escape = False

    for index, char in enumerate(content):
        if escape:
            escape = False
            continue
        if char == "\\":
            escape = True
            continue
        if char == '"':
            in_string = not in_string
            continue
        if in_string:
            continue
        if char == opening:
            depth += 1
        if char == closing:
            depth -= 1
            if depth == 0:
                return content[: index + 1]

    raise AppError(502, "Unable to parse a balanced JSON object from AI output.", code="ai_invalid_json")


def _load_json(content: str) -> Any:
    try:
        return json.loads(content)
    except json.JSONDecodeError as exc:
        raise AppError(
            502,
            "AI returned malformed JSON that could not be decoded safely.",
            code="ai_invalid_json",
            details={"error": str(exc)},
        ) from exc

