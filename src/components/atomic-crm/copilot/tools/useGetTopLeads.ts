import { useAuditedFrontendTool as useFrontendTool } from "./useAuditedFrontendTool";
import { z } from "zod";

const API_BASE =
  import.meta.env.VITE_COPILOTKIT_API_URL || "http://localhost:4000";

export function useGetTopLeads() {
  useFrontendTool({
    name: "getTopLeads",
    description:
      "Get the top leads ranked by lead score. Returns contacts with the highest lead scores.",
    parameters: z.object({
      limit: z
        .number()
        .optional()
        .default(10)
        .describe("Number of top leads to return (default: 10)"),
    }),
    handler: async (params) => {
      const limit = params.limit ?? 10;
      const res = await fetch(`${API_BASE}/api/leads/top?limit=${limit}`);
      if (!res.ok) {
        throw new Error(`getTopLeads HTTP ${res.status} ${res.statusText}`);
      }
      const rows: Array<Record<string, unknown>> = await res.json();
      // Pre-shape for LeadPriorityList so the agent doesn't have to re-map
      // snake_case API fields to the component's expected camelCase props.
      return rows.map((c) => ({
        contactId: c.id,
        name: `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim(),
        score: c.lead_score,
        lifecycleStage: c.lifecycle_stage,
        lastActivity:
          c.last_activity_type && c.last_activity_date
            ? `${c.last_activity_type} on ${c.last_activity_date}`
            : (c.last_activity_type ?? c.last_activity_date ?? ""),
        company: c.company_name,
        status: c.status,
        title: c.title,
      }));
    },
  });
}
