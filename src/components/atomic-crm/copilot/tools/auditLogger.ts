const API_BASE =
  import.meta.env.VITE_COPILOTKIT_API_URL || "http://localhost:4000";

// Dedup set: tool calls already logged by useAuditedFrontendTool
const recentlyLogged = new Set<string>();

function makeKey(toolName: string, args: Record<string, unknown>): string {
  return `${toolName}:${JSON.stringify(args)}`;
}

function extractNames(args: Record<string, unknown>): {
  contactName: string | null;
  companyName: string | null;
} {
  return {
    contactName:
      (args.contactName as string) || (args.contact_name as string) || null,
    companyName:
      (args.companyName as string) ||
      (args.company as string) ||
      (args.company_name as string) ||
      null,
  };
}

const summaryRules: Record<string, (args: Record<string, unknown>) => string> =
  {
    getContactsByCompany: (a) =>
      `Fetched contacts for ${a.companyName || "unknown"}`,
    getTopLeads: (a) => `Fetched top ${a.limit || 10} leads`,
    searchContacts: (a) =>
      `Searched contacts${a.company ? ` for ${a.company}` : ""}`,
    createTask: (a) => `Created task: ${a.description || "untitled"}`,
    draftEmail: (a) =>
      `Drafted email to ${a.contactName || "unknown"}: ${a.subject || ""}`,
    updateContactStatus: (a) =>
      `Updated contact status to ${a.status || "unknown"}`,
  };

function generateSummary(
  toolName: string,
  args: Record<string, unknown>,
): string {
  if (typeof args.summary === "string" && args.summary.length > 0) {
    return args.summary;
  }
  const rule = summaryRules[toolName];
  if (rule) return rule(args);
  return `Called ${toolName}`;
}

async function postAuditEvent(event: {
  actionType: string;
  toolName: string | null;
  contactName: string | null;
  companyName: string | null;
  summary: string;
}): Promise<void> {
  try {
    await fetch(`${API_BASE}/api/audit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });
  } catch {
    // Silently fail — audit logging should never break the app
  }
}

export async function logToolCall(
  toolName: string,
  args: Record<string, unknown>,
): Promise<void> {
  const key = makeKey(toolName, args);
  recentlyLogged.add(key);
  setTimeout(() => recentlyLogged.delete(key), 10_000);

  const { contactName, companyName } = extractNames(args);
  await postAuditEvent({
    actionType: "tool_call",
    toolName,
    contactName,
    companyName,
    summary: generateSummary(toolName, args),
  });
}

export async function logComponentRender(
  toolName: string,
  args: Record<string, unknown>,
): Promise<void> {
  const key = makeKey(toolName, args);
  if (recentlyLogged.has(key)) return;

  const { contactName, companyName } = extractNames(args);
  await postAuditEvent({
    actionType: "component_render",
    toolName,
    contactName,
    companyName,
    summary: `Rendered ${toolName}`,
  });
}

export async function logAgentSummary(summary: string): Promise<void> {
  await postAuditEvent({
    actionType: "agent_summary",
    toolName: null,
    contactName: null,
    companyName: null,
    summary,
  });
}
