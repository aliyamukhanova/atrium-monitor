interface RecommendationCardProps {
  time: string;
  location: string;
  score?: number;
}

function formatLocation(location: string): string {
  if (location.toLowerCase() === "atrium") {
    return "NU Atrium";
  }

  if (location.toLowerCase() === "outside") {
    return "Outside NU";
  }

  return location;
}

export default function RecommendationCard({
  time,
  location,
  score,
}: RecommendationCardProps) {
  return (
    <article className="recommendation-card">
      <div className="recommendation-icon">📚</div>

      <div>
        <p className="card-label">Best Study Period</p>
        <h2>{time}</h2>

        <p className="recommendation-location">
          Recommended place:{" "}
          <strong>{formatLocation(location)}</strong>
        </p>

        {score !== undefined && (
          <p className="recommendation-score">
            Expected comfort score: {score}/100
          </p>
        )}
      </div>
    </article>
  );
}