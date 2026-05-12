interface Action {
  action: string;
  priority: string;
  reason: string;
}

interface ActionListProps {
  actions: Action[];
}

const priorityColors: Record<string, string> = {
  high: "border-red-500",
  medium: "border-yellow-500",
  low: "border-green-500",
};

export function ActionList(props: ActionListProps) {
  const actions = Array.isArray(props.actions) ? props.actions : [];

  if (actions.length === 0) return null;

  return (
    <div className="space-y-3">
      {actions.map((item, index) => {
        const action = typeof item?.action === "string" ? item.action : "";
        const priority =
          typeof item?.priority === "string" ? item.priority : "";
        const reason = typeof item?.reason === "string" ? item.reason : "";
        if (!action) return null;

        const borderColor =
          priorityColors[priority.toLowerCase()] ?? "border-blue-500";

        return (
          <div key={index} className={`border-l-4 ${borderColor} pl-3 py-1`}>
            <div className="text-sm font-medium">{action}</div>
            {(priority || reason) && (
              <div className="text-sm text-muted-foreground mt-0.5">
                {priority && (
                  <>
                    <span className="font-medium">Priority:</span> {priority}
                  </>
                )}
                {priority && reason && " · "}
                {reason}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
