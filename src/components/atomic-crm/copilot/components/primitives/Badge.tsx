interface BadgeProps {
  text: string;
  variant: "success" | "warning" | "danger" | "neutral";
}

const variantStyles: Record<string, string> = {
  success:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  warning:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  danger: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  neutral: "bg-muted text-muted-foreground",
};

export function Badge(props: BadgeProps) {
  const text = typeof props.text === "string" ? props.text : "";
  const variant = typeof props.variant === "string" ? props.variant : "neutral";
  const styles = variantStyles[variant] ?? variantStyles.neutral;

  if (!text) return null;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles}`}
    >
      {text}
    </span>
  );
}
