import { serve } from "@hono/node-server";
import { Hono } from "hono";
import {
  CopilotRuntime,
  createCopilotEndpointSingleRoute,
  BuiltInAgent,
  InMemoryAgentRunner,
} from "@copilotkit/runtime/v2";
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

## Status Lines
Before rendering UI components, emit brief status lines (one per line) describing what you are doing. Example:
Fetching account data for Schmitt and Sons...
Found 30 contacts across 4 lifecycle stages...
Analyzing missing signals...
Then render components. After all components, you may add 1-2 sentences of summary in a separate text message.

## Workflow Guidelines
- Account Review: call getContactsByCompany tool, then render AccountSummary + MissingSignals + RiskIndicators + NextActions
- Contract Risk: call analyzeContract tool to get the contract text, then render ContractRiskReport with the identified risks
- Forecast: render ForecastAdjustment for display, use updateRenewalForecast tool for mutations (triggers human approval)
- Lead Triage: call getTopLeads tool, then render LeadPriorityList
- For free-form questions: compose from primitives as appropriate

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
