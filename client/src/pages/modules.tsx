import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Settings, History, TrendingUp } from "lucide-react";
import { AgentStatus } from "@/components/agent-status";

export default function Modules() {
  const { data: activeAgents, isLoading } = useQuery({
    queryKey: ["/api/agents/active"],
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!activeAgents || activeAgents.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-semibold tracking-tight mb-8">Active Agents</h1>
        <Card className="p-16 text-center">
          <div className="flex flex-col items-center gap-4">
            <TrendingUp className="w-16 h-16 text-muted-foreground" />
            <h3 className="text-xl font-semibold">No Active Agents Yet</h3>
            <p className="text-muted-foreground max-w-md">
              Browse the Agent Shop to activate AI automation modules for your organization.
            </p>
            <Button asChild className="mt-4">
              <a href="/agent-shop">Browse Agent Shop</a>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Active Agents</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Manage and monitor your activated automation modules
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {activeAgents.length} Active
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeAgents.map(({ agent, subscription }: any) => (
          <Card key={agent.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{agent.icon}</div>
                <div>
                  <h3 className="font-semibold text-lg">{agent.name}</h3>
                  <Badge variant="outline" className="mt-1">
                    {agent.category}
                  </Badge>
                </div>
              </div>
              <AgentStatus agentId={agent.id} status="idle" />
            </div>

            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {agent.description}
            </p>

            <div className="flex gap-2">
              <Button size="sm" variant="default" className="flex-1">
                <Play className="w-4 h-4 mr-1" />
                Run
              </Button>
              <Button size="sm" variant="outline">
                <Settings className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline">
                <History className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}