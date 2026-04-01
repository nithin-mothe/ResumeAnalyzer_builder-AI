import re
import unicodedata
from collections import Counter


STOPWORDS = {
    "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "in", "into", "is",
    "it", "of", "on", "or", "that", "the", "to", "with", "will", "you", "your", "our",
    "we", "this", "those", "these", "using", "used", "required", "preferred", "ability",
    "experience", "work", "working", "team", "role", "candidate", "requirements", "requirement",
    "include", "includes", "plus", "hiring", "build", "building", "strong", "looking",
    "ideal", "preferred", "need", "needs", "want", "wants",
}

KEY_PHRASES = [
    "machine learning",
    "artificial intelligence",
    "project management",
    "data analysis",
    "system design",
    "cloud computing",
    "continuous integration",
    "continuous deployment",
    "stakeholder management",
    "test automation",
    "data engineering",
    "software development",
    "product management",
    "rest api",
    "rest apis",
    "ci/cd",
    "fastapi",
    "postgresql",
    "docker",
    "supabase",
    "react",
    "kubernetes",
    "system design",
]


def clean_text(text: str) -> str:
    normalized = text.replace("\x00", " ")
    normalized = re.sub(r"[ \t]+", " ", normalized)
    normalized = re.sub(r"\n{3,}", "\n\n", normalized)
    return normalized.strip()


def safe_pdf_text(text: str) -> str:
    normalized = unicodedata.normalize("NFKD", text or "")
    return normalized.encode("latin-1", "ignore").decode("latin-1")


def extract_keywords(text: str, max_keywords: int = 20) -> list[str]:
    working_text = text.lower()
    scores = Counter()

    for phrase in KEY_PHRASES:
        if phrase in working_text:
            scores[phrase] += working_text.count(phrase) * 3

    tokens = re.findall(r"[a-zA-Z0-9\+#\-/]{2,}", working_text)
    for token in tokens:
        token = token.strip(".,:;!?()[]{}")
        if token in STOPWORDS or token.isdigit() or len(token) < 3:
            continue
        if token.endswith("s") and len(token) > 4:
            singular = token[:-1]
            if singular in {"api", "system", "project", "skill"}:
                token = singular
        scores[token] += 1

    ranked = [term for term, _ in scores.most_common(max_keywords * 2)]
    deduped: list[str] = []
    seen = set()
    for term in ranked:
        if term in seen:
            continue
        seen.add(term)
        deduped.append(term)
        if len(deduped) >= max_keywords:
            break
    return deduped


def contains_quantified_impact(text: str) -> bool:
    return bool(re.search(r"\b\d+[%xX+]?\b", text))
