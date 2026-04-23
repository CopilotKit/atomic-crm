import { useCallback, useEffect, useState } from "react";
import { ReferenceManyField } from "@/components/admin/reference-many-field";
import { SortButton } from "@/components/admin/sort-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CopilotWorkspace } from "../copilot/components/CopilotWorkspace";
import { formatDistance } from "date-fns";
import { Bot, Building2, FileSearch, UserPlus } from "lucide-react";
import {
  RecordContextProvider,
  ShowBase,
  useListContext,
  useRecordContext,
  useShowContext,
} from "ra-core";
import {
  Link,
  Link as RouterLink,
  useLocation,
  useMatch,
  useNavigate,
} from "react-router-dom";
import { useAgent, useCopilotKit } from "@copilotkit/react-core/v2";
import { randomUUID } from "@copilotkit/shared";

import { useIsMobile } from "@/hooks/use-mobile";
import { ActivityLog } from "../activity/ActivityLog";
import { Avatar } from "../contacts/Avatar";
import { TagsList } from "../contacts/TagsList";
import { useCopilotOverlay } from "../copilot/CopilotOverlayContext";
import { useCopilotSetup } from "../copilot/hooks/useCopilotSetup";
import { useCompanyEnrichment } from "../copilot/useCompanyEnrichment";
import { findDealLabel } from "../deals/deal";
import { MobileContent } from "../layout/MobileContent";
import MobileHeader from "../layout/MobileHeader";
import { MobileBackButton } from "../misc/MobileBackButton";
import { Status } from "../misc/Status";
import { useConfigurationContext } from "../root/ConfigurationContext";
import type { Company, Contact, Deal } from "../types";
import {
  AdditionalInfo,
  AddressInfo,
  CompanyAside,
  CompanyInfo,
  ContextInfo,
} from "./CompanyAside";
import { CompanyAvatar } from "./CompanyAvatar";

export const CompanyShow = () => {
  const isMobile = useIsMobile();

  return (
    <ShowBase>
      {isMobile ? <CompanyShowContentMobile /> : <CompanyShowContent />}
    </ShowBase>
  );
};

const CompanyShowContentMobile = () => {
  const { record, isPending } = useShowContext<Company>();
  if (isPending || !record) return null;

  return (
    <>
      <MobileHeader>
        <MobileBackButton to="/" />
        <div className="flex flex-1">
          <Link to="/">
            <h1 className="text-xl font-semibold">Company</h1>
          </Link>
        </div>
      </MobileHeader>

      <MobileContent>
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <CompanyAvatar />
            <div className="mx-3 flex-1">
              <h2 className="text-2xl font-bold">{record.name}</h2>
            </div>
          </div>
        </div>
        <CompanyInfo record={record} />
        <AddressInfo record={record} />
        <ContextInfo record={record} />
        <AdditionalInfo record={record} />
      </MobileContent>
    </>
  );
};

