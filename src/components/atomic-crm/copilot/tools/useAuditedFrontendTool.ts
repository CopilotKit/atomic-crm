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
          const result = await originalHandler(args, context);
          logToolCall(options.name, args);
          return result;
        }
      : undefined,
  };

  useFrontendTool(auditedOptions, deps);
}
