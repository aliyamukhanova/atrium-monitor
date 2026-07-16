interface ComfortCardProps {
  score: number;
  status: string;
}

function getComfortClass(score: number): string {
  if (score >= 90) {
    return "comfort-excellent";
  }

  if (score >= 70) {
    return "comfort-good";
  }

  if (score >= 40) {
    return "comfort-fair";
  }

  return "comfort-poor";
}

export default function ComfortCard({
  score,
  status,
}: ComfortCardProps) {
  const comfortClass = getComfortClass(score);

  return (
    <article className={`comfort-card ${comfortClass}`}>
      <div>
        <p className="card-label">Current Comfort Score</p>
        <h2>{status}</h2>
        <p className="comfort-description">
          Based on temperature, noise, and brightness.
        </p>
      </div>

      <div className="comfort-score-circle">
        <span>{score}</span>
        <small>/ 100</small>
      </div>
    </article>
  );
}