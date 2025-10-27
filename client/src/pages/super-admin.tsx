import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  Users,
  Building2,
  Bot,
  Activity,
  Database,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Shield,
  TrendingUp,
  Server,
  FileText,
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function SuperAdmin() {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("overview");

  const { data: systemStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: selectedTab === "overview",
  });

  const { data: allUsers, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: selectedTab === "users",
  });

  const { data: allOrgs, isLoading: orgsLoading } = useQuery({
    queryKey: ["/api/admin/organizations"],
    enabled: selectedTab === "organizations",
  });

  const { data: agentCatalog, isLoading: catalogLoading } = useQuery({
    queryKey: ["/api/admin/agent-catalog"],
    enabled: selectedTab === "agents",
  });

  const { data: systemLogs, isLoading: logsLoading } = useQuery({
    queryKey: ["/api/admin/logs"],
    enabled: selectedTab === "logs",
  });

  const { data: resourceStats, isLoading: resourceLoading } = useQuery({
    queryKey: ["/api/admin/resources"],
    enabled: selectedTab === "resources",
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight mb-2" data-testid="text-page-title">
            Super Admin Panel
          </h1>
          <p className="text-muted-foreground">
            System-wide management and monitoring
          </p>
        </div>
        <Badge variant="destructive" className="h-8 px-4" data-testid="badge-admin-status">
          <Shield className="h-3 w-3 mr-1" />
          Super Admin
        </Badge>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="users" data-testid="tab-users">Users</TabsTrigger>
          <TabsTrigger value="organizations" data-testid="tab-organizations">Organizations</TabsTrigger>
          <TabsTrigger value="agents" data-testid="tab-agents">Agent Catalog</TabsTrigger>
          <TabsTrigger value="resources" data-testid="tab-resources">Resources</TabsTrigger>
          <TabsTrigger value="executions" data-testid="tab-executions">Executions</TabsTrigger>
          <TabsTrigger value="logs" data-testid="tab-logs">System Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <SystemOverview stats={systemStats} isLoading={statsLoading} />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UserManagement users={allUsers} isLoading={usersLoading} />
        </TabsContent>

        <TabsContent value="organizations" className="space-y-6">
          <OrganizationManagement orgs={allOrgs} isLoading={orgsLoading} />
        </TabsContent>

        <TabsContent value="agents" className="space-y-6">
          <AgentCatalogManagement catalog={agentCatalog} isLoading={catalogLoading} />
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <ResourceMonitoring stats={resourceStats} isLoading={resourceLoading} />
        </TabsContent>

        <TabsContent value="executions" className="space-y-6">
          <ExecutionMonitoring />
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <SystemLogs logs={systemLogs} isLoading={logsLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SystemOverview({ stats, isLoading }: { stats: any; isLoading: boolean }) {
  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading statistics...</div>;
  }

  const metrics = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      trend: "+12%",
      description: "Across all organizations",
    },
    {
      title: "Organizations",
      value: stats?.totalOrganizations || 0,
      icon: Building2,
      trend: "+5%",
      description: "Active organizations",
    },
    {
      title: "Active Agents",
      value: stats?.totalAgents || 0,
      icon: Bot,
      trend: "+23%",
      description: "In catalog",
    },
    {
      title: "Total Executions",
      value: stats?.totalExecutions || 0,
      icon: Activity,
      trend: "+45%",
      description: "Last 30 days",
    },
    {
      title: "Storage Used",
      value: `${stats?.storageUsed || 0} MB`,
      icon: Database,
      trend: "+8%",
      description: "System-wide",
    },
    {
      title: "API Calls",
      value: stats?.apiCalls || 0,
      icon: Server,
      trend: "+34%",
      description: "Last 30 days",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric, index) => (
          <Card key={index} data-testid={`card-metric-${index}`}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold" data-testid={`text-metric-value-${index}`}>
                {metric.value}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {metric.trend}
                </Badge>
                <p className="text-xs text-muted-foreground">{metric.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Current system status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <HealthMetric label="Database" status="healthy" value="99.9%" />
            <HealthMetric label="API Server" status="healthy" value="100%" />
            <HealthMetric label="Python Agents" status="healthy" value="98.5%" />
            <HealthMetric label="Storage" status="warning" value="75%" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system events</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ActivityItem
              event="New user registered"
              time="2 minutes ago"
              type="success"
            />
            <ActivityItem
              event="Agent executed"
              time="5 minutes ago"
              type="info"
            />
            <ActivityItem
              event="API rate limit reached"
              time="10 minutes ago"
              type="warning"
            />
            <ActivityItem
              event="Database backup completed"
              time="1 hour ago"
              type="success"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function HealthMetric({ label, status, value }: { label: string; status: string; value: string }) {
  const statusColors = {
    healthy: "text-green-600 dark:text-green-400",
    warning: "text-yellow-600 dark:text-yellow-400",
    error: "text-red-600 dark:text-red-400",
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-medium ${statusColors[status as keyof typeof statusColors]}`}>
          {value}
        </span>
        <div className={`h-2 w-2 rounded-full ${status === 'healthy' ? 'bg-green-500' : status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'}`} />
      </div>
    </div>
  );
}

function ActivityItem({ event, time, type }: { event: string; time: string; type: string }) {
  const typeColors = {
    success: "text-green-600 dark:text-green-400",
    info: "text-blue-600 dark:text-blue-400",
    warning: "text-yellow-600 dark:text-yellow-400",
    error: "text-red-600 dark:text-red-400",
  };

  return (
    <div className="flex items-start gap-3">
      <div className={`mt-0.5 h-2 w-2 rounded-full ${type === 'success' ? 'bg-green-500' : type === 'info' ? 'bg-blue-500' : type === 'warning' ? 'bg-yellow-500' : 'bg-red-500'}`} />
      <div className="flex-1">
        <p className="text-sm">{event}</p>
        <p className="text-xs text-muted-foreground">{time}</p>
      </div>
    </div>
  );
}

function UserManagement({ users, isLoading }: { users: any[]; isLoading: boolean }) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const handleDeleteUser = async (userId: string) => {
    try {
      await apiRequest(`/api/admin/users/${userId}`, "DELETE");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "User deleted",
        description: "User has been removed from the system",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete user",
      });
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading users...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage all users across organizations</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-user">
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>Create a new user account</DialogDescription>
            </DialogHeader>
            <UserForm onClose={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user: any) => (
              <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.role === 'super_admin' ? 'destructive' : user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>{user.organization?.name || 'N/A'}</TableCell>
                <TableCell>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      data-testid={`button-edit-user-${user.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={user.role === 'super_admin'}
                      data-testid={`button-delete-user-${user.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function UserForm({ user, onClose }: { user?: any; onClose: () => void }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "member",
    orgId: user?.orgId || "",
    password: "",
  });

  const { data: allOrgs } = useQuery({
    queryKey: ["/api/admin/organizations"],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (user) {
        await apiRequest(`/api/admin/users/${user.id}`, "PATCH", formData);
        toast({ title: "User updated successfully" });
      } else {
        await apiRequest("/api/admin/users", "POST", formData);
        toast({ title: "User created successfully" });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      onClose();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save user",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          data-testid="input-user-name"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          data-testid="input-user-email"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="organization">Organization</Label>
        <Select
          value={formData.orgId}
          onValueChange={(value) => setFormData({ ...formData, orgId: value })}
        >
          <SelectTrigger data-testid="select-user-organization">
            <SelectValue placeholder="Select organization" />
          </SelectTrigger>
          <SelectContent>
            {allOrgs?.map((org: any) => (
              <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select
          value={formData.role}
          onValueChange={(value) => setFormData({ ...formData, role: value })}
        >
          <SelectTrigger data-testid="select-user-role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="member">Member</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {!user && (
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            data-testid="input-user-password"
            required
          />
        </div>
      )}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel-user">
          Cancel
        </Button>
        <Button type="submit" data-testid="button-submit-user">
          {user ? 'Update' : 'Create'}
        </Button>
      </DialogFooter>
    </form>
  );
}

function OrganizationManagement({ orgs, isLoading }: { orgs: any[]; isLoading: boolean }) {
  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading organizations...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization Management</CardTitle>
        <CardDescription>Manage all organizations in the system</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Users</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orgs?.map((org: any) => (
              <TableRow key={org.id} data-testid={`row-org-${org.id}`}>
                <TableCell className="font-medium">{org.name}</TableCell>
                <TableCell>
                  <Badge>{org.plan}</Badge>
                </TableCell>
                <TableCell>{org.userCount || 0}</TableCell>
                <TableCell>{new Date(org.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant="secondary">Active</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="ghost" data-testid={`button-edit-org-${org.id}`}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function AgentCatalogManagement({ catalog, isLoading }: { catalog: any[]; isLoading: boolean }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading agent catalog...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div>
          <CardTitle>Agent Catalog</CardTitle>
          <CardDescription>Manage available agents in the marketplace</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-agent">
              <Plus className="h-4 w-4 mr-2" />
              Add Agent
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Agent</DialogTitle>
              <DialogDescription>Add a new agent to the catalog</DialogDescription>
            </DialogHeader>
            <AgentForm onClose={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {catalog?.map((agent: any) => (
              <TableRow key={agent.id} data-testid={`row-agent-${agent.id}`}>
                <TableCell className="font-medium">{agent.name}</TableCell>
                <TableCell>{agent.type}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{agent.category}</Badge>
                </TableCell>
                <TableCell>${agent.price || 0}</TableCell>
                <TableCell>
                  <Badge variant={agent.isActive ? 'default' : 'secondary'}>
                    {agent.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="ghost" data-testid={`button-edit-agent-${agent.id}`}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" data-testid={`button-delete-agent-${agent.id}`}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function AgentForm({ agent, onClose }: { agent?: any; onClose: () => void }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    id: agent?.id || "",
    name: agent?.name || "",
    type: agent?.type || "",
    description: agent?.description || "",
    longDescription: agent?.longDescription || "",
    icon: agent?.icon || "",
    category: agent?.category || "",
    price: agent?.price || 0,
    isActive: agent?.isActive ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (agent) {
        await apiRequest(`/api/admin/agent-catalog/${agent.id}`, "PATCH", formData);
        toast({ title: "Agent updated successfully" });
      } else {
        await apiRequest("/api/admin/agent-catalog", "POST", formData);
        toast({ title: "Agent added successfully" });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/admin/agent-catalog"] });
      onClose();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save agent",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="id">Agent ID</Label>
          <Input
            id="id"
            value={formData.id}
            onChange={(e) => setFormData({ ...formData, id: e.target.value })}
            placeholder="nlp-agent"
            data-testid="input-agent-id"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            data-testid="input-agent-name"
            required
          />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Input
            id="type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            data-testid="input-agent-type"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            data-testid="input-agent-category"
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          data-testid="input-agent-description"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="longDescription">Long Description</Label>
        <Textarea
          id="longDescription"
          value={formData.longDescription}
          onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
          data-testid="input-agent-long-description"
          rows={3}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="icon">Icon</Label>
          <Input
            id="icon"
            value={formData.icon}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            placeholder="Bot"
            data-testid="input-agent-icon"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
            data-testid="input-agent-price"
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" data-testid="button-submit-agent">
          {agent ? 'Update' : 'Create'}
        </Button>
      </DialogFooter>
    </form>
  );
}

function ResourceMonitoring({ stats, isLoading }: { stats: any; isLoading: boolean }) {
  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading resource stats...</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>API Usage</CardTitle>
          <CardDescription>System-wide API call statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Calls</span>
              <span className="text-2xl font-semibold">{stats?.totalApiCalls || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Calls Today</span>
              <span className="text-2xl font-semibold">{stats?.todayApiCalls || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Average Response Time</span>
              <span className="text-2xl font-semibold">{stats?.avgResponseTime || 0}ms</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Storage Usage</CardTitle>
          <CardDescription>Database and file storage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Database Size</span>
              <span className="text-2xl font-semibold">{stats?.databaseSize || 0} MB</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">File Storage</span>
              <span className="text-2xl font-semibold">{stats?.fileStorage || 0} MB</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Cache Size</span>
              <span className="text-2xl font-semibold">{stats?.cacheSize || 0} MB</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Task Execution</CardTitle>
          <CardDescription>Task processing statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Tasks</span>
              <span className="text-2xl font-semibold">{stats?.totalTasks || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Success Rate</span>
              <span className="text-2xl font-semibold">{stats?.successRate || 0}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Avg Duration</span>
              <span className="text-2xl font-semibold">{stats?.avgDuration || 0}s</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Resources</CardTitle>
          <CardDescription>Server resource utilization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">CPU Usage</span>
              <span className="text-2xl font-semibold">{stats?.cpuUsage || 0}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Memory Usage</span>
              <span className="text-2xl font-semibold">{stats?.memoryUsage || 0}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active Connections</span>
              <span className="text-2xl font-semibold">{stats?.connections || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ExecutionMonitoring() {
  const { data: executions, isLoading } = useQuery({
    queryKey: ["/api/admin/executions"],
  });

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading executions...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Module Executions</CardTitle>
        <CardDescription>All module execution history</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Module</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Started</TableHead>
              <TableHead>Completed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {executions?.slice(0, 20).map((execution: any) => (
              <TableRow key={execution.id} data-testid={`row-execution-${execution.id}`}>
                <TableCell className="font-medium">{execution.module?.name || 'Unknown'}</TableCell>
                <TableCell>{execution.organization?.name || 'N/A'}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      execution.status === 'completed' ? 'default' :
                      execution.status === 'failed' ? 'destructive' :
                      execution.status === 'running' ? 'secondary' : 'outline'
                    }
                  >
                    {execution.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {execution.completedAt && execution.startedAt
                    ? `${Math.round((new Date(execution.completedAt).getTime() - new Date(execution.startedAt).getTime()) / 1000)}s`
                    : 'N/A'}
                </TableCell>
                <TableCell>{new Date(execution.startedAt).toLocaleString()}</TableCell>
                <TableCell>{execution.completedAt ? new Date(execution.completedAt).toLocaleString() : 'Pending'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function SystemLogs({ logs, isLoading }: { logs: any[]; isLoading: boolean }) {
  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading logs...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Logs</CardTitle>
        <CardDescription>Recent system activity logs</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {logs?.slice(0, 100).map((log: any, index: number) => (
            <div
              key={log.id || index}
              className="flex items-start gap-3 p-3 rounded-md bg-muted/50"
              data-testid={`log-entry-${index}`}
            >
              <div className="flex-shrink-0 mt-1">
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{log.message}</p>
                {log.response && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">{log.response}</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                  {log.organization && (
                    <Badge variant="outline" className="text-xs">
                      {log.organization.name}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
