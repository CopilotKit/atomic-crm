import { useFrontendTool } from "@copilotkit/react-core/v2";
import { z } from "zod";
import { logAgentSummary } from "./auditLogger";

export function useLogAuditEvent() {
  useFrontendTool({
    name: "logAuditEvent",
    description:
      "Log a custom audit event with a summary of what the agent did. Use after completing a significant workflow.",
    parameters: z.object({
      summary: z.string().describe("A brief description of the action taken"),
    }),
    handler: async (params) => {
      await logAgentSummary(params.summary);
      return { logged: true };
    },
  });
}
