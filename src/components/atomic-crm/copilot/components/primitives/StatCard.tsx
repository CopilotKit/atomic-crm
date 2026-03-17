import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  description?: string;
  trend?: "up" | "down" | "neutral";
  color?: string;
}

const trendIcons = {
  up: <TrendingUp className="h-3 w-3 text-green-500" />,
  down: <TrendingDown className="h-3 w-3 text-red-500" />,
  neutral: <Minus className="h-3 w-3 text-muted-foreground" />,
};

export function StatCard(props: StatCardProps) {
  const label = typeof props.label === "string" ? props.label : "";
  const value =
    typeof props.value === "string" || typeof props.value === "number"
      ? props.value
      : "";
  const description =
    typeof props.description === "string" ? props.description : undefined;
  const trend = typeof props.trend === "string" ? props.trend : undefined;
  const color = typeof props.color === "string" ? props.color : "";

  if (!label && !value) return null;

  return (
    <div className="rounded-md border p-3 text-center">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      {description && (
        <div className="text-xs text-muted-foreground mt-1">{description}</div>
      )}
      {trend && trendIcons[trend] && (
        <div className="flex justify-center mt-1">{trendIcons[trend]}</div>
      )}
    </div>
  );
}
