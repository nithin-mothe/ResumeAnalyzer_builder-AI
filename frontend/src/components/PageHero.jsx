function PageHero({ eyebrow, title, description, actions, stats = [] }) {
  return (
    <section className="page-hero">
      <div className="page-hero__copy">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="page-hero__description">{description}</p>
        {actions ? <div className="page-hero__actions">{actions}</div> : null}
      </div>
      {stats.length ? (
        <div className="page-hero__stats">
          {stats.map((stat) => (
            <article key={stat.label} className="mini-stat">
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export default PageHero;

