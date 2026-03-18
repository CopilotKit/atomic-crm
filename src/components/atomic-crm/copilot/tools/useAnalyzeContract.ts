import { useFrontendTool } from "@copilotkit/react-core/v2";
import { z } from "zod";

const API_BASE =
  import.meta.env.VITE_COPILOTKIT_API_URL || "http://localhost:4000";

export function useAnalyzeContract() {
  useFrontendTool({
    name: "analyzeContract",
    description:
      "Read and return the contract document for a given company. The contract text can then be analyzed for risks. Call this tool, then render ContractRiskReport with the results.",
    parameters: z.object({
      companyName: z
        .string()
        .describe("The company name to look up the contract for"),
    }),
    handler: async (params) => {
      const res = await fetch(
        `${API_BASE}/api/contracts/${encodeURIComponent(params.companyName)}`,
      );
      return res.json();
    },
  });
}
