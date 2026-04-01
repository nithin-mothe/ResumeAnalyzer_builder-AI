import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHero from "../components/PageHero";
import ResumePreview from "../components/ResumePreview";
import TemplateSelector from "../components/TemplateSelector";
import { buildResume, generateResumePdf } from "../services/api";
import {
  buildResumePayload,
  createPreviewResume,
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
  const [editableResume, setEditableResume] = useState(() => {
    const saved = localStorage.getItem("latestBuiltResume");
    return saved ? JSON.parse(saved) : null;
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  const previewResume = editableResume || createPreviewResume(form);

  return (
    <div className="stack page-stack">
      <PageHero
        eyebrow="AI Resume Builder"
        title="Choose a template, generate a stronger draft, and edit it live before download."
        description="This builder now gives you templates, live preview, editable output, and a cleaner workflow that feels closer to a real production resume studio."
        stats={[
          { value: "3", label: "Template options" },
          { value: editableResume ? "Ready" : "Draft", label: "Preview state" },
          { value: editableResume?.experience?.length || 0, label: "Experience sections" },
        ]}
      />

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
                Add Experience
              </button>
            </div>
            {form.experience.map((item, index) => (
              <div className="builder-card" key={`experience-${index}`}>
                <div className="builder-card__header">
                  <strong>Experience #{index + 1}</strong>
                  {form.experience.length > 1 ? (
                    <button type="button" className="ghost-button" onClick={() => removeExperience(index)}>
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
              </div>
            ))}
          </div>

          <div className="builder-section">
            <div className="section-heading">
              <h3>Projects</h3>
              <button type="button" className="secondary-button" onClick={addProject}>
                Add Project
              </button>
            </div>
            {form.projects.map((item, index) => (
              <div className="builder-card" key={`project-${index}`}>
                <div className="builder-card__header">
                  <strong>Project #{index + 1}</strong>
                  {form.projects.length > 1 ? (
                    <button type="button" className="ghost-button" onClick={() => removeProject(index)}>
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
              </div>
            ))}
          </div>

          {error ? <p className="error-text">{error}</p> : null}
        </form>

        <div className="builder-preview-column">
          <ResumePreview
            resume={previewResume}
            templateId={selectedTemplate}
            title={editableResume ? "Generated Preview" : "Template Preview"}
          />
          <div className="surface-card preview-tip-card">
            <p className="eyebrow">Why this is better now</p>
            <h3>Preview before you commit</h3>
            <p>
              The preview updates with your selected template, so you can judge structure, clarity, and presentation
              before downloading the final PDF.
            </p>
          </div>
        </div>
      </section>

      {editableResume ? (
        <section className="builder-output-layout">
          <article className="surface-card builder-editor-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Step 3</p>
                <h2>Edit your generated draft</h2>
              </div>
              <div className="inline-actions">
                <button className="primary-button" type="button" onClick={handleDownloadPdf}>
                  Download PDF
                </button>
                <Link className="secondary-button" to="/chat">
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
              <div className="builder-card" key={`generated-experience-${index}`}>
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
              </div>
            ))}

            {(editableResume.projects || []).map((item, index) => (
              <div className="builder-card" key={`generated-project-${index}`}>
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
              </div>
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
        </section>
      ) : null}
    </div>
  );
}

export default ResumeBuilderPage;
