import { BarChart3 } from "lucide-react";

export function TrendChart({
  title,
  subtitle,
  labels,
  series,
  colors,
}: {
  title: string;
  subtitle: string;
  labels: string[];
  series: { name: string; values: number[] }[];
  colors: string[];
}) {
  const max = Math.max(1, ...series.flatMap(item => item.values));
  return (
    <article className="trend-chart-card">
      <div className="trend-chart-head">
        <div>
          <span className="eyebrow">
            <BarChart3 size={13} /> Visual analytics
          </span>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
        <div className="trend-legend">
          {series.map((item, index) => (
            <span key={item.name}>
              <i style={{ background: colors[index] }} />
              {item.name}
            </span>
          ))}
        </div>
      </div>
      <div
        className="trend-chart"
        role="img"
        aria-label={`${title}: ${series.map(item => `${item.name} ${item.values.join(", ")}`).join("; ")}`}
      >
        {labels.map((label, index) => (
          <div className="trend-column" key={label}>
            <div className="trend-bars">
              {series.map((item, seriesIndex) => (
                <span
                  key={item.name}
                  title={`${item.name}: ${item.values[index]}`}
                  style={{
                    height: `${Math.max(8, (item.values[index] / max) * 100)}%`,
                    background: colors[seriesIndex],
                  }}
                />
              ))}
            </div>
            <strong>{label}</strong>
          </div>
        ))}
      </div>
    </article>
  );
}
