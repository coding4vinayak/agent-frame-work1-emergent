
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AgentConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduleId: string;
  moduleName: string;
  currentConfig?: any;
}

export function AgentConfigModal({
  isOpen,
  onClose,
  moduleId,
  moduleName,
  currentConfig,
}: AgentConfigModalProps) {
  const { toast } = useToast();
  const [configJson, setConfigJson] = useState(
    JSON.stringify(currentConfig || {}, null, 2)
  );

  const updateConfigMutation = useMutation({
    mutationFn: async (config: string) => {
      const parsedConfig = JSON.parse(config);
      return apiRequest("PUT", `/api/modules/${moduleId}/config`, {
        config: parsedConfig,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/modules"] });
      toast({
        title: "Configuration saved",
        description: "Agent configuration updated successfully",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to save configuration",
        description: error.message,
      });
    },
  });

  const handleSave = () => {
    try {
      JSON.parse(configJson);
      updateConfigMutation.mutate(configJson);
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Invalid JSON",
        description: "Please provide valid JSON configuration",
      });
    }
  };

  const resetToDefault = () => {
    setConfigJson(JSON.stringify({}, null, 2));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configure {moduleName}
          </DialogTitle>
          <DialogDescription>
            Update the configuration settings for this agent
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="editor" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="editor">JSON Editor</TabsTrigger>
            <TabsTrigger value="help">Help</TabsTrigger>
          </TabsList>
          
          <TabsContent value="editor" className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Configuration (JSON)
              </label>
              <Textarea
                value={configJson}
                onChange={(e) => setConfigJson(e.target.value)}
                placeholder="Enter configuration as JSON"
                className="font-mono text-sm min-h-[300px]"
                data-testid="textarea-config"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={resetToDefault}
              data-testid="button-reset"
            >
              Reset to Default
            </Button>
          </TabsContent>
          
          <TabsContent value="help" className="space-y-4">
            <div className="bg-muted p-4 rounded-md">
              <h4 className="font-medium mb-2">Configuration Guide</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Each agent accepts different configuration options. Here are some common settings:
              </p>
              <ul className="text-sm space-y-2 list-disc list-inside text-muted-foreground">
                <li><strong>timeout</strong>: Maximum execution time in seconds</li>
                <li><strong>retries</strong>: Number of retry attempts on failure</li>
                <li><strong>batchSize</strong>: Number of items to process at once</li>
                <li><strong>threshold</strong>: Minimum confidence score (0-1)</li>
              </ul>
            </div>
            <div className="bg-muted p-4 rounded-md">
              <h4 className="font-medium mb-2">Example Configuration</h4>
              <pre className="text-xs font-mono">
{`{
  "timeout": 30,
  "retries": 3,
  "batchSize": 100,
  "threshold": 0.8
}`}
              </pre>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} data-testid="button-cancel">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateConfigMutation.isPending}
            data-testid="button-save"
          >
            {updateConfigMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Configuration"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
