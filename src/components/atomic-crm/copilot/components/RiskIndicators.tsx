import { Card, CardContent } from "@/components/ui/card";

interface RiskIndicatorsProps {
  championConfidence: string;
  competitorMentioned: string | null;
  additionalRisks?: string[];
}

export function RiskIndicators({
  championConfidence,
  competitorMentioned,
  additionalRisks,
}: RiskIndicatorsProps) {
  return (
    <Card className="my-2">
      <CardContent className="pt-4">
        <div className="text-lg font-semibold mb-3">Risk Indicators</div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Champion Confidence</span>
            <span className="font-medium">{championConfidence}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Competitor Mentioned</span>
            <span className="font-medium">{competitorMentioned ?? "None"}</span>
          </div>
          {additionalRisks && additionalRisks.length > 0 && (
            <div className="mt-3">
              <div className="text-sm font-medium mb-1">Additional Risks</div>
              <ul className="space-y-1">
                {additionalRisks.map((risk, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    • {risk}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
