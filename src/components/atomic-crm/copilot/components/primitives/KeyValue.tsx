interface KeyValuePair {
  key: string;
  value: string;
}

interface KeyValueProps {
  pairs: KeyValuePair[];
}

export function KeyValue(props: KeyValueProps) {
  const pairs = Array.isArray(props.pairs) ? props.pairs : [];

  if (pairs.length === 0) return null;

  return (
    <div className="space-y-1.5">
      {pairs.map((pair, index) => {
        const key = typeof pair?.key === "string" ? pair.key : "";
        const value = typeof pair?.value === "string" ? pair.value : "";
        if (!key) return null;
        return (
          <div
            key={index}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-muted-foreground">{key}</span>
            <span className="font-medium">{value}</span>
          </div>
        );
      })}
    </div>
  );
}
