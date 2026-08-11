import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BriefcaseBusiness,
  FileSearch,
  FileText,
  MessageSquareText,
  SearchCheck,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { itemVariants, listVariants, motionTokens, Reveal } from "../components/MotionSystem";
import PageHero from "../components/PageHero";

const featureCards = [
  {
    title: "Resume Analyzer",
    Icon: FileSearch,
    description: "Score your resume, catch weak spots, and get clear improvements without guessing what to fix.",
  },
  {
    title: "ATS Match Engine",
    Icon: SearchCheck,
    description: "Paste a full job description or a short skill list and instantly see what you are matching or missing.",
  },
  {
    title: "Template Builder",
    Icon: FileText,
    description: "Generate a polished, ATS-ready resume and preview it in multiple recruiter-friendly templates.",
  },
  {
    title: "Company Redesign",
    Icon: WandSparkles,
    description: "Tailor an existing resume to one company's expectations without starting from scratch.",
  },
  {
    title: "Resume Chat",
    Icon: MessageSquareText,
    description: "Work with the assistant like a conversation, refine drafts, and keep improving until the resume feels right.",
  },
  {
    title: "Job Tracker",
    Icon: BriefcaseBusiness,
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
              <Sparkles size={18} aria-hidden="true" />
              Start with Analyzer
            </Link>
            <Link className="secondary-button" to="/builder">
              <FileText size={18} aria-hidden="true" />
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

      <Reveal className="home-highlight-grid">
        <motion.article className="feature-spotlight feature-spotlight--dark" whileHover={{ y: -5 }} transition={motionTokens.spring}>
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
        </motion.article>

        <motion.article className="feature-spotlight" whileHover={{ y: -5 }} transition={motionTokens.spring}>
          <p className="eyebrow">Who it serves</p>
          <h2>Friendly for beginners, credible for senior candidates.</h2>
          <p>
            The UI explains what matters, why it matters, and how to improve. That helps first-time users move fast
            while still giving experienced candidates the polish they expect.
          </p>
          <Link className="inline-link" to="/chat">
            Try Resume Chat
          </Link>
        </motion.article>
      </Reveal>

      <motion.section className="feature-grid" variants={listVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.14 }}>
        {featureCards.map((card) => {
          const Icon = card.Icon;
          return (
            <motion.article
              key={card.title}
              className="surface-card feature-card"
              variants={itemVariants}
              whileHover={{ y: -6, scale: 1.012 }}
              transition={motionTokens.spring}
            >
              <span className="feature-card__icon" aria-hidden="true">
                <Icon size={21} />
              </span>
              <p className="eyebrow">Feature</p>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              <span className="feature-card__link">
                Explore <ArrowRight size={15} aria-hidden="true" />
              </span>
            </motion.article>
          );
        })}
      </motion.section>

      <Reveal className="surface-card workflow-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">How It Works</p>
            <h2>One clear flow from resume draft to final download</h2>
          </div>
        </div>
        <div className="workflow-grid">
          {steps.map((step, index) => (
            <motion.article
              key={step}
              className="workflow-step"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ ...motionTokens.spring, delay: index * 0.045 }}
              whileHover={{ y: -4 }}
            >
              <span className="workflow-step__index">0{index + 1}</span>
              <p>{step}</p>
            </motion.article>
          ))}
        </div>
      </Reveal>
    </div>
  );
}

export default Home;
