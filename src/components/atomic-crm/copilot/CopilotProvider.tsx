import { CopilotKit } from "@copilotkit/react-core";
import type { ReactNode } from "react";

import "@copilotkit/react-core/v2/styles.css";

const RUNTIME_URL =
  import.meta.env.VITE_COPILOTKIT_RUNTIME_URL ||
  "http://localhost:4000/api/copilotkit";

export function CopilotProvider({ children }: { children: ReactNode }) {
  return <CopilotKit runtimeUrl={RUNTIME_URL} useSingleEndpoint>{children}</CopilotKit>;
}
