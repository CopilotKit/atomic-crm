import { AlertTriangle, CheckCircle, Info, Circle } from "lucide-react";

interface BulletListProps {
  items: string[];
  icon?: "warning" | "check" | "info" | "dot";
}

const iconMap = {
  warning: (
    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
  ),
  check: (
    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
  ),
  info: <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />,
  dot: (
    <Circle className="h-2 w-2 text-muted-foreground mt-1.5 flex-shrink-0 fill-current" />
  ),
};

export function BulletList(props: BulletListProps) {
  const items = Array.isArray(props.items) ? props.items : [];
  const icon = typeof props.icon === "string" ? props.icon : "dot";
  const iconElement = iconMap[icon] ?? iconMap.dot;

  if (items.length === 0) return null;

  return (
    <ul className="space-y-1.5">
      {items.map((item, index) => {
        const text = typeof item === "string" ? item : "";
        if (!text) return null;
        return (
          <li key={index} className="flex items-start gap-2 text-sm">
            {iconElement}
            <span>{text}</span>
          </li>
        );
      })}
    </ul>
  );
}
