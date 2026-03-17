import { Heading } from "../primitives/Heading";
import { RiskSection } from "../primitives/RiskSection";

interface ContractRiskReportProps {
  companyName: string;
  highRisks: string[];
  mediumRisks: string[];
  lowRisks: string[];
}

export function ContractRiskReport(props: ContractRiskReportProps) {
  const companyName =
    typeof props.companyName === "string" ? props.companyName : "";
  const highRisks = Array.isArray(props.highRisks) ? props.highRisks : [];
  const mediumRisks = Array.isArray(props.mediumRisks) ? props.mediumRisks : [];
  const lowRisks = Array.isArray(props.lowRisks) ? props.lowRisks : [];

  return (
    <>
      <Heading text={`${companyName} — Contract Risk Report`} level={2} />
      <RiskSection title="High Risk" items={highRisks} severity="high" />
      <RiskSection title="Medium Risk" items={mediumRisks} severity="medium" />
      <RiskSection title="Low Risk" items={lowRisks} severity="low" />
    </>
  );
}
