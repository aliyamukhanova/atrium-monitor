interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
}

export default function StatCard({
  title,
  value,
  unit,
}: StatCardProps) {
  return (
    <article className="stat-card">
      <p className="card-label">{title}</p>

      <p className="stat-value">
        {value}
        {unit && <span className="stat-unit">{unit}</span>}
      </p>
    </article>
  );
}