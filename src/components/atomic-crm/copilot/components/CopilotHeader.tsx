import { History, Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CopilotHeaderProps {
  view: "chat" | "history";
  onToggleView: () => void;
  onNewConversation: () => void;
}

export function CopilotHeader({
  view,
  onToggleView,
  onNewConversation,
}: CopilotHeaderProps) {
  if (view === "history") {
    return (
      <div className="flex items-center gap-2 px-3 py-2 border-b shrink-0 relative z-10">
        <Button variant="ghost" size="sm" onClick={onToggleView}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <span className="text-sm font-medium">Conversation History</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between px-3 py-2 border-b shrink-0 relative z-10">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={onToggleView}
        title="Conversation history"
      >
        <History className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onNewConversation}
        title="New conversation"
      >
        <Plus className="h-4 w-4 mr-1" />
        New
      </Button>
    </div>
  );
}
