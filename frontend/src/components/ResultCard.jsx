import { AlertTriangle, CheckCircle2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { itemVariants, listVariants, motionTokens } from "./MotionSystem";

const toneIcons = {
  positive: CheckCircle2,
  warning: AlertTriangle,
  default: Sparkles,
};

function ResultCard({ title, items, description, tone = "default" }) {
  const Icon = toneIcons[tone] || toneIcons.default;

  return (
    <motion.section
      className={`result-card result-card--${tone}`}
      variants={itemVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.22 }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={motionTokens.spring}
    >
      <div className="result-card__header">
        <motion.span
          className="result-card__icon"
          aria-hidden="true"
          initial={{ scale: 0.8, rotate: -8 }}
          whileInView={{ scale: 1, rotate: 0 }}
          transition={motionTokens.spring}
        >
          <Icon size={19} />
        </motion.span>
        <h3>{title}</h3>
      </div>
      {description ? <p className="result-card__description">{description}</p> : null}
      {items?.length ? (
        <motion.ul className="result-list" variants={listVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          {items.map((item, index) => (
            <motion.li key={`${title}-${index}`} variants={itemVariants}>{item}</motion.li>
          ))}
        </motion.ul>
      ) : (
        <motion.p className="muted empty-state-inline" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          No items to show.
        </motion.p>
      )}
    </motion.section>
  );
}

export default ResultCard;
