import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Package,
  Play,
  PauseCircle,
  Trash2,
  Loader2,
  Plus,
  Activity,
} from "lucide-react";
import type { Module, ModuleExecution } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export default function Modules() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [executionInput, setExecutionInput] = useState("");

  const { data: modules, isLoading } = useQuery<Module[]>({
    queryKey: ["/api/modules"],
  });

  const { data: executions } = useQuery<ModuleExecution[]>({
    queryKey: ["/api/module-executions"],
    refetchInterval: 5000,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/modules", data);
    },
    onSuccess: () => {
      toast({
        title: "Module created",
        description: "The Python module has been added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/modules"] });
      setIsCreateOpen(false);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to create module",
        description: error.message,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (moduleId: string) => {
      return apiRequest("DELETE", `/api/modules/${moduleId}`, null);
    },
    onSuccess: () => {
      toast({
        title: "Module deleted",
        description: "The module has been removed",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/modules"] });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to delete module",
        description: error.message,
      });
    },
  });

  const executeMutation = useMutation({
    mutationFn: async ({ moduleId, inputData }: { moduleId: string; inputData: any }) => {
      return apiRequest("POST", `/api/modules/${moduleId}/execute`, { inputData });
    },
    onSuccess: (data) => {
      toast({
        title: "Module executed",
        description: data.status === "completed" ? "Execution completed successfully" : "Execution in progress",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/module-executions"] });
      setSelectedModule(null);
      setExecutionInput("");
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Execution failed",
        description: error.message,
      });
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ moduleId, status }: { moduleId: string; status: string }) => {
      return apiRequest("PATCH", `/api/modules/${moduleId}/status`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Status updated",
        description: "Module status has been changed",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/modules"] });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to update status",
        description: error.message,
      });
    },
  });

  const handleCreateModule = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    createMutation.mutate({
      name: formData.get("name"),
      category: formData.get("category"),
      pythonModule: formData.get("pythonModule"),
      endpoint: formData.get("endpoint") || null,
      config: formData.get("config") || null,
      status: "active",
    });
  };

  const handleExecute = (moduleId: string) => {
    try {
      const inputData = executionInput ? JSON.parse(executionInput) : {};
      executeMutation.mutate({ moduleId, inputData });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Invalid input",
        description: "Please enter valid JSON for the input data",
      });
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "inactive":
        return "secondary";
      case "error":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getExecutionStatusVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "running":
        return "secondary";
      case "failed":
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

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Python Modules</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Manage and execute Python AI agent modules
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-module">
              <Plus className="w-4 h-4 mr-2" />
              Add Module
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreateModule}>
              <DialogHeader>
                <DialogTitle>Create New Module</DialogTitle>
                <DialogDescription>
                  Add a new Python agent module to your automation platform
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Module Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="NLP Processor"
                    required
                    data-testid="input-module-name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select name="category" required>
                    <SelectTrigger data-testid="select-module-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nlp">NLP</SelectItem>
                      <SelectItem value="data">Data Processing</SelectItem>
                      <SelectItem value="automation">Automation</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pythonModule">Python Module ID</Label>
                  <Input
                    id="pythonModule"
                    name="pythonModule"
                    placeholder="nlp_processor"
                    required
                    data-testid="input-python-module"
                  />
                  <p className="text-xs text-muted-foreground">
                    Must match the module ID in your Python service
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endpoint">Endpoint (Optional)</Label>
                  <Input
                    id="endpoint"
                    name="endpoint"
                    placeholder="http://localhost:8000"
                    data-testid="input-module-endpoint"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-module">
                  {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create Module
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!modules || modules.length === 0 ? (
        <Card className="p-16">
          <div className="max-w-md mx-auto text-center">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Modules Yet</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Create your first Python module to start automating tasks with AI agents.
            </p>
            <Button onClick={() => setIsCreateOpen(true)} data-testid="button-create-first-module">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Module
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {modules.map((module) => (
                <Card key={module.id} className="p-6" data-testid={`card-module-${module.id}`}>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Package className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold mb-1">{module.name}</h3>
                      <Badge variant={getStatusVariant(module.status)} className="text-xs">
                        {module.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Category:</span>{" "}
                      <span className="font-medium">{module.category}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Python Module:</span>{" "}
                      <code className="text-xs bg-muted px-1 py-0.5 rounded">
                        {module.pythonModule}
                      </code>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="default"
                          className="flex-1"
                          onClick={() => setSelectedModule(module.id)}
                          data-testid={`button-execute-${module.id}`}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Execute
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Execute {module.name}</DialogTitle>
                          <DialogDescription>
                            Provide input data in JSON format
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="inputData">Input Data (JSON)</Label>
                            <Textarea
                              id="inputData"
                              placeholder='{"text": "Hello, world!"}'
                              value={executionInput}
                              onChange={(e) => setExecutionInput(e.target.value)}
                              className="font-mono text-sm"
                              rows={6}
                              data-testid="textarea-execution-input"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            onClick={() => handleExecute(module.id)}
                            disabled={executeMutation.isPending}
                            data-testid="button-confirm-execute"
                          >
                            {executeMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Execute
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        statusMutation.mutate({
                          moduleId: module.id,
                          status: module.status === "active" ? "inactive" : "active",
                        })
                      }
                      disabled={statusMutation.isPending}
                      data-testid={`button-toggle-${module.id}`}
                    >
                      {module.status === "active" ? (
                        <PauseCircle className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteMutation.mutate(module.id)}
                      disabled={deleteMutation.isPending}
                      data-testid={`button-delete-${module.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Recent Executions</h3>
              </div>
              
              <div className="space-y-3">
                {executions && executions.length > 0 ? (
                  executions.slice(0, 10).map((execution) => {
                    const module = modules?.find((m) => m.id === execution.moduleId);
                    return (
                      <div
                        key={execution.id}
                        className="p-3 rounded-md bg-muted/50"
                        data-testid={`execution-${execution.id}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium truncate">
                            {module?.name || "Unknown"}
                          </span>
                          <Badge variant={getExecutionStatusVariant(execution.status)} className="text-xs">
                            {execution.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(execution.startedAt).toLocaleString()}
                        </div>
                        {execution.error && (
                          <div className="text-xs text-destructive mt-1 truncate">
                            {execution.error}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-8">
                    No executions yet
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
