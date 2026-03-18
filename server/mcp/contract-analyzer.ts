import {
  registerAppTool,
  registerAppResource,
  RESOURCE_MIME_TYPE,
} from "@modelcontextprotocol/ext-apps/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contractsDir = path.join(__dirname, "../contracts");

function toKebabCase(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ─── Contract risk parser ────────────────────────────────────────────────────
// Parses [HIGH RISK], [MEDIUM RISK], [LOW RISK] annotations from contract markdown

interface ContractRisks {
  companyName: string;
  high: string[];
  medium: string[];
  low: string[];
}

function parseContractRisks(
  companyName: string,
  contractText: string,
): ContractRisks {
  const risks: ContractRisks = { companyName, high: [], medium: [], low: [] };
  const sections = contractText.split(/^## /m);

  for (const section of sections) {
    const lines = section.trim().split("\n");
    const title = lines[0]?.replace(/^#+\s*/, "").trim() || "";

    if (section.includes("[HIGH RISK]")) {
      // Extract the paragraph after the risk tag
      const desc = section
        .replace(/\*\*\[HIGH RISK\]\*\*\s*/g, "")
        .split("\n")
        .filter((l) => l.trim() && !l.startsWith("#"))
        .map((l) => l.trim())
        .join(" ")
        .slice(0, 200);
      risks.high.push(`${title}: ${desc}`);
    } else if (section.includes("[MEDIUM RISK]")) {
      const desc = section
        .replace(/\*\*\[MEDIUM RISK\]\*\*\s*/g, "")
        .split("\n")
        .filter((l) => l.trim() && !l.startsWith("#"))
        .map((l) => l.trim())
        .join(" ")
        .slice(0, 200);
      risks.medium.push(`${title}: ${desc}`);
    } else if (section.includes("[LOW RISK]")) {
      const desc = section
        .replace(/\*\*\[LOW RISK\]\*\*\s*/g, "")
        .split("\n")
        .filter((l) => l.trim() && !l.startsWith("#"))
        .map((l) => l.trim())
        .join(" ")
        .slice(0, 200);
      risks.low.push(`${title}: ${desc}`);
    }
  }

  return risks;
}

// ─── HTML template for the MCP App UI ────────────────────────────────────────

function buildContractRiskHtml(risks: ContractRisks): string {
  const riskSection = (
    title: string,
    items: string[],
    color: string,
    dotColor: string,
  ) => {
    if (items.length === 0) return "";
    const lis = items
      .map(
        (item) => `
      <li style="display:flex;align-items:flex-start;gap:8px;font-size:14px;margin-bottom:6px">
        <span style="margin-top:6px;width:8px;height:8px;border-radius:50%;background:${dotColor};flex-shrink:0"></span>
        <span>${item}</span>
      </li>`,
      )
      .join("");
    return `
      <div style="margin-bottom:16px">
        <div style="font-size:14px;font-weight:600;margin-bottom:6px;color:${color}">${title}</div>
        <ul style="list-style:none;padding:0;margin:0">${lis}</ul>
      </div>`;
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      padding: 20px;
      color: #1a1a1a;
      background: transparent;
      line-height: 1.5;
    }
    @media (prefers-color-scheme: dark) {
      body { color: #e0e0e0; }
    }
  </style>
</head>
<body>
  <div style="font-size:16px;font-weight:600;margin-bottom:16px">
    ${risks.companyName} — Contract Risk Report
  </div>
  ${riskSection("High Risk", risks.high, "#dc2626", "#ef4444")}
  ${riskSection("Medium Risk", risks.medium, "#d97706", "#f59e0b")}
  ${riskSection("Low Risk", risks.low, "#16a34a", "#22c55e")}
  ${risks.high.length === 0 && risks.medium.length === 0 && risks.low.length === 0 ? '<div style="font-size:14px;color:#888">No risk annotations found in contract.</div>' : ""}
</body>
</html>`;
}

// ─── MCP App Server ──────────────────────────────────────────────────────────

// Module-level cache: persists across requests since the HTTP server stays alive
let latestRisksHtml = buildContractRiskHtml({
  companyName: "",
  high: [],
  medium: [],
  low: [],
});

function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "contract-analyzer",
    version: "1.0.0",
  });

  const resourceUri = "ui://analyzeContract/contract-risk-report.html";

  // Register tool with UI metadata — links to the resource URI
  registerAppTool(
    server,
    "analyzeContract",
    {
      title: "Analyze Contract",
      description:
        "Read and analyze the contract document for a given company, identifying high, medium, and low risk clauses. Returns a visual risk report.",
      inputSchema: {
        companyName: z
          .string()
          .describe("The company name to look up the contract for"),
      },
      _meta: { ui: { resourceUri } },
    },
    async ({ companyName }: { companyName: string }) => {
      console.log(`[MCP App] analyzeContract called for: "${companyName}"`);

      const filename = `${toKebabCase(companyName)}.md`;
      const filepath = path.join(contractsDir, filename);

      if (!fs.existsSync(filepath)) {
        return {
          content: [
            {
              type: "text" as const,
              text: `No contract file found for company "${companyName}" (looked for ${filename})`,
            },
          ],
        };
      }

      const contractText = fs.readFileSync(filepath, "utf-8");
      const risks = parseContractRisks(companyName, contractText);

      // Update module-level cache so the resource handler serves the correct HTML
      latestRisksHtml = buildContractRiskHtml(risks);
      console.log(
        `[MCP App] Parsed risks: ${risks.high.length} high, ${risks.medium.length} medium, ${risks.low.length} low`,
      );

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(risks),
          },
        ],
      };
    },
  );

  // Register the UI resource that CopilotKit will fetch and render in an iframe
  registerAppResource(
    server,
    resourceUri,
    resourceUri,
    { mimeType: RESOURCE_MIME_TYPE },
    async () => {
      console.log(
        `[MCP App] Resource fetched, HTML length: ${latestRisksHtml.length}`,
      );
      return {
        contents: [
          {
            uri: resourceUri,
            mimeType: RESOURCE_MIME_TYPE,
            text: latestRisksHtml,
          },
        ],
      };
    },
  );

  return server;
}

// ─── HTTP Server ─────────────────────────────────────────────────────────────

const httpServer = createServer(
  async (req: IncomingMessage, res: ServerResponse) => {
    if (req.url === "/mcp") {
      try {
        const server = createMcpServer();
        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: undefined,
        });
        await server.connect(transport);
        await transport.handleRequest(req, res);
      } catch (err) {
        console.error("MCP request error:", err);
        if (!res.headersSent) {
          res.writeHead(500);
          res.end("Internal server error");
        }
      }
    } else {
      res.writeHead(404);
      res.end("Not found");
    }
  },
);

const port = parseInt(process.env.PORT || process.env.MCP_PORT || "3108", 10);
httpServer.listen(port, () => {
  console.log(
    `MCP App contract analyzer running on http://localhost:${port}/mcp`,
  );
});
