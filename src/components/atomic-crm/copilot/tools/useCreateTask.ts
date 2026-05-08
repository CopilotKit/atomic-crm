import { useAuditedFrontendTool as useFrontendTool } from "./useAuditedFrontendTool";
import { useDataProvider, useGetIdentity } from "ra-core";
import { z } from "zod";

export function useCreateTask() {
  const dataProvider = useDataProvider();
  const { data: identity } = useGetIdentity();

  useFrontendTool({
    name: "createTask",
    description:
      "Create a new task for a contact. ALWAYS call searchContacts or getContactsByCompany first to get a valid contactId — do not invent IDs. Use this to schedule follow-ups, calls, demos, or other action items.",
    parameters: z.object({
      contactId: z
        .number()
        .describe(
          "The ID of the contact to assign the task to. Must come from searchContacts or getContactsByCompany.",
        ),
      type: z.string().describe("The task type (e.g. Email, Call, Demo, None)"),
      description: z.string().describe("The task description or text"),
      dueDate: z
        .string()
        .describe("The due date for the task (ISO 8601 format)"),
    }),
    handler: async (params) => {
      try {
        await dataProvider.getOne("contacts", { id: params.contactId });
      } catch {
        return {
          ok: false,
          error: `No contact found with id ${params.contactId}. Call searchContacts first to find a real contact, then retry with that contact's id.`,
        };
      }

      const result = await dataProvider.create("tasks", {
        data: {
          contact_id: params.contactId,
          type: params.type,
          text: params.description,
          due_date: params.dueDate,
          // sales_id ties the task to the logged-in user. The dashboard's
          // Upcoming Tasks widget filters by `sales_id` of the current user,
          // so omitting this hides chat-created tasks from the dashboard.
          sales_id: (identity as { id?: number } | undefined)?.id ?? 0,
        },
      });
      return { success: true, taskId: result.data.id };
    },
  });
}
