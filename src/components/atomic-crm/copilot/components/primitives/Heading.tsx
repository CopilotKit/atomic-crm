interface HeadingProps {
  text: string;
  level: 1 | 2 | 3;
}

const levelClasses: Record<number, string> = {
  1: "text-lg font-semibold",
  2: "text-base font-semibold",
  3: "text-sm font-semibold",
};

export function Heading(props: HeadingProps) {
  const text = typeof props.text === "string" ? props.text : "";
  const level = typeof props.level === "number" ? props.level : 2;
  if (!text) return null;
  return <div className={levelClasses[level] ?? levelClasses[2]}>{text}</div>;
}
