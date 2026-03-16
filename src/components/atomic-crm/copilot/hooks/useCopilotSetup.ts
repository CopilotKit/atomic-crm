import { useAgentContext, useComponent } from "@copilotkit/react-core/v2";
import { z } from "zod";
import { AccountSummary } from "../components/AccountSummary";
import { MissingSignals } from "../components/MissingSignals";
import { RiskIndicators } from "../components/RiskIndicators";
import { NextActions } from "../components/NextActions";
import { ContractRiskReport } from "../components/ContractRiskReport";
import { ForecastAdjustment } from "../components/ForecastAdjustment";
import { LeadPriorityList } from "../components/LeadPriorityList";
import { useSearchContacts } from "../tools/useSearchContacts";
import { useGetContactsByCompany } from "../tools/useGetContactsByCompany";
import { useGetTopLeads } from "../tools/useGetTopLeads";
import { useCreateTask } from "../tools/useCreateTask";
import { useDraftEmail } from "../tools/useDraftEmail";
import { useUpdateRenewalForecast } from "../tools/useUpdateRenewalForecast";
import { useUpdateContactStatus } from "../tools/useUpdateContactStatus";

interface CopilotSetupOptions {
  context: {
    description: string;
    value: any;
  };
}

export function useCopilotSetup({ context }: CopilotSetupOptions) {
  // Share app state with agent
  useAgentContext({
    description: context.description,
    value: context.value,
  });

  // Register generative UI components
  useComponent({
    name: "AccountSummary",
    description: "Display an account summary with contact counts by status.",
    parameters: z.object({
      company: z.string(),
      contactCount: z.number(),
      hotCount: z.number(),
      warmCount: z.number(),
      coldCount: z.number(),
      inContractCount: z.number(),
    }),
    render: AccountSummary,
  });

  useComponent({
    name: "MissingSignals",
    description:
      "Display a list of missing signals or data gaps for a contact or account.",
    parameters: z.object({
      signals: z.array(z.string()),
    }),
    render: MissingSignals,
  });

  useComponent({
    name: "RiskIndicators",
    description:
      "Display risk indicators including champion confidence and competitor mentions.",
    parameters: z.object({
      championConfidence: z.string(),
      competitorMentioned: z.string().nullable(),
      additionalRisks: z.array(z.string()).optional(),
    }),
    render: RiskIndicators,
  });

  useComponent({
    name: "NextActions",
    description:
      "Display a prioritized list of recommended next actions for an account.",
    parameters: z.object({
      actions: z.array(
        z.object({
          action: z.string(),
          priority: z.string(),
          reason: z.string(),
        }),
      ),
    }),
    render: NextActions,
  });

  useComponent({
    name: "ContractRiskReport",
    description:
      "Display a contract risk report categorized by high, medium, and low risk items.",
    parameters: z.object({
      companyName: z.string(),
      highRisks: z.array(z.string()),
      mediumRisks: z.array(z.string()),
      lowRisks: z.array(z.string()),
    }),
    render: ContractRiskReport,
  });

  useComponent({
    name: "ForecastAdjustment",
    description:
      "Display a forecast adjustment proposal comparing current and proposed renewal probability.",
    parameters: z.object({
      contactName: z.string(),
      currentCategory: z.string(),
      proposedCategory: z.string(),
      currentProbability: z.number(),
      proposedProbability: z.number(),
      reason: z.string(),
    }),
    render: ForecastAdjustment,
  });

  useComponent({
    name: "LeadPriorityList",
    description:
      "Display a prioritized list of leads with scores and lifecycle stages.",
    parameters: z.object({
      leads: z.array(
        z.object({
          name: z.string(),
          score: z.number(),
          lifecycleStage: z.string(),
          lastActivity: z.string(),
        }),
      ),
    }),
    render: LeadPriorityList,
  });

  // Register frontend tool hooks
  useSearchContacts();
  useGetContactsByCompany();
  useGetTopLeads();
  useCreateTask();
  useDraftEmail();
  useUpdateRenewalForecast();
  useUpdateContactStatus();
}
