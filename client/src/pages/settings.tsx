import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Eye, EyeOff, Loader2, Key, Link as LinkIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { Organization, ApiKey, Integration } from "@shared/schema";

interface CreateApiKeyForm {
  name: string;
}

export default function Settings() {
  const { toast } = useToast();
  const [isCreateKeyDialogOpen, setIsCreateKeyDialogOpen] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  const { data: organization } = useQuery<Organization>({
    queryKey: ["/api/organization"],
  });

  const { data: apiKeys, isLoading: apiKeysLoading } = useQuery<ApiKey[]>({
    queryKey: ["/api/api-keys"],
  });

  const { data: integrations, isLoading: integrationsLoading } = useQuery<
    Integration[]
  >({
    queryKey: ["/api/integrations"],
  });

  const form = useForm<CreateApiKeyForm>({
    defaultValues: {
      name: "",
    },
  });

  const createKeyMutation = useMutation({
    mutationFn: async (data: CreateApiKeyForm) => {
      const response = await fetch("/api/api-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create API key");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/api-keys"] });
      setIsCreateKeyDialogOpen(false);
      form.reset();
      toast({
        title: "API key created",
        description: "Your new API key has been generated",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to create API key",
        description: error.message,
      });
    },
  });

  const deleteKeyMutation = useMutation({
    mutationFn: async (keyId: string) => {
      const response = await fetch(`/api/api-keys/${keyId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete API key");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/api-keys"] });
      toast({
        title: "API key deleted",
        description: "The API key has been revoked",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to delete API key",
        description: error.message,
      });
    },
  });

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      if (next.has(keyId)) {
        next.delete(keyId);
      } else {
        next.add(keyId);
      }
      return next;
    });
  };

  const maskKey = (key: string) => {
    return `${key.slice(0, 8)}${"*".repeat(24)}${key.slice(-8)}`;
  };

  const integrationIcons = {
    google: "🔗",
    email: "📧",
    whatsapp: "💬",
  };

  if (!organization && !apiKeys && !integrations) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto" />
          <p className="text-muted-foreground mt-4">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Manage your organization settings and integrations
        </p>
      </div>

      <Tabs defaultValue="organization" className="space-y-6">
        <TabsList>
          <TabsTrigger value="organization" data-testid="tab-organization">
            Organization
          </TabsTrigger>
          <TabsTrigger value="api-keys" data-testid="tab-api-keys">
            API Keys
          </TabsTrigger>
          <TabsTrigger value="integrations" data-testid="tab-integrations">
            Integrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="organization">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Organization Details</h2>
            <div className="space-y-4 max-w-lg">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Organization Name
                </label>
                <Input
                  value={organization?.name || ""}
                  readOnly
                  data-testid="input-org-name"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Plan</label>
                <div className="flex items-center gap-2">
                  <Input
                    value={organization?.plan || "free"}
                    readOnly
                    className="flex-1"
                    data-testid="input-org-plan"
                  />
                  <Badge variant="outline">
                    {organization?.plan?.toUpperCase() || "FREE"}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Created At
                </label>
                <Input
                  value={
                    organization?.createdAt
                      ? new Date(organization.createdAt).toLocaleDateString()
                      : ""
                  }
                  readOnly
                  data-testid="input-org-created"
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="api-keys">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">API Keys</h2>
              <Button onClick={() => setIsCreateKeyDialogOpen(true)} data-testid="button-create-api-key">
                <Plus className="w-4 h-4 mr-2" />
                Generate Key
              </Button>
            </div>

            {apiKeysLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : apiKeys && apiKeys.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs font-semibold uppercase tracking-wide">
                        Name
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wide">
                        Key
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wide">
                        Created
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wide">
                        Last Used
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wide text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiKeys.map((apiKey) => (
                      <TableRow key={apiKey.id} data-testid={`row-api-key-${apiKey.id}`}>
                        <TableCell className="font-medium">{apiKey.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                              {visibleKeys.has(apiKey.id)
                                ? apiKey.key
                                : maskKey(apiKey.key)}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => toggleKeyVisibility(apiKey.id)}
                              data-testid={`button-toggle-${apiKey.id}`}
                            >
                              {visibleKeys.has(apiKey.id) ? (
                                <EyeOff className="w-3 h-3" />
                              ) : (
                                <Eye className="w-3 h-3" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(apiKey.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {apiKey.lastUsed
                            ? new Date(apiKey.lastUsed).toLocaleDateString()
                            : "Never"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteKeyMutation.mutate(apiKey.id)}
                            disabled={deleteKeyMutation.isPending}
                            data-testid={`button-delete-${apiKey.id}`}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-16">
                <Key className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No API keys yet. Generate one to get started.
                </p>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Integrations</h2>

            {integrationsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {["google", "email", "whatsapp"].map((type) => {
                  const integration = integrations?.find((i) => i.type === type);
                  const isConnected = integration?.status === "active";

                  return (
                    <Card
                      key={type}
                      className="p-4 flex items-center gap-4"
                      data-testid={`card-integration-${type}`}
                    >
                      <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center text-xl">
                        {integrationIcons[type as keyof typeof integrationIcons]}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium capitalize">{type}</h3>
                        <Badge
                          variant={isConnected ? "default" : "secondary"}
                          className="text-xs mt-1"
                        >
                          {isConnected ? "Connected" : "Not Connected"}
                        </Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled
                        data-testid={`button-configure-${type}`}
                      >
                        <LinkIcon className="w-4 h-4 mr-2" />
                        Configure
                      </Button>
                    </Card>
                  );
                })}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isCreateKeyDialogOpen} onOpenChange={setIsCreateKeyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate API Key</DialogTitle>
            <DialogDescription>
              Create a new API key for your organization
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) => createKeyMutation.mutate(data))}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Key Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Production API Key"
                        data-testid="input-key-name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateKeyDialogOpen(false)}
                  data-testid="button-cancel-key"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createKeyMutation.isPending}
                  data-testid="button-submit-key"
                >
                  {createKeyMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Key"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
