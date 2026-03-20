import { useEffect, useRef } from "react";
import { DWELL_TIMES, AUTO_APPROVE_DELAY_MS } from "./demoConfig";
import type { DemoStateOrDone, AgentPhase } from "./useDemoStateMachine";

const DEFAULT_DWELL_MS = 3000;

/** Get dwell time for a state. Exported for testing. */
export function getDwellTime(state: string): number {
  return DWELL_TIMES[state] ?? DEFAULT_DWELL_MS;
}

/** Click the first button inside the HITL card. Exported for testing. */
export function autoApproveViaDOM(): void {
  const card = document.querySelector('[data-demo="hitl-card"]');
  if (!card) return;
  const btn = card.querySelector<HTMLButtonElement>("button");
  btn?.click();
}

interface UseAutoAdvanceOptions {
  enabled: boolean;
  state: DemoStateOrDone;
  agentPhase: AgentPhase;
  canAdvance: boolean;
  advance: () => void;
  restart: () => void;
}

/**
 * Auto-advances through demo states on a dwell timer.
 * - When canAdvance becomes true, starts a dwell timer, then calls advance().
 * - At S5_APPROVAL_PENDING, auto-clicks the approve button after a delay.
 * - At DONE, calls restart() to loop continuously.
 */
export function useAutoAdvance({
  enabled,
  state,
  agentPhase,
  canAdvance,
  advance,
  restart,
}: UseAutoAdvanceOptions) {
  const advanceRef = useRef(advance);
  advanceRef.current = advance;
  const restartRef = useRef(restart);
  restartRef.current = restart;

  // Auto-advance after dwell when canAdvance is true
  useEffect(() => {
    if (!enabled || !canAdvance) return;

    const dwell = getDwellTime(state);
    const timer = setTimeout(() => {
      advanceRef.current();
    }, dwell);

    return () => clearTimeout(timer);
  }, [enabled, canAdvance, state]);

  // Auto-approve HITL card at S5
  useEffect(() => {
    if (!enabled) return;
    if (state !== "S5_APPROVAL_PENDING") return;
    if (agentPhase !== "idle") return;

    const timer = setTimeout(() => {
      autoApproveViaDOM();
    }, AUTO_APPROVE_DELAY_MS);

    return () => clearTimeout(timer);
  }, [enabled, state, agentPhase]);

  // Loop: restart when DONE
  useEffect(() => {
    if (!enabled || state !== "DONE") return;

    const timer = setTimeout(() => {
      restartRef.current();
    }, 2000);

    return () => clearTimeout(timer);
  }, [enabled, state]);
}
