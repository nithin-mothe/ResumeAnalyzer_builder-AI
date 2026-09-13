from fastapi import APIRouter

from ai_engine import AIEngine
from config import get_settings
from models import BuildResumeResponse, ChatRequest, ChatResponse, ChatResumeBuildRequest


router = APIRouter(tags=["chat"])
ai_engine = AIEngine(get_settings())


@router.post("/resume-chat", response_model=ChatResponse)
async def resume_chat(payload: ChatRequest) -> ChatResponse:
    return await ai_engine.chat_with_resume_ai(
        payload.message,
        resume_text=payload.resume_text,
        history=payload.history,
    )


@router.post("/build-resume-from-chat", response_model=BuildResumeResponse)
async def build_resume_from_chat(payload: ChatResumeBuildRequest) -> BuildResumeResponse:
    resume = await ai_engine.build_resume_from_chat(
        history=payload.history,
        resume_text=payload.resume_text,
    )
    return BuildResumeResponse(resume=resume)
