interface Entry {
  key: string;
  value: string;
}

interface Side {
  label: string;
  entries: Entry[];
}

interface ComparisonCardProps {
  title: string;
  before: Side;
  after: Side;
}

function safeSide(side: unknown): Side {
  if (typeof side !== "object" || side === null || Array.isArray(side)) {
    return { label: "", entries: [] };
  }
  const s = side as Record<string, unknown>;
  return {
    label: typeof s.label === "string" ? s.label : "",
    entries: Array.isArray(s.entries) ? s.entries : [],
  };
}

function SideColumn({ side, highlight }: { side: Side; highlight?: boolean }) {
  return (
    <div className={`rounded-md border p-3 ${highlight ? "bg-muted/30" : ""}`}>
      {side.label && (
        <div className="text-sm font-medium text-muted-foreground mb-2">
          {side.label}
        </div>
      )}
      <div className="space-y-1">
        {side.entries.map((entry, index) => {
          const key = typeof entry?.key === "string" ? entry.key : "";
          const value = typeof entry?.value === "string" ? entry.value : "";
          if (!key) return null;
          return (
            <div key={index} className="text-sm">
              <span className="text-muted-foreground">{key}: </span>
              <span
                className={`font-medium ${highlight ? "text-green-500" : ""}`}
              >
                {value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ComparisonCard(props: ComparisonCardProps) {
  const title = typeof props.title === "string" ? props.title : "";
  const before = safeSide(props.before);
  const after = safeSide(props.after);

  return (
    <div>
      {title && <div className="text-base font-semibold mb-2">{title}</div>}
      <div className="grid grid-cols-2 gap-4">
        <SideColumn side={before} />
        <SideColumn side={after} highlight />
      </div>
    </div>
  );
}
