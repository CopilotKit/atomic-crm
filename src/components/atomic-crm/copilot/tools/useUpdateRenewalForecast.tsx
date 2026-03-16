import { useHumanInTheLoop } from "@copilotkit/react-core/v2";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const API_BASE =
  import.meta.env.VITE_COPILOTKIT_API_URL || "http://localhost:4000";

export function useUpdateRenewalForecast() {
  useHumanInTheLoop({
    name: "updateRenewalForecast",
    description:
      "Propose a renewal forecast update for a contact. Requires human approval before applying the change.",
    parameters: z.object({
      contactId: z.number().describe("The ID of the contact"),
      contactName: z.string().describe("The name of the contact"),
      currentCategory: z.string().describe("Current renewal forecast category"),
      proposedCategory: z
        .string()
        .describe("Proposed new renewal forecast category"),
      currentProbability: z
        .number()
        .describe("Current renewal probability (0-100)"),
      proposedProbability: z
        .number()
        .describe("Proposed new renewal probability (0-100)"),
      reason: z.string().describe("Reason for the proposed change"),
    }),
    render: ({ args, respond, status }) => {
      const isExecuting = !!respond;

      return (
        <Card className="my-2">
          <CardContent className="pt-4">
            <div className="mb-3">
              <p className="font-semibold text-sm mb-1">
                Renewal Forecast Update — {args.contactName}
              </p>
              <p className="text-xs text-muted-foreground mb-2">
                {args.reason}
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-muted rounded p-2">
                  <p className="font-medium text-muted-foreground">Current</p>
                  <p>{args.currentCategory}</p>
                  <p>{args.currentProbability}%</p>
                </div>
                <div className="bg-muted rounded p-2">
                  <p className="font-medium text-muted-foreground">Proposed</p>
                  <p>{args.proposedCategory}</p>
                  <p>{args.proposedProbability}%</p>
                </div>
              </div>
            </div>
            {isExecuting && respond && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={async () => {
                    await fetch(
                      `${API_BASE}/api/contacts/${args.contactId}/forecast`,
                      {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          renewal_forecast_category: args.proposedCategory,
                          renewal_probability: args.proposedProbability,
                        }),
                      },
                    );
                    await respond({ approved: true });
                  }}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => respond({ approved: false })}
                >
                  Reject
                </Button>
              </div>
            )}
            {status === "complete" && (
              <p className="text-xs text-muted-foreground mt-2">
                Decision submitted.
              </p>
            )}
          </CardContent>
        </Card>
      );
    },
  });
}
