function ScoreGauge({ label, score }) {
  const safeScore = Math.max(0, Math.min(100, Number(score) || 0));
  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (safeScore / 100) * circumference;
  const tier =
    safeScore >= 85 ? "Excellent" : safeScore >= 70 ? "Strong" : safeScore >= 55 ? "Needs Work" : "Weak";

  return (
    <div className="score-gauge">
      <div className="score-gauge__ring">
        <svg width="160" height="160" viewBox="0 0 140 140">
          <circle className="gauge-track" cx="70" cy="70" r="52" />
          <circle
            className="gauge-fill"
            cx="70"
            cy="70"
            r="52"
            style={{ strokeDasharray: circumference, strokeDashoffset: offset }}
          />
        </svg>
        <div className="gauge-number">{safeScore}</div>
      </div>
      <div className="gauge-meta">
        <span>{label}</span>
        <small>{tier}</small>
      </div>
    </div>
  );
}

export default ScoreGauge;
