from ats_matcher import ATSMatcher


def test_ats_matcher_returns_missing_keywords_and_score():
    matcher = ATSMatcher()
    result = matcher.match(
        resume_text=(
            "Python developer with FastAPI, PostgreSQL, Docker, and CI/CD experience. "
            "Improved API latency by 35 percent."
        ),
        job_description=(
            "Looking for a backend engineer with Python, FastAPI, PostgreSQL, Kubernetes, "
            "Docker, and system design experience."
        ),
    )

    assert result.match_score >= 40
    assert "python" in result.matched_keywords
    assert "kubernetes" in result.missing_keywords

