import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Download, FileText, MessageSquareText, Plus, Sparkles, Trash2, WandSparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { AiProcessingPanel, motionTokens, SuccessBurst } from "../components/MotionSystem";
import PageHero from "../components/PageHero";
import ResumePreview from "../components/ResumePreview";
import TemplateSelector from "../components/TemplateSelector";
import { buildResume, generateResumePdf } from "../services/api";
import {
  buildResumePayload,
  hydrateGeneratedResume,
  joinLineValues,
  splitCommaValues,
  splitLineValues,
} from "../utils/resume";

const createExperience = () => ({ role: "", company: "", achievementsText: "" });
const createProject = () => ({ title: "", description: "", achievementsText: "" });

const initialFormState = {
  name: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
  website: "",
  target_role: "",
  summary: "",
  education: "",
  certifications: "",
  extra_notes: "",
  save_title: "AI Optimized Resume",
  languages: "",
  frameworks: "",
  tools: "",
  experience: [createExperience()],
  projects: [createProject()],
};

function ResumeBuilderPage() {
  const [selectedTemplate, setSelectedTemplate] = useState(
    () => localStorage.getItem("selectedTemplateId") || "executive"
  );
  const [form, setForm] = useState(initialFormState);
  const [editableResume, setEditableResume] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  const builderProgress = useMemo(() => {
    const requiredFields = [
      form.name,
      form.target_role,
      form.summary,
      form.education,
      form.languages || form.frameworks || form.tools,
      form.experience.some((item) => item.role || item.company || item.achievementsText),
    ];
    const completed = requiredFields.filter(Boolean).length;
    return Math.round((completed / requiredFields.length) * 100);
  }, [form]);

  useEffect(() => {
    localStorage.setItem("selectedTemplateId", selectedTemplate);
  }, [selectedTemplate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const updateExperience = (index, key, value) => {
    setForm((current) => ({
      ...current,
      experience: current.experience.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      ),
    }));
  };

  const updateProject = (index, key, value) => {
    setForm((current) => ({
      ...current,
      projects: current.projects.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      ),
    }));
  };

  const addExperience = () => {
    setForm((current) => ({ ...current, experience: [...current.experience, createExperience()] }));
  };

  const addProject = () => {
    setForm((current) => ({ ...current, projects: [...current.projects, createProject()] }));
  };

  const removeExperience = (index) => {
    setForm((current) => ({
      ...current,
      experience: current.experience.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const removeProject = (index) => {
    setForm((current) => ({
      ...current,
      projects: current.projects.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = buildResumePayload(form);
      const data = await buildResume(payload);
      const hydrated = hydrateGeneratedResume(data.resume, form);
      setEditableResume(hydrated);
      localStorage.setItem("latestBuiltResume", JSON.stringify(hydrated));
      localStorage.setItem("latestResumeProfile", JSON.stringify(form));
    } catch (buildError) {
      setError(buildError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!editableResume) {
      return;
    }

    setPdfGenerating(true);
    setError("");
    try {
      const blob = await generateResumePdf(editableResume, selectedTemplate);
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${(editableResume.name || "resume").replace(/\s+/g, "-").toLowerCase()}.pdf`;
      anchor.click();
      window.URL.revokeObjectURL(url);
    } catch (downloadError) {
      setError(downloadError.message);
    } finally {
      setPdfGenerating(false);
    }
  };

  const updateGeneratedResume = (field, value) => {
    setEditableResume((current) => ({ ...current, [field]: value }));
  };

  const updateContactField = (field, value) => {
    setEditableResume((current) => ({
      ...current,
      contact: {
        ...current.contact,
        [field]: value,
      },
    }));
  };

  const updateSkillsField = (field, value) => {
    setEditableResume((current) => ({
      ...current,
      skills: {
        ...current.skills,
        [field]: splitCommaValues(value),
      },
    }));
  };

  const updateExperienceDraft = (index, field, value) => {
    setEditableResume((current) => ({
      ...current,
      experience: current.experience.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: field === "points" ? splitLineValues(value) : value,
            }
          : item
      ),
    }));
  };

  const updateProjectDraft = (index, field, value) => {
    setEditableResume((current) => ({
      ...current,
      projects: current.projects.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: field === "points" ? splitLineValues(value) : value,
            }
          : item
      ),
    }));
  };

  const readinessItems = [
    { label: "Name and target role", complete: Boolean(form.name && form.target_role) },
    { label: "Career direction", complete: Boolean(form.summary) },
    { label: "Education", complete: Boolean(form.education) },
    { label: "Skills grouped by type", complete: Boolean(form.languages || form.frameworks || form.tools) },
    {
      label: "At least one real achievement",
      complete: form.experience.some((item) => item.role && item.achievementsText),
    },
  ];

  return (
    <div className="stack page-stack">
      <PageHero
        eyebrow="AI Resume Builder"
        title="Choose a template, generate a stronger draft, and edit it live before download."
        description="Fill the profile once, let ResumeForge AI rewrite it with stronger positioning, then review an ATS-clean final resume before downloading."
        stats={[
          { value: "3", label: "Template options" },
          { value: editableResume ? "Ready" : `${builderProgress}%`, label: "Builder readiness" },
          { value: editableResume?.experience?.length || 0, label: "Experience sections" },
        ]}
      />

      <section className="motion-stepper" aria-label="Resume builder progress">
        {[
          { label: "Template", active: true, complete: Boolean(selectedTemplate) },
          { label: "Profile", active: builderProgress > 0, complete: builderProgress >= 72 },
          { label: "AI Draft", active: loading || Boolean(editableResume), complete: Boolean(editableResume) },
        ].map((step, index) => (
          <motion.article
            key={step.label}
            className={`motion-step ${step.active ? "motion-step--active" : ""} ${step.complete ? "motion-step--complete" : ""}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...motionTokens.spring, delay: index * 0.06 }}
          >
            <span>{index + 1}</span>
            <strong>{step.label}</strong>
          </motion.article>
        ))}
        <div className="motion-stepper__track" aria-hidden="true">
          <motion.span animate={{ width: editableResume ? "100%" : `${Math.max(builderProgress, 12)}%` }} />
        </div>
      </section>

      <section className="surface-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Step 1</p>
            <h2>Choose a resume template</h2>
          </div>
        </div>
        <TemplateSelector selectedId={selectedTemplate} onSelect={setSelectedTemplate} />
      </section>

      <section className="builder-main-layout">
        <form className="surface-card builder-form-card" onSubmit={handleSubmit}>
          <div className="section-heading">
            <div>
              <p className="eyebrow">Step 2</p>
              <h2>Fill your details</h2>
            </div>
            <button className="primary-button" type="submit" disabled={loading}>
              <Sparkles size={18} aria-hidden="true" />
              {loading ? "Generating..." : "Generate Resume"}
            </button>
          </div>

          <div className="form-grid form-grid--triple">
            <label className="field">
              <span>Name</span>
              <input name="name" value={form.name} onChange={handleChange} required />
            </label>
            <label className="field">
              <span>Email</span>
              <input name="email" value={form.email} onChange={handleChange} />
            </label>
            <label className="field">
              <span>Phone</span>
              <input name="phone" value={form.phone} onChange={handleChange} />
            </label>
            <label className="field">
              <span>Location</span>
              <input name="location" value={form.location} onChange={handleChange} />
            </label>
            <label className="field">
              <span>LinkedIn</span>
              <input name="linkedin" value={form.linkedin} onChange={handleChange} />
            </label>
            <label className="field">
              <span>Website</span>
              <input name="website" value={form.website} onChange={handleChange} />
            </label>
          </div>

          <div className="form-grid">
            <label className="field">
              <span>Target Role</span>
              <input
                name="target_role"
                value={form.target_role}
                onChange={handleChange}
                placeholder="Senior Backend Engineer"
              />
            </label>
            <label className="field">
              <span>Save Title</span>
              <input name="save_title" value={form.save_title} onChange={handleChange} />
            </label>
          </div>

          <label className="field">
            <span>Professional Summary or Direction</span>
            <textarea
              name="summary"
              rows="4"
              value={form.summary}
              onChange={handleChange}
              placeholder="Share your current summary or the kind of impression you want the AI to create."
            />
          </label>

          <div className="form-grid form-grid--triple">
            <label className="field">
              <span>Languages</span>
              <input name="languages" value={form.languages} onChange={handleChange} placeholder="Python, SQL, TypeScript" />
            </label>
            <label className="field">
              <span>Frameworks</span>
              <input name="frameworks" value={form.frameworks} onChange={handleChange} placeholder="FastAPI, React, Next.js" />
            </label>
            <label className="field">
              <span>Tools</span>
              <input name="tools" value={form.tools} onChange={handleChange} placeholder="Docker, Supabase, GitHub Actions" />
            </label>
          </div>

          <label className="field">
            <span>Education</span>
            <textarea name="education" rows="3" value={form.education} onChange={handleChange} required />
          </label>

          <div className="form-grid">
            <label className="field">
              <span>Certifications</span>
              <input
                name="certifications"
                value={form.certifications}
                onChange={handleChange}
                placeholder="AWS Solutions Architect, Google Cloud Associate"
              />
            </label>
            <label className="field">
              <span>Extra Notes</span>
              <input
                name="extra_notes"
                value={form.extra_notes}
                onChange={handleChange}
                placeholder="Target FAANG-style roles, emphasize platform scale and ownership"
              />
            </label>
          </div>

          <div className="builder-section">
            <div className="section-heading">
              <h3>Experience</h3>
              <button type="button" className="secondary-button" onClick={addExperience}>
                <Plus size={17} aria-hidden="true" />
                Add Experience
              </button>
            </div>
            {form.experience.map((item, index) => (
              <motion.div className="builder-card" key={`experience-${index}`} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="builder-card__header">
                  <strong>Experience #{index + 1}</strong>
                  {form.experience.length > 1 ? (
                    <button type="button" className="ghost-button" onClick={() => removeExperience(index)}>
                      <Trash2 size={16} aria-hidden="true" />
                      Remove
                    </button>
                  ) : null}
                </div>
                <div className="form-grid">
                  <label className="field">
                    <span>Role</span>
                    <input value={item.role} onChange={(event) => updateExperience(index, "role", event.target.value)} />
                  </label>
                  <label className="field">
                    <span>Company</span>
                    <input value={item.company} onChange={(event) => updateExperience(index, "company", event.target.value)} />
                  </label>
                </div>
                <label className="field">
                  <span>Achievements</span>
                  <textarea
                    rows="4"
                    value={item.achievementsText}
                    onChange={(event) => updateExperience(index, "achievementsText", event.target.value)}
                    placeholder="One achievement per line"
                  />
                </label>
              </motion.div>
            ))}
          </div>

          <div className="builder-section">
            <div className="section-heading">
              <h3>Projects</h3>
              <button type="button" className="secondary-button" onClick={addProject}>
                <Plus size={17} aria-hidden="true" />
                Add Project
              </button>
            </div>
            {form.projects.map((item, index) => (
              <motion.div className="builder-card" key={`project-${index}`} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="builder-card__header">
                  <strong>Project #{index + 1}</strong>
                  {form.projects.length > 1 ? (
                    <button type="button" className="ghost-button" onClick={() => removeProject(index)}>
                      <Trash2 size={16} aria-hidden="true" />
                      Remove
                    </button>
                  ) : null}
                </div>
                <div className="form-grid">
                  <label className="field">
                    <span>Title</span>
                    <input value={item.title} onChange={(event) => updateProject(index, "title", event.target.value)} />
                  </label>
                  <label className="field">
                    <span>Description</span>
                    <input value={item.description} onChange={(event) => updateProject(index, "description", event.target.value)} />
                  </label>
                </div>
                <label className="field">
                  <span>Project Bullets</span>
                  <textarea
                    rows="4"
                    value={item.achievementsText}
                    onChange={(event) => updateProject(index, "achievementsText", event.target.value)}
                    placeholder="One bullet per line"
                  />
                </label>
              </motion.div>
            ))}
          </div>

          {error ? <p className="error-text">{error}</p> : null}
        </form>

        <div className="builder-preview-column">
          <motion.aside
            className="surface-card builder-readiness-card"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={motionTokens.spring}
          >
            <div className="readiness-ring" aria-hidden="true" style={{ "--readiness": `${builderProgress}%` }}>
              <span>{builderProgress}%</span>
            </div>
            <div className="stack">
              <p className="eyebrow">ResumeForge Studio</p>
              <h3>No preview until AI builds it</h3>
              <p>
                Add the facts here first. When you click Generate Resume, the AI will produce a complete,
                reference-style ATS resume with stronger bullets and a clean final preview.
              </p>
            </div>

            <div className="readiness-checklist">
              {readinessItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  className={item.complete ? "readiness-item readiness-item--complete" : "readiness-item"}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...motionTokens.spring, delay: index * 0.04 }}
                >
                  {item.complete ? <CheckCircle2 size={17} aria-hidden="true" /> : <span>{index + 1}</span>}
                  <strong>{item.label}</strong>
                </motion.div>
              ))}
            </div>

            <div className="ai-quality-card">
              <WandSparkles size={22} aria-hidden="true" />
              <div>
                <strong>AI enhancement mode</strong>
                <p>Truthful, quantified where possible, stronger action verbs, tighter ATS section order.</p>
              </div>
            </div>

            <div className="reference-format-card">
              <FileText size={22} aria-hidden="true" />
              <div>
                <strong>Reference output format</strong>
                <p>Name header, role tagline, contact row, uppercase sections, skills rows, compact bullets.</p>
              </div>
            </div>
          </motion.aside>
        </div>
      </section>

      <AnimatePresence>
        {loading ? (
          <AiProcessingPanel
            title="Generating optimized resume"
            stages={[
              "Reading profile...",
              "Optimizing Resume...",
              "Sharpening bullet impact...",
              "Balancing ATS structure...",
              "Almost Done...",
            ]}
            tone="brain"
          />
        ) : null}
        {pdfGenerating ? (
          <AiProcessingPanel
            title="Generating polished PDF"
            stages={["Rendering template...", "Checking spacing...", "Preparing download...", "Finalizing PDF..."]}
            tone="success"
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
      {editableResume ? (
        <motion.section
          className="builder-output-layout"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={motionTokens.spring}
        >
          <article className="surface-card builder-editor-card">
            <SuccessBurst active />
            <div className="section-heading">
              <div>
                <p className="eyebrow">Step 3</p>
                <h2>Edit your generated draft</h2>
              </div>
              <div className="inline-actions">
                <button className="primary-button" type="button" onClick={handleDownloadPdf}>
                  <Download size={18} aria-hidden="true" />
                  {pdfGenerating ? "Generating PDF..." : "Download PDF"}
                </button>
                <Link className="secondary-button" to="/chat">
                  <MessageSquareText size={18} aria-hidden="true" />
                  Continue in Resume Chat
                </Link>
              </div>
            </div>

            <div className="builder-edit-grid">
              <label className="field">
                <span>Name</span>
                <input value={editableResume.name} onChange={(event) => updateGeneratedResume("name", event.target.value)} />
              </label>
              <label className="field">
                <span>Headline</span>
                <input
                  value={editableResume.headline || ""}
                  onChange={(event) => updateGeneratedResume("headline", event.target.value)}
                />
              </label>
            </div>

            <div className="builder-edit-grid">
              <label className="field">
                <span>Email</span>
                <input value={editableResume.contact?.email || ""} onChange={(event) => updateContactField("email", event.target.value)} />
              </label>
              <label className="field">
                <span>Phone</span>
                <input value={editableResume.contact?.phone || ""} onChange={(event) => updateContactField("phone", event.target.value)} />
              </label>
              <label className="field">
                <span>Location</span>
                <input value={editableResume.contact?.location || ""} onChange={(event) => updateContactField("location", event.target.value)} />
              </label>
              <label className="field">
                <span>LinkedIn or Website</span>
                <input
                  value={editableResume.contact?.linkedin || editableResume.contact?.website || ""}
                  onChange={(event) => updateContactField("linkedin", event.target.value)}
                />
              </label>
            </div>

            <label className="field">
              <span>Summary</span>
              <textarea
                rows="4"
                value={editableResume.summary}
                onChange={(event) => updateGeneratedResume("summary", event.target.value)}
              />
            </label>

            <div className="builder-edit-grid">
              <label className="field">
                <span>Languages</span>
                <input
                  value={(editableResume.skills?.languages || []).join(", ")}
                  onChange={(event) => updateSkillsField("languages", event.target.value)}
                />
              </label>
              <label className="field">
                <span>Frameworks</span>
                <input
                  value={(editableResume.skills?.frameworks || []).join(", ")}
                  onChange={(event) => updateSkillsField("frameworks", event.target.value)}
                />
              </label>
              <label className="field">
                <span>Tools</span>
                <input
                  value={(editableResume.skills?.tools || []).join(", ")}
                  onChange={(event) => updateSkillsField("tools", event.target.value)}
                />
              </label>
            </div>

            {(editableResume.experience || []).map((item, index) => (
              <motion.div className="builder-card" key={`generated-experience-${index}`} layout>
                <label className="field">
                  <span>Experience Title</span>
                  <input value={item.role} onChange={(event) => updateExperienceDraft(index, "role", event.target.value)} />
                </label>
                <label className="field">
                  <span>Experience Bullets</span>
                  <textarea
                    rows="4"
                    value={joinLineValues(item.points)}
                    onChange={(event) => updateExperienceDraft(index, "points", event.target.value)}
                  />
                </label>
              </motion.div>
            ))}

            {(editableResume.projects || []).map((item, index) => (
              <motion.div className="builder-card" key={`generated-project-${index}`} layout>
                <label className="field">
                  <span>Project Title</span>
                  <input value={item.title} onChange={(event) => updateProjectDraft(index, "title", event.target.value)} />
                </label>
                <label className="field">
                  <span>Project Bullets</span>
                  <textarea
                    rows="4"
                    value={joinLineValues(item.points)}
                    onChange={(event) => updateProjectDraft(index, "points", event.target.value)}
                  />
                </label>
              </motion.div>
            ))}

            <label className="field">
              <span>Education</span>
              <textarea
                rows="3"
                value={editableResume.education}
                onChange={(event) => updateGeneratedResume("education", event.target.value)}
              />
            </label>
          </article>

          <ResumePreview resume={editableResume} templateId={selectedTemplate} title="Live Final Preview" />
        </motion.section>
      ) : null}
      </AnimatePresence>
    </div>
  );
}

export default ResumeBuilderPage;