const CompanyShowContent = () => {
  const { record, isPending } = useShowContext<Company>();
  const { agent } = useAgent();
  const { copilotkit } = useCopilotKit();
  const [asideTab, setAsideTab] = useState("info");
  const navigate = useNavigate();

  // Get tab from URL or default to "activity"
  const tabMatch = useMatch("/companies/:id/show/:tab");
  const currentTab = tabMatch?.params?.tab || "activity";

  // Enrichment and copilot setup — must be BEFORE any early return
  const { data: enriched } = useCompanyEnrichment(record?.name);

  useCopilotSetup({
    context: {
      description:
        "Current company record being viewed, with enriched contact data",
      value:
        record && enriched
          ? {
              ...record,
              enrichedContacts: enriched.stats,
              contactCount: enriched.stats.total,
            }
          : (record ?? null),
    },
  });

  const { registerPage } = useCopilotOverlay();

  useEffect(() => {
    return registerPage(() => setAsideTab("copilot"));
  }, [registerPage]);

  const triggerAgent = useCallback(
    async (prompt: string) => {
      setAsideTab("copilot");
      agent.addMessage({ id: randomUUID(), role: "user", content: prompt });
      await copilotkit.runAgent({ agent });
    },
    [agent, copilotkit],
  );

  const handleTabChange = (value: string) => {
    if (value === currentTab) return;
    if (value === "activity") {
      navigate(`/companies/${record?.id}/show`);
      return;
    }
    navigate(`/companies/${record?.id}/show/${value}`);
  };

  if (isPending || !record) return null;

  return (
    <>
      <div className="mt-2 flex pb-2 gap-8">
        <div className="flex-1">
          <Card>
            <CardContent>
              <div className="flex mb-3">
                <CompanyAvatar />
                <h5 className="text-xl ml-2 flex-1">{record.name}</h5>
              </div>
              <Tabs defaultValue={currentTab} onValueChange={handleTabChange}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="contacts">
                    {record.nb_contacts
                      ? record.nb_contacts === 1
                        ? "1 Contact"
                        : `${record.nb_contacts} Contacts`
                      : "No Contacts"}
                  </TabsTrigger>
                  {record.nb_deals ? (
                    <TabsTrigger value="deals">
                      {record.nb_deals === 1
                        ? "1 deal"
                        : `${record.nb_deals} deals`}
                    </TabsTrigger>
                  ) : null}
                </TabsList>
                <TabsContent value="activity" className="pt-2">
                  <ActivityLog companyId={record.id} context="company" />
                </TabsContent>
                <TabsContent value="contacts">
                  {record.nb_contacts ? (
                    <ReferenceManyField
                      reference="contacts_summary"
                      target="company_id"
                      sort={{ field: "last_name", order: "ASC" }}
                    >
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-row justify-end space-x-2 mt-1">
                          {!!record.nb_contacts && (
                            <SortButton
                              fields={["last_name", "first_name", "last_seen"]}
                            />
                          )}
                          <CreateRelatedContactButton />
                        </div>
                        <ContactsIterator />
                      </div>
                    </ReferenceManyField>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-row justify-end space-x-2 mt-1">
                        <CreateRelatedContactButton />
                      </div>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="deals">
                  {record.nb_deals ? (
                    <ReferenceManyField
                      reference="deals"
                      target="company_id"
                      sort={{ field: "name", order: "ASC" }}
                    >
                      <DealsIterator />
                    </ReferenceManyField>
                  ) : null}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        {/* Aside — tabbed: Company Info | Copilot */}
        <div className="hidden sm:block w-92 min-w-92 sticky top-4 h-[calc(100vh-5rem)] flex flex-col">
          <Tabs
            value={asideTab}
            onValueChange={setAsideTab}
            className="flex flex-col h-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-3 flex-shrink-0">
              <TabsTrigger value="info" className="text-xs">
                <Building2 className="h-3.5 w-3.5 mr-1" />
                Company
              </TabsTrigger>
              <TabsTrigger value="copilot" className="text-xs">
                <Bot className="h-3.5 w-3.5 mr-1" />
                Copilot
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="mt-0 flex-1 overflow-y-auto">
              <CompanyAside bare />
            </TabsContent>

            <TabsContent
              value="copilot"
              className="mt-0 flex-1 min-h-0 flex flex-col"
              forceMount
            >
              <CopilotWorkspace className="flex-1 min-h-0">
                <div className="flex gap-1.5 flex-wrap px-3 py-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    disabled={agent.isRunning}
                    onClick={() =>
                      triggerAgent(
                        `Analyze the contract for ${record.name}. Show the contract risk report.`,
                      )
                    }
                  >
                    <FileSearch className="h-3 w-3 mr-1" />
                    Analyze Contract
                  </Button>
                </div>
              </CopilotWorkspace>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

const ContactsIterator = () => {
  const location = useLocation();
  const { data: contacts, error, isPending } = useListContext<Contact>();

  if (isPending || error) return null;

  const now = Date.now();
  return (
    <div className="pt-0">
      {contacts.map((contact) => (
        <RecordContextProvider key={contact.id} value={contact}>
          <div className="p-0 text-sm">
            <RouterLink
              to={`/contacts/${contact.id}/show`}
              state={{ from: location.pathname }}
              className="flex items-center justify-between hover:bg-muted py-2 transition-colors"
            >
              <div className="mr-4">
                <Avatar />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium">
                  {`${contact.first_name} ${contact.last_name}`}
                </div>
                <div className="text-sm text-muted-foreground">
                  {contact.title}
                  {contact.nb_tasks
                    ? ` - ${contact.nb_tasks} task${
                        contact.nb_tasks > 1 ? "s" : ""
                      }`
                    : ""}
                  &nbsp; &nbsp;
                  <TagsList />
                </div>
              </div>
              {contact.last_seen && (
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">
                    last activity {formatDistance(contact.last_seen, now)} ago{" "}
                    <Status status={contact.status} />
                  </div>
                </div>
              )}
            </RouterLink>
          </div>
        </RecordContextProvider>
      ))}
    </div>
  );
};

const CreateRelatedContactButton = () => {
  const company = useRecordContext<Company>();
  return (
    <Button variant="outline" asChild size="sm" className="h-9">
      <RouterLink
        to="/contacts/create"
        state={company ? { record: { company_id: company.id } } : undefined}
        className="flex items-center gap-2"
      >
        <UserPlus className="h-4 w-4" />
        Add contact
      </RouterLink>
    </Button>
  );
};

const DealsIterator = () => {
  const { data: deals, error, isPending } = useListContext<Deal>();
  const { dealStages, dealCategories } = useConfigurationContext();
  if (isPending || error) return null;

  const now = Date.now();
  return (
    <div>
      <div>
        {deals.map((deal) => (
          <div key={deal.id} className="p-0 text-sm">
            <RouterLink
              to={`/deals/${deal.id}/show`}
              className="flex items-center justify-between hover:bg-muted py-2 px-4 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium">{deal.name}</div>
                <div className="text-sm text-muted-foreground">
                  {findDealLabel(dealStages, deal.stage)},{" "}
                  {deal.amount.toLocaleString("en-US", {
                    notation: "compact",
                    style: "currency",
                    currency: "USD",
                    currencyDisplay: "narrowSymbol",
                    minimumSignificantDigits: 3,
                  })}
                  {deal.category
                    ? `, ${dealCategories.find((c) => c.value === deal.category)?.label ?? deal.category}`
                    : ""}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">
                  last activity {formatDistance(deal.updated_at, now)} ago{" "}
                </div>
              </div>
            </RouterLink>
          </div>
        ))}
      </div>
    </div>
  );
};
