import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Package,
  Play,
  Settings,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Activity,
  ShoppingBag,
  Eye,
  History
} from "lucide-react";
import type { AgentCatalog, AgentSubscription, ModuleExecution } from "@shared/schema";
import { Link, useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AgentTestInterface } from "@/components/agent-test-interface";
import { AgentConfigModal } from "@/components/agent-config-modal";

type ActiveAgentWithDetails = {
  subscription: AgentSubscription;
  agent: AgentCatalog;
  stats: {
    totalExecutions: number;
    successRate: number;
    lastRun?: string;
  };
  recentExecutions: ModuleExecution[];
  currentStatus: "idle" | "running" | "error" | "unknown";
};

export default function Modules() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedAgent, setSelectedAgent] = useState<AgentCatalog | null>(null);
  const [configAgent, setConfigAgent] = useState<AgentCatalog | null>(null);


  const { data: subscriptions = [], isLoading: isLoadingSubscriptions } = useQuery<AgentSubscription[]>({
    queryKey: ["/api/agents"],
  });

  const { data: catalog = [] } = useQuery<AgentCatalog[]>({
    queryKey: ["/api/agents/marketplace"],
  });

  const { data: executions = [] } = useQuery<ModuleExecution[]>({
    queryKey: ["/api/module-executions", { limit: 100 }],
    refetchInterval: 5000,
  });

  const activeAgents: ActiveAgentWithDetails[] = subscriptions
    .map((sub) => {
      const agent = catalog.find((a) => a.id === sub.agentId);
      if (!agent) return null;

      const agentExecutions = executions.filter((e) => {
        return e.moduleId === sub.id || e.moduleId === sub.agentId;
      });

    const recentExecutions = agentExecutions.slice(0, 5);
    const totalExecutions = agentExecutions.length;
    const successfulExecutions = agentExecutions.filter((e) => e.status === "completed").length;
    const successRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0;
    const lastRun = agentExecutions.length > 0 ? agentExecutions[0].startedAt.toString() : undefined;

    const hasRunningExecution = agentExecutions.some((e) => e.status === "running");
    const hasFailedExecution = agentExecutions.length > 0 && agentExecutions[0].status === "failed";

    let currentStatus: "idle" | "running" | "error" | "unknown";
    if (hasRunningExecution) {
      currentStatus = "running";
    } else if (hasFailedExecution) {
      currentStatus = "error";
    } else if (sub.status === "active") {
      currentStatus = "idle";
    } else {
      currentStatus = "unknown";
    }

      return {
        subscription: sub,
        agent,
        stats: {
          totalExecutions,
          successRate: Math.round(successRate),
          lastRun,
        },
        recentExecutions,
        currentStatus,
      };
    })
    .filter((item) => item !== null) as ActiveAgentWithDetails[];

  const getStatusBadge = (status: "idle" | "running" | "error" | "unknown") => {
    switch (status) {
      case "idle":
        return (
          <Badge variant="secondary" className="gap-1" data-testid="badge-status-idle">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            Idle
          </Badge>
        );
      case "running":
        return (
          <Badge variant="secondary" className="gap-1" data-testid="badge-status-running">
            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            Running
          </Badge>
        );
      case "error":
        return (
          <Badge variant="destructive" className="gap-1" data-testid="badge-status-error">
            <div className="w-2 h-2 rounded-full bg-white" />
            Error
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1" data-testid="badge-status-unknown">
            <div className="w-2 h-2 rounded-full bg-gray-400" />
            Unknown
          </Badge>
        );
    }
  };

  if (isLoadingSubscriptions) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (activeAgents.length === 0) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Active Agents</h1>
          <p className="text-muted-foreground">Manage and monitor your activated AI agents</p>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Active Agents Yet</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              You haven't activated any agents yet. Browse the Agent Shop to discover and activate
              AI agents that can help automate your workflows.
            </p>
            <Link href="/agent-shop">
              <Button data-testid="button-browse-shop">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Browse Agent Shop
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Active Agents</h1>
        <p className="text-muted-foreground">Manage and monitor your activated AI agents</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {activeAgents.map(({ subscription, agent, stats, recentExecutions, currentStatus }) => {
          if (!agent) return null;

          return (
            <Card key={subscription.id} className="flex flex-col" data-testid={`card-agent-${agent.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-3xl flex-shrink-0">{agent.icon}</span>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate" data-testid={`text-agent-name-${agent.id}`}>
                        {agent.name}
                      </CardTitle>
                      <CardDescription className="text-xs truncate">{agent.category}</CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(currentStatus)}
                </div>
              </CardHeader>

              <CardContent className="flex-1 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Activity className="w-3 h-3" />
                      <span>Executions</span>
                    </div>
                    <div className="text-xl font-bold" data-testid={`text-executions-${agent.id}`}>
                      {stats?.totalExecutions || 0}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <TrendingUp className="w-3 h-3" />
                      <span>Success</span>
                    </div>
                    <div className="text-xl font-bold" data-testid={`text-success-rate-${agent.id}`}>
                      {stats?.successRate || 0}%
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>Last Run</span>
                    </div>
                    <div className="text-xs font-medium" data-testid={`text-last-run-${agent.id}`}>
                      {stats?.lastRun
                        ? new Date(stats.lastRun).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })
                        : "Never"}
                    </div>
                  </div>
                </div>

                {recentExecutions && recentExecutions.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground mb-2">
                      Recent Executions
                    </h4>
                    <div className="space-y-1">
                      {recentExecutions.slice(0, 3).map((execution) => (
                        <div
                          key={execution.id}
                          className="flex items-center justify-between text-xs py-1"
                          data-testid={`execution-${execution.id}`}
                        >
                          <span className="text-muted-foreground truncate">
                            {new Date(execution.startedAt).toLocaleString(undefined, {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {execution.status === "completed" ? (
                            <CheckCircle2 className="w-3 h-3 text-green-600 flex-shrink-0" />
                          ) : execution.status === "failed" ? (
                            <XCircle className="w-3 h-3 text-red-600 flex-shrink-0" />
                          ) : execution.status === "running" ? (
                            <Loader2 className="w-3 h-3 animate-spin text-yellow-600 flex-shrink-0" />
                          ) : (
                            <div className="w-3 h-3 rounded-full bg-gray-300 flex-shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="gap-2 pt-4 border-t flex-wrap">
                <Button size="sm" variant="default" className="flex-1" data-testid={`button-run-${agent.id}`} onClick={() => setSelectedAgent(agent)}>
                  <Play className="w-3 h-3 mr-1" />
                  Run
                </Button>
                <Button size="sm" variant="outline" className="flex-1" data-testid={`button-configure-${agent.id}`} onClick={() => setConfigAgent(agent)}>
                  <Settings className="w-3 h-3 mr-1" />
                  Configure
                </Button>
                <Button size="sm" variant="outline" className="flex-1" data-testid={`button-history-${agent.id}`} onClick={() => setLocation(`/executions/${subscription.id}`)}>
                  <History className="w-3 h-3 mr-1" />
                  History
                </Button>
                <Button size="sm" variant="outline" className="flex-1" data-testid={`button-test-${agent.id}`} onClick={() => setSelectedAgent(agent)}>
                  <Eye className="w-3 h-3 mr-1" />
                  Test
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!selectedAgent} onOpenChange={(open) => !open && setSelectedAgent(null)}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Test Agent: {selectedAgent?.name}</DialogTitle>
          </DialogHeader>
          {selectedAgent && <AgentTestInterface agentId={selectedAgent.id} />}
        </DialogContent>
      </Dialog>

      <Dialog open={!!configAgent} onOpenChange={(open) => !open && setConfigAgent(null)}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Configure Agent: {configAgent?.name}</DialogTitle>
          </DialogHeader>
          {configAgent && <AgentConfigModal agentId={configAgent.id} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}