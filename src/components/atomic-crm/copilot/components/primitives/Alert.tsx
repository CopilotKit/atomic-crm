interface AlertProps {
  message: string;
  severity: "high" | "medium" | "low" | "info";
}

const severityStyles: Record<
  string,
  { bg: string; border: string; text: string }
> = {
  high: {
    bg: "bg-red-50 dark:bg-red-950/20",
    border: "border-red-200 dark:border-red-800",
    text: "text-red-700 dark:text-red-400",
  },
  medium: {
    bg: "bg-yellow-50 dark:bg-yellow-950/20",
    border: "border-yellow-200 dark:border-yellow-800",
    text: "text-yellow-700 dark:text-yellow-400",
  },
  low: {
    bg: "bg-green-50 dark:bg-green-950/20",
    border: "border-green-200 dark:border-green-800",
    text: "text-green-700 dark:text-green-400",
  },
  info: {
    bg: "bg-blue-50 dark:bg-blue-950/20",
    border: "border-blue-200 dark:border-blue-800",
    text: "text-blue-700 dark:text-blue-400",
  },
};

export function Alert(props: AlertProps) {
  const message = typeof props.message === "string" ? props.message : "";
  const severity = typeof props.severity === "string" ? props.severity : "info";
  const styles = severityStyles[severity] ?? severityStyles.info;

  if (!message) return null;

  return (
    <div
      className={`rounded-md border px-3 py-2 text-sm ${styles.bg} ${styles.border} ${styles.text}`}
    >
      {message}
    </div>
  );
}
