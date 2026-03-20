import { Link } from "react-router-dom";
import { Heading } from "../primitives/Heading";

interface Lead {
  name: string;
  contactId?: number;
  score: number;
  lifecycleStage: string;
  lastActivity: string;
}

interface LeadPriorityListProps {
  leads: Lead[];
}

export function LeadPriorityList(props: LeadPriorityListProps) {
  const leads = Array.isArray(props.leads) ? props.leads : [];

  return (
    <div className="space-y-2">
      <Heading text="Lead Priority List" level={2} />
      {leads.length > 0 && (
        <ol className="space-y-3">
          {leads.map((l, index) => {
            const name = typeof l?.name === "string" ? l.name : "";
            const subtitle = `${typeof l?.lifecycleStage === "string" ? l.lifecycleStage : ""} · Last activity: ${typeof l?.lastActivity === "string" ? l.lastActivity : ""}`;
            const score = typeof l?.score === "number" ? l.score : 0;
            const contactId =
              typeof l?.contactId === "number" ? l.contactId : undefined;
            if (!name) return null;

            return (
              <li key={index} className="flex items-start gap-3">
                <span className="text-sm font-bold text-muted-foreground w-5 flex-shrink-0 mt-0.5">
                  {index + 1}.
                </span>
                <div className="flex-1">
                  <div className="text-sm font-medium flex items-center gap-2">
                    {contactId != null ? (
                      <Link
                        to={`/contacts/${contactId}/show`}
                        className="underline hover:text-primary"
                      >
                        {name}
                      </Link>
                    ) : (
                      name
                    )}
                    <span className="text-xs text-muted-foreground">
                      Score:{" "}
                      <span className="font-medium text-foreground">
                        {score}
                      </span>
                    </span>
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
      )}
    </div>
  );
}
