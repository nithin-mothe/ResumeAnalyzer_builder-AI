import asyncio
import json
from typing import TypeVar

from groq import Groq
from pydantic import BaseModel, ValidationError

from config import Settings
from models import (
    BuildResumeRequest,
    BuiltResume,
    ChatMessage,
    ChatResponse,
    RedesignResumeRequest,
    ResumeAnalysisResponse,
)
from utils.errors import AppError
from utils.json_utils import extract_json_payload


ModelT = TypeVar("ModelT", bound=BaseModel)


class GroqAIEngine:
    def __init__(self, settings: Settings) -> None:
        if not settings.groq_api_key:
            raise RuntimeError("Provide GROQ_API_KEY")
        self.settings = settings
        self.client = Groq(api_key=settings.groq_api_key)

    async def analyze_resume_with_ai(self, text: str) -> ResumeAnalysisResponse:
        system_prompt = (
            "You are an expert resume reviewer. Evaluate the resume and respond with strict JSON only. "
            "Return keys: score, strengths, problems, suggestions. "
            "Score must be an integer from 0 to 100. Lists must contain concise, actionable strings. "
            "Prioritize practical feedback over generic filler. Do not invent certifications unless their absence is materially important."
        )
        user_prompt = f"Resume text:\n{text}"
        return await self._complete_json(system_prompt, user_prompt, ResumeAnalysisResponse)

    async def build_resume(self, data: BuildResumeRequest) -> BuiltResume:
        system_prompt = (
            "You are an ATS-focused resume writer creating top-tier resumes for selective product companies such as "
            "Google, Amazon, Microsoft, Stripe, and Meta. Convert the candidate profile into strict JSON only. "
            "Use action verbs, quantified impact when possible, sharp phrasing, and recruiter-friendly clarity. "
            "Keep the summary tight, senior, and high-signal. Every bullet must feel credible and outcomes-driven. "
            "Output exactly this shape: "
            '{"name":"","headline":"","contact":{"email":"","phone":"","location":"","linkedin":"","website":""},'
            '"summary":"","skills":{"languages":[],"frameworks":[],"tools":[]},'
            '"projects":[{"title":"","points":[]}],"experience":[{"role":"","points":[]}],"education":""}'
        )
        user_prompt = f"Candidate profile:\n{data.model_dump_json(indent=2)}"
        return await self._complete_json(system_prompt, user_prompt, BuiltResume)

    async def redesign_resume_for_company(self, data: RedesignResumeRequest) -> BuiltResume:
        system_prompt = (
            "You are an elite resume strategist rewriting an existing resume for a specific company. "
            "Preserve truth, do not invent employers or achievements, but sharpen the positioning toward the company's needs. "
            "Use recruiter-friendly, ATS-optimized language, stronger headlines, and outcome-driven bullets. "
            "Output strict JSON only in this exact shape: "
            '{"name":"","headline":"","contact":{"email":"","phone":"","location":"","linkedin":"","website":""},'
            '"summary":"","skills":{"languages":[],"frameworks":[],"tools":[]},'
            '"projects":[{"title":"","points":[]}],"experience":[{"role":"","points":[]}],"education":""}'
        )
        user_prompt = (
            f"Company name: {data.company_name}\n"
            f"Target role: {data.target_role or 'Use the best inferred role from the resume and company requirements'}\n"
            f"Company requirements:\n{data.company_requirements}\n\n"
            f"Existing resume text:\n{data.resume_text}\n\n"
            f"Contact details to preserve when available:\n{data.contact.model_dump_json(indent=2)}"
        )
        return await self._complete_json(system_prompt, user_prompt, BuiltResume)

    async def chat_with_resume_ai(
        self,
        prompt: str,
        *,
        resume_text: str | None = None,
        history: list[ChatMessage] | None = None,
    ) -> ChatResponse:
        if not isinstance(prompt, str) or not prompt.strip():
            raise AppError(400, "Chat message must be a non-empty string.", code="invalid_message")

        messages = [
            {
                "role": "system",
                "content": (
                "You are a warm, sharp resume strategist and career assistant. Sound natural and supportive, "
                "like a strong ChatGPT-style collaborator. Keep answers easy to scan with short paragraphs or bullets. "
                "Ground your advice in the candidate's resume when provided. Ask one smart follow-up when important "
                "details are missing. If the user seems ready to build a resume, invite them to generate one and ask for "
                "target role, top achievements, skills, education, and preferred template from Executive, Modern, or Compact. "
                "If the user wants a company-specific redesign, ask for company name, role focus, and the company requirements."
                ),
            }
        ]

        if resume_text:
            messages.append({"role": "system", "content": f"Resume context:\n{resume_text}"})

        for item in history or []:
            messages.append({"role": item.role, "content": item.content})

        messages.append({"role": "user", "content": prompt.strip()})
        answer = await self._complete_text(messages)
        return ChatResponse(answer=answer)

    async def _complete_json(self, system_prompt: str, user_prompt: str, schema: type[ModelT]) -> ModelT:
        raw_output = await self._complete_text(
            [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.2,
        )
        payload = extract_json_payload(raw_output)
        try:
            return schema.model_validate(payload)
        except ValidationError as exc:
            raise AppError(
                502,
                "AI returned structured data that failed schema validation.",
                code="ai_validation_failed",
                details={"errors": json.loads(exc.json())},
            ) from exc

    async def _complete_text(self, messages: list[dict[str, str]], temperature: float = 0.3) -> str:
        return await asyncio.to_thread(self._sync_complete_text, messages, temperature)

    def _sync_complete_text(self, messages: list[dict[str, str]], temperature: float) -> str:
        try:
            response = self.client.chat.completions.create(
                model=self.settings.groq_model,
                messages=messages,
                temperature=temperature,
            )
        except Exception as exc:  # pragma: no cover
            raise AppError(
                502,
                "Groq request failed. Check the API key, model, or upstream availability.",
                code="groq_request_failed",
                details={"error": str(exc)},
            ) from exc

        content = ""
        if response.choices:
            content = response.choices[0].message.content or ""

        if not content.strip():
            raise AppError(502, "Groq returned an empty response.", code="groq_empty_response")
        return content.strip()
