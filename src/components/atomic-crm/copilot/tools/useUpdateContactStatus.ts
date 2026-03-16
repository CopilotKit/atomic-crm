import { useFrontendTool } from "@copilotkit/react-core/v2";
import { useDataProvider } from "ra-core";
import { z } from "zod";

export function useUpdateContactStatus() {
  const dataProvider = useDataProvider();

  useFrontendTool({
    name: "updateContactStatus",
    description:
      "Update a contact's status. Valid statuses are: cold, warm, hot, in-contract. Use this when the user asks to change a contact's temperature/status.",
    parameters: z.object({
      contactId: z.number().describe("The ID of the contact to update"),
      status: z
        .enum(["cold", "warm", "hot", "in-contract"])
        .describe("The new status for the contact"),
    }),
    handler: async ({ contactId, status }) => {
      const result = await dataProvider.update("contacts", {
        id: contactId,
        data: { status },
        previousData: { id: contactId },
      });
      return {
        success: true,
        contactId,
        newStatus: status,
        updatedRecord: result.data,
      };
    },
  });
}
