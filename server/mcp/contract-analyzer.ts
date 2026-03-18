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

function createMcpServer(): McpServer {
  const server = new McpServer({ name: "contract-analyzer", version: "1.0.0" });

  server.tool(
    "analyzeContract",
    "Read and return the contract document for a given company. The contract text can then be analyzed for risks.",
    {
      companyName: z
        .string()
        .describe("The company name to look up the contract for"),
    },
    async ({ companyName }) => {
      console.log(`[MCP] analyzeContract called for: "${companyName}"`);
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
      return {
        content: [
          {
            type: "text" as const,
            text: `Contract document for ${companyName}:\n\n${contractText}`,
          },
        ],
      };
    },
  );

  return server;
}

// Stateless: create a fresh server + transport per request
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
  console.log(`MCP contract analyzer running on http://localhost:${port}/mcp`);
});
