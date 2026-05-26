import { Suspense, type ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Notification } from "@/components/admin/notification";
import { Error } from "@/components/admin/error";
import { Skeleton } from "@/components/ui/skeleton";

import { useConfigurationLoader } from "../root/useConfigurationLoader";
import Header from "./Header";
import { DemoProvider } from "../demo/DemoProvider";
import { PersonaProvider } from "../copilot/PersonaProvider";
import {
  CopilotOverlayProvider,
  useCopilotOverlay,
} from "../copilot/CopilotOverlayContext";
import { CopilotOverlayPanel } from "../copilot/components/CopilotOverlayPanel";

export const Layout = ({ children }: { children: ReactNode }) => {
  useConfigurationLoader();
  return (
    <PersonaProvider>
      <DemoProvider>
        <CopilotOverlayProvider>
          <Header />
          <main className="max-w-screen-xl mx-auto pt-4 px-4" id="main-content">
            <ErrorBoundary FallbackComponent={Error}>
              <Suspense
                fallback={<Skeleton className="h-12 w-12 rounded-full" />}
              >
                {children}
              </Suspense>
            </ErrorBoundary>
          </main>
          <ErrorBoundary
            FallbackComponent={CopilotErrorFallback}
            onError={(error, info) =>
              console.error("[copilot:error-boundary]", error, info)
            }
          >
            <CopilotOverlayPanelGate />
          </ErrorBoundary>
          <Notification />
        </CopilotOverlayProvider>
      </DemoProvider>
    </PersonaProvider>
  );
};

function CopilotOverlayPanelGate() {
  const { isOpen } = useCopilotOverlay();
  if (!isOpen) return null;
  return <CopilotOverlayPanel />;
}

function CopilotErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div className="fixed right-4 top-14 z-50 w-92 max-w-[calc(100vw-2rem)] rounded-md border bg-background p-4 shadow-lg">
      <p className="text-sm font-medium">Copilot crashed</p>
      <p className="mt-1 text-xs text-muted-foreground break-words">
        {error.message}
      </p>
      <button
        type="button"
        onClick={resetErrorBoundary}
        className="mt-3 rounded-md border px-3 py-1 text-xs hover:bg-accent"
      >
        Reset
      </button>
    </div>
  );
}
