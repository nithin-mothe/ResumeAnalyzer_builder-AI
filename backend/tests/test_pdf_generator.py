from models import BuiltExperience, BuiltProject, BuiltResume, BuilderSkills, ContactInfo
from pdf_generator import ResumePDFGenerator


def test_pdf_generator_returns_pdf_bytes():
    generator = ResumePDFGenerator()
    pdf_bytes = generator.generate(
        BuiltResume(
            name="Jane Doe",
            headline="Senior Backend Engineer",
            contact=ContactInfo(email="jane@example.com", location="Remote"),
            summary="Backend engineer focused on resilient APIs and measurable product outcomes.",
            skills=BuilderSkills(languages=["Python"], frameworks=["FastAPI"], tools=["Docker"]),
            projects=[BuiltProject(title="Resume Platform", points=["Built a document workflow for resume analysis."])],
            experience=[BuiltExperience(role="Senior Engineer", points=["Reduced incident volume by 28 percent."])],
            education="B.S. in Computer Science",
        ),
        "modern",
    )

    assert pdf_bytes.startswith(b"%PDF")
