import { useEffect, useState } from "react";
import FileUpload from "../components/FileUpload";
import PageHero from "../components/PageHero";
import ResultCard from "../components/ResultCard";
import ScoreGauge from "../components/ScoreGauge";
import TagList from "../components/TagList";
import { atsMatchResume, uploadResume } from "../services/api";
import { normalizeAtsJobDescription } from "../utils/resume";

function AtsMatchPage() {
  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setResumeText(localStorage.getItem("latestResumeText") || "");
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
      localStorage.setItem("latestResumeText", data.text);
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMatch = async () => {
    if (!resumeText.trim()) {
      setError("Upload a PDF or paste resume text before matching.");
      return;
    }

    if (!jobDescription.trim()) {
      setError("Paste a job description or a short skill list first.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await atsMatchResume({
        resume_text: resumeText,
        job_description: normalizeAtsJobDescription(jobDescription),
      });
      setResult(data);
    } catch (matchError) {
      setError(matchError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stack page-stack">
      <PageHero
        eyebrow="ATS Match"
        title="See how well your resume lines up with a target role before you apply."
        description="Paste a full job description or even a short keyword list like `Python, pandas, numpy, FastAPI`. The page will normalize it and compare your resume in a beginner-friendly way."
        actions={
          <>
            <button className="primary-button" onClick={handleMatch} disabled={loading}>
              {loading ? "Matching..." : "Run ATS Match"}
            </button>
            <button className="secondary-button" onClick={handleUpload} disabled={loading}>
              {loading ? "Parsing..." : "Upload and Parse"}
            </button>
          </>
        }
        stats={[
          { value: result ? `${result.match_score}/100` : "--", label: "Match score" },
          { value: result ? `${result.matched_keywords.length}` : "--", label: "Matched keywords" },
          { value: result ? `${result.missing_keywords.length}` : "--", label: "Missing keywords" },
        ]}
      />

      <section className="workspace-grid">
        <article className="surface-card workspace-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Resume Input</p>
              <h2>Bring in your current resume</h2>
            </div>
          </div>
          <FileUpload label="Resume PDF" onFileChange={setFile} fileName={file?.name} />
          <label className="field">
            <span>Resume Text</span>
            <textarea
              rows="14"
              value={resumeText}
              onChange={(event) => setResumeText(event.target.value)}
              placeholder="Parsed resume text appears here."
            />
          </label>
        </article>

        <article className="surface-card workspace-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Target Role</p>
              <h2>Paste the job description or keywords</h2>
            </div>
          </div>
          <label className="field">
            <span>Job Description</span>
            <textarea
              rows="16"
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              placeholder="Example: Senior backend engineer with Python, FastAPI, PostgreSQL, Docker, CI/CD, and system design."
            />
          </label>
          <p className="helper-text">
            Short keyword lists are okay too. ResumeForge will expand them into a usable ATS prompt automatically.
          </p>
        </article>
      </section>

      {error ? <p className="error-text page-error">{error}</p> : null}

      {result ? (
        <section className="analysis-dashboard">
          <article className="surface-card score-panel">
            <p className="eyebrow">ATS Match Score</p>
            <ScoreGauge label="Match Score" score={result.match_score} />
            <p className="score-panel__copy">
              A higher score means your resume already uses more of the right language. Missing keywords show where to
              tailor the summary, skills, or recent experience.
            </p>
          </article>

          <TagList title="Matched Keywords" items={result.matched_keywords} tone="positive" />
          <TagList title="Missing Keywords" items={result.missing_keywords} tone="warning" />
          <ResultCard
            title="Recommendations"
            description="Use these actions to improve your chances before applying."
            items={result.recommendations}
          />
        </section>
      ) : null}
    </div>
  );
}

export default AtsMatchPage;
