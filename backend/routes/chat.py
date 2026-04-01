from fastapi import APIRouter

from ai_engine import GroqAIEngine
from config import get_settings
from models import ChatRequest, ChatResponse


router = APIRouter(tags=["chat"])
ai_engine = GroqAIEngine(get_settings())


@router.post("/resume-chat", response_model=ChatResponse)
async def resume_chat(payload: ChatRequest) -> ChatResponse:
    return await ai_engine.chat_with_resume_ai(
        payload.message,
        resume_text=payload.resume_text,
        history=payload.history,
    )

