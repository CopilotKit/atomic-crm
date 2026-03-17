interface RiskSectionProps {
  title: string;
  items: string[];
  severity: "high" | "medium" | "low";
}

const severityStyles: Record<string, { heading: string; dot: string }> = {
  high: { heading: "text-red-600 dark:text-red-400", dot: "bg-red-500" },
  medium: {
    heading: "text-yellow-600 dark:text-yellow-400",
    dot: "bg-yellow-500",
  },
  low: { heading: "text-green-600 dark:text-green-400", dot: "bg-green-500" },
};

export function RiskSection(props: RiskSectionProps) {
  const title = typeof props.title === "string" ? props.title : "";
  const items = Array.isArray(props.items) ? props.items : [];
  const severity = typeof props.severity === "string" ? props.severity : "low";
  const styles = severityStyles[severity] ?? severityStyles.low;

  if (items.length === 0) return null;

  return (
    <div className="mb-3">
      {title && (
        <div className={`text-sm font-semibold mb-1 ${styles.heading}`}>
          {title}
        </div>
      )}
      <ul className="space-y-1">
        {items.map((item, index) => {
          const text = typeof item === "string" ? item : "";
          if (!text) return null;
          return (
            <li key={index} className="flex items-start gap-2 text-sm">
              <span
                className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${styles.dot}`}
              />
              <span>{text}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
