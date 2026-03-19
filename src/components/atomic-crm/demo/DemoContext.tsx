import { createContext, useContext } from "react";
import type { DemoStateOrDone, AgentPhase } from "./useDemoStateMachine";

export interface DemoContextValue {
  isDemoMode: boolean;
  autoAgent: boolean;
  state: DemoStateOrDone;
  agentPhase: AgentPhase;
  canAdvance: boolean;
  errorCount: number;
  advance: () => void;
  reset: () => void;
  skipState: () => void;
  reportError: () => void;
  /** When true, ContactShowContent should switch aside tab to "copilot" */
  requestCopilotTab: boolean;
}

const defaultValue: DemoContextValue = {
  isDemoMode: false,
  autoAgent: false,
  state: "S0_IDLE",
  agentPhase: "idle",
  canAdvance: false,
  errorCount: 0,
  advance: () => {},
  reset: () => {},
  skipState: () => {},
  reportError: () => {},
  requestCopilotTab: false,
};

export const DemoContext = createContext<DemoContextValue>(defaultValue);

export function useDemoContext() {
  return useContext(DemoContext);
}
