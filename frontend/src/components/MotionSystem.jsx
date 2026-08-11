import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  animate,
  motion,
  MotionConfig,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { BrainCircuit, CheckCircle2, FileScan, Loader2, Sparkles } from "lucide-react";

export const motionTokens = {
  fast: 0.12,
  medium: 0.22,
  large: 0.4,
  page: 0.5,
  spring: {
    type: "spring",
    stiffness: 120,
    damping: 18,
    mass: 0.8,
  },
};

export const pageVariants = {
  initial: { opacity: 0, y: 18, scale: 0.985, filter: "blur(10px)" },
  animate: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, y: -10, scale: 0.99, filter: "blur(8px)" },
};

export const revealVariants = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};

export const listVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.04,
    },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

const MotionPreferenceContext = createContext(null);

export function MotionSystemProvider({ children }) {
  const prefersReducedMotion = useReducedMotion();
  const [animationsEnabled, setAnimationsEnabled] = useState(() => {
    const saved = localStorage.getItem("resumeForgeAnimations");
    return saved ? saved === "enabled" : true;
  });

  useEffect(() => {
    localStorage.setItem("resumeForgeAnimations", animationsEnabled ? "enabled" : "disabled");
  }, [animationsEnabled]);

  const value = useMemo(
    () => ({
      animationsEnabled,
      setAnimationsEnabled,
      prefersReducedMotion,
      motionOff: prefersReducedMotion || !animationsEnabled,
    }),
    [animationsEnabled, prefersReducedMotion]
  );

  return (
    <MotionPreferenceContext.Provider value={value}>
      <MotionConfig reducedMotion={value.motionOff ? "always" : "user"} transition={motionTokens.spring}>
        {children}
      </MotionConfig>
    </MotionPreferenceContext.Provider>
  );
}

export function useMotionSettings() {
  const context = useContext(MotionPreferenceContext);
  if (!context) {
    return {
      animationsEnabled: true,
      setAnimationsEnabled: () => {},
      prefersReducedMotion: false,
      motionOff: false,
    };
  }
  return context;
}

export function Reveal({ as = "section", className, children, delay = 0, once = true }) {
  const Component = motion[as] || motion.section;

  return (
    <Component
      className={className}
      variants={revealVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.18 }}
      transition={{ ...motionTokens.spring, delay }}
    >
      {children}
    </Component>
  );
}

export function AnimatedCounter({ value, className }) {
  const numericValue = Number(value);
  const isNumeric = Number.isFinite(numericValue);
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString());

  useEffect(() => {
    if (!isNumeric) {
      return undefined;
    }

    const controls = animate(count, numericValue, {
      duration: motionTokens.large,
      ease: "easeOut",
    });

    return controls.stop;
  }, [count, isNumeric, numericValue]);

  if (!isNumeric) {
    return <span className={className}>{value}</span>;
  }

  return <motion.span className={className}>{rounded}</motion.span>;
}

const defaultStages = [
  "Reading Resume...",
  "Understanding Skills...",
  "Calculating ATS...",
  "Generating Suggestions...",
  "Almost Done...",
];

const processingIcons = {
  scan: FileScan,
  brain: BrainCircuit,
  success: CheckCircle2,
  default: Sparkles,
};

export function AiProcessingPanel({
  title = "ResumeForge AI is working",
  stages = defaultStages,
  tone = "default",
  compact = false,
}) {
  const [activeStage, setActiveStage] = useState(0);
  const Icon = processingIcons[tone] || processingIcons.default;
  const progress = Math.round(((activeStage + 1) / stages.length) * 100);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActiveStage((current) => (current + 1) % stages.length);
    }, 1150);

    return () => window.clearInterval(id);
  }, [stages.length]);

  return (
    <motion.div
      className={`ai-processing ${compact ? "ai-processing--compact" : ""}`}
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={motionTokens.spring}
      role="status"
      aria-live="polite"
    >
      <div className="ai-processing__orb" aria-hidden="true">
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />
        <Icon size={compact ? 18 : 23} />
      </div>
      <div className="ai-processing__content">
        <div className="ai-processing__header">
          <strong>{title}</strong>
          <span>{progress}%</span>
        </div>
        <div className="ai-stage-list">
          {stages.map((stage, index) => (
            <motion.span
              key={stage}
              className={index === activeStage ? "ai-stage ai-stage--active" : "ai-stage"}
              animate={{ opacity: index === activeStage ? 1 : 0.45, x: index === activeStage ? 2 : 0 }}
            >
              {index === activeStage ? <Loader2 size={14} aria-hidden="true" /> : null}
              {stage}
            </motion.span>
          ))}
        </div>
        <div className="ai-progress-track" aria-hidden="true">
          <motion.span
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ ...motionTokens.spring, damping: 22 }}
          />
        </div>
      </div>
    </motion.div>
  );
}

export function SuccessBurst({ active }) {
  if (!active) {
    return null;
  }

  return (
    <motion.span className="success-burst" aria-hidden="true">
      {Array.from({ length: 10 }).map((_, index) => (
        <motion.i
          key={index}
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0.4],
            x: Math.cos(index) * 34,
            y: Math.sin(index) * 30,
          }}
          transition={{ duration: 0.8, delay: index * 0.02 }}
        />
      ))}
    </motion.span>
  );
}
