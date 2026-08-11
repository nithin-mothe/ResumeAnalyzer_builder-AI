import { motion } from "framer-motion";
import { itemVariants, listVariants, motionTokens } from "./MotionSystem";
import { resumeTemplateMap } from "../data/resumeTemplates";

function ResumePreview({ resume, templateId = "executive", title = "Resume Preview" }) {
  const template = resumeTemplateMap[templateId] || resumeTemplateMap.executive;
  const contact = [
    resume?.contact?.email,
    resume?.contact?.phone,
    resume?.contact?.location,
    resume?.contact?.linkedin,
    resume?.contact?.website,
  ].filter(Boolean);
  const skillRows = [
    ["Languages", resume?.skills?.languages || []],
    ["Frameworks", resume?.skills?.frameworks || []],
    ["Tools", resume?.skills?.tools || []],
  ].filter(([, values]) => values.length);

  return (
    <motion.section
      className="preview-shell"
      initial={{ opacity: 0, y: 18, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={motionTokens.spring}
    >
      <div className="preview-shell__header">
        <div>
          <p className="eyebrow">{title}</p>
          <h3>{template.name}</h3>
        </div>
        <span className="template-badge" style={{ "--template-accent": template.accent }}>
          {template.shortLabel}
        </span>
      </div>

      <motion.article
        className={`resume-preview resume-preview--${templateId}`}
        variants={listVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.16 }}
        whileHover={{ y: -3 }}
        transition={motionTokens.spring}
      >
        <header className="resume-preview__header">
          <h2>{resume?.name ? resume.name.toUpperCase() : ""}</h2>
          <p className="resume-preview__headline">{resume?.headline}</p>
          {contact.length ? <p className="resume-preview__contact">{contact.join(" | ")}</p> : null}
        </header>

        <motion.section className="resume-preview__section" variants={itemVariants}>
          <h4>Summary</h4>
          <p>{resume?.summary}</p>
        </motion.section>

        <motion.section className="resume-preview__section" variants={itemVariants}>
          <h4>Skills</h4>
          <div className="skill-row-list">
            {skillRows.map(([label, values]) => (
              <div className="skill-row" key={label}>
                <strong>{label}:</strong>
                <span>{values.join(", ")}</span>
              </div>
            ))}
          </div>
        </motion.section>

        {!!resume?.experience?.length && (
          <motion.section className="resume-preview__section" variants={itemVariants}>
            <h4>Experience</h4>
            <div className="preview-item-list">
              {resume.experience.map((item, index) => (
                <article key={`${item.role}-${index}`} className="preview-item">
                  <h5>{item.role}</h5>
                  <ul>
                    {(item.points || []).map((point, pointIndex) => (
                      <li key={`${item.role}-${pointIndex}`}>{point}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </motion.section>
        )}

        {!!resume?.projects?.length && (
          <motion.section className="resume-preview__section" variants={itemVariants}>
            <h4>Projects</h4>
            <div className="preview-item-list">
              {resume.projects.map((item, index) => (
                <article key={`${item.title}-${index}`} className="preview-item">
                  <h5>{item.title}</h5>
                  <ul>
                    {(item.points || []).map((point, pointIndex) => (
                      <li key={`${item.title}-${pointIndex}`}>{point}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </motion.section>
        )}

        <motion.section className="resume-preview__section" variants={itemVariants}>
          <h4>Education</h4>
          <p>{resume?.education}</p>
        </motion.section>
      </motion.article>
    </motion.section>
  );
}

export default ResumePreview;
