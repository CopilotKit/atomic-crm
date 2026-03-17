import { SignalList } from "../primitives/SignalList";

interface MissingSignalsProps {
  signals: string[];
}

export function MissingSignals(props: MissingSignalsProps) {
  const signals = Array.isArray(props.signals) ? props.signals : [];

  return (
    <SignalList
      title="Missing Signals"
      signals={signals.map((s) => ({
        text: typeof s === "string" ? s : "",
        severity: "warning",
      }))}
    />
  );
}
