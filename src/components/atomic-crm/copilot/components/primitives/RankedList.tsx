interface RankedItem {
  name: string;
  subtitle?: string;
  score?: number;
  badge?: string;
}

interface RankedListProps {
  items: RankedItem[];
}

export function RankedList(props: RankedListProps) {
  const items = Array.isArray(props.items) ? props.items : [];

  if (items.length === 0) return null;

  return (
    <ol className="space-y-3">
      {items.map((item, index) => {
        const name = typeof item?.name === "string" ? item.name : "";
        const subtitle =
          typeof item?.subtitle === "string" ? item.subtitle : "";
        const score = typeof item?.score === "number" ? item.score : undefined;
        const badge = typeof item?.badge === "string" ? item.badge : "";
        if (!name) return null;

        return (
          <li key={index} className="flex items-start gap-3">
            <span className="text-sm font-bold text-muted-foreground w-5 flex-shrink-0 mt-0.5">
              {index + 1}.
            </span>
            <div className="flex-1">
              <div className="text-sm font-medium flex items-center gap-2">
                {name}
                {score !== undefined && (
                  <span className="text-xs text-muted-foreground">
                    Score:{" "}
                    <span className="font-medium text-foreground">{score}</span>
                  </span>
                )}
                {badge && (
                  <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground">
                    {badge}
                  </span>
                )}
              </div>
              {subtitle && (
                <div className="text-sm text-muted-foreground mt-0.5">
                  {subtitle}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
