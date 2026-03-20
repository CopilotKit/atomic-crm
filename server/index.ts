import { serve } from "@hono/node-server";
import { Hono } from "hono";
import {
  CopilotRuntime,
  createCopilotEndpointSingleRoute,
  BuiltInAgent,
  InMemoryAgentRunner,
} from "@copilotkit/runtime/v2";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  loadContacts,
  getAllContacts,
  getContactById,
  getContactByName,
  searchContacts as searchContactsStore,
  getContactsByCompany as getContactsByCompanyStore,
  getTopLeads as getTopLeadsStore,
  updateContactForecast,
} from "./data/contacts-store.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load CSV data
loadContacts(path.join(__dirname, "../test-data/contacts_demo_v2.csv"));

// CopilotKit Runtime
const MCP_SERVER_URL =
  process.env.MCP_SERVER_URL || "http://localhost:3108/mcp";

const builtInAgent = new BuiltInAgent({
  model: "openai/gpt-4o",
  prompt: `You are a Revenue Operations Copilot embedded in a CRM application.

## Available UI Components

### Primitives
You have access to atomic UI components for composing any analysis:
Heading, StatCard, BulletList, KeyValue, Alert, ProgressBar, Badge,
MetricRow, SignalList, RiskSection, ActionList, ComparisonCard, RankedList

Use Alert for risk/signal callouts (severity: high/medium/low/info).
Use Badge for status/category labels (variant: success/warning/danger/neutral).
StatCard and MetricRow accept a color prop with Tailwind text classes (e.g., text-red-500).

### Domain Composites
For standard workflows, use these pre-built components:
AccountSummary, MissingSignals, RiskIndicators, NextActions,
ContractRiskReport, ForecastAdjustment, LeadPriorityList

## Rendering Rules
- ALWAYS use UI components to present data. NEVER use markdown formatting.
- Use domain composites when the data fits their exact shape.
- Use primitives when you need flexibility or the data doesn't fit a composite.
- You may mix composites and primitives in a single response.

## Response Style
- ALWAYS render UI components to present data. The components ARE the response.
- After rendering components, you may add a BRIEF 1-2 sentence plain text summary. No more.
- NEVER use markdown formatting (no **, no ##, no -, no lists) in text responses. The components handle all structured display.
- NEVER repeat data in text that is already shown in a rendered component.

## Workflow Guidelines
- Account Review: call getContactsByCompany tool, then render AccountSummary + MissingSignals + RiskIndicators + NextActions
- Contract Risk: call analyzeContract tool to get the contract text, then render ContractRiskReport with the identified risks
- Forecast: use updateRenewalForecast tool (shows proposal card with approve/reject buttons, triggers human approval)
- Lead Triage: call getTopLeads tool, then render LeadPriorityList
- For free-form questions: compose from primitives as appropriate

## Role Awareness
The user's role is provided in the application context as \`userRole\`.
- Admin users can approve renewal forecast changes.
- Non-admin users can view forecast proposals but cannot approve them.
  When a non-admin asks about forecasts, you may still invoke updateRenewalForecast
  to show the proposal, but inform them that only an admin can approve the change.
- If the updateRenewalForecast tool response includes \`reason: "insufficient_role"\`,
  explain to the user that admin approval is required. Do not treat this as a manual rejection.
- All other tools are available to both roles.

## Persona-Aware Narration
The application context may include a \`persona\` field. When present, adapt your
narration style to the audience AFTER presenting the standard UI components.
Add a brief narration section (2-4 sentences) that explains what just happened
through the lens of that persona. When persona is absent, skip narration entirely.

Personas:
- **explorer**: Curious first-time viewer. Narrate what the agent just did in plain language.
  Example: "I just pulled all contacts at Schmitt and Sons to build an account health picture — the missing signals tell you where your team has gaps."
- **developer**: Technical builder evaluating CopilotKit. Narrate the technical mechanics:
  which tools were called, whether MCP was used, how frontend tools mutate state, how
  human-in-the-loop approval works, how the UI components are rendered via useComponent.
  Example: "Behind the scenes: getContactsByCompany was called as a frontend tool, then the
  agent composed AccountSummary + MissingSignals + RiskIndicators as structured UI blocks
  via CopilotKit's useComponent API — no markdown, just typed React components."
- **product**: Product lead evaluating capabilities. Narrate the product value: what workflow
  was automated, what decisions were surfaced, how this saves time for RevOps teams.
  Example: "This single action replaced a 20-minute manual review — the agent surfaced that
  no economic buyer is identified and legal review hasn't started, two blockers a rep might miss."
- **enterprise**: Enterprise buyer evaluating governance. Narrate the control and safety aspects:
  audit trail, approval gates, role-based permissions, data provenance, traceability.
  Example: "Every action was logged to the audit trail. The forecast change requires explicit
  admin approval before any data is mutated — non-admin users can view but not approve."

Rules for persona narration:
- Persona changes explanation style ONLY — never change the data, analysis, or UI components shown.
- Narration is plain text AFTER the components, never instead of them.
- Keep narration concise (2-4 sentences max).
- Do not mention the persona system itself or that you are adapting your style.

## Rules
- NEVER invent data. Use only provided application context and tool results.
- For forecast changes, ALWAYS use updateRenewalForecast tool (triggers human approval).
- Be concise and actionable.`,
});

