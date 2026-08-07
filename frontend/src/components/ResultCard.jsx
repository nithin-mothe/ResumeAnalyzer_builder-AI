import { AlertTriangle, CheckCircle2, Sparkles } from "lucide-react";

const toneIcons = {
  positive: CheckCircle2,
  warning: AlertTriangle,
  default: Sparkles,
};

function ResultCard({ title, items, description, tone = "default" }) {
  const Icon = toneIcons[tone] || toneIcons.default;

  return (
    <section className={`result-card result-card--${tone}`}>
      <div className="result-card__header">
        <span className="result-card__icon" aria-hidden="true">
          <Icon size={19} />
        </span>
        <h3>{title}</h3>
      </div>
      {description ? <p className="result-card__description">{description}</p> : null}
      {items?.length ? (
        <ul className="result-list">
          {items.map((item, index) => (
            <li key={`${title}-${index}`}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="muted">No items to show.</p>
      )}
    </section>
  );
}

export default ResultCard;
