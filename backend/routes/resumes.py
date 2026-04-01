from fastapi import APIRouter, File, Header, UploadFile
from fastapi.responses import StreamingResponse

from ai_engine import GroqAIEngine
from ats_matcher import ATSMatcher
from config import get_settings
from database import DatabaseClient
from models import (
    ATSMatchRequest,
    ATSMatchResponse,
    BuildResumeRequest,
    BuildResumeResponse,
    GeneratePdfRequest,
    RedesignResumeRequest,
    RedesignResumeResponse,
    ResumeAnalysisRequest,
    ResumeAnalysisResponse,
    ResumeUploadResponse,
    SavedResumeResponse,
)
from pdf_generator import ResumePDFGenerator
from resume_analyzer import ResumeAnalyzer
from resume_builder import ResumeBuilder
from resume_parser import ResumeParser
from utils.errors import AppError


router = APIRouter(tags=["resumes"])
settings = get_settings()
ai_engine = GroqAIEngine(settings)
resume_parser = ResumeParser()
resume_analyzer = ResumeAnalyzer(ai_engine)
ats_matcher = ATSMatcher()
resume_builder = ResumeBuilder(ai_engine)
pdf_generator = ResumePDFGenerator()
database = DatabaseClient(settings)


@router.post("/upload_resume", response_model=ResumeUploadResponse)
async def upload_resume(
    file: UploadFile = File(...),
    authorization: str | None = Header(default=None),
) -> ResumeUploadResponse:
    text, file_bytes = await resume_parser.parse_upload(file)
    user_id = await database.resolve_user_id(authorization)

    storage_path = None
    saved_resume_id = None
    if user_id and database.enabled:
        storage_path = await database.upload_resume_file(user_id=user_id, filename=file.filename or "resume.pdf", file_bytes=file_bytes)
        saved = await database.save_resume(
            user_id=user_id,
            title=file.filename or "Uploaded Resume",
            content={"parsed_text": text, "filename": file.filename or "resume.pdf"},
            storage_path=storage_path,
        )
        saved_resume_id = saved["id"]

    return ResumeUploadResponse(
        filename=file.filename or "resume.pdf",
        text=text,
        word_count=len(text.split()),
        storage_path=storage_path,
        saved_resume_id=saved_resume_id,
    )


@router.post("/analyze-resume", response_model=ResumeAnalysisResponse)
async def analyze_resume(
    payload: ResumeAnalysisRequest,
    authorization: str | None = Header(default=None),
) -> ResumeAnalysisResponse:
    result = await resume_analyzer.analyze(payload.resume_text)
    user_id = await database.resolve_user_id(authorization)

    if user_id and payload.resume_id and database.enabled:
        await database.save_analysis(
            resume_id=payload.resume_id,
            score=result.score,
            suggestions=result.suggestions,
            problems=result.problems,
            strengths=result.strengths,
        )

    return result


@router.post("/ats-match", response_model=ATSMatchResponse)
async def ats_match(payload: ATSMatchRequest) -> ATSMatchResponse:
    return ats_matcher.match(payload.resume_text, payload.job_description)


@router.post("/ai-resume-builder", response_model=BuildResumeResponse)
async def build_ai_resume(
    payload: BuildResumeRequest,
    authorization: str | None = Header(default=None),
) -> BuildResumeResponse:
    built_resume = await resume_builder.build(payload)
    user_id = await database.resolve_user_id(authorization)

    saved_resume_id = None
    if user_id and database.enabled:
        saved = await database.save_resume(
            user_id=user_id,
            title=payload.save_title,
            content=built_resume.model_dump(),
        )
        saved_resume_id = saved["id"]

    return BuildResumeResponse(resume=built_resume, saved_resume_id=saved_resume_id)


@router.post("/redesign-resume", response_model=RedesignResumeResponse)
async def redesign_resume(payload: RedesignResumeRequest) -> RedesignResumeResponse:
    redesigned = await resume_builder.redesign(payload)
    return RedesignResumeResponse(resume=redesigned)


@router.post("/generate-resume-pdf")
async def generate_resume_pdf(payload: GeneratePdfRequest):
    pdf_bytes = pdf_generator.generate(payload.resume, payload.template_id)
    headers = {"Content-Disposition": 'attachment; filename="optimized-resume.pdf"'}
    return StreamingResponse(iter([pdf_bytes]), media_type="application/pdf", headers=headers)


@router.get("/resume/{resume_id}", response_model=SavedResumeResponse)
async def get_resume(resume_id: str, authorization: str | None = Header(default=None)) -> SavedResumeResponse:
    user_id = await database.resolve_user_id(authorization)
    if not user_id:
        raise AppError(401, "You must be authenticated to load saved resumes.", code="unauthorized")

    resume = await database.get_resume(resume_id=resume_id, user_id=user_id)
    return SavedResumeResponse.model_validate(resume)
