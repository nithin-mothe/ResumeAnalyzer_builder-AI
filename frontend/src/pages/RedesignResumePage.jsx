import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import FileUpload from "../components/FileUpload";
import PageHero from "../components/PageHero";
import ResumePreview from "../components/ResumePreview";
import TemplateSelector from "../components/TemplateSelector";
import { generateResumePdf, redesignResume, uploadResume } from "../services/api";

function RedesignResumePage() {
  const [selectedTemplate, setSelectedTemplate] = useState(
    () => localStorage.getItem("selectedTemplateId") || "executive"
  );
  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [companyRequirements, setCompanyRequirements] = useState("");
  const [contact, setContact] = useState({
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    website: "",
  });
  const [result, setResult] = useState(() => {
    const saved = localStorage.getItem("latestRedesignedResume");
    return saved ? JSON.parse(saved) : null;
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setResumeText(localStorage.getItem("latestResumeText") || "");
  }, []);

  useEffect(() => {
    localStorage.setItem("selectedTemplateId", selectedTemplate);
  }, [selectedTemplate]);

  const handleUpload = async () => {
    if (!file) {
      setError("Choose your existing resume PDF first.");
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

  const handleRedesign = async () => {
    if (!resumeText.trim()) {
      setError("Upload or paste your current resume text first.");
      return;
    }

    if (!companyName.trim() || !companyRequirements.trim()) {
      setError("Add the company name and their requirements before redesigning.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await redesignResume({
        resume_text: resumeText,
        company_name: companyName,
        company_requirements: companyRequirements,
        target_role: targetRole || null,
        contact,
      });
      setResult(data.resume);
      localStorage.setItem("latestRedesignedResume", JSON.stringify(data.resume));
      localStorage.setItem(
        "latestJobTarget",
        JSON.stringify({
          company: companyName,
          role: targetRole,
          notes: companyRequirements,
        })
      );
    } catch (redesignError) {
      setError(redesignError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!result) {
      return;
    }

    try {
      const blob = await generateResumePdf(result, selectedTemplate);
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${(companyName || "tailored-resume").replace(/\s+/g, "-").toLowerCase()}.pdf`;
      anchor.click();
      window.URL.revokeObjectURL(url);
    } catch (downloadError) {
      setError(downloadError.message);
    }
  };

  const updateContact = (field, value) => {
    setContact((current) => ({ ...current, [field]: value }));
  };

  return (
    <div className="stack page-stack">
      <PageHero
        eyebrow="Company Redesign"
        title="Redesign an existing resume for one company’s exact hiring signals."
        description="Paste your current resume, add the company name and what they want, and ResumeForge will rewrite the positioning into a sharper company-specific draft while keeping the content truthful."
        actions={
          <>
            <button className="primary-button" onClick={handleRedesign} disabled={loading}>
              {loading ? "Redesigning..." : "Redesign Resume"}
            </button>
            <button className="secondary-button" onClick={handleUpload} disabled={loading}>
              {loading ? "Parsing..." : "Upload Current Resume"}
            </button>
          </>
        }
        stats={[
          { value: companyName || "Company", label: "Target company" },
          { value: targetRole || "Role", label: "Role focus" },
          { value: result ? "Ready" : "Draft", label: "Tailored output" },
        ]}
      />

      <section className="surface-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Template</p>
            <h2>Select the final resume style</h2>
          </div>
        </div>
        <TemplateSelector selectedId={selectedTemplate} onSelect={setSelectedTemplate} />
      </section>

      <section className="workspace-grid">
        <article className="surface-card workspace-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Current Resume</p>
              <h2>Bring in the resume you already have</h2>
            </div>
          </div>
          <FileUpload label="Current Resume PDF" onFileChange={setFile} fileName={file?.name} />
          <label className="field">
            <span>Resume Text</span>
            <textarea
              rows="14"
              value={resumeText}
              onChange={(event) => setResumeText(event.target.value)}
              placeholder="Paste the current resume text if you already have it."
            />
          </label>
        </article>

        <article className="surface-card workspace-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Company Brief</p>
              <h2>Tell the AI what this company wants</h2>
            </div>
          </div>
          <div className="form-grid">
            <label className="field">
              <span>Company Name</span>
              <input value={companyName} onChange={(event) => setCompanyName(event.target.value)} />
            </label>
            <label className="field">
              <span>Target Role</span>
              <input value={targetRole} onChange={(event) => setTargetRole(event.target.value)} />
            </label>
          </div>
          <label className="field">
            <span>Company Requirements</span>
            <textarea
              rows="8"
              value={companyRequirements}
              onChange={(event) => setCompanyRequirements(event.target.value)}
              placeholder="Paste the job description, hiring priorities, or the company-specific expectations here."
            />
          </label>
          <div className="form-grid form-grid--triple">
            <label className="field">
              <span>Email</span>
              <input value={contact.email} onChange={(event) => updateContact("email", event.target.value)} />
            </label>
            <label className="field">
              <span>Phone</span>
              <input value={contact.phone} onChange={(event) => updateContact("phone", event.target.value)} />
            </label>
            <label className="field">
              <span>Location</span>
              <input value={contact.location} onChange={(event) => updateContact("location", event.target.value)} />
            </label>
          </div>
        </article>
      </section>

      {error ? <p className="error-text page-error">{error}</p> : null}

      {result ? (
        <section className="builder-output-layout">
          <ResumePreview resume={result} templateId={selectedTemplate} title="Company-Specific Resume Preview" />
          <article className="surface-card builder-editor-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Next Step</p>
                <h2>Use this tailored version in the rest of your workflow</h2>
              </div>
              <div className="inline-actions">
                <button className="primary-button" type="button" onClick={handleDownload}>
                  Download PDF
                </button>
                <Link className="secondary-button" to="/job-tracker">
                  Track This Job
                </Link>
              </div>
            </div>
            <p className="helper-text">
              This draft is tailored to {companyName || "the target company"} and can now be tracked in the job
              tracker, refined in chat, or downloaded immediately.
            </p>
            <Link className="ghost-button" to="/chat">
              Continue refining in Resume Chat
            </Link>
          </article>
        </section>
      ) : null}
    </div>
  );
}

export default RedesignResumePage;