const runtime = new CopilotRuntime({
  agents: { default: builtInAgent },
  runner: new InMemoryAgentRunner(),
  // MCP Apps middleware — contract analyzer available via MCP protocol.
  // Note: the frontend also registers an analyzeContract tool via useFrontendTool
  // which shadows the MCP tool and handles the multi-turn loop correctly.
  mcpApps: {
    servers: [
      {
        type: "http" as const,
        url: MCP_SERVER_URL,
        serverId: "contract-analyzer",
      },
    ],
  },
});

// Main Hono app
const app = new Hono();

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:5173"];

console.log("CORS allowed origins:", allowedOrigins);

function withCors(request: Request, response: Response): Response {
  const origin = request.headers.get("Origin");
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, Accept",
    );
  }
  return response;
}

// Mount CopilotKit endpoint (single-route: client POSTs everything to one URL)
const copilotApp = createCopilotEndpointSingleRoute({
  runtime,
  basePath: "/api/copilotkit",
});

// REST API for enriched contact data
app.get("/api/contacts", (c) => {
  const company = c.req.query("company");
  const lifecycleStage = c.req.query("lifecycle_stage");
  const leadScoreMin = c.req.query("lead_score_min");
  const leadScoreMax = c.req.query("lead_score_max");
  const status = c.req.query("status");
  const firstName = c.req.query("first_name");
  const lastName = c.req.query("last_name");

  // Name-based lookup
  if (firstName && lastName) {
    const contact = getContactByName(firstName, lastName);
    return c.json(contact ? [contact] : []);
  }

  if (company || lifecycleStage || leadScoreMin || leadScoreMax || status) {
    return c.json(
      searchContactsStore({
        company: company || undefined,
        lifecycleStage: lifecycleStage || undefined,
        leadScoreMin: leadScoreMin ? parseInt(leadScoreMin, 10) : undefined,
        leadScoreMax: leadScoreMax ? parseInt(leadScoreMax, 10) : undefined,
        status: status || undefined,
      }),
    );
  }
  return c.json(getAllContacts());
});

app.get("/api/contacts/:id", (c) => {
  const id = parseInt(c.req.param("id"), 10);
  const contact = getContactById(id);
  if (!contact) return c.json({ error: "Not found" }, 404);
  return c.json(contact);
});

app.get("/api/companies/:name/contacts", (c) => {
  const name = decodeURIComponent(c.req.param("name"));
  return c.json(getContactsByCompanyStore(name));
});

app.get("/api/leads/top", (c) => {
  const limit = parseInt(c.req.query("limit") || "10", 10);
  return c.json(getTopLeadsStore(limit));
});

app.patch("/api/contacts/:id/forecast", async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  const body = await c.req.json();
  const updated = updateContactForecast(id, body);
  if (!updated) return c.json({ error: "Not found" }, 404);
  return c.json(updated);
});

// In-memory audit log
const auditEvents: Array<{
  id: string;
  timestamp: string;
  actionType: string;
  toolName: string | null;
  contactName: string | null;
  companyName: string | null;
  summary: string;
}> = [];

app.post("/api/audit", async (c) => {
  const body = await c.req.json();
  const event = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    actionType: body.actionType || "tool_call",
    toolName: body.toolName || null,
    contactName: body.contactName || null,
    companyName: body.companyName || null,
    summary: body.summary || "",
  };
  auditEvents.unshift(event);
  return c.json(event, 201);
});

app.get("/api/audit", (c) => {
  const contactName = c.req.query("contactName");
  const companyName = c.req.query("companyName");
  let filtered = auditEvents;
  if (contactName) {
    filtered = filtered.filter((e) => e.contactName === contactName);
  }
  if (companyName) {
    filtered = filtered.filter((e) => e.companyName === companyName);
  }
  return c.json(filtered);
});

// Mount CopilotKit — must come after CORS middleware
app.route("", copilotApp);

const port = parseInt(process.env.PORT || "4000", 10);
serve(
  {
    fetch: async (request) => {
      // Handle preflight
      if (request.method === "OPTIONS") {
        return withCors(request, new Response(null, { status: 204 }));
      }
      const response = await app.fetch(request);
      return withCors(request, response);
    },
    port,
  },
  (info) => {
    console.log(`CopilotKit server running on http://localhost:${info.port}`);
  },
);
