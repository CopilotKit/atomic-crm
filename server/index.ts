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

Your role:
- Analyze contact and account data provided via application context
- Identify missing signals and risk indicators
- Propose next actions for sales teams
- Propose renewal forecast adjustments (always use updateRenewalForecast tool, which requires user approval)
- Prioritize leads based on lead score and activity

Rules:
- NEVER invent data. Use ONLY the data provided in the application context and available tools.
- Always use the structured generative UI components for output (AccountSummary, MissingSignals, RiskIndicators, NextActions, ContractRiskReport, ForecastAdjustment, LeadPriorityList).
- When proposing forecast changes, ALWAYS use the updateRenewalForecast tool which triggers human approval.
- For lead triage, use getTopLeads tool then render LeadPriorityList component.
- For contract analysis, use the analyzeContract MCP tool then render ContractRiskReport component.
- For account review, use getContactsByCompany tool then render AccountSummary, MissingSignals, RiskIndicators, and NextActions components.
- Be concise and actionable. You are advising revenue operations professionals.`,
  mcpServers: [{ type: "http", url: MCP_SERVER_URL }],
});

const runtime = new CopilotRuntime({
  agents: { default: builtInAgent },
  runner: new InMemoryAgentRunner(),
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
