import { Card, CardContent } from "@/components/ui/card";

interface AccountSummaryProps {
  company: string;
  contactCount: number;
  hotCount: number;
  warmCount: number;
  coldCount: number;
  inContractCount: number;
}

export function AccountSummary({
  company,
  contactCount,
  hotCount,
  warmCount,
  coldCount,
  inContractCount,
}: AccountSummaryProps) {
  return (
    <Card className="my-2">
      <CardContent className="pt-4">
        <div className="text-lg font-semibold mb-3">{company}</div>
        <div className="grid grid-cols-5 gap-2 text-center">
          <div>
            <div className="text-2xl font-bold">{contactCount}</div>
            <div className="text-sm text-muted-foreground">Contacts</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-500">{hotCount}</div>
            <div className="text-sm text-muted-foreground">Hot</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-500">
              {warmCount}
            </div>
            <div className="text-sm text-muted-foreground">Warm</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-500">{coldCount}</div>
            <div className="text-sm text-muted-foreground">Cold</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-500">
              {inContractCount}
            </div>
            <div className="text-sm text-muted-foreground">In Contract</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
