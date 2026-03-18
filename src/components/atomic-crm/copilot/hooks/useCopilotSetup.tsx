import {
  useAgentContext,
  useDefaultRenderTool,
} from "@copilotkit/react-core/v2";
import { useRegisterComponents } from "./useRegisterComponents";
import { useSearchContacts } from "../tools/useSearchContacts";
import { useGetContactsByCompany } from "../tools/useGetContactsByCompany";
import { useGetTopLeads } from "../tools/useGetTopLeads";
import { useCreateTask } from "../tools/useCreateTask";
import { useDraftEmail } from "../tools/useDraftEmail";
import { useUpdateRenewalForecast } from "../tools/useUpdateRenewalForecast";
import { useUpdateContactStatus } from "../tools/useUpdateContactStatus";
// import { useAnalyzeContract } from "../tools/useAnalyzeContract";

interface CopilotSetupOptions {
  context: {
    description: string;
    value: any;
  };
}

export function useCopilotSetup({ context }: CopilotSetupOptions) {
  // Share app state with agent
  useAgentContext({
    description: context.description,
    value: context.value,
  });

  // Register all UI components (primitives + composites)
  useRegisterComponents();

  // Show tool execution status for backend tools (MCP, etc.)
  useDefaultRenderTool({
    render: ({ name, status, parameters }) => {
      console.log("[ToolCall]", { name, status, parameters });
      const isComplete = status === "complete";
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-1">
          {isComplete ? "✓" : "⏳"}
          <span>
            {name}
            {isComplete ? " — done" : " — running..."}
          </span>
        </div>
      );
    },
  });

  // Register frontend tool hooks
  useSearchContacts();
  useGetContactsByCompany();
  useGetTopLeads();
  useCreateTask();
  useDraftEmail();
  useUpdateRenewalForecast();
  useUpdateContactStatus();
  // useAnalyzeContract(); // Disabled — using MCP analyzeContract instead
}
