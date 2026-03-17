import { StatCard } from "./StatCard";

interface Metric {
  label: string;
  value: string | number;
  description?: string;
  color?: string;
}

interface MetricRowProps {
  metrics: Metric[];
}

export function MetricRow(props: MetricRowProps) {
  const metrics = Array.isArray(props.metrics) ? props.metrics : [];

  if (metrics.length === 0) return null;

  return (
    <div
      className="grid gap-2"
      style={{
        gridTemplateColumns: `repeat(${Math.min(metrics.length, 6)}, minmax(0, 1fr))`,
      }}
    >
      {metrics.map((metric, index) => {
        if (typeof metric !== "object" || metric === null) return null;
        return (
          <StatCard
            key={index}
            label={typeof metric.label === "string" ? metric.label : ""}
            value={
              typeof metric.value === "string" ||
              typeof metric.value === "number"
                ? metric.value
                : ""
            }
            description={
              typeof metric.description === "string"
                ? metric.description
                : undefined
            }
            color={typeof metric.color === "string" ? metric.color : undefined}
          />
        );
      })}
    </div>
  );
}
