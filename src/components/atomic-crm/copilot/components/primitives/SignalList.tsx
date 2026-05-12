import type { ReactNode } from "react";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";

interface Signal {
  text: string;
  severity: string;
}

interface SignalListProps {
  title: string;
  signals: Signal[];
}

const severityIcons: Record<string, ReactNode> = {
  high: <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />,
  medium: (
    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
  ),
  low: <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />,
  warning: (
    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
  ),
  info: <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />,
};

export function SignalList(props: SignalListProps) {
  const title = typeof props.title === "string" ? props.title : "";
  const signals = Array.isArray(props.signals) ? props.signals : [];

  if (signals.length === 0 && !title) return null;

  return (
    <div>
      {title && <div className="text-base font-semibold mb-2">{title}</div>}
      <ul className="space-y-1.5">
        {signals.map((signal, index) => {
          const text = typeof signal?.text === "string" ? signal.text : "";
          const severity =
            typeof signal?.severity === "string" ? signal.severity : "info";
          if (!text) return null;
          return (
            <li key={index} className="flex items-start gap-2 text-sm">
              {severityIcons[severity] ?? severityIcons.info}
              <span>{text}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
