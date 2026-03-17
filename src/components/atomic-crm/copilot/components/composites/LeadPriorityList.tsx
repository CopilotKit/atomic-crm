import { Heading } from "../primitives/Heading";
import { RankedList } from "../primitives/RankedList";

interface Lead {
  name: string;
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
    <>
      <Heading text="Lead Priority List" level={2} />
      <RankedList
        items={leads.map((l) => ({
          name: typeof l?.name === "string" ? l.name : "",
          subtitle: `${typeof l?.lifecycleStage === "string" ? l.lifecycleStage : ""} · Last activity: ${typeof l?.lastActivity === "string" ? l.lastActivity : ""}`,
          score: typeof l?.score === "number" ? l.score : 0,
        }))}
      />
    </>
  );
}
