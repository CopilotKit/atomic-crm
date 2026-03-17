import { Loader2, Check } from "lucide-react";

interface StatusLineProps {
  text: string;
  isActive: boolean;
}

export function StatusLine({ text, isActive }: StatusLineProps) {
  return (
    <div
      className={`flex items-center gap-2 text-sm transition-opacity ${
        isActive ? "opacity-100" : "opacity-50"
      }`}
    >
      {isActive ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground flex-shrink-0" />
      ) : (
        <Check className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
      )}
      <span className="text-muted-foreground">{text}</span>
    </div>
  );
}
