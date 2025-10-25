import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export interface AgentStatusProps {
  agentId: string;
  status: "idle" | "running" | "error" | "unknown";
  lastRun?: string;
}

export function AgentStatus({ agentId, status, lastRun }: AgentStatusProps) {
  const getStatusDisplay = () => {
    switch (status) {
      case "idle":
        return {
          badge: (
            <Badge variant="secondary" className="gap-1" data-testid={`badge-status-${agentId}`}>
              <div className="w-2 h-2 rounded-full bg-green-500" />
              Idle
            </Badge>
          ),
          color: "text-green-600",
          bgColor: "bg-green-50",
        };
      case "running":
        return {
          badge: (
            <Badge variant="secondary" className="gap-1" data-testid={`badge-status-${agentId}`}>
              <Loader2 className="w-3 h-3 animate-spin" />
              Running
            </Badge>
          ),
          color: "text-yellow-600",
          bgColor: "bg-yellow-50",
        };
      case "error":
        return {
          badge: (
            <Badge variant="destructive" className="gap-1" data-testid={`badge-status-${agentId}`}>
              <div className="w-2 h-2 rounded-full bg-white" />
              Error
            </Badge>
          ),
          color: "text-red-600",
          bgColor: "bg-red-50",
        };
      default:
        return {
          badge: (
            <Badge variant="outline" className="gap-1" data-testid={`badge-status-${agentId}`}>
              <div className="w-2 h-2 rounded-full bg-gray-400" />
              Unknown
            </Badge>
          ),
          color: "text-gray-600",
          bgColor: "bg-gray-50",
        };
    }
  };

  const display = getStatusDisplay();

  return (
    <div className="flex flex-col gap-2">
      {display.badge}
      {lastRun && (
        <p className="text-xs text-muted-foreground" data-testid={`text-last-run-${agentId}`}>
          Last run: {new Date(lastRun).toLocaleString()}
        </p>
      )}
    </div>
  );
}
