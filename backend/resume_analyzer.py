from ai_engine import GroqAIEngine
from models import ResumeAnalysisResponse


class ResumeAnalyzer:
    def __init__(self, ai_engine: GroqAIEngine) -> None:
        self.ai_engine = ai_engine

    async def analyze(self, resume_text: str) -> ResumeAnalysisResponse:
        return await self.ai_engine.analyze_resume_with_ai(resume_text)

