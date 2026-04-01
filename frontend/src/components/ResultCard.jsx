function ResultCard({ title, items, description, tone = "default" }) {
  return (
    <section className={`result-card result-card--${tone}`}>
      <h3>{title}</h3>
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

