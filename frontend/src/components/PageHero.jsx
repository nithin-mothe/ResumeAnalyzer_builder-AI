import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { AnimatedCounter, itemVariants, listVariants, motionTokens } from "./MotionSystem";

function PageHero({ eyebrow, title, description, actions, stats = [] }) {
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 90, damping: 24, mass: 0.6 });
  const smoothY = useSpring(pointerY, { stiffness: 90, damping: 24, mass: 0.6 });
  const cardX = useTransform(smoothX, [-0.5, 0.5], [-12, 12]);
  const cardY = useTransform(smoothY, [-0.5, 0.5], [-10, 10]);
  const glowX = useTransform(smoothX, [-0.5, 0.5], ["18%", "82%"]);
  const glowY = useTransform(smoothY, [-0.5, 0.5], ["16%", "84%"]);

  const handlePointerMove = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - bounds.left) / bounds.width - 0.5);
    pointerY.set((event.clientY - bounds.top) / bounds.height - 0.5);
  };

  const handlePointerLeave = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <motion.section
      className="page-hero"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      initial={{ opacity: 0, y: 22, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={motionTokens.spring}
    >
      <motion.div className="page-hero__glow" style={{ "--hero-glow-x": glowX, "--hero-glow-y": glowY }} />
      <motion.div className="page-hero__copy" variants={listVariants} initial="hidden" animate="visible">
        <motion.p className="eyebrow" variants={itemVariants}>{eyebrow}</motion.p>
        <motion.h1 variants={itemVariants}>{title}</motion.h1>
        <motion.p className="page-hero__description" variants={itemVariants}>{description}</motion.p>
        {actions ? <div className="page-hero__actions">{actions}</div> : null}
      </motion.div>
      {stats.length ? (
        <motion.div className="page-hero__stats" variants={listVariants} initial="hidden" animate="visible">
          {stats.map((stat) => (
            <motion.article
              key={stat.label}
              className="mini-stat"
              variants={itemVariants}
              whileHover={{ y: -4, scale: 1.015 }}
              transition={motionTokens.spring}
            >
              <strong><AnimatedCounter value={stat.value} /></strong>
              <span>{stat.label}</span>
            </motion.article>
          ))}
        </motion.div>
      ) : null}
      <motion.div className="hero-visual" aria-hidden="true" style={{ x: cardX, y: cardY }}>
        <motion.div
          className="hero-resume-card"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="hero-resume-card__bar" />
          <span className="hero-resume-card__line hero-resume-card__line--wide" />
          <span className="hero-resume-card__line" />
          <span className="hero-resume-card__line hero-resume-card__line--short" />
          <div className="hero-resume-card__score">
            <motion.span
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 0.92 }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.25 }}
            >
              92
            </motion.span>
            <small>ATS</small>
          </div>
        </motion.div>
        <motion.span className="hero-particle hero-particle--one" animate={{ y: [0, -14, 0], opacity: [0.4, 1, 0.4] }} transition={{ duration: 4.2, repeat: Infinity }} />
        <motion.span className="hero-particle hero-particle--two" animate={{ x: [0, 12, 0], opacity: [0.3, 0.9, 0.3] }} transition={{ duration: 5.2, repeat: Infinity }} />
        <motion.span className="hero-particle hero-particle--three" animate={{ y: [0, 10, 0], opacity: [0.35, 0.75, 0.35] }} transition={{ duration: 4.7, repeat: Infinity }} />
      </motion.div>
    </motion.section>
  );
}

export default PageHero;
