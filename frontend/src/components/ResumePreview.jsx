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

  return (
    <section className="preview-shell">
      <div className="preview-shell__header">
        <div>
          <p className="eyebrow">{title}</p>
          <h3>{template.name}</h3>
        </div>
        <span className="template-badge" style={{ "--template-accent": template.accent }}>
          {template.shortLabel}
        </span>
      </div>

      <article className={`resume-preview resume-preview--${templateId}`}>
        <header className="resume-preview__header">
          <h2>{resume?.name}</h2>
          <p className="resume-preview__headline">{resume?.headline}</p>
          {contact.length ? <p className="resume-preview__contact">{contact.join(" | ")}</p> : null}
        </header>

        <section className="resume-preview__section">
          <h4>Summary</h4>
          <p>{resume?.summary}</p>
        </section>

        <section className="resume-preview__section">
          <h4>Skills</h4>
          <div className="skill-pill-row">
            {(resume?.skills?.languages || []).map((item) => (
              <span key={`lang-${item}`} className="skill-pill">
                {item}
              </span>
            ))}
            {(resume?.skills?.frameworks || []).map((item) => (
              <span key={`framework-${item}`} className="skill-pill">
                {item}
              </span>
            ))}
            {(resume?.skills?.tools || []).map((item) => (
              <span key={`tool-${item}`} className="skill-pill">
                {item}
              </span>
            ))}
          </div>
        </section>

        {!!resume?.experience?.length && (
          <section className="resume-preview__section">
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
          </section>
        )}

        {!!resume?.projects?.length && (
          <section className="resume-preview__section">
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
          </section>
        )}

        <section className="resume-preview__section">
          <h4>Education</h4>
          <p>{resume?.education}</p>
        </section>
      </article>
    </section>
  );
}

export default ResumePreview;

