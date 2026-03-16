import { Card, CardContent } from "@/components/ui/card";

interface ForecastAdjustmentProps {
  contactName: string;
  currentCategory: string;
  proposedCategory: string;
  currentProbability: number;
  proposedProbability: number;
  reason: string;
}

export function ForecastAdjustment({
  contactName,
  currentCategory,
  proposedCategory,
  currentProbability,
  proposedProbability,
  reason,
}: ForecastAdjustmentProps) {
  return (
    <Card className="my-2">
      <CardContent className="pt-4">
        <div className="text-lg font-semibold mb-3">
          Forecast Adjustment — {contactName}
        </div>
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div className="rounded-md border p-3">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              Current
            </div>
            <div className="text-sm">
              <div className="mb-1">
                <span className="text-muted-foreground">Category: </span>
                <span className="font-medium">{currentCategory}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Probability: </span>
                <span className="font-medium">{currentProbability}%</span>
              </div>
            </div>
          </div>
          <div className="rounded-md border p-3 bg-muted/30">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              Proposed
            </div>
            <div className="text-sm">
              <div className="mb-1">
                <span className="text-muted-foreground">Category: </span>
                <span className="font-medium">{proposedCategory}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Probability: </span>
                <span className="font-medium text-green-500">
                  {proposedProbability}%
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Reason: </span>
          {reason}
        </div>
      </CardContent>
    </Card>
  );
}
