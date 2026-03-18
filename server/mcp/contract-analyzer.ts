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

// ─── HTML template: renders contract markdown with highlighted risk tags ─────

function buildContractHtml(_companyName: string, markdown: string): string {
  // Escape backticks and backslashes for safe embedding in JS template literal
  const escaped = markdown
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$/g, "\\$");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      padding: 16px;
      color: #1a1a1a;
      background: transparent;
      line-height: 1.6;
      font-size: 13px;
    }
    @media (prefers-color-scheme: dark) {
      body { color: #e0e0e0; }
      .risk-high { background: #7f1d1d; color: #fecaca; }
      .risk-medium { background: #78350f; color: #fef3c7; }
      .risk-low { background: #14532d; color: #dcfce7; }
    }
    h1 { font-size: 16px; font-weight: 600; margin-bottom: 12px; }
    h2 { font-size: 14px; font-weight: 600; margin: 16px 0 8px; }
    p { margin-bottom: 8px; }
    hr { border: none; border-top: 1px solid #e5e5e5; margin: 12px 0; }
    @media (prefers-color-scheme: dark) { hr { border-color: #404040; } }
    .risk-high {
      display: inline-block;
      background: #fee2e2; color: #991b1b;
      font-size: 11px; font-weight: 600;
      padding: 1px 6px; border-radius: 4px;
      margin-right: 4px;
    }
    .risk-medium {
      display: inline-block;
      background: #fef9c3; color: #854d0e;
      font-size: 11px; font-weight: 600;
      padding: 1px 6px; border-radius: 4px;
      margin-right: 4px;
    }
    .risk-low {
      display: inline-block;
      background: #dcfce7; color: #166534;
      font-size: 11px; font-weight: 600;
      padding: 1px 6px; border-radius: 4px;
      margin-right: 4px;
    }
  </style>
</head>
<body>
  <div id="content"></div>
  <script>
    const md = \`${escaped}\`;
    // Minimal markdown parser — handles headings, bold, hr, paragraphs
    function parseMd(text) {
      return text
        .split('\\n\\n')
        .map(function(block) {
          block = block.trim();
          if (!block) return '';
          // Horizontal rule
          if (/^---+$/.test(block)) return '<hr>';
          // Headings
          if (block.startsWith('# ')) return '<h1>' + inline(block.slice(2)) + '</h1>';
          if (block.startsWith('## ')) return '<h2>' + inline(block.slice(3)) + '</h2>';
          if (block.startsWith('### ')) return '<h3>' + inline(block.slice(4)) + '</h3>';
          // Paragraph
          return '<p>' + inline(block.replace(/\\n/g, ' ')) + '</p>';
        })
        .join('\\n');
    }
    function inline(text) {
      // Bold
      text = text.replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>');
      // Italic
      text = text.replace(/\\*(.+?)\\*/g, '<em>$1</em>');
      return text;
    }
    let html = parseMd(md);
    // Replace risk tags with colored badges
    html = html.replace(/<strong>\\[HIGH RISK\\]<\\/strong>/g,
      '<span class="risk-high">HIGH RISK</span>');
    html = html.replace(/<strong>\\[MEDIUM RISK\\]<\\/strong>/g,
      '<span class="risk-medium">MEDIUM RISK</span>');
    html = html.replace(/<strong>\\[LOW RISK\\]<\\/strong>/g,
      '<span class="risk-low">LOW RISK</span>');
    document.getElementById('content').innerHTML = html;

    // Report content size to CopilotKit MCP App host
    requestAnimationFrame(function() {
      window.parent.postMessage({
        jsonrpc: "2.0",
        method: "ui/notifications/size-changed",
        params: { width: document.body.scrollWidth, height: document.body.scrollHeight }
      }, "*");
    });
  </script>
</body>
</html>`;
}

// ─── MCP App Server ──────────────────────────────────────────────────────────

// Module-level cache: persists across requests since the HTTP server stays alive
let latestHtml = buildContractHtml("", "No contract loaded yet.");

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

      // Update module-level cache so the resource handler serves the correct HTML
      latestHtml = buildContractHtml(companyName, contractText);
      console.log(
        `[MCP App] Built HTML for ${companyName}, length: ${latestHtml.length}`,
      );

      return {
        content: [
          {
            type: "text" as const,
            text: contractText,
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
        `[MCP App] Resource fetched, HTML length: ${latestHtml.length}`,
      );
      return {
        contents: [
          {
            uri: resourceUri,
            mimeType: RESOURCE_MIME_TYPE,
            text: latestHtml,
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
