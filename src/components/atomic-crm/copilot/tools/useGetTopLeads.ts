import { useFrontendTool } from "@copilotkit/react-core/v2";
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
      return res.json();
    },
  });
}
