import {
  CopilotChat,
  CopilotChatToolCallsView,
} from "@copilotkit/react-core/v2";
import { Bot, Loader2, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// ─── v2 AssistantMessage ─────────────────────────────────────────────────────
//
// Renders:
// 1. Tool call blocks via CopilotChatToolCallsView (generative UI)
//    Tool execution status (spinner/checkmark) is handled by
//    useDefaultRenderTool in useCopilotSetup — that's the reasoning trace.
// 2. Agent text as plain chat text (no parsing, no status line splitting)

function WorkspaceAssistantMessage({
  message,
  messages,
  isRunning,
}: {
  message: {
    id: string;
    role: string;
    content?: string;
    toolCalls?: unknown[];
  };
  messages: unknown[];
  isRunning: boolean;
  [key: string]: unknown;
}) {
  const hasToolCalls = message.toolCalls && message.toolCalls.length > 0;
  const textContent = message.content?.trim();
  const isLatest =
    (messages as Array<{ id: string }>)?.at(-1)?.id === message.id;
  const isThinking = isRunning && isLatest && !textContent && !hasToolCalls;

  if (isThinking) {
    return (
      <div className="flex items-center gap-2 py-3 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Thinking...</span>
      </div>
    );
  }

  if (!textContent && !hasToolCalls) return null;

  return (
    <div className="space-y-2 py-1">
      {/* Tool call blocks (generative UI + useDefaultRenderTool status) */}
      {hasToolCalls && (
        <CopilotChatToolCallsView
          message={message as any}
          messages={messages as any}
        />
      )}

      {/* Agent text — rendered as plain chat text, never parsed */}
      {textContent && (
        <div className="flex items-start gap-2">
          <Bot className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
          <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">
            {textContent}
            {isRunning && isLatest && (
              <span className="inline-block w-1.5 h-4 bg-foreground/50 animate-pulse ml-0.5 align-text-bottom" />
            )}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── v2 UserMessage: right-aligned bubble ────────────────────────────────────

function WorkspaceUserMessage({
  message,
}: {
  message: { content?: string };
  [key: string]: unknown;
}) {
  if (!message?.content?.trim()) return null;

  return (
    <div className="py-1 flex justify-end">
      <div className="bg-muted rounded-lg px-3 py-2 max-w-[85%]">
        <p className="text-sm">{message.content}</p>
      </div>
    </div>
  );
}

// ─── CopilotWorkspace ────────────────────────────────────────────────────────

interface CopilotWorkspaceProps {
  className?: string;
}

export function CopilotWorkspace({ className }: CopilotWorkspaceProps) {
  return (
    <Card className={className}>
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Copilot</span>
        </div>
        <div className="copilot-workspace-chat">
          <CopilotChat
            className="copilot-chat-inline"
            messageView={{
              assistantMessage: WorkspaceAssistantMessage as any,
              userMessage: WorkspaceUserMessage as any,
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
