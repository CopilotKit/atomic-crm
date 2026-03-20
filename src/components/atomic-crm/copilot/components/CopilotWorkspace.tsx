import {
  CopilotChat,
  CopilotChatToolCallsView,
} from "@copilotkit/react-core/v2";
import { Bot, Loader2 } from "lucide-react";

// ─── Null slot: disables a v2 CopilotChat sub-component ─────────────────────

const NullSlot = () => null;

// ─── v2 AssistantMessage ─────────────────────────────────────────────────────

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
      {hasToolCalls && (
        <CopilotChatToolCallsView
          message={message as any}
          messages={messages as any}
        />
      )}

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
    <div
      className={`copilot-workspace-chat h-full [&_[data-testid=copilot-welcome-screen]]:px-0 ${className ?? ""}`}
    >
      <CopilotChat
        className="copilot-chat-inline"
        messageView={{
          assistantMessage: WorkspaceAssistantMessage as any,
          userMessage: WorkspaceUserMessage as any,
        }}
        scrollView={{
          feather: NullSlot,
          scrollToBottomButton: NullSlot,
        }}
      />
    </div>
  );
}
