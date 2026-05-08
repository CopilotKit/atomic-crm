import { useFrontendTool } from "@copilotkit/react-core/v2";
import { logToolCall } from "./auditLogger";

type FrontendToolOptions = Parameters<typeof useFrontendTool>[0];

export function useAuditedFrontendTool(
  options: FrontendToolOptions,
  deps?: ReadonlyArray<unknown>,
) {
  const originalHandler = options.handler;

  const auditedOptions: FrontendToolOptions = {
    ...options,
    handler: originalHandler
      ? async (args: any, context: any) => {
          try {
            const result = await originalHandler(args, context);
            logToolCall(options.name, args);
            return result;
          } catch (err) {
            // Returning a structured error keeps the result in the agent's
            // tool-output channel. Re-throwing here causes CopilotKit's
            // RunHandler to abort the run, which triggers a new thread on
            // the next chat send and visibly wipes the panel.
            const message = err instanceof Error ? err.message : String(err);
            console.error("[tool:error]", options.name, err);
            return {
              error: `Tool ${options.name} failed: ${message}`,
              ok: false,
            };
          }
        }
      : undefined,
  };

  useFrontendTool(auditedOptions, deps);
}
