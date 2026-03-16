import { Card, CardContent } from "@/components/ui/card";

interface Lead {
  name: string;
  score: number;
  lifecycleStage: string;
  lastActivity: string;
}

interface LeadPriorityListProps {
  leads: Lead[];
}

export function LeadPriorityList({ leads }: LeadPriorityListProps) {
  return (
    <Card className="my-2">
      <CardContent className="pt-4">
        <div className="text-lg font-semibold mb-3">Lead Priority List</div>
        <ol className="space-y-3">
          {leads.map((lead, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="text-sm font-bold text-muted-foreground w-5 flex-shrink-0 mt-0.5">
                {index + 1}.
              </span>
              <div className="flex-1">
                <div className="text-sm font-medium">{lead.name}</div>
                <div className="text-sm text-muted-foreground mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5">
                  <span>{lead.lifecycleStage}</span>
                  <span>
                    Score:{" "}
                    <span className="font-medium text-foreground">
                      {lead.score}
                    </span>
                  </span>
                  <span>Last activity: {lead.lastActivity}</span>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
