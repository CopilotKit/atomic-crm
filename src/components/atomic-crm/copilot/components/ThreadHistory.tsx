import { useThreads } from "@copilotkit/react-core/v2";
import { Loader2, Trash2, Archive, ArchiveRestore } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ThreadHistoryProps {
  agentId: string;
  activeThreadId: string | undefined;
  onSelectThread: (threadId: string) => void;
}

export function ThreadHistory({
  agentId,
  activeThreadId,
  onSelectThread,
}: ThreadHistoryProps) {
  const [showArchived, setShowArchived] = useState(false);
  const {
    threads,
    archiveThread,
    deleteThread,
    isLoading,
    hasMoreThreads,
    isFetchingMoreThreads,
    fetchMoreThreads,
  } = useThreads({
    agentId,
    includeArchived: showArchived,
    limit: 20,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        <span className="text-sm">Loading threads...</span>
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
        <p className="text-sm">No conversations yet.</p>
        <p className="text-xs">Start a new conversation to see it here.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <ul className="divide-y divide-border">
          {threads.map((thread) => (
            <li key={thread.id}>
              <button
                type="button"
                onClick={() => onSelectThread(thread.id)}
                className={`w-full text-left px-3 py-3 hover:bg-muted/50 transition-colors ${
                  activeThreadId === thread.id ? "bg-muted" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      {thread.name || "Untitled conversation"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(thread.updatedAt ?? thread.createdAt)}
                      {thread.archived && (
                        <span className="ml-1.5 text-muted-foreground/60">
                          (archived)
                        </span>
                      )}
                    </p>
                  </div>
                  <div
                    className="flex items-center gap-0.5 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => archiveThread(thread.id)}
                      className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      title={thread.archived ? "Unarchive" : "Archive"}
                    >
                      {thread.archived ? (
                        <ArchiveRestore className="h-3.5 w-3.5" />
                      ) : (
                        <Archive className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteThread(thread.id)}
                      className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>

        {hasMoreThreads && (
          <div className="px-3 py-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              disabled={isFetchingMoreThreads}
              onClick={() => fetchMoreThreads?.()}
            >
              {isFetchingMoreThreads ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  Loading...
                </>
              ) : (
                "Load more"
              )}
            </Button>
          </div>
        )}
      </div>

      <div className="border-t px-3 py-2">
        <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
            className="rounded"
          />
          Show archived
        </label>
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
