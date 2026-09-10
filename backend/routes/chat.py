from fastapi import APIRouter

from ai_engine import AIEngine
from config import get_settings
from models import ChatRequest, ChatResponse


router = APIRouter(tags=["chat"])
ai_engine = AIEngine(get_settings())


@router.post("/resume-chat", response_model=ChatResponse)
async def resume_chat(payload: ChatRequest) -> ChatResponse:
    return await ai_engine.chat_with_resume_ai(
        payload.message,
        resume_text=payload.resume_text,
        history=payload.history,
    )

