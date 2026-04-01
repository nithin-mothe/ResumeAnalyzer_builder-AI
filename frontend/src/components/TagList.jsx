function TagList({ title, items = [], tone = "default" }) {
  return (
    <section className="result-card">
      <h3>{title}</h3>
      {items.length ? (
        <div className="tag-list">
          {items.map((item, index) => (
            <span key={`${item}-${index}`} className={`tag-chip tag-chip--${tone}`}>
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="muted">No items to show.</p>
      )}
    </section>
  );
}

export default TagList;
