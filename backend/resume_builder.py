from ai_engine import GroqAIEngine
from models import BuildResumeRequest, BuiltResume, ContactInfo, RedesignResumeRequest


class ResumeBuilder:
    def __init__(self, ai_engine: GroqAIEngine) -> None:
        self.ai_engine = ai_engine

    async def build(self, request: BuildResumeRequest) -> BuiltResume:
        built_resume = await self.ai_engine.build_resume(request)
        if not built_resume.headline:
            built_resume.headline = request.target_role or "ATS Optimized Resume"

        built_resume.contact = ContactInfo(
            email=request.email,
            phone=request.phone,
            location=request.location,
            linkedin=request.linkedin,
            website=request.website,
        )
        return built_resume

    async def redesign(self, request: RedesignResumeRequest) -> BuiltResume:
        built_resume = await self.ai_engine.redesign_resume_for_company(request)
        if not built_resume.headline:
            built_resume.headline = request.target_role or f"Tailored Resume for {request.company_name}"
        built_resume.contact = request.contact
        return built_resume
