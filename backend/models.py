from typing import Any, Literal

from pydantic import BaseModel, EmailStr, Field, field_validator


class ResumeUploadResponse(BaseModel):
    filename: str
    text: str
    word_count: int
    storage_path: str | None = None
    saved_resume_id: str | None = None


class ResumeAnalysisRequest(BaseModel):
    resume_text: str = Field(min_length=50)
    resume_id: str | None = None

    @field_validator("resume_text")
    @classmethod
    def validate_resume_text(cls, value: str) -> str:
        stripped = value.strip()
        if len(stripped) < 50:
            raise ValueError("Resume text must contain at least 50 characters.")
        return stripped


class ResumeAnalysisResponse(BaseModel):
    score: int = Field(ge=0, le=100)
    strengths: list[str] = Field(default_factory=list)
    problems: list[str] = Field(default_factory=list)
    suggestions: list[str] = Field(default_factory=list)


class ATSMatchRequest(BaseModel):
    resume_text: str = Field(min_length=30)
    job_description: str = Field(min_length=10)

    @field_validator("resume_text", "job_description")
    @classmethod
    def validate_fields(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("This field cannot be empty.")
        return stripped


class ATSMatchResponse(BaseModel):
    match_score: int = Field(ge=0, le=100)
    matched_keywords: list[str] = Field(default_factory=list)
    missing_keywords: list[str] = Field(default_factory=list)
    recommendations: list[str] = Field(default_factory=list)


class BuilderSkills(BaseModel):
    languages: list[str] = Field(default_factory=list)
    frameworks: list[str] = Field(default_factory=list)
    tools: list[str] = Field(default_factory=list)


class ContactInfo(BaseModel):
    email: EmailStr | None = None
    phone: str | None = None
    location: str | None = None
    linkedin: str | None = None
    website: str | None = None


class ProjectInput(BaseModel):
    title: str = Field(min_length=2)
    description: str | None = None
    achievements: list[str] = Field(default_factory=list)


class ExperienceInput(BaseModel):
    role: str = Field(min_length=2)
    company: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    achievements: list[str] = Field(default_factory=list)


class BuildResumeRequest(BaseModel):
    name: str = Field(min_length=2)
    email: EmailStr | None = None
    phone: str | None = None
    location: str | None = None
    linkedin: str | None = None
    website: str | None = None
    target_role: str | None = None
    summary: str | None = None
    skills: BuilderSkills = Field(default_factory=BuilderSkills)
    projects: list[ProjectInput] = Field(default_factory=list)
    experience: list[ExperienceInput] = Field(default_factory=list)
    education: str = Field(min_length=2)
    certifications: list[str] = Field(default_factory=list)
    extra_notes: str | None = None
    save_title: str = "AI Optimized Resume"


class BuiltProject(BaseModel):
    title: str
    points: list[str] = Field(default_factory=list)


class BuiltExperience(BaseModel):
    role: str
    points: list[str] = Field(default_factory=list)


class BuiltResume(BaseModel):
    name: str
    headline: str = ""
    contact: ContactInfo = Field(default_factory=ContactInfo)
    summary: str
    skills: BuilderSkills
    projects: list[BuiltProject] = Field(default_factory=list)
    experience: list[BuiltExperience] = Field(default_factory=list)
    education: str


class BuildResumeResponse(BaseModel):
    resume: BuiltResume
    saved_resume_id: str | None = None


ResumeTemplateId = Literal["executive", "modern", "compact"]


class RedesignResumeRequest(BaseModel):
    resume_text: str = Field(min_length=50)
    company_name: str = Field(min_length=2)
    company_requirements: str = Field(min_length=10)
    target_role: str | None = None
    contact: ContactInfo = Field(default_factory=ContactInfo)

    @field_validator("resume_text", "company_name", "company_requirements")
    @classmethod
    def validate_redesign_fields(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("This field cannot be empty.")
        return stripped


class RedesignResumeResponse(BaseModel):
    resume: BuiltResume


class GeneratePdfRequest(BaseModel):
    resume: BuiltResume
    template_id: ResumeTemplateId = "executive"


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1)
    resume_text: str | None = None
    history: list[ChatMessage] = Field(default_factory=list)

    @field_validator("message")
    @classmethod
    def validate_message(cls, value: str) -> str:
        if not isinstance(value, str) or not value.strip():
            raise ValueError("Message must be a non-empty string.")
        return value.strip()


class ChatResponse(BaseModel):
    answer: str


class SavedResumeResponse(BaseModel):
    id: str
    title: str
    content: dict[str, Any]
    storage_path: str | None = None
    created_at: str
