import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Users, CheckCircle, TrendingUp, Activity } from "lucide-react";

interface DashboardStats {
  activeUsers: number;
  tasksDone: number;
  leadsGenerated: number;
  tasksPending: number;
}

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
}: {
  title: string;
  value: number;
  icon: any;
  trend?: "up" | "down";
  trendValue?: string;
}) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <h3 className="text-3xl font-bold" data-testid={`stat-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            {value.toLocaleString()}
          </h3>
          {trend && trendValue && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
              <TrendingUp className={`w-3 h-3 ${trend === "down" ? "rotate-180" : ""}`} />
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/metrics/dashboard"],
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Welcome to your CRM overview
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6 h-32 animate-pulse bg-muted/10" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Welcome to your CRM overview
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Active Users"
          value={stats?.activeUsers || 0}
          icon={Users}
          trend="up"
          trendValue="+12%"
        />
        <StatCard
          title="Tasks Done"
          value={stats?.tasksDone || 0}
          icon={CheckCircle}
          trend="up"
          trendValue="+8%"
        />
        <StatCard
          title="Leads Generated"
          value={stats?.leadsGenerated || 0}
          icon={TrendingUp}
          trend="up"
          trendValue="+23%"
        />
        <StatCard
          title="Pending Tasks"
          value={stats?.tasksPending || 0}
          icon={Activity}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-medium mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3 py-3 border-b last:border-b-0">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
              <div className="flex-1">
                <p className="text-sm font-medium">New user registered</p>
                <p className="text-xs text-muted-foreground">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 py-3 border-b last:border-b-0">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
              <div className="flex-1">
                <p className="text-sm font-medium">Task completed</p>
                <p className="text-xs text-muted-foreground">15 minutes ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 py-3 border-b last:border-b-0">
              <div className="w-2 h-2 rounded-full bg-purple-500 mt-2" />
              <div className="flex-1">
                <p className="text-sm font-medium">Agent execution started</p>
                <p className="text-xs text-muted-foreground">1 hour ago</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <a
              href="/tasks"
              className="flex items-center gap-3 p-3 rounded-md hover-elevate border"
              data-testid="link-create-task"
            >
              <CheckCircle className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Create New Task</span>
            </a>
            <a
              href="/users"
              className="flex items-center gap-3 p-3 rounded-md hover-elevate border"
              data-testid="link-manage-users"
            >
              <Users className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Manage Users</span>
            </a>
            <a
              href="/reports"
              className="flex items-center gap-3 p-3 rounded-md hover-elevate border"
              data-testid="link-view-reports"
            >
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">View Reports</span>
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
