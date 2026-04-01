from fpdf import FPDF

from models import BuiltResume, ResumeTemplateId
from utils.text import safe_pdf_text


class ResumePDFGenerator:
    def generate(self, resume: BuiltResume, template_id: ResumeTemplateId = "executive") -> bytes:
        pdf = FPDF(format="A4")
        pdf.set_auto_page_break(auto=True, margin=12)
        pdf.add_page()

        if template_id == "modern":
            self._render_modern(pdf, resume)
        elif template_id == "compact":
            self._render_compact(pdf, resume)
        else:
            self._render_executive(pdf, resume)

        rendered = pdf.output()
        if isinstance(rendered, str):
            return rendered.encode("latin-1")
        return bytes(rendered)

    def _render_executive(self, pdf: FPDF, resume: BuiltResume) -> None:
        pdf.set_fill_color(245, 239, 228)
        pdf.rect(10, 10, 190, 24, style="F")
        pdf.set_xy(14, 14)
        pdf.set_font("Helvetica", "B", 21)
        pdf.cell(0, 8, safe_pdf_text(resume.name), new_x="LMARGIN", new_y="NEXT")
        if resume.headline:
            pdf.set_x(14)
            pdf.set_font("Helvetica", "", 11)
            pdf.set_text_color(99, 75, 53)
            pdf.cell(0, 6, safe_pdf_text(resume.headline), new_x="LMARGIN", new_y="NEXT")
        self._contact_line(pdf, resume)
        pdf.set_text_color(34, 22, 15)
        pdf.ln(6)
        self._render_body(pdf, resume, accent=(191, 91, 41))

    def _render_modern(self, pdf: FPDF, resume: BuiltResume) -> None:
        pdf.set_fill_color(25, 48, 59)
        pdf.rect(0, 0, 210, 38, style="F")
        pdf.set_xy(14, 12)
        pdf.set_text_color(245, 244, 238)
        pdf.set_font("Helvetica", "B", 22)
        pdf.cell(0, 8, safe_pdf_text(resume.name), new_x="LMARGIN", new_y="NEXT")
        if resume.headline:
            pdf.set_x(14)
            pdf.set_font("Helvetica", "", 11)
            pdf.cell(0, 6, safe_pdf_text(resume.headline), new_x="LMARGIN", new_y="NEXT")
        self._contact_line(pdf, resume, text_color=(228, 233, 236), start_x=14)
        pdf.set_text_color(34, 22, 15)
        pdf.set_y(46)
        self._render_body(pdf, resume, accent=(33, 102, 172), shaded_sections=True)

    def _render_compact(self, pdf: FPDF, resume: BuiltResume) -> None:
        pdf.set_fill_color(243, 246, 250)
        pdf.rect(10, 10, 52, 277, style="F")
        pdf.set_xy(16, 18)
        pdf.set_font("Helvetica", "B", 18)
        pdf.cell(40, 8, safe_pdf_text(resume.name), new_x="LMARGIN", new_y="NEXT")
        if resume.headline:
            pdf.set_x(16)
            pdf.set_font("Helvetica", "", 10)
            pdf.multi_cell(40, 5, safe_pdf_text(resume.headline))
        pdf.ln(3)
        pdf.set_x(16)
        pdf.set_font("Helvetica", "B", 10)
        pdf.cell(40, 6, "Contact", new_x="LMARGIN", new_y="NEXT")
        pdf.set_x(16)
        pdf.set_font("Helvetica", "", 9)
        for line in self._contact_lines(resume):
            pdf.set_x(16)
            pdf.multi_cell(40, 5, safe_pdf_text(line))

        pdf.ln(3)
        pdf.set_x(16)
        pdf.set_font("Helvetica", "B", 10)
        pdf.cell(40, 6, "Skills", new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("Helvetica", "", 9)
        self._sidebar_list(pdf, resume.skills.languages)
        self._sidebar_list(pdf, resume.skills.frameworks)
        self._sidebar_list(pdf, resume.skills.tools)
        pdf.ln(2)
        pdf.set_x(16)
        pdf.set_font("Helvetica", "B", 10)
        pdf.cell(40, 6, "Education", new_x="LMARGIN", new_y="NEXT")
        pdf.set_x(16)
        pdf.set_font("Helvetica", "", 9)
        pdf.multi_cell(40, 5, safe_pdf_text(resume.education))

        pdf.set_xy(72, 18)
        self._section_title(pdf, "Summary", accent=(191, 91, 41), width=126)
        pdf.set_x(72)
        pdf.set_font("Helvetica", "", 11)
        pdf.multi_cell(126, 6, safe_pdf_text(resume.summary))

        if resume.experience:
            pdf.ln(2)
            self._section_title(pdf, "Experience", accent=(191, 91, 41), width=126)
            for item in resume.experience:
                pdf.set_x(72)
                pdf.set_font("Helvetica", "B", 12)
                pdf.multi_cell(126, 6, safe_pdf_text(item.role))
                pdf.set_font("Helvetica", "", 10)
                for point in item.points:
                    self._write_bullet(pdf, point, start_x=74, width=124)

        if resume.projects:
            pdf.ln(2)
            self._section_title(pdf, "Projects", accent=(191, 91, 41), width=126)
            for item in resume.projects:
                pdf.set_x(72)
                pdf.set_font("Helvetica", "B", 12)
                pdf.multi_cell(126, 6, safe_pdf_text(item.title))
                pdf.set_font("Helvetica", "", 10)
                for point in item.points:
                    self._write_bullet(pdf, point, start_x=74, width=124)

    def _render_body(
        self,
        pdf: FPDF,
        resume: BuiltResume,
        *,
        accent: tuple[int, int, int],
        shaded_sections: bool = False,
    ) -> None:
        self._section_title(pdf, "Summary", accent=accent, shaded=shaded_sections)
        pdf.set_x(pdf.l_margin)
        pdf.set_font("Helvetica", "", 11)
        pdf.multi_cell(0, 6, safe_pdf_text(resume.summary))

        self._section_title(pdf, "Core Skills", accent=accent, shaded=shaded_sections)
        self._write_skill_group(pdf, "Languages", resume.skills.languages)
        self._write_skill_group(pdf, "Frameworks", resume.skills.frameworks)
        self._write_skill_group(pdf, "Tools", resume.skills.tools)

        if resume.experience:
            self._section_title(pdf, "Experience", accent=accent, shaded=shaded_sections)
            for item in resume.experience:
                pdf.set_x(pdf.l_margin)
                pdf.set_font("Helvetica", "B", 12)
                pdf.multi_cell(0, 7, safe_pdf_text(item.role))
                pdf.set_font("Helvetica", "", 11)
                for point in item.points:
                    self._write_bullet(pdf, point)

        if resume.projects:
            self._section_title(pdf, "Projects", accent=accent, shaded=shaded_sections)
            for item in resume.projects:
                pdf.set_x(pdf.l_margin)
                pdf.set_font("Helvetica", "B", 12)
                pdf.multi_cell(0, 7, safe_pdf_text(item.title))
                pdf.set_font("Helvetica", "", 11)
                for point in item.points:
                    self._write_bullet(pdf, point)

        self._section_title(pdf, "Education", accent=accent, shaded=shaded_sections)
        pdf.set_x(pdf.l_margin)
        pdf.set_font("Helvetica", "", 11)
        pdf.multi_cell(0, 6, safe_pdf_text(resume.education))

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
        shaded: bool = False,
        width: float | None = None,
    ) -> None:
        pdf.ln(4)
        pdf.set_x(pdf.get_x() if width else pdf.l_margin)
        if shaded:
            current_x = pdf.get_x()
            current_y = pdf.get_y()
            pdf.set_fill_color(241, 246, 252)
            pdf.rect(current_x, current_y, width or 190, 9, style="F")
            pdf.set_xy(current_x + 2, current_y + 1)
        pdf.set_font("Helvetica", "B", 12)
        pdf.set_text_color(*accent)
        pdf.cell(width or 0, 7, safe_pdf_text(title), new_x="LMARGIN", new_y="NEXT")
        pdf.set_text_color(34, 22, 15)
        if not shaded:
            pdf.set_draw_color(*accent)
            pdf.set_line_width(0.5)
            pdf.line(pdf.l_margin, pdf.get_y(), pdf.w - pdf.r_margin, pdf.get_y())
            pdf.ln(2)
        else:
            pdf.ln(1)

    def _write_skill_group(self, pdf: FPDF, label: str, values: list[str]) -> None:
        if not values:
            return
        pdf.set_x(pdf.l_margin)
        pdf.set_font("Helvetica", "B", 10)
        pdf.cell(28, 6, safe_pdf_text(f"{label}"), new_x="RIGHT", new_y="TOP")
        pdf.set_font("Helvetica", "", 10)
        pdf.multi_cell(0, 6, safe_pdf_text(", ".join(values)))

    def _write_bullet(
        self,
        pdf: FPDF,
        point: str,
        *,
        start_x: float | None = None,
        width: float = 0,
    ) -> None:
        pdf.set_x(start_x or pdf.l_margin + 2)
        pdf.multi_cell(width, 6, safe_pdf_text(f"- {point}"))

    def _sidebar_list(self, pdf: FPDF, items: list[str]) -> None:
        for item in items:
            pdf.set_x(16)
            pdf.multi_cell(40, 5, safe_pdf_text(f"- {item}"))
