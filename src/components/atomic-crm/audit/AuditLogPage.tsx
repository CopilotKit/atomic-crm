import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router";

const API_BASE =
  import.meta.env.VITE_COPILOTKIT_API_URL || "http://localhost:4000";

interface AuditEvent {
  id: string;
  timestamp: string;
  actionType: "tool_call" | "component_render" | "agent_summary";
  toolName: string | null;
  contactName: string | null;
  companyName: string | null;
  summary: string;
}

const badgeStyles: Record<string, string> = {
  tool_call: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  component_render:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  agent_summary:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
};

const badgeLabels: Record<string, string> = {
  tool_call: "Tool",
  component_render: "Render",
  agent_summary: "Agent",
};

function relativeTime(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(timestamp).toLocaleDateString();
}

export const AuditLogPage = () => {
  const [events, setEvents] = useState<AuditEvent[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/audit`);
        const data = await res.json();
        setEvents(data);
      } catch {
        // Silently fail
      }
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-3xl mx-auto mt-8 px-4" data-demo="audit-list">
      <h2 className="text-2xl font-semibold mb-4">Audit Log</h2>
      {events.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No audit events yet. Interact with the agent to generate entries.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {events.map((event) => (
            <Card key={event.id}>
              <CardContent className="py-3 flex items-start gap-3">
                <div className="text-xs text-muted-foreground w-16 flex-shrink-0 pt-0.5">
                  {relativeTime(event.timestamp)}
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium flex-shrink-0 ${badgeStyles[event.actionType] ?? ""}`}
                >
                  {badgeLabels[event.actionType] ?? event.actionType}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm">{event.summary}</div>
                  {(event.contactName || event.companyName) && (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {event.contactName && <span>{event.contactName}</span>}
                      {event.contactName && event.companyName && " · "}
                      {event.companyName && (
                        <Link to={`/companies`} className="underline">
                          {event.companyName}
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

AuditLogPage.path = "/audit";
