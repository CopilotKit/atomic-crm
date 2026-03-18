import { useAuditedFrontendTool as useFrontendTool } from "./useAuditedFrontendTool";
import { z } from "zod";

const API_BASE =
  import.meta.env.VITE_COPILOTKIT_API_URL || "http://localhost:4000";

export function useGetContactsByCompany() {
  useFrontendTool({
    name: "getContactsByCompany",
    description: "Get all contacts associated with a specific company.",
    parameters: z.object({
      companyName: z
        .string()
        .describe("The company name to look up contacts for"),
    }),
    handler: async (params) => {
      const res = await fetch(
        `${API_BASE}/api/companies/${encodeURIComponent(params.companyName)}/contacts`,
      );
      return res.json();
    },
  });
}
