from models import ATSMatchResponse
from utils.text import contains_quantified_impact, extract_keywords


SKILL_ALIASES = {
    "js": "javascript",
    "ts": "typescript",
    "node": "node.js",
    "nodejs": "node.js",
    "react.js": "react",
    "postgres": "postgresql",
    "postgresql": "postgresql",
    "k8s": "kubernetes",
    "ci": "ci/cd",
    "cd": "ci/cd",
    "rest": "rest api",
    "apis": "api",
    "ml": "machine learning",
    "ai": "artificial intelligence",
}

HIGH_VALUE_TERMS = {
    "system design",
    "software development",
    "data engineering",
    "machine learning",
    "artificial intelligence",
    "project management",
    "stakeholder management",
    "cloud computing",
    "test automation",
}


class ATSMatcher:
    def match(self, resume_text: str, job_description: str) -> ATSMatchResponse:
        job_keywords = self._normalized_keywords(job_description, max_keywords=28)
        resume_keywords = set(self._normalized_keywords(resume_text, max_keywords=64))

        matched_keywords = [keyword for keyword in job_keywords if keyword in resume_keywords]
        missing_keywords = [keyword for keyword in job_keywords if keyword not in resume_keywords]

        total_weight = sum(self._keyword_weight(keyword) for keyword in job_keywords) or 1
        matched_weight = sum(self._keyword_weight(keyword) for keyword in matched_keywords)
        base_score = int((matched_weight / total_weight) * 100)
        if contains_quantified_impact(resume_text):
            base_score = min(100, base_score + 5)
        if len(resume_text.split()) > 250:
            base_score = min(100, base_score + 5)
        if len(matched_keywords) >= 8:
            base_score = min(100, base_score + 10)

        recommendations: list[str] = []
        if missing_keywords:
            priority_missing = sorted(missing_keywords, key=self._keyword_weight, reverse=True)
            recommendations.append(
                "Prioritize truthful coverage for high-signal gaps: "
                + ", ".join(priority_missing[:6])
                + "."
            )
        if not contains_quantified_impact(resume_text):
            recommendations.append("Quantify outcomes with numbers, percentages, or time savings.")
        if len(matched_keywords) < 5:
            recommendations.append("Align your summary and recent experience more directly to the target job description.")
        if len(job_description.split()) < 25:
            recommendations.append("Add a few more role details or required skills for a more accurate ATS comparison.")
        if self._looks_under_sectioned(resume_text):
            recommendations.append("Use clear resume sections such as Summary, Skills, Experience, Projects, and Education.")
        if not recommendations:
            recommendations.append("Strong alignment detected. Focus next on tailoring achievements to the exact hiring priorities.")

        return ATSMatchResponse(
            match_score=max(0, min(100, base_score)),
            matched_keywords=matched_keywords,
            missing_keywords=missing_keywords,
            recommendations=recommendations,
        )

    def _normalized_keywords(self, text: str, *, max_keywords: int) -> list[str]:
        keywords = extract_keywords(text, max_keywords=max_keywords)
        normalized: list[str] = []
        seen = set()
        for keyword in keywords:
            normalized_keyword = SKILL_ALIASES.get(keyword, keyword)
            if normalized_keyword in seen:
                continue
            seen.add(normalized_keyword)
            normalized.append(normalized_keyword)
        return normalized

    def _keyword_weight(self, keyword: str) -> int:
        if keyword in HIGH_VALUE_TERMS:
            return 3
        if "/" in keyword or "." in keyword or len(keyword) >= 10:
            return 2
        return 1

    def _looks_under_sectioned(self, resume_text: str) -> bool:
        lowered = resume_text.lower()
        section_hits = sum(
            section in lowered
            for section in ["summary", "skills", "experience", "projects", "education"]
        )
        return section_hits < 3
