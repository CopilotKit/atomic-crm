import { useState, useCallback } from "react";
import { RecordRepresentation, ShowBase, useShowContext } from "ra-core";
import { useIsMobile } from "@/hooks/use-mobile";
import { ReferenceField } from "@/components/admin/reference-field";
import { ReferenceManyField } from "@/components/admin/reference-many-field";
import { TextField } from "@/components/admin/text-field";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Pencil } from "lucide-react";
import { Link } from "react-router";
import { useAgent, useCopilotKit } from "@copilotkit/react-core/v2";
import { randomUUID } from "@copilotkit/shared";
import { Bot, FileSearch, TrendingUp, Users, Info } from "lucide-react";

import MobileHeader from "../layout/MobileHeader";
import { MobileContent } from "../layout/MobileContent";
import { CompanyAvatar } from "../companies/CompanyAvatar";
import { NoteCreate, NotesIterator, NotesIteratorMobile } from "../notes";
import { NoteCreateSheet } from "../notes/NoteCreateSheet";
import { ContactEditSheet } from "./ContactEditSheet";
import { TagsListEdit } from "./TagsListEdit";
import { ContactPersonalInfo } from "./ContactPersonalInfo";
import { ContactBackgroundInfo } from "./ContactBackgroundInfo";
import { ContactTasksList } from "./ContactTasksList";
import type { Contact } from "../types";
import { Avatar } from "./Avatar";
import { ContactAside } from "./ContactAside";
import { MobileBackButton } from "../misc/MobileBackButton";
import { useCopilotSetup } from "../copilot/hooks/useCopilotSetup";
import { useContactEnrichment } from "../copilot/useContactEnrichment";
import { CopilotWorkspace } from "../copilot/components/CopilotWorkspace";

export const ContactShow = () => {
  const isMobile = useIsMobile();

  return (
    <ShowBase
      queryOptions={{
        onError: isMobile
          ? () => {
              {
                /** Disable error notification as the content handles offline */
              }
            }
          : undefined,
      }}
    >
      {isMobile ? <ContactShowContentMobile /> : <ContactShowContent />}
    </ShowBase>
  );
};

const ContactShowContentMobile = () => {
  const { record, isPending } = useShowContext<Contact>();
  const [noteCreateOpen, setNoteCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  if (isPending || !record) return null;

  return (
    <>
      {/* We need to repeat the note creation sheet here to support the note 
      create button that is rendered when there are no notes. */}
      <NoteCreateSheet
        open={noteCreateOpen}
        onOpenChange={setNoteCreateOpen}
        contact_id={record.id}
      />
      <ContactEditSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        contactId={record.id}
      />
      <MobileHeader>
        <MobileBackButton />
        <div className="flex flex-1 min-w-0">
          <Link to="/contacts" className="flex-1 min-w-0">
            <h1 className="truncate text-xl font-semibold">
              <RecordRepresentation />
            </h1>
          </Link>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => setEditOpen(true)}
        >
          <Pencil className="size-5" />
          <span className="sr-only">Edit record</span>
        </Button>
      </MobileHeader>
      <MobileContent>
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <Avatar />
            <div className="mx-3 flex-1">
              <h2 className="text-2xl font-bold">
                <RecordRepresentation />
              </h2>
              <div className="text-sm text-muted-foreground">
                {record.title}
                {record.title && record.company_id != null && " at "}
                {record.company_id != null && (
                  <ReferenceField
                    source="company_id"
                    reference="companies"
                    link="show"
                  >
                    <TextField source="name" className="underline" />
                  </ReferenceField>
                )}
              </div>
            </div>
            <div>
              <ReferenceField
                source="company_id"
                reference="companies"
                link="show"
                className="no-underline"
              >
                <CompanyAvatar />
              </ReferenceField>
            </div>
          </div>
        </div>

        <Tabs defaultValue="notes" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-10">
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="tasks">
              {`${record.nb_tasks ?? 0} Tasks`}
            </TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="notes" className="mt-2">
            <ReferenceManyField
              target="contact_id"
              reference="contact_notes"
              sort={{ field: "date", order: "DESC" }}
              empty={
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-muted-foreground mb-4">No notes yet</p>
                  <Button
                    variant="outline"
                    onClick={() => setNoteCreateOpen(true)}
                  >
                    Add note
                  </Button>
                </div>
              }
              loading={false}
              error={false}
              queryOptions={
                {
                  onError: () => {
                    /** override to hide notification as error case is handled by NotesIteratorMobile */
                  },
                  // We want infinite pagination so we need to disable placeHolder data to avoid flicker duplicating previous page before showing the new one
                  placeholderData: null,
                } as any // fixme: remove once https://github.com/marmelab/react-admin/pull/11166 is released
              }
            >
              <NotesIteratorMobile contactId={record.id} showStatus />
            </ReferenceManyField>
          </TabsContent>

          <TabsContent value="tasks" className="mt-4">
            <ContactTasksList />
          </TabsContent>

          <TabsContent value="details" className="mt-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold">Personal info</h3>
                <Separator />
                <div className="mt-3">
                  <ContactPersonalInfo />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Background info</h3>
                <Separator />
                <div className="mt-3">
                  <ContactBackgroundInfo />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Tags</h3>
                <Separator />
                <div className="mt-3">
                  <TagsListEdit />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </MobileContent>
    </>
  );
};

