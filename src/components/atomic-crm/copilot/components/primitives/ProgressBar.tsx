interface ProgressBarProps {
  label: string;
  value: number;
  color?: string;
}

export function ProgressBar(props: ProgressBarProps) {
  const label = typeof props.label === "string" ? props.label : "";
  const value =
    typeof props.value === "number"
      ? Math.min(100, Math.max(0, props.value))
      : 0;
  const color = typeof props.color === "string" ? props.color : "";

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className={`font-medium ${color}`}>{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full bg-current ${color || "text-primary"}`}
          style={{ width: `${value}%`, transition: "width 0.3s ease" }}
        />
      </div>
    </div>
  );
}
