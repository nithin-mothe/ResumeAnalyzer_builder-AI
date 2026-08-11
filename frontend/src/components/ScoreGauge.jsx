import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import { motionTokens } from "./MotionSystem";

function ScoreGauge({ label, score }) {
  const safeScore = Math.max(0, Math.min(100, Number(score) || 0));
  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (safeScore / 100) * circumference;
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const tier =
    safeScore >= 85 ? "Excellent" : safeScore >= 70 ? "Strong" : safeScore >= 55 ? "Needs Work" : "Weak";

  useEffect(() => {
    const controls = animate(count, safeScore, {
      duration: 0.9,
      ease: "easeOut",
    });

    return controls.stop;
  }, [count, safeScore]);

  return (
    <motion.div
      className="score-gauge"
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={motionTokens.spring}
    >
      <motion.div className="score-gauge__ring" whileHover={{ scale: 1.025 }}>
        <svg width="160" height="160" viewBox="0 0 140 140">
          <circle className="gauge-track" cx="70" cy="70" r="52" />
          <motion.circle
            className="gauge-fill"
            cx="70"
            cy="70"
            r="52"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            style={{ strokeDasharray: circumference }}
          />
        </svg>
        <motion.div className="gauge-number">{rounded}</motion.div>
        {safeScore >= 85 ? <span className="gauge-celebration" aria-hidden="true" /> : null}
      </motion.div>
      <div className="gauge-meta">
        <span>{label}</span>
        <small>{tier}</small>
      </div>
    </motion.div>
  );
}

export default ScoreGauge;
