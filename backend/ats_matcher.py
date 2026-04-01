from models import ATSMatchResponse
from utils.text import contains_quantified_impact, extract_keywords


class ATSMatcher:
    def match(self, resume_text: str, job_description: str) -> ATSMatchResponse:
        job_keywords = extract_keywords(job_description, max_keywords=24)
        resume_keywords = set(extract_keywords(resume_text, max_keywords=48))

        matched_keywords = [keyword for keyword in job_keywords if keyword in resume_keywords]
        missing_keywords = [keyword for keyword in job_keywords if keyword not in resume_keywords]

        base_score = int((len(matched_keywords) / max(len(job_keywords), 1)) * 100)
        if contains_quantified_impact(resume_text):
            base_score = min(100, base_score + 5)
        if len(resume_text.split()) > 250:
            base_score = min(100, base_score + 5)
        if len(matched_keywords) >= 8:
            base_score = min(100, base_score + 10)

        recommendations: list[str] = []
        if missing_keywords:
            recommendations.append(
                "Add missing skills or phrases where they truthfully match your background: "
                + ", ".join(missing_keywords[:6])
                + "."
            )
        if not contains_quantified_impact(resume_text):
            recommendations.append("Quantify outcomes with numbers, percentages, or time savings.")
        if len(matched_keywords) < 5:
            recommendations.append("Align your summary and recent experience more directly to the target job description.")
        if len(job_description.split()) < 25:
            recommendations.append("Add a few more role details or required skills for a more accurate ATS comparison.")
        if not recommendations:
            recommendations.append("Strong alignment detected. Focus next on tailoring achievements to the exact hiring priorities.")

        return ATSMatchResponse(
            match_score=max(0, min(100, base_score)),
            matched_keywords=matched_keywords,
            missing_keywords=missing_keywords,
            recommendations=recommendations,
        )
