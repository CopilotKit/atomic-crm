import { Heading } from "../primitives/Heading";
import { ComparisonCard } from "../primitives/ComparisonCard";
import { ProgressBar } from "../primitives/ProgressBar";

interface ForecastAdjustmentProps {
  contactName: string;
  currentCategory: string;
  proposedCategory: string;
  currentProbability: number;
  proposedProbability: number;
  reason: string;
}

export function ForecastAdjustment(props: ForecastAdjustmentProps) {
  const contactName =
    typeof props.contactName === "string" ? props.contactName : "";
  const currentCategory =
    typeof props.currentCategory === "string" ? props.currentCategory : "";
  const proposedCategory =
    typeof props.proposedCategory === "string" ? props.proposedCategory : "";
  const currentProbability =
    typeof props.currentProbability === "number" ? props.currentProbability : 0;
  const proposedProbability =
    typeof props.proposedProbability === "number"
      ? props.proposedProbability
      : 0;
  const reason = typeof props.reason === "string" ? props.reason : "";

  return (
    <>
      <Heading text={`Forecast Adjustment — ${contactName}`} level={2} />
      <ComparisonCard
        title=""
        before={{
          label: "Current",
          entries: [
            { key: "Category", value: currentCategory },
            { key: "Probability", value: `${currentProbability}%` },
          ],
        }}
        after={{
          label: "Proposed",
          entries: [
            { key: "Category", value: proposedCategory },
            { key: "Probability", value: `${proposedProbability}%` },
          ],
        }}
      />
      <ProgressBar
        label="Proposed Probability"
        value={proposedProbability}
        color="text-green-500"
      />
      {reason && (
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Reason: </span>
          {reason}
        </div>
      )}
    </>
  );
}
