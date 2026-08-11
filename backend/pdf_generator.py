from fpdf import FPDF

from models import BuiltResume, ResumeTemplateId
from utils.text import safe_pdf_text


class ResumePDFGenerator:
    def generate(self, resume: BuiltResume, template_id: ResumeTemplateId = "executive") -> bytes:
        pdf = FPDF(format="A4")
        pdf.set_margins(15, 12, 15)
        pdf.set_auto_page_break(auto=True, margin=13)
        pdf.add_page()

        accent = {
            "modern": (180, 83, 9),
            "compact": (15, 111, 100),
            "executive": (185, 93, 30),
        }.get(template_id, (185, 93, 30))
        self._render_reference_resume(pdf, resume, accent=accent)

        rendered = pdf.output()
        if isinstance(rendered, str):
            return rendered.encode("latin-1")
        return bytes(rendered)

    def _render_reference_resume(
        self,
        pdf: FPDF,
        resume: BuiltResume,
        *,
        accent: tuple[int, int, int],
    ) -> None:
        pdf.set_text_color(20, 17, 13)
        pdf.set_draw_color(*accent)
        pdf.set_line_width(0.45)

        pdf.set_font("Helvetica", "B", 19)
        pdf.cell(0, 7.5, safe_pdf_text(resume.name.upper()), align="C", new_x="LMARGIN", new_y="NEXT")

        if resume.headline:
            pdf.set_font("Helvetica", "", 10)
            pdf.set_text_color(65, 51, 40)
            pdf.set_x(pdf.l_margin)
            pdf.multi_cell(0, 5.2, safe_pdf_text(resume.headline), align="C")

        contact_parts = self._contact_lines(resume)
        if contact_parts:
            pdf.set_font("Helvetica", "", 9)
            pdf.set_text_color(85, 70, 58)
            pdf.set_x(pdf.l_margin)
            pdf.multi_cell(0, 4.8, safe_pdf_text(" | ".join(contact_parts)), align="C")

        pdf.set_text_color(20, 17, 13)
        pdf.ln(1.4)

        self._section_title(pdf, "Professional Summary", accent=accent)
        pdf.set_x(pdf.l_margin)
        pdf.set_font("Helvetica", "", 9.8)
        pdf.multi_cell(0, 5.2, safe_pdf_text(resume.summary))

        self._section_title(pdf, "Technical Skills", accent=accent)
        self._write_skill_group(pdf, "Languages", resume.skills.languages)
        self._write_skill_group(pdf, "Frameworks", resume.skills.frameworks)
        self._write_skill_group(pdf, "Tools", resume.skills.tools)

        if resume.experience:
            self._section_title(pdf, "Experience", accent=accent)
            for item in resume.experience:
                self._item_heading(pdf, item.role)
                for point in item.points:
                    self._write_bullet(pdf, point)
                pdf.ln(0.8)

        if resume.projects:
            self._section_title(pdf, "Projects", accent=accent)
            for item in resume.projects:
                self._item_heading(pdf, item.title)
                for point in item.points:
                    self._write_bullet(pdf, point)
                pdf.ln(0.8)

        self._section_title(pdf, "Education", accent=accent)
        pdf.set_x(pdf.l_margin)
        pdf.set_font("Helvetica", "", 9.8)
        pdf.multi_cell(0, 5.2, safe_pdf_text(resume.education))

    def _contact_line(
        self,
        pdf: FPDF,
        resume: BuiltResume,
        *,
        text_color: tuple[int, int, int] = (111, 93, 80),
        start_x: float | None = None,
    ) -> None:
        contact_parts = self._contact_lines(resume)
        if not contact_parts:
            return
        pdf.set_text_color(*text_color)
        pdf.set_font("Helvetica", "", 9)
        if start_x is not None:
            pdf.set_x(start_x)
        pdf.multi_cell(0, 5, safe_pdf_text(" | ".join(contact_parts)))

    def _contact_lines(self, resume: BuiltResume) -> list[str]:
        parts = [
            resume.contact.email,
            resume.contact.phone,
            resume.contact.location,
            resume.contact.linkedin,
            resume.contact.website,
        ]
        return [part for part in parts if part]

    def _section_title(
        self,
        pdf: FPDF,
        title: str,
        *,
        accent: tuple[int, int, int],
    ) -> None:
        if pdf.get_y() > 270:
            pdf.add_page()
        pdf.ln(3.2)
        pdf.set_font("Helvetica", "B", 9.4)
        pdf.set_text_color(20, 17, 13)
        pdf.cell(0, 4.8, safe_pdf_text(title.upper()), new_x="LMARGIN", new_y="NEXT")
        pdf.set_draw_color(*accent)
        pdf.line(pdf.l_margin, pdf.get_y(), pdf.w - pdf.r_margin, pdf.get_y())
        pdf.ln(1.8)

    def _item_heading(self, pdf: FPDF, value: str) -> None:
        if pdf.get_y() > 268:
            pdf.add_page()
        pdf.set_font("Helvetica", "B", 10.4)
        pdf.set_text_color(20, 17, 13)
        pdf.set_x(pdf.l_margin)
        pdf.multi_cell(0, 5.4, safe_pdf_text(value))

    def _write_skill_group(self, pdf: FPDF, label: str, values: list[str]) -> None:
        if not values:
            return
        pdf.set_x(pdf.l_margin)
        pdf.set_font("Helvetica", "B", 9.4)
        pdf.cell(30, 5.2, safe_pdf_text(f"{label}:"), new_x="RIGHT", new_y="TOP")
        pdf.set_font("Helvetica", "", 9.4)
        pdf.multi_cell(0, 5.2, safe_pdf_text(", ".join(values)))

    def _write_bullet(
        self,
        pdf: FPDF,
        point: str,
        *,
        start_x: float | None = None,
        width: float = 0,
    ) -> None:
        if not point:
            return
        if pdf.get_y() > 274:
            pdf.add_page()
        bullet_x = start_x or pdf.l_margin + 2
        text_x = bullet_x + 3.2
        pdf.set_font("Helvetica", "", 9.6)
        pdf.set_text_color(20, 17, 13)
        pdf.set_x(bullet_x)
        pdf.cell(2.4, 5.1, "-", new_x="RIGHT", new_y="TOP")
        pdf.set_x(text_x)
        pdf.multi_cell(width or pdf.w - pdf.r_margin - text_x, 5.1, safe_pdf_text(point))
