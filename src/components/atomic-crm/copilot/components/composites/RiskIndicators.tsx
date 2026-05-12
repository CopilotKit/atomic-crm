import { KeyValue } from "../primitives/KeyValue";
import { BulletList } from "../primitives/BulletList";

interface RiskIndicatorsProps {
  championConfidence: string;
  competitorMentioned: string | null;
  additionalRisks?: string[];
}

export function RiskIndicators(props: RiskIndicatorsProps) {
  const championConfidence =
    typeof props.championConfidence === "string"
      ? props.championConfidence
      : "";
  const competitorMentioned =
    typeof props.competitorMentioned === "string"
      ? props.competitorMentioned
      : null;
  const additionalRisks = Array.isArray(props.additionalRisks)
    ? props.additionalRisks
    : [];

  return (
    <div className="space-y-2">
      <KeyValue
        pairs={[
          { key: "Champion Confidence", value: championConfidence },
          { key: "Competitor Mentioned", value: competitorMentioned ?? "None" },
        ]}
      />
      {additionalRisks.length > 0 && (
        <BulletList items={additionalRisks} icon="warning" />
      )}
    </div>
  );
}
