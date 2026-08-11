import { motion } from "framer-motion";
import { itemVariants, listVariants, motionTokens } from "./MotionSystem";

function TagList({ title, items = [], tone = "default" }) {
  return (
    <motion.section
      className="result-card"
      variants={itemVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.22 }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={motionTokens.spring}
    >
      <h3>{title}</h3>
      {items.length ? (
        <motion.div className="tag-list" variants={listVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          {items.map((item, index) => (
            <motion.span
              key={`${item}-${index}`}
              className={`tag-chip tag-chip--${tone}`}
              variants={itemVariants}
              whileHover={{ y: -2, scale: 1.03 }}
              transition={motionTokens.spring}
            >
              {item}
            </motion.span>
          ))}
        </motion.div>
      ) : (
        <motion.p className="muted empty-state-inline" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          No items to show.
        </motion.p>
      )}
    </motion.section>
  );
}

export default TagList;
