import { useCallback, useEffect } from "react";
import { useAgent, useCopilotKit } from "@copilotkit/react-core/v2";
import { randomUUID } from "@copilotkit/shared";
import { Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCopilotOverlay } from "../CopilotOverlayContext";
import { useCopilotSetup } from "../hooks/useCopilotSetup";
import { CopilotWorkspace } from "./CopilotWorkspace";

export function CopilotOverlayPanel() {
  const { close } = useCopilotOverlay();
  const { agent } = useAgent();
  const { copilotkit } = useCopilotKit();

  useCopilotSetup({
    context: {
      description: "User is using the global CRM assistant",
      value: null,
    },
  });

  const triggerAgent = useCallback(
    async (prompt: string) => {
      agent.addMessage({ id: randomUUID(), role: "user", content: prompt });
      await copilotkit.runAgent({ agent });
    },
    [agent, copilotkit],
  );

  // Escape key closes the panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [close]);

  return (
    <div className="fixed right-0 top-[41px] bottom-0 w-92 bg-background shadow-lg z-50 flex flex-col border-l">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b flex-shrink-0">
        <h3 className="text-sm font-medium">Copilot</h3>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={close}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>

      {/* Chat workspace (includes thread header, action buttons, chat, and thread history) */}
      <CopilotWorkspace className="flex-1 min-h-0">
        <div className="flex gap-1.5 flex-wrap px-3 py-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-7"
            disabled={agent.isRunning}
            onClick={() =>
              triggerAgent("Search contacts in the CRM. Show results.")
            }
          >
            <Users className="h-3 w-3 mr-1" />
            Search Contacts
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-7"
            disabled={agent.isRunning}
            onClick={() =>
              triggerAgent("Triage the top leads. Show the lead priority list.")
            }
          >
            <Users className="h-3 w-3 mr-1" />
            Lead Triage
          </Button>
        </div>
      </CopilotWorkspace>
    </div>
  );
}
