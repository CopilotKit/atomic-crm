import { useReducer, useState, useCallback } from "react";
import type { DemoState } from "./demoSteps";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DemoStateOrDone = DemoState | "DONE";
export type AgentPhase = "idle" | "running" | "done";

export interface DemoMachineState {
  state: DemoStateOrDone;
  agentPhase: AgentPhase;
  errorCount: number;
}

export type DemoAction =
  | { type: "ADVANCE" }
  | { type: "RESET" }
  | { type: "RESTART" }
  | { type: "AGENT_STARTED" }
  | { type: "AGENT_FINISHED" }
  | { type: "AGENT_ERROR" }
  | { type: "SKIP_STATE" };

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Ordered progression of demo states */
const STATE_ORDER: DemoStateOrDone[] = [
  "S0_IDLE",
  "S1_OPEN_CONTACT",
  "S2_AGENT_REVIEW",
  "S3_CONTRACT_ANALYSIS",
  "S4_FORECAST_PROPOSAL",
  "S5_APPROVAL_PENDING",
  "S6_AUDIT_LOG",
  "DONE",
];

export const initialState: DemoMachineState = {
  state: "S0_IDLE",
  agentPhase: "idle",
  errorCount: 0,
};

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

function nextState(current: DemoStateOrDone): DemoStateOrDone {
  const idx = STATE_ORDER.indexOf(current);
  if (idx === -1 || idx === STATE_ORDER.length - 1) return current;
  return STATE_ORDER[idx + 1];
}

// ---------------------------------------------------------------------------
// Reducer (pure, tested)
// ---------------------------------------------------------------------------

export function demoReducer(
  state: DemoMachineState,
  action: DemoAction,
): DemoMachineState {
  switch (action.type) {
    case "ADVANCE": {
      const next = nextState(state.state);
      if (next === state.state) return state;
      return { state: next, agentPhase: "idle", errorCount: 0 };
    }

    case "RESET":
    case "RESTART":
      return initialState;

    case "AGENT_STARTED":
      return { ...state, agentPhase: "running" };

    case "AGENT_FINISHED":
      return { ...state, agentPhase: "done" };

    case "AGENT_ERROR":
      return {
        ...state,
        agentPhase: "idle",
        errorCount: state.errorCount + 1,
      };

    case "SKIP_STATE": {
      const next = nextState(state.state);
      if (next === state.state) return state;
      return { state: next, agentPhase: "idle", errorCount: 0 };
    }

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// computeCanAdvance (pure, tested)
// ---------------------------------------------------------------------------

/**
 * Determines whether the user can manually advance from the current state.
 * `elementReady` indicates whether the target DOM element for the current
 * step has been found (relevant for S1).
 */
export function computeCanAdvance(
  machineState: DemoMachineState,
  elementReady?: boolean,
): boolean {
  switch (machineState.state) {
    case "S0_IDLE":
      return true;

    case "S1_OPEN_CONTACT":
      return elementReady === true;

    case "S2_AGENT_REVIEW":
    case "S3_CONTRACT_ANALYSIS":
      return machineState.agentPhase === "done";

    case "S4_FORECAST_PROPOSAL":
      // Auto-transitions via DOM observer; never manually advanceable
      return false;

    case "S5_APPROVAL_PENDING":
      return machineState.agentPhase === "done";

    case "S6_AUDIT_LOG":
      return true;

    case "DONE":
      return false;

    default:
      return false;
  }
}

// ---------------------------------------------------------------------------
// React hook (not unit tested -- wires reducer + element-ready state)
// ---------------------------------------------------------------------------

export function useDemoStateMachine() {
  const [machineState, dispatch] = useReducer(demoReducer, initialState);
  const [elementReady, setElementReady] = useState(false);

  const canAdvance = computeCanAdvance(machineState, elementReady);

  const advance = useCallback(() => {
    if (canAdvance) {
      dispatch({ type: "ADVANCE" });
      setElementReady(false);
    }
  }, [canAdvance]);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
    setElementReady(false);
  }, []);

  const skipState = useCallback(() => {
    dispatch({ type: "SKIP_STATE" });
    setElementReady(false);
  }, []);

  const restart = useCallback(() => {
    dispatch({ type: "RESTART" });
    setElementReady(false);
  }, []);

  return {
    machineState,
    dispatch,
    canAdvance,
    elementReady,
    setElementReady,
    advance,
    reset,
    restart,
    skipState,
  };
}
