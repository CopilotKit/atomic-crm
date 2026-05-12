import { createContext, useContext } from "react";
import type { DemoStateOrDone, AgentPhase } from "./useDemoStateMachine";
import type { DemoMode } from "./demoConfig";

export interface DemoContextValue {
  isDemoMode: boolean;
  mode: DemoMode | null;
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
  mode: null,
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
