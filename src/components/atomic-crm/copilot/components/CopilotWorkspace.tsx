import {
  CopilotChat,
  CopilotChatToolCallsView,
  useAgent,
} from "@copilotkit/react-core/v2";
import { Loader2 } from "lucide-react";
import { useState, useCallback, useRef } from "react";
import { CopilotHeader } from "./CopilotHeader";
import { ThreadHistory } from "./ThreadHistory";

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
          🪁
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

const AGENT_ID = "default";

interface CopilotWorkspaceProps {
  className?: string;
  children?: React.ReactNode;
}

export function CopilotWorkspace({
  className,
  children,
}: CopilotWorkspaceProps) {
  const { agent } = useAgent();
  const [threadId, setThreadId] = useState<string | undefined>(undefined);
  const [view, setView] = useState<"chat" | "history">("chat");
  const [chatKey, setChatKey] = useState(0);
  const agentThreadRef = useRef<string | undefined>(undefined);
  if (agent.threadId) agentThreadRef.current = agent.threadId;

  const handleToggleView = useCallback(() => {
    setView((prev) => {
      if (prev === "chat") {
        // Only snapshot from agent if threadId isn't already set
        // (i.e. CopilotChat was managing its own thread)
        if (!threadId && agentThreadRef.current) {
          setThreadId(agentThreadRef.current);
        }
        return "history";
      }
      setChatKey((k) => k + 1);
      return "chat";
    });
  }, [threadId]);

  const handleNewConversation = useCallback(() => {
    console.log("[WS new conversation]");
    setThreadId(undefined);
    setChatKey((k) => k + 1);
    setView("chat");
  }, []);

  const handleSelectThread = useCallback((id: string) => {
    console.log("[WS select thread]", id);
    setThreadId(id);
    setChatKey((k) => k + 1);
    setView("chat");
  }, []);

  return (
    <div
      className={`copilot-workspace-chat h-full flex flex-col [&_[data-testid=copilot-welcome-screen]]:px-0 ${className ?? ""}`}
    >
      <CopilotHeader
        view={view}
        onToggleView={handleToggleView}
        onNewConversation={handleNewConversation}
      />

      {view === "history" ? (
        <div className="flex-1 min-h-0 overflow-y-auto">
          <ThreadHistory
            agentId={AGENT_ID}
            activeThreadId={threadId ?? agent.threadId}
            onSelectThread={handleSelectThread}
          />
        </div>
      ) : (
        <>
          {children}
          <div className="copilot-chat-area">
            <CopilotChat
              key={chatKey}
              agentId={AGENT_ID}
              threadId={threadId}
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
        </>
      )}
    </div>
  );
}
