import { useAuditedFrontendTool as useFrontendTool } from "./useAuditedFrontendTool";
import { useDataProvider } from "ra-core";
import { z } from "zod";

export function useCreateTask() {
  const dataProvider = useDataProvider();

  useFrontendTool({
    name: "createTask",
    description:
      "Create a new task for a contact. Use this to schedule follow-ups, calls, or other action items.",
    parameters: z.object({
      contactId: z
        .number()
        .describe("The ID of the contact to assign the task to"),
      type: z.string().describe("The task type (e.g. Email, Call, Demo, None)"),
      description: z.string().describe("The task description or text"),
      dueDate: z
        .string()
        .describe("The due date for the task (ISO 8601 format)"),
    }),
    handler: async (params) => {
      const result = await dataProvider.create("tasks", {
        data: {
          contact_id: params.contactId,
          type: params.type,
          text: params.description,
          due_date: params.dueDate,
        },
      });
      return { success: true, taskId: result.data.id };
    },
  });
}
