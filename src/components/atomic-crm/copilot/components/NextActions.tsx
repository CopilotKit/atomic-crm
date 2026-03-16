import { Card, CardContent } from "@/components/ui/card";

interface Action {
  action: string;
  priority: string;
  reason: string;
}

interface NextActionsProps {
  actions: Action[];
}

export function NextActions({ actions }: NextActionsProps) {
  return (
    <Card className="my-2">
      <CardContent className="pt-4">
        <div className="text-lg font-semibold mb-3">Next Actions</div>
        <div className="space-y-3">
          {actions.map((item, index) => (
            <div key={index} className="border-l-4 border-blue-500 pl-3 py-1">
              <div className="text-sm font-medium">{item.action}</div>
              <div className="text-sm text-muted-foreground mt-0.5">
                <span className="font-medium">Priority:</span> {item.priority}
                {" · "}
                {item.reason}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
