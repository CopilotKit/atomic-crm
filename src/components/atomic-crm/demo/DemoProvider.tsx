import {
  useEffect,
  useMemo,
  useCallback,
  useState,
  useRef,
  type ReactNode,
} from "react";
import { useNavigate, useLocation } from "react-router";
import { useAgent, useCopilotKit } from "@copilotkit/react-core/v2";
import { randomUUID } from "@copilotkit/shared";
import { useDataProvider } from "ra-core";
import { DemoContext, type DemoContextValue } from "./DemoContext";
import { useDemoStateMachine } from "./useDemoStateMachine";
import { useDemoDriver } from "./useDemoDriver";
import { DEMO_CONTACT, DEMO_PROMPTS } from "./demoConfig";

export function DemoProvider({ children }: { children: ReactNode }) {
  // Read from window.location directly — ra-core's router strips query params
  // from useSearchParams, but the URL still has them.
  const [isDemoMode] = useState(
    () => new URLSearchParams(window.location.search).get("demo") === "guided",
  );
  const [autoAgent] = useState(
    () =>
      isDemoMode &&
      new URLSearchParams(window.location.search).get("autoAgent") === "true",
  );

  if (!isDemoMode) {
    return <DemoInactiveProvider>{children}</DemoInactiveProvider>;
  }

  return (
    <DemoActiveProvider autoAgent={autoAgent}>{children}</DemoActiveProvider>
  );
}

