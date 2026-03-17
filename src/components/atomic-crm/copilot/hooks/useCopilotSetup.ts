import { useAgentContext } from "@copilotkit/react-core/v2";
import { useRegisterComponents } from "./useRegisterComponents";
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

  // Register all UI components (primitives + composites)
  useRegisterComponents();

  // Register frontend tool hooks
  useSearchContacts();
  useGetContactsByCompany();
  useGetTopLeads();
  useCreateTask();
  useDraftEmail();
  useUpdateRenewalForecast();
  useUpdateContactStatus();
}
