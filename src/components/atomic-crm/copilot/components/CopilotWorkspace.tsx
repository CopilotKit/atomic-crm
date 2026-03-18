import {
  CopilotChat,
  CopilotChatToolCallsView,
} from "@copilotkit/react-core/v2";
import { Bot, Loader2, Check, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// ─── v2 AssistantMessage ─────────────────────────────────────────────────────
//
// Renders:
// 1. Tool call blocks via CopilotChatToolCallsView (generative UI)
// 2. Text content as status lines (if message also has tool calls)
//    or as normal chat text (if message has no tool calls)
//
// Key: CopilotChatToolCallsView is rendered exactly as in the original
// working code — no extra wrappers or conditional state that could
// interfere with CopilotKit's internal rendering lifecycle.

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

  // DEBUG: log message structure to understand CopilotKit's rendering
  console.log("[CopilotMsg]", {
    id: message.id?.slice(0, 8),
    role: message.role,
    hasText: !!textContent,
    textPreview: textContent?.slice(0, 50),
    toolCallCount: message.toolCalls?.length ?? 0,
    toolCallNames: (message.toolCalls as any[])?.map(
      (tc: any) => tc?.function?.name ?? tc?.name ?? "unknown",
    ),
    isLatest,
    isRunning,
  });

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
      {/* Tool call blocks — rendered first, same as original working code */}
      {hasToolCalls && (
        <CopilotChatToolCallsView
          message={message as any}
          messages={messages as any}
        />
      )}

      {/* Text: status lines (if message has tool calls) or chat text */}
      {textContent &&
        (hasToolCalls ? (
          <StatusLines
            content={textContent}
            isRunning={isRunning && isLatest}
          />
        ) : (
          <div className="flex items-start gap-2">
            <Bot className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
            <p className="text-sm leading-relaxed text-foreground">
              {textContent}
              {isRunning && isLatest && (
                <span className="inline-block w-1.5 h-4 bg-foreground/50 animate-pulse ml-0.5 align-text-bottom" />
              )}
            </p>
          </div>
        ))}
    </div>
  );
}

// ─── StatusLines: stateless rendering of agent text as status entries ─────────
//
// No useState, no useEffect — purely derived from props.
// This avoids interfering with CopilotKit's rendering lifecycle.

function StatusLines({
  content,
  isRunning,
}: {
  content: string;
  isRunning: boolean;
}) {
  const lines = content
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return null;

  return (
    <div className="space-y-1">
      {lines.map((line, index) => {
        const isLast = index === lines.length - 1;
        const isActive = isRunning && isLast;

        return (
          <div
            key={index}
            className={`flex items-center gap-2 text-sm transition-opacity ${
              isActive ? "opacity-100" : "opacity-50"
            }`}
          >
            {isActive ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground flex-shrink-0" />
            ) : (
              <Check className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            )}
            <span className="text-muted-foreground">{line}</span>
          </div>
        );
      })}
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
