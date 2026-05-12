import { CopilotKitProvider } from "@copilotkit/react-core/v2";
import type { ReactNode } from "react";

import "@copilotkit/react-core/v2/styles.css";

const RUNTIME_URL =
  import.meta.env.VITE_COPILOTKIT_RUNTIME_URL || "/api/copilotkit";

export function CopilotProvider({ children }: { children: ReactNode }) {
  return (
    <CopilotKitProvider runtimeUrl={RUNTIME_URL}>{children}</CopilotKitProvider>
  );
}
