import { Heading } from "../primitives/Heading";
import { MetricRow } from "../primitives/MetricRow";

interface AccountSummaryProps {
  company: string;
  contactCount: number;
  hotCount: number;
  warmCount: number;
  coldCount: number;
  inContractCount: number;
}

export function AccountSummary(props: AccountSummaryProps) {
  const company = typeof props.company === "string" ? props.company : "";
  const contactCount =
    typeof props.contactCount === "number" ? props.contactCount : 0;
  const hotCount = typeof props.hotCount === "number" ? props.hotCount : 0;
  const warmCount = typeof props.warmCount === "number" ? props.warmCount : 0;
  const coldCount = typeof props.coldCount === "number" ? props.coldCount : 0;
  const inContractCount =
    typeof props.inContractCount === "number" ? props.inContractCount : 0;

  return (
    <div className="space-y-2">
      <Heading text={company} level={2} />
      <MetricRow
        metrics={[
          { label: "Contacts", value: contactCount },
          { label: "Hot", value: hotCount, color: "text-red-500" },
          { label: "Warm", value: warmCount, color: "text-orange-500" },
          { label: "Cold", value: coldCount, color: "text-blue-500" },
          {
            label: "In Contract",
            value: inContractCount,
            color: "text-green-500",
          },
        ]}
      />
    </div>
  );
}