const ContactShowContent = () => {
  const { record, isPending } = useShowContext<Contact>();
  const { agent } = useAgent();
  const { copilotkit } = useCopilotKit();
  const [asideTab, setAsideTab] = useState("info");

  // Enrichment and copilot setup — must be BEFORE any early return
  const { data: enriched } = useContactEnrichment(
    record?.first_name,
    record?.last_name,
  );

  useCopilotSetup({
    context: {
      description:
        "Current contact record being viewed, with enriched data from the CRM database",
      value: record && enriched ? { ...record, ...enriched } : (record ?? null),
    },
  });

  const triggerAgent = useCallback(
    async (prompt: string) => {
      setAsideTab("copilot");
      agent.addMessage({ id: randomUUID(), role: "user", content: prompt });
      await copilotkit.runAgent({ agent });
    },
    [agent, copilotkit],
  );

  if (isPending || !record) return null;

  const companyName = record.company_name ?? "";

  return (
    <>
      <div className="mt-2 mb-2 flex gap-8">
        {/* Main content — contact card + notes */}
        <div className="flex-1">
          <Card>
            <CardContent>
              <div className="flex">
                <Avatar />
                <div className="ml-2 flex-1">
                  <h5 className="text-xl font-semibold">
                    <RecordRepresentation />
                  </h5>
                  <div className="inline-flex text-sm text-muted-foreground">
                    {record.title}
                    {record.title && record.company_id != null && " at "}
                    {record.company_id != null && (
                      <ReferenceField
                        source="company_id"
                        reference="companies"
                        link="show"
                      >
                        &nbsp;
                        <TextField source="name" />
                      </ReferenceField>
                    )}
                  </div>
                </div>
                <div>
                  <ReferenceField
                    source="company_id"
                    reference="companies"
                    link="show"
                    className="no-underline"
                  >
                    <CompanyAvatar />
                  </ReferenceField>
                </div>
              </div>
              <ReferenceManyField
                target="contact_id"
                reference="contact_notes"
                sort={{ field: "date", order: "DESC" }}
                empty={
                  <NoteCreate
                    reference="contacts"
                    showStatus
                    className="mt-4"
                  />
                }
                queryOptions={{
                  // We want infinite pagination so we need to disable placeHolder data to avoid flicker duplicating previous page before showing the new one
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  //@ts-expect-error
                  placeholderData: null,
                }}
              >
                <NotesIterator reference="contacts" showStatus />
              </ReferenceManyField>
            </CardContent>
          </Card>
        </div>

        {/* Aside — tabbed: Contact Info | Copilot */}
        <div className="hidden sm:block w-92 min-w-92 sticky top-4 h-[calc(100vh-5rem)] flex flex-col">
          <Tabs
            value={asideTab}
            onValueChange={setAsideTab}
            className="flex flex-col h-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-3 flex-shrink-0">
              <TabsTrigger value="info" className="text-xs">
                <Info className="h-3.5 w-3.5 mr-1" />
                Contact
              </TabsTrigger>
              <TabsTrigger value="copilot" className="text-xs">
                <Bot className="h-3.5 w-3.5 mr-1" />
                Copilot
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="mt-0 flex-1 overflow-y-auto">
              <ContactAside />
            </TabsContent>

            <TabsContent
              value="copilot"
              className="mt-0 flex-1 min-h-0 flex flex-col"
            >
              {/* Action buttons — pinned top, disabled while agent runs */}
              <div className="flex gap-1.5 flex-wrap mb-3 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  disabled={agent.isRunning}
                  onClick={() =>
                    triggerAgent(
                      `Review the account for ${record.first_name} ${record.last_name} at ${companyName}. Show account summary, missing signals, risk indicators, and next actions.`,
                    )
                  }
                >
                  <Bot className="h-3 w-3 mr-1" />
                  Review Account
                </Button>
                {companyName && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    disabled={agent.isRunning}
                    onClick={() =>
                      triggerAgent(
                        `Analyze the contract for ${companyName}. Show the contract risk report.`,
                      )
                    }
                  >
                    <FileSearch className="h-3 w-3 mr-1" />
                    Analyze Contract
                  </Button>
                )}
                {enriched?.renewal_amount != null && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    disabled={agent.isRunning}
                    onClick={() =>
                      triggerAgent(
                        `Review the renewal forecast for ${record.first_name} ${record.last_name} and propose an adjustment if warranted.`,
                      )
                    }
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Forecast
                  </Button>
                )}
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
                  Leads
                </Button>
              </div>
              {/* Copilot workspace — inside the aside */}
              <CopilotWorkspace className="flex-1 min-h-0" />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};
