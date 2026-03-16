import { Card, CardContent } from "@/components/ui/card";

interface ContractRiskReportProps {
  companyName: string;
  highRisks: string[];
  mediumRisks: string[];
  lowRisks: string[];
}

interface RiskSectionProps {
  label: string;
  items: string[];
  dotColor: string;
  headingColor: string;
}

function RiskSection({
  label,
  items,
  dotColor,
  headingColor,
}: RiskSectionProps) {
  if (items.length === 0) return null;
  return (
    <div className="mb-3">
      <div className={`text-sm font-semibold mb-1 ${headingColor}`}>
        {label}
      </div>
      <ul className="space-y-1">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-2 text-sm">
            <span
              className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${dotColor}`}
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ContractRiskReport({
  companyName,
  highRisks,
  mediumRisks,
  lowRisks,
}: ContractRiskReportProps) {
  return (
    <Card className="my-2">
      <CardContent className="pt-4">
        <div className="text-lg font-semibold mb-3">
          {companyName} — Contract Risk Report
        </div>
        <RiskSection
          label="High Risk"
          items={highRisks}
          dotColor="bg-red-500"
          headingColor="text-red-600"
        />
        <RiskSection
          label="Medium Risk"
          items={mediumRisks}
          dotColor="bg-yellow-500"
          headingColor="text-yellow-600"
        />
        <RiskSection
          label="Low Risk"
          items={lowRisks}
          dotColor="bg-green-500"
          headingColor="text-green-600"
        />
      </CardContent>
    </Card>
  );
}
