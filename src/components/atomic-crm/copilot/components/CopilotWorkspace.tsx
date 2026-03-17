import { useState, useEffect, useRef } from "react";
import {
  CopilotChat,
  CopilotChatToolCallsView,
} from "@copilotkit/react-core/v2";
import { Bot, ChevronDown, ChevronRight, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusLine } from "./StatusLine";

// ─── Status Stream: renders agent text as multi-step status lines ────────────

function StatusStream({
  content,
  isRunning,
  toolCallCount,
}: {
  content: string;
  isRunning: boolean;
  toolCallCount: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const wasRunning = useRef(isRunning);

  // Auto-collapse when agent finishes
  useEffect(() => {
    if (wasRunning.current && !isRunning) {
      setExpanded(false);
    }
    wasRunning.current = isRunning;
  }, [isRunning]);

  const lines = content
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return null;

  // While running, always show expanded
  if (isRunning) {
    return (
      <div className="space-y-1 py-1">
        {lines.map((line, index) => (
          <StatusLine
            key={index}
            text={line}
            isActive={index === lines.length - 1}
          />
        ))}
      </div>
    );
  }

  // After completion: collapsible summary
  const summary = `Analyzed · ${toolCallCount} block${toolCallCount !== 1 ? "s" : ""} · ${lines.length} step${lines.length !== 1 ? "s" : ""}`;

  return (
    <div className="py-1">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {expanded ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        {summary}
      </button>
      {expanded && (
        <div className="space-y-1 mt-1">
          {lines.map((line, index) => (
            <StatusLine key={index} text={line} isActive={false} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── v2 AssistantMessage: status stream + tool call blocks + text ────────────

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
  const isActivelyRunning = isRunning && isLatest;

  // If message has tool calls + text → text is status lines (per spec heuristic)
  const isStatusMessage = hasToolCalls && !!textContent;
  // If message has only text (no tool calls) → normal text message
  const isTextOnly = !hasToolCalls && !!textContent;
  // Thinking state: running, latest, no content yet
  const isThinking = isActivelyRunning && !textContent && !hasToolCalls;

  if (isThinking) {
    return (
      <div className="py-1">
        <StatusLine text="Thinking..." isActive />
      </div>
    );
  }

  if (!textContent && !hasToolCalls) return null;

  return (
    <div className="space-y-3 py-1">
      {/* Status stream (text in a message that also has tool calls) */}
      {isStatusMessage && (
        <StatusStream
          content={textContent}
          isRunning={isActivelyRunning}
          toolCallCount={message.toolCalls?.length ?? 0}
        />
      )}

      {/* Generative UI blocks rendered via tool calls */}
      {hasToolCalls && (
        <div className="space-y-3">
          <CopilotChatToolCallsView
            message={message as any}
            messages={messages as any}
          />
        </div>
      )}

      {/* Normal text response (messages without tool calls) */}
      {isTextOnly && (
        <div className="flex items-start gap-2">
          <Bot className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
          <p className="text-sm leading-relaxed text-foreground">
            {textContent}
            {isActivelyRunning && (
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
