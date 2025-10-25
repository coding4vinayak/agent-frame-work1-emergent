
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus } from "lucide-react";

interface AgentRegistrationFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  { value: "lead-generation", label: "Lead Generation" },
  { value: "analytics", label: "Analytics" },
  { value: "automation", label: "Automation" },
  { value: "communication", label: "Communication" },
  { value: "data-processing", label: "Data Processing" },
  { value: "forecasting", label: "Forecasting" },
];

export function AgentRegistrationForm({
  isOpen,
  onClose,
}: AgentRegistrationFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    type: "",
    description: "",
    longDescription: "",
    icon: "🤖",
    category: "",
    backendEndpoint: "",
    configSchema: "",
    price: 0,
  });

  const registerMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        ...data,
        configSchema: data.configSchema ? JSON.parse(data.configSchema) : undefined,
      };
      return apiRequest("POST", "/api/agents/register", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents/marketplace"] });
      queryClient.invalidateQueries({ queryKey: ["/api/agent-catalog"] });
      toast({
        title: "Agent Registered",
        description: "The agent has been successfully added to the catalog.",
      });
      onClose();
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message,
      });
    },
  });

  const resetForm = () => {
    setFormData({
      id: "",
      name: "",
      type: "",
      description: "",
      longDescription: "",
      icon: "🤖",
      category: "",
      backendEndpoint: "",
      configSchema: "",
      price: 0,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate config schema if provided
    if (formData.configSchema) {
      try {
        JSON.parse(formData.configSchema);
      } catch {
        toast({
          variant: "destructive",
          title: "Invalid JSON",
          description: "Configuration schema must be valid JSON",
        });
        return;
      }
    }

    registerMutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Register New Agent</DialogTitle>
          <DialogDescription>
            Add a new AI agent to the marketplace catalog
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="id">Agent ID *</Label>
              <Input
                id="id"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                placeholder="e.g., custom-nlp-agent"
                required
              />
            </div>

            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Custom NLP Agent"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Type *</Label>
              <Input
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                placeholder="e.g., nlp-processor"
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="icon">Icon (emoji)</Label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="🤖"
              />
            </div>

            <div>
              <Label htmlFor="price">Price ($/month)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                min="0"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Short Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of what this agent does"
              required
            />
          </div>

          <div>
            <Label htmlFor="longDescription">Detailed Description</Label>
            <Textarea
              id="longDescription"
              value={formData.longDescription}
              onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
              placeholder="Detailed description with features, benefits, etc."
              className="min-h-[100px]"
            />
          </div>

          <div>
            <Label htmlFor="backendEndpoint">Backend Endpoint</Label>
            <Input
              id="backendEndpoint"
              value={formData.backendEndpoint}
              onChange={(e) => setFormData({ ...formData, backendEndpoint: e.target.value })}
              placeholder="/api/agents/custom-nlp"
            />
          </div>

          <div>
            <Label htmlFor="configSchema">Configuration Schema (JSON)</Label>
            <Textarea
              id="configSchema"
              value={formData.configSchema}
              onChange={(e) => setFormData({ ...formData, configSchema: e.target.value })}
              placeholder='{"apiKey": "", "model": "gpt-4"}'
              className="font-mono text-sm"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={registerMutation.isPending}>
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Register Agent
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
