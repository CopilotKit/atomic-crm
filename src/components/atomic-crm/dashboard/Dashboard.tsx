import { useCallback, useEffect, useState } from "react";
import { useGetList } from "ra-core";
import { useAgent, useCopilotKit } from "@copilotkit/react-core/v2";
import { randomUUID } from "@copilotkit/shared";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, ClipboardList, Users } from "lucide-react";

import type { Contact, ContactNote } from "../types";
import { CopilotWorkspace } from "../copilot/components/CopilotWorkspace";
import { useCopilotOverlay } from "../copilot/CopilotOverlayContext";
import { useCopilotSetup } from "../copilot/hooks/useCopilotSetup";
import { DashboardActivityLog } from "./DashboardActivityLog";
import { DashboardStepper } from "./DashboardStepper";
import { DealsChart } from "./DealsChart";
import { HotContacts } from "./HotContacts";
import { TasksList } from "./TasksList";
import { Welcome } from "./Welcome";

export const Dashboard = () => {
  const { agent } = useAgent();
  const { copilotkit } = useCopilotKit();
  const [rightTab, setRightTab] = useState("tasks");

  useCopilotSetup({
    context: {
      description: "User is viewing the CRM dashboard",
      value: null,
    },
  });

  const { registerPage } = useCopilotOverlay();

  useEffect(() => {
    return registerPage(() => setRightTab("copilot"));
  }, [registerPage]);

  const triggerAgent = useCallback(
    async (prompt: string) => {
      setRightTab("copilot");
      agent.addMessage({ id: randomUUID(), role: "user", content: prompt });
      await copilotkit.runAgent({ agent });
    },
    [agent, copilotkit],
  );

  const {
    data: dataContact,
    total: totalContact,
    isPending: isPendingContact,
  } = useGetList<Contact>("contacts", {
    pagination: { page: 1, perPage: 1 },
  });

  const { total: totalContactNotes, isPending: isPendingContactNotes } =
    useGetList<ContactNote>("contact_notes", {
      pagination: { page: 1, perPage: 1 },
    });

  const { total: totalDeal, isPending: isPendingDeal } = useGetList<Contact>(
    "deals",
    {
      pagination: { page: 1, perPage: 1 },
    },
  );

  const isPending = isPendingContact || isPendingContactNotes || isPendingDeal;

  if (isPending) {
    return null;
  }

  if (!totalContact) {
    return <DashboardStepper step={1} />;
  }

  if (!totalContactNotes) {
    return <DashboardStepper step={2} contactId={dataContact?.[0]?.id} />;
  }

  return (
    <div className="flex flex-col gap-6 mt-1">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-3">
          <div className="flex flex-col gap-4">
            {import.meta.env.VITE_IS_DEMO === "true" ? <Welcome /> : null}
            <HotContacts />
          </div>
        </div>
        <div className="md:col-span-6">
          <div className="flex flex-col gap-6">
            {totalDeal ? <DealsChart /> : null}
            <DashboardActivityLog />
          </div>
        </div>

        <div className="md:col-span-3">
          <Tabs
            value={rightTab}
            onValueChange={setRightTab}
            className="flex flex-col h-[calc(100vh-8rem)]"
          >
            <TabsList className="grid w-full grid-cols-2 mb-3 flex-shrink-0">
              <TabsTrigger value="tasks" className="text-xs">
                <ClipboardList className="h-3.5 w-3.5 mr-1" />
                Tasks
              </TabsTrigger>
              <TabsTrigger value="copilot" className="text-xs">
                <Bot className="h-3.5 w-3.5 mr-1" />
                Copilot
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tasks" className="mt-0">
              <TasksList />
            </TabsContent>

            <TabsContent value="copilot" className="mt-0 min-h-0 flex flex-col">
              <div className="flex gap-1.5 flex-wrap mb-3 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  disabled={agent.isRunning}
                  onClick={() =>
                    triggerAgent(
                      `Triage the top leads. Show the lead priority list.`,
                    )
                  }
                >
                  <Users className="h-3 w-3 mr-1" />
                  Lead Triage
                </Button>
              </div>
              <CopilotWorkspace className="flex-1 min-h-0" />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
