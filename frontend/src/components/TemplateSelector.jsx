import { resumeTemplates } from "../data/resumeTemplates";

function TemplateSelector({ selectedId, onSelect, compact = false }) {
  return (
    <div className={`template-grid ${compact ? "template-grid--compact" : ""}`}>
      {resumeTemplates.map((template) => {
        const active = template.id === selectedId;
        return (
          <button
            key={template.id}
            type="button"
            className={`template-card ${active ? "template-card--active" : ""}`}
            onClick={() => onSelect(template.id)}
            style={{ "--template-accent": template.accent }}
          >
            <span className="template-card__label">{template.shortLabel}</span>
            <h3>{template.name}</h3>
            <p>{template.description}</p>
            <span className="template-card__meta">{template.bestFor}</span>
          </button>
        );
      })}
    </div>
  );
}

export default TemplateSelector;

