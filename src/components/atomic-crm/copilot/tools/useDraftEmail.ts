import { useFrontendTool } from "@copilotkit/react-core/v2";
import { z } from "zod";

export function useDraftEmail() {
  useFrontendTool({
    name: "draftEmail",
    description:
      "Draft an email to a contact. Returns the email draft with contact name, subject, and body.",
    parameters: z.object({
      contactName: z.string().describe("The name of the contact to email"),
      subject: z.string().describe("The email subject line"),
      body: z.string().describe("The email body content"),
    }),
    handler: async (params) => {
      return {
        contactName: params.contactName,
        subject: params.subject,
        body: params.body,
        status: "draft",
      };
    },
  });
}
