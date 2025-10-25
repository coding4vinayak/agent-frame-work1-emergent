import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, CheckCircle, Store, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { AgentCatalog } from "@shared/schema";
import { AgentRegistrationForm } from "@/components/agent-registration-form";

const CATEGORY_OPTIONS = [
  { value: "all", label: "All Categories" },
  { value: "lead-generation", label: "Lead Generation" },
  { value: "analytics", label: "Analytics" },
  { value: "automation", label: "Automation" },
  { value: "communication", label: "Communication" },
  { value: "data-processing", label: "Data Processing" },
  { value: "forecasting", label: "Forecasting" },
];

export default function AgentShop() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedAgent, setSelectedAgent] = useState<AgentCatalog | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);

  const { data: marketplace = [], isLoading: isLoadingMarketplace } = useQuery<AgentCatalog[]>({
    queryKey: ["/api/agents/marketplace"],
  });

  const { data: activeAgents = [] } = useQuery<AgentCatalog[]>({
    queryKey: ["/api/agents/active"],
  });

  const seedMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/agents/seed", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents/marketplace"] });
      toast({
        title: "Agents Seeded",
        description: "Default agents have been added to the marketplace.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Seeding Failed",
        description: error.message || "Failed to seed agents.",
        variant: "destructive",
      });
    },
  });

  const activateMutation = useMutation({
    mutationFn: async (agentId: string) => {
      return apiRequest("POST", `/api/agents/${agentId}/activate`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/agents/marketplace"] });
      toast({
        title: "Agent Activated",
        description: "The agent has been successfully activated for your organization.",
      });
      setIsDetailModalOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Activation Failed",
        description: error.message || "Failed to activate agent.",
        variant: "destructive",
      });
    },
  });

  const filteredAgents = marketplace.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || agent.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const isAgentActive = (agentId: string) => {
    return activeAgents.some((agent) => agent.id === agentId);
  };

  const handleAgentClick = (agent: AgentCatalog) => {
    setSelectedAgent(agent);
    setIsDetailModalOpen(true);
  };

  const handleActivate = () => {
    if (selectedAgent) {
      activateMutation.mutate(selectedAgent.id);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Store className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Agent Marketplace</h1>
          </div>
          <div className="flex gap-2">
            {marketplace.length === 0 && (
              <Button 
                variant="outline" 
                onClick={() => seedMutation.mutate()}
                disabled={seedMutation.isPending}
              >
                {seedMutation.isPending ? "Seeding..." : "Seed Default Agents"}
              </Button>
            )}
            <Button onClick={() => setIsRegistrationModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Register Agent
            </Button>
          </div>
        </div>
        <p className="text-muted-foreground">
          Browse and activate AI agents to enhance your organization's capabilities
        </p>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search agents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-agents"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[200px]" data-testid="select-category">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoadingMarketplace ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="hover-elevate">
              <CardHeader>
                <div className="h-6 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredAgents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Store className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No agents found</h3>
            <p className="text-muted-foreground text-center max-w-md">
              {searchTerm || selectedCategory !== "all"
                ? "Try adjusting your filters to find more agents"
                : "The agent marketplace is currently being populated with new agents"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => {
            const active = isAgentActive(agent.id);
            return (
              <Card
                key={agent.id}
                className="hover-elevate cursor-pointer"
                onClick={() => handleAgentClick(agent)}
                data-testid={`card-agent-${agent.id}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <span className="text-2xl">{agent.icon}</span>
                        <span data-testid={`text-agent-name-${agent.id}`}>{agent.name}</span>
                      </CardTitle>
                      <CardDescription className="mt-1">{agent.description}</CardDescription>
                    </div>
                    {active && (
                      <Badge variant="default" className="shrink-0" data-testid={`badge-active-${agent.id}`}>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{agent.category}</Badge>
                    {agent.price > 0 ? (
                      <span className="text-sm font-semibold">${agent.price}/mo</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">Free</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <AgentRegistrationForm
        isOpen={isRegistrationModalOpen}
        onClose={() => setIsRegistrationModalOpen(false)}
      />

      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedAgent && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{selectedAgent.icon}</span>
                  <div>
                    <DialogTitle className="text-2xl" data-testid="text-modal-agent-name">
                      {selectedAgent.name}
                    </DialogTitle>
                    <DialogDescription>
                      <Badge variant="secondary" className="mt-1">
                        {selectedAgent.category}
                      </Badge>
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">{selectedAgent.description}</p>
                </div>

                {selectedAgent.longDescription && (
                  <div>
                    <h3 className="font-semibold mb-2">Detailed Information</h3>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {selectedAgent.longDescription}
                    </p>
                  </div>
                )}

                {selectedAgent.configSchema && (
                  <div>
                    <h3 className="font-semibold mb-2">Configuration Options</h3>
                    <div className="bg-muted p-4 rounded-md">
                      <pre className="text-xs overflow-x-auto">
                        {JSON.stringify(JSON.parse(selectedAgent.configSchema), null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    {selectedAgent.price > 0 ? (
                      <span className="text-lg font-bold">${selectedAgent.price}/month</span>
                    ) : (
                      <span className="text-lg font-bold text-primary">Free</span>
                    )}
                  </div>
                  {isAgentActive(selectedAgent.id) && (
                    <Badge variant="default" data-testid="badge-already-active">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Already Active
                    </Badge>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDetailModalOpen(false)} data-testid="button-cancel">
                  Cancel
                </Button>
                {!isAgentActive(selectedAgent.id) && (
                  <Button
                    onClick={handleActivate}
                    disabled={activateMutation.isPending}
                    data-testid="button-activate"
                  >
                    {activateMutation.isPending ? "Activating..." : "Activate Agent"}
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
