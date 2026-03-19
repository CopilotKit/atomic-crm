import {
  useAgentContext,
  useDefaultRenderTool,
} from "@copilotkit/react-core/v2";
import { useGetIdentity } from "ra-core";
import { useRegisterComponents } from "./useRegisterComponents";
import { useSearchContacts } from "../tools/useSearchContacts";
import { useGetContactsByCompany } from "../tools/useGetContactsByCompany";
import { useGetTopLeads } from "../tools/useGetTopLeads";
import { useCreateTask } from "../tools/useCreateTask";
import { useDraftEmail } from "../tools/useDraftEmail";
import { useUpdateRenewalForecast } from "../tools/useUpdateRenewalForecast";
import { useUpdateContactStatus } from "../tools/useUpdateContactStatus";
import { useLogAuditEvent } from "../tools/useLogAuditEvent";
import { logComponentRender } from "../tools/auditLogger";

interface CopilotSetupOptions {
  context: {
    description: string;
    value: any;
  };
}

export function useCopilotSetup({ context }: CopilotSetupOptions) {
  // Detect user role
  const { data: identity } = useGetIdentity();
  const isAdmin = !!(identity as { administrator?: boolean })?.administrator;

  // Share app state with agent, including role
  useAgentContext({
    description: context.description,
    value: { ...context.value, userRole: isAdmin ? "admin" : "user" },
  });

  // Register all UI components (primitives + composites)
  useRegisterComponents();

  // Show tool execution status for backend/MCP tools only.
  // Skip tools that have their own rendering (HITL, useComponent).
  const ignoredTools = new Set([
    // HITL tool — has its own render with approve/reject buttons
    "updateRenewalForecast",
    // useComponent registrations — rendered by CopilotChatToolCallsView
    "Heading",
    "StatCard",
    "BulletList",
    "KeyValue",
    "Alert",
    "ProgressBar",
    "Badge",
    "MetricRow",
    "SignalList",
    "RiskSection",
    "ActionList",
    "ComparisonCard",
    "RankedList",
    "AccountSummary",
    "MissingSignals",
    "RiskIndicators",
    "NextActions",
    "ContractRiskReport",
    "LeadPriorityList",
    // Explicit audit tool
    "logAuditEvent",
  ]);

  useDefaultRenderTool({
    render: ({ name, status, parameters }) => {
      if (ignoredTools.has(name)) return <></>;

      if (status === "complete") {
        logComponentRender(name, (parameters as Record<string, unknown>) ?? {});
      }
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
  useLogAuditEvent();
}
