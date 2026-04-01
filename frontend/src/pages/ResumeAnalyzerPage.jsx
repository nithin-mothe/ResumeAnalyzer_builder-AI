import { useEffect, useState } from "react";
import FileUpload from "../components/FileUpload";
import PageHero from "../components/PageHero";
import ResultCard from "../components/ResultCard";
import ScoreGauge from "../components/ScoreGauge";
import { analyzeResume, uploadResume } from "../services/api";

function ResumeAnalyzerPage() {
  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [resumeId, setResumeId] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setResumeText(localStorage.getItem("latestResumeText") || "");
    setResumeId(localStorage.getItem("latestResumeId") || "");
  }, []);

  const handleUpload = async () => {
    if (!file) {
      setError("Choose a PDF resume first.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await uploadResume(file);
      setResumeText(data.text);
      setResumeId(data.saved_resume_id || "");
      localStorage.setItem("latestResumeText", data.text);
      if (data.saved_resume_id) {
        localStorage.setItem("latestResumeId", data.saved_resume_id);
      }
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      setError("Upload a PDF or paste resume text before analysis.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await analyzeResume({ resume_text: resumeText, resume_id: resumeId || null });
      setResult(data);
    } catch (analysisError) {
      setError(analysisError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stack page-stack">
      <PageHero
        eyebrow="Resume Analyzer"
        title="Understand what is strong, what feels weak, and what to fix next."
        description="This page is built to be clear even for first-time users. Upload a PDF, parse the text, then run AI analysis to get structured strengths, problems, and concrete suggestions."
        actions={
          <>
            <button className="primary-button" onClick={handleAnalyze} disabled={loading}>
              {loading ? "Analyzing..." : "Analyze Resume"}
            </button>
            <button className="secondary-button" onClick={handleUpload} disabled={loading}>
              {loading ? "Parsing..." : "Upload and Parse"}
            </button>
          </>
        }
        stats={[
          { value: resumeText ? `${resumeText.split(/\s+/).filter(Boolean).length}` : "0", label: "Words parsed" },
          { value: result ? `${result.score}/100` : "--", label: "Current score" },
          { value: result ? `${result.suggestions.length}` : "--", label: "Suggestions" },
        ]}
      />

      <section className="workspace-grid">
        <article className="surface-card workspace-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Step 1</p>
              <h2>Upload your resume PDF</h2>
            </div>
          </div>
          <FileUpload label="Resume PDF" onFileChange={setFile} fileName={file?.name} />
          <div className="info-strip">
            <span className="info-chip">PDF only</span>
            <span className="info-chip">Best with text-based resumes</span>
            <span className="info-chip">Saved text reused across pages</span>
          </div>
        </article>

        <article className="surface-card workspace-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Step 2</p>
              <h2>Review the parsed text</h2>
            </div>
          </div>
          <label className="field">
            <span>Resume Text</span>
            <textarea
              rows="16"
              value={resumeText}
              onChange={(event) => setResumeText(event.target.value)}
              placeholder="Your parsed resume text appears here after upload."
            />
          </label>
        </article>
      </section>

      {error ? <p className="error-text page-error">{error}</p> : null}

      {result ? (
        <section className="analysis-dashboard">
          <article className="surface-card score-panel">
            <p className="eyebrow">Overall Score</p>
            <ScoreGauge label="Resume Score" score={result.score} />
            <p className="score-panel__copy">
              Use this as a direction signal, not just a grade. Stronger summaries, better impact bullets, and clearer
              job targeting usually move the score fastest.
            </p>
          </article>

          <ResultCard
            title="Strengths"
            description="These are the parts already helping your resume."
            items={result.strengths}
            tone="positive"
          />
          <ResultCard
            title="Problems"
            description="These issues are likely reducing clarity or credibility."
            items={result.problems}
            tone="warning"
          />
          <ResultCard
            title="Suggestions"
            description="Start with the suggestions that are easiest to improve today."
            items={result.suggestions}
            tone="default"
          />
        </section>
      ) : null}
    </div>
  );
}

export default ResumeAnalyzerPage;

