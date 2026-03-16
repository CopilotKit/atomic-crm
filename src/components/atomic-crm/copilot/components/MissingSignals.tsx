import { Card, CardContent } from "@/components/ui/card";

interface MissingSignalsProps {
  signals: string[];
}

export function MissingSignals({ signals }: MissingSignalsProps) {
  return (
    <Card className="my-2">
      <CardContent className="pt-4">
        <div className="text-lg font-semibold mb-3">Missing Signals</div>
        <ul className="space-y-2">
          {signals.map((signal, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <span className="text-yellow-500 mt-0.5">⚠</span>
              <span>{signal}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