/** No-op context when demo is off — zero overhead */
function DemoInactiveProvider({ children }: { children: ReactNode }) {
  const value = useMemo<DemoContextValue>(
    () => ({
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
    }),
    [],
  );
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

interface DemoActiveProviderProps {
  autoAgent: boolean;
  children: ReactNode;
}

function DemoActiveProvider({ autoAgent, children }: DemoActiveProviderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const dataProvider = useDataProvider();
  const { agent } = useAgent();
  const { copilotkit } = useCopilotKit();

  // Resolve contact ID
  const [contactId, setContactId] = useState<number | null>(null);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    dataProvider
      .getList("contacts", {
        filter: {
          first_name: DEMO_CONTACT.firstName,
          last_name: DEMO_CONTACT.lastName,
        },
        pagination: { page: 1, perPage: 1 },
        sort: { field: "id", order: "ASC" },
      })
      .then(({ data }) => {
        if (data.length > 0) {
          setContactId(data[0].id as number);
        } else {
          setInitError(
            "Demo contact not found. Import the demo dataset first.",
          );
        }
      })
      .catch(() => {
        setInitError("Failed to resolve demo contact.");
      });
  }, [dataProvider]);

  const contactRoute = contactId ? `/contacts/${contactId}/show` : "";

  const triggerAgent = useCallback(
    async (prompt: string) => {
      agent.addMessage({ id: randomUUID(), role: "user", content: prompt });
      await copilotkit.runAgent({ agent });
    },
    [agent, copilotkit],
  );

  const machine = useDemoStateMachine();

  const reportError = useCallback(() => {
    machine.dispatch({ type: "AGENT_ERROR" });
  }, [machine.dispatch]);

  // Wrap reset to also clean up URL params
  const resetWithCleanup = useCallback(() => {
    machine.reset();
    const url = new URL(window.location.href);
    url.searchParams.delete("demo");
    url.searchParams.delete("autoAgent");
    window.history.replaceState({}, "", url.pathname + url.search);
    navigate("/");
  }, [machine.reset, navigate]);

  // Track agent.isRunning transitions → dispatch agentPhase changes.
  // This handles both autoAgent mode (where we trigger the agent) and manual
  // mode (where the user clicks the action button themselves).
  const AGENT_PHASE_STATES = [
    "S2_AGENT_REVIEW",
    "S3_CONTRACT_ANALYSIS",
    "S4_FORECAST_PROPOSAL",
    "S5_APPROVAL_PENDING",
  ];
  const prevAgentRunning = useRef(false);
  useEffect(() => {
    const currentState = machine.machineState.state;
    const phase = machine.machineState.agentPhase;
    if (!AGENT_PHASE_STATES.includes(currentState as string)) {
      prevAgentRunning.current = agent.isRunning;
      return;
    }
    if (agent.isRunning && phase === "idle") {
      machine.dispatch({ type: "AGENT_STARTED" });
    }
    if (!agent.isRunning && prevAgentRunning.current && phase === "running") {
      machine.dispatch({ type: "AGENT_FINISHED" });
    }
    prevAgentRunning.current = agent.isRunning;
  }, [
    agent.isRunning,
    machine.machineState.state,
    machine.machineState.agentPhase,
    machine.dispatch,
  ]);

  useDemoDriver({
    state: machine.machineState.state,
    agentPhase: machine.machineState.agentPhase,
    canAdvance: machine.canAdvance,
    errorCount: machine.machineState.errorCount,
    autoAgent,
    advance: machine.advance,
    reset: resetWithCleanup,
    skipState: machine.skipState,
    reportError,
    setElementReady: machine.setElementReady,
  });

  // On state entry: navigate and/or auto-trigger agent
  const prevStateRef = useRef(machine.machineState.state);
  useEffect(() => {
    const currentState = machine.machineState.state;
    if (prevStateRef.current === currentState) return;
    prevStateRef.current = currentState;

    // Navigate based on state
    if (currentState === "S1_OPEN_CONTACT" && contactRoute) {
      navigate(contactRoute);
    } else if (currentState === "S6_AUDIT_LOG") {
      navigate("/audit");
    } else if (currentState === "DONE") {
      navigate("/");
    }

    // Auto-trigger agent if enabled and state has a prompt
    const prompt = DEMO_PROMPTS[currentState as keyof typeof DEMO_PROMPTS];
    if (!prompt || !autoAgent) return;

    machine.dispatch({ type: "AGENT_STARTED" });
    triggerAgent(prompt)
      .then(() => {
        machine.dispatch({ type: "AGENT_FINISHED" });
      })
      .catch(() => {
        machine.dispatch({ type: "AGENT_ERROR" });
      });
  }, [
    machine.machineState.state,
    autoAgent,
    triggerAgent,
    contactRoute,
    navigate,
    machine.dispatch,
  ]);

  // Navigate to / on init (runs once when contactId is resolved)
  const hasInitNavigated = useRef(false);
  useEffect(() => {
    if (contactId && !hasInitNavigated.current && location.pathname !== "/") {
      hasInitNavigated.current = true;
      navigate("/");
    }
  }, [contactId]); // eslint-disable-line react-hooks/exhaustive-deps

  // requestCopilotTab: true when we are about to trigger agent (S2/S3/S4 entry)
  const requestCopilotTab =
    machine.machineState.state === "S2_AGENT_REVIEW" ||
    machine.machineState.state === "S3_CONTRACT_ANALYSIS" ||
    machine.machineState.state === "S4_FORECAST_PROPOSAL" ||
    machine.machineState.state === "S5_APPROVAL_PENDING";

  const value = useMemo<DemoContextValue>(
    () => ({
      isDemoMode: true,
      autoAgent,
      state: machine.machineState.state,
      agentPhase: machine.machineState.agentPhase,
      canAdvance: machine.canAdvance,
      errorCount: machine.machineState.errorCount,
      advance: machine.advance,
      reset: resetWithCleanup,
      skipState: machine.skipState,
      reportError,
      requestCopilotTab,
    }),
    [
      autoAgent,
      machine.machineState.state,
      machine.machineState.agentPhase,
      machine.canAdvance,
      machine.machineState.errorCount,
      machine.advance,
      resetWithCleanup,
      machine.skipState,
      reportError,
      requestCopilotTab,
    ],
  );

  // Show error if contact not found
  if (initError) {
    return (
      <DemoContext.Provider value={value}>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-md">
            <h3 className="font-semibold text-lg mb-2">Demo Error</h3>
            <p className="text-sm text-muted-foreground mb-4">{initError}</p>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm"
              onClick={() => resetWithCleanup()}
            >
              Close
            </button>
          </div>
        </div>
        {children}
      </DemoContext.Provider>
    );
  }

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}
