import { BadgeCheck } from "lucide-react";
import { motion } from "framer-motion";
import { itemVariants, listVariants, motionTokens } from "./MotionSystem";
import { resumeTemplates } from "../data/resumeTemplates";

function TemplateSelector({ selectedId, onSelect, compact = false }) {
  return (
    <motion.div
      className={`template-grid ${compact ? "template-grid--compact" : ""}`}
      variants={listVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {resumeTemplates.map((template) => {
        const active = template.id === selectedId;
        return (
          <motion.button
            key={template.id}
            type="button"
            className={`template-card ${active ? "template-card--active" : ""}`}
            onClick={() => onSelect(template.id)}
            style={{ "--template-accent": template.accent }}
            variants={itemVariants}
            whileHover={{ y: -5, rotateX: 1.5, rotateY: -1.5 }}
            whileTap={{ scale: 0.985 }}
            transition={motionTokens.spring}
          >
            <span className="template-card__label">
              <BadgeCheck size={16} aria-hidden="true" />
              {template.shortLabel}
            </span>
            <h3>{template.name}</h3>
            <p>{template.description}</p>
            <span className="template-card__meta">{template.bestFor}</span>
            {active ? <motion.span className="template-card__active-ring" layoutId="template-active-ring" /> : null}
          </motion.button>
        );
      })}
    </motion.div>
  );
}

export default TemplateSelector;
