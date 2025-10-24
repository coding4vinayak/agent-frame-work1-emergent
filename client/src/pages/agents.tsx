import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Cpu, Play, Settings, Eye, Loader2 } from "lucide-react";
import type { Agent } from "@shared/schema";

export default function Agents() {
  const { toast } = useToast();

  const { data: agents, isLoading } = useQuery<Agent[]>({
    queryKey: ["/api/agents"],
  });

  const runMutation = useMutation({
    mutationFn: async (agentId: string) => {
      return apiRequest("POST", `/api/agents/${agentId}/run`, null);
    },
    onSuccess: () => {
      toast({
        title: "Agent started",
        description: "The agent is now running",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to run agent",
        description: error.message,
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "inactive":
        return "bg-gray-400";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "error":
        return "destructive";
      default:
        return "secondary";
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!agents || agents.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Agents</h1>
          <p className="text-sm text-muted-foreground mt-2">
            AI agents to automate your workflows (coming soon)
          </p>
        </div>

        <Card className="p-16">
          <div className="max-w-md mx-auto text-center">
            <Cpu className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Agents Yet</h2>
            <p className="text-sm text-muted-foreground mb-6">
              AI agents are powerful automation tools that will be available soon.
              They'll help you streamline workflows, process data, and complete tasks
              automatically.
            </p>
            <Button variant="outline" disabled data-testid="button-create-agent">
              Coming Soon
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Agents</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Manage and monitor your AI automation agents
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <Card key={agent.id} className="p-6" data-testid={`card-agent-${agent.id}`}>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Cpu className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold mb-1">{agent.name}</h3>
                <Badge variant="outline" className="text-xs mb-2">
                  {agent.type}
                </Badge>
              </div>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {agent.description || "No description available"}
            </p>

            <div className="flex items-center gap-2 mb-4">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)}`} />
              <Badge variant={getStatusVariant(agent.status)} className="text-xs">
                {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
              </Badge>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                disabled
                data-testid={`button-view-${agent.id}`}
              >
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
              <Button
                variant="default"
                size="sm"
                className="flex-1"
                onClick={() => runMutation.mutate(agent.id)}
                disabled={runMutation.isPending}
                data-testid={`button-run-${agent.id}`}
              >
                <Play className="w-4 h-4 mr-1" />
                Run
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled
                data-testid={`button-settings-${agent.id}`}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
