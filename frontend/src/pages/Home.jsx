import { Link } from "react-router-dom";
import PageHero from "../components/PageHero";

const featureCards = [
  {
    title: "Resume Analyzer",
    description: "Score your resume, catch weak spots, and get clear improvements without guessing what to fix.",
  },
  {
    title: "ATS Match Engine",
    description: "Paste a full job description or a short skill list and instantly see what you are matching or missing.",
  },
  {
    title: "Template Builder",
    description: "Generate a polished, ATS-ready resume and preview it in multiple recruiter-friendly templates.",
  },
  {
    title: "Company Redesign",
    description: "Tailor an existing resume to one company’s expectations without starting from scratch.",
  },
  {
    title: "Resume Chat",
    description: "Work with the assistant like a conversation, refine drafts, and keep improving until the resume feels right.",
  },
  {
    title: "Job Tracker",
    description: "Track applications, follow-up dates, interview stages, and notes in one organized workflow.",
  },
];

const steps = [
  "Upload or paste your resume content and get a clean quality score.",
  "Compare your resume against a target job and understand the gap clearly.",
  "Choose a template, generate a stronger draft, and edit it live before download.",
  "Redesign the same resume for a company-specific opportunity when needed.",
  "Use Resume Chat to refine tone, targeting, and final polish like a real collaboration.",
  "Track the application afterward so you never lose the follow-up timeline.",
];

function Home({ session }) {
  return (
    <div className="stack page-stack">
      <PageHero
        eyebrow="AI Resume Platform"
        title="Build resumes that feel sharper, cleaner, and more ready for serious hiring teams."
        description="ResumeForge AI gives you a guided workflow from analysis to ATS alignment to final PDF export. The experience is designed to be beginner-friendly, but polished enough for senior engineers and ambitious candidates."
        actions={
          <>
            <Link className="primary-button" to="/analyzer">
              Start with Analyzer
            </Link>
            <Link className="secondary-button" to="/builder">
              Open Resume Builder
            </Link>
          </>
        }
        stats={[
          { value: "4", label: "Core workflows" },
          { value: "3", label: "Resume templates" },
          { value: session?.user ? "On" : "Ready", label: "Auth status" },
        ]}
      />

      <section className="home-highlight-grid">
        <article className="feature-spotlight feature-spotlight--dark">
          <p className="eyebrow">Why it feels better</p>
          <h2>Less guesswork. More guided progress.</h2>
          <p>
            Every page is built around clear actions, readable results, and stronger visual hierarchy so users know
            what to do next without feeling lost.
          </p>
          <div className="check-list">
            <span>Cleaner score layouts</span>
            <span>Better upload and action buttons</span>
            <span>Live resume preview before download</span>
            <span>Chat-driven revision workflow</span>
          </div>
        </article>

        <article className="feature-spotlight">
          <p className="eyebrow">Who it serves</p>
          <h2>Friendly for beginners, credible for senior candidates.</h2>
          <p>
            The UI explains what matters, why it matters, and how to improve. That helps first-time users move fast
            while still giving experienced candidates the polish they expect.
          </p>
          <Link className="inline-link" to="/chat">
            Try Resume Chat
          </Link>
        </article>
      </section>

      <section className="feature-grid">
        {featureCards.map((card) => (
          <article key={card.title} className="surface-card feature-card">
            <p className="eyebrow">Feature</p>
            <h3>{card.title}</h3>
            <p>{card.description}</p>
          </article>
        ))}
      </section>

      <section className="surface-card workflow-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">How It Works</p>
            <h2>One clear flow from resume draft to final download</h2>
          </div>
        </div>
        <div className="workflow-grid">
          {steps.map((step, index) => (
            <article key={step} className="workflow-step">
              <span className="workflow-step__index">0{index + 1}</span>
              <p>{step}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
