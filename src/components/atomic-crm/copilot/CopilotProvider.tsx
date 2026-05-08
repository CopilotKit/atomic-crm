import { CopilotKitProvider } from "@copilotkit/react-core/v2";
import type { ReactNode } from "react";

import "@copilotkit/react-core/v2/styles.css";

const RUNTIME_URL =
  import.meta.env.VITE_COPILOTKIT_RUNTIME_URL || "/api/copilotkit";

// Stable references for optional props. CopilotKitProvider declares
// `headers = {}`, `properties = {}`, `agents__unsafe_dev_only = {}`,
// `selfManagedAgents = {}` as default parameters, which create fresh
// objects on every render. Those fresh refs invalidate the useMemo for
// mergedHeaders / mergedAgents, which re-fires the provider's setup
// useEffect (setRuntimeUrl/setRuntimeTransport/setHeaders/...) mid-tool-run,
// which resets the agent thread and wipes the chat panel.
const EMPTY_HEADERS: Record<string, string> = {};
const EMPTY_PROPERTIES: Record<string, unknown> = {};
const EMPTY_AGENTS = {};

export function CopilotProvider({ children }: { children: ReactNode }) {
  return (
    <CopilotKitProvider
      runtimeUrl={RUNTIME_URL}
      headers={EMPTY_HEADERS}
      properties={EMPTY_PROPERTIES}
      agents__unsafe_dev_only={EMPTY_AGENTS}
      selfManagedAgents={EMPTY_AGENTS}
    >
      {children}
    </CopilotKitProvider>
  );
}
