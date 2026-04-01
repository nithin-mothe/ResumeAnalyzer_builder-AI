import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ChatWindow from "../components/ChatWindow";
import PageHero from "../components/PageHero";
import ResumePreview from "../components/ResumePreview";
import TemplateSelector from "../components/TemplateSelector";
import { buildResume, chatWithResume, generateResumePdf } from "../services/api";
import { hydrateGeneratedResume, resumeToChatContext, splitCommaValues, splitLineValues } from "../utils/resume";

const starterPrompts = [
  "Review my resume like a recruiter",
  "How can I tailor this for product companies?",
  "Rewrite my summary to sound more senior",
  "Help me prepare a Google-ready version",
];

function ResumeChatPage() {
  const [selectedTemplate, setSelectedTemplate] = useState(
    () => localStorage.getItem("selectedTemplateId") || "executive"
  );
  const [resumeText, setResumeText] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "I can help you improve your resume step by step. Ask for feedback, targeting help, or use the workspace panel to generate a new draft with a template.",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [generatedResume, setGeneratedResume] = useState(() => {
    const saved = localStorage.getItem("latestBuiltResume");
    return saved ? JSON.parse(saved) : null;
  });
  const [assistantDraft, setAssistantDraft] = useState(() => {
    const savedProfile = localStorage.getItem("latestResumeProfile");
    return savedProfile
      ? JSON.parse(savedProfile)
      : {
          name: "",
          email: "",
          phone: "",
          location: "",
          target_role: "",
          summary: "",
          education: "",
          languages: "",
          frameworks: "",
          tools: "",
          achievementsText: "",
          extra_notes: "",
        };
  });

  useEffect(() => {
    setResumeText(localStorage.getItem("latestResumeText") || "");
  }, []);

  useEffect(() => {
    localStorage.setItem("selectedTemplateId", selectedTemplate);
  }, [selectedTemplate]);

  const activeResumeContext = useMemo(() => {
    if (generatedResume) {
      return resumeToChatContext(generatedResume);
    }
    return resumeText;
  }, [generatedResume, resumeText]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const message = inputValue.trim();
    if (!message) {
      setError("Enter a message before sending.");
      return;
    }

    const history = [...messages];
    setMessages((current) => [...current, { role: "user", content: message }]);
    setInputValue("");
    setPending(true);
    setError("");

    try {
      const data = await chatWithResume({
        message,
        resume_text: activeResumeContext || null,
        history,
      });
      setMessages((current) => [...current, { role: "assistant", content: data.answer }]);
    } catch (chatError) {
      setError(chatError.message);
    } finally {
      setPending(false);
    }
  };

  const handleDraftFieldChange = (event) => {
    const { name, value } = event.target;
    setAssistantDraft((current) => ({ ...current, [name]: value }));
  };

  const handleGenerateFromChat = async () => {
    if (!assistantDraft.name.trim()) {
      setError("Add at least the candidate name before generating a resume.");
      return;
    }

    if (!assistantDraft.education.trim()) {
      setError("Add education details so the draft feels complete.");
      return;
    }

    setPending(true);
    setError("");

    try {
      const payload = {
        name: assistantDraft.name,
        email: assistantDraft.email || null,
        phone: assistantDraft.phone || null,
        location: assistantDraft.location || null,
        target_role: assistantDraft.target_role || null,
        summary: assistantDraft.summary || null,
        education: assistantDraft.education,
        extra_notes: assistantDraft.extra_notes || null,
        save_title: `${assistantDraft.name || "AI"} Resume Draft`,
        skills: {
          languages: splitCommaValues(assistantDraft.languages),
          frameworks: splitCommaValues(assistantDraft.frameworks),
          tools: splitCommaValues(assistantDraft.tools),
        },
        experience: assistantDraft.achievementsText.trim()
          ? [
              {
                role: assistantDraft.target_role || "Target Role",
                company: null,
                achievements: splitLineValues(assistantDraft.achievementsText),
              },
            ]
          : [],
        projects: [],
      };

      const data = await buildResume(payload);
      const hydrated = hydrateGeneratedResume(data.resume, assistantDraft);
      setGeneratedResume(hydrated);
      localStorage.setItem("latestBuiltResume", JSON.stringify(hydrated));
      localStorage.setItem("latestResumeProfile", JSON.stringify(assistantDraft));
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: `I generated a ${selectedTemplate} resume draft for ${
            assistantDraft.target_role || "your target role"
          }. Review the preview, download it if it looks good, or tell me what to change and I will help you refine it.`,
        },
      ]);
    } catch (generationError) {
      setError(generationError.message);
    } finally {
      setPending(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedResume) {
      return;
    }

    try {
      const blob = await generateResumePdf(generatedResume, selectedTemplate);
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${(generatedResume.name || "resume").replace(/\s+/g, "-").toLowerCase()}.pdf`;
      anchor.click();
      window.URL.revokeObjectURL(url);
    } catch (downloadError) {
      setError(downloadError.message);
    }
  };

  return (
    <div className="stack page-stack">
      <PageHero
        eyebrow="Resume Chat"
        title="Talk to the assistant like a collaborator, not a static help page."
        description="Ask follow-up questions, get more natural answers, generate a draft from the chat workspace, and keep iterating until the resume feels right."
        stats={[
          { value: generatedResume ? "Draft ready" : "No draft yet", label: "Resume status" },
          { value: "Live", label: "Conversation flow" },
          { value: "3", label: "Template choices" },
        ]}
      />

      <section className="chat-layout">
        <div className="chat-main-column">
          <ChatWindow
            messages={messages}
            pending={pending}
            onSubmit={handleSubmit}
            inputValue={inputValue}
            onInputChange={setInputValue}
            starterPrompts={starterPrompts}
            onStarterSelect={setInputValue}
          />

          {generatedResume ? (
            <section className="surface-card chat-generated-actions">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Generated in Chat</p>
                  <h2>Continue refining this resume</h2>
                </div>
                <div className="inline-actions">
                  <button className="primary-button" type="button" onClick={handleDownload}>
                    Download Resume
                  </button>
                  <Link className="secondary-button" to="/builder">
                    Edit in Builder
                  </Link>
                </div>
              </div>
              <p className="helper-text">
                If you do not like the draft, keep chatting. Ask for a stronger summary, sharper bullets, or a more
                senior tone and continue iterating.
              </p>
            </section>
          ) : null}
        </div>

        <aside className="chat-sidebar">
          <section className="surface-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Assistant Workspace</p>
                <h2>Generate a resume from chat</h2>
              </div>
            </div>
            <TemplateSelector selectedId={selectedTemplate} onSelect={setSelectedTemplate} compact />
            <div className="stack">
              <label className="field">
                <span>Name</span>
                <input name="name" value={assistantDraft.name || ""} onChange={handleDraftFieldChange} />
              </label>
              <label className="field">
                <span>Target Role</span>
                <input name="target_role" value={assistantDraft.target_role || ""} onChange={handleDraftFieldChange} />
              </label>
              <label className="field">
                <span>Email</span>
                <input name="email" value={assistantDraft.email || ""} onChange={handleDraftFieldChange} />
              </label>
              <label className="field">
                <span>Location</span>
                <input name="location" value={assistantDraft.location || ""} onChange={handleDraftFieldChange} />
              </label>
              <label className="field">
                <span>Current Summary</span>
                <textarea name="summary" rows="3" value={assistantDraft.summary || ""} onChange={handleDraftFieldChange} />
              </label>
              <label className="field">
                <span>Languages</span>
                <input name="languages" value={assistantDraft.languages || ""} onChange={handleDraftFieldChange} />
              </label>
              <label className="field">
                <span>Frameworks</span>
                <input name="frameworks" value={assistantDraft.frameworks || ""} onChange={handleDraftFieldChange} />
              </label>
              <label className="field">
                <span>Tools</span>
                <input name="tools" value={assistantDraft.tools || ""} onChange={handleDraftFieldChange} />
              </label>
              <label className="field">
                <span>Top Achievements</span>
                <textarea
                  name="achievementsText"
                  rows="4"
                  value={assistantDraft.achievementsText || ""}
                  onChange={handleDraftFieldChange}
                  placeholder="One line per achievement"
                />
              </label>
              <label className="field">
                <span>Education</span>
                <textarea name="education" rows="3" value={assistantDraft.education || ""} onChange={handleDraftFieldChange} />
              </label>
              <label className="field">
                <span>Extra Notes</span>
                <textarea
                  name="extra_notes"
                  rows="3"
                  value={assistantDraft.extra_notes || ""}
                  onChange={handleDraftFieldChange}
                  placeholder="Example: optimize for Google-style backend roles"
                />
              </label>
              <button className="primary-button" type="button" onClick={handleGenerateFromChat} disabled={pending}>
                {pending ? "Working..." : "Generate Resume with AI"}
              </button>
              {error ? <p className="error-text">{error}</p> : null}
            </div>
          </section>

          <section className="surface-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Context</p>
                <h2>Resume text used in chat</h2>
              </div>
            </div>
            <label className="field">
              <span>Resume Context</span>
              <textarea
                rows="8"
                value={resumeText}
                onChange={(event) => {
                  setResumeText(event.target.value);
                  localStorage.setItem("latestResumeText", event.target.value);
                }}
                placeholder="Paste your resume text if you want the assistant grounded in your existing resume."
              />
            </label>
          </section>
        </aside>
      </section>

      {generatedResume ? (
        <ResumePreview resume={generatedResume} templateId={selectedTemplate} title="Chat Draft Preview" />
      ) : null}
    </div>
  );
}

export default ResumeChatPage;
