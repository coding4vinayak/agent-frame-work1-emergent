import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

// Auth Pages
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import ResetPassword from "@/pages/reset-password";
// Import AdminLogin page
import AdminLogin from "@/pages/admin-login";

// Dashboard Pages
import Dashboard from "@/pages/dashboard";
import Users from "@/pages/users";
import Tasks from "@/pages/tasks";
import Reports from "@/pages/reports";
import Agents from "@/pages/agents";
import AgentShop from "@/pages/agent-shop";
import Modules from "@/pages/modules";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center h-16 px-6 border-b border-border">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex-1" />
          </header>
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  return (
    <Switch>
      {/* Auth Routes */}
      <Route path="/login">
        <AuthLayout>
          <Login />
        </AuthLayout>
      </Route>
      {/* Admin Login Route */}
      <Route path="/admin/login">
        <AuthLayout>
          <AdminLogin />
        </AuthLayout>
      </Route>
      <Route path="/signup">
        <AuthLayout>
          <Signup />
        </AuthLayout>
      </Route>
      <Route path="/reset-password">
        <AuthLayout>
          <ResetPassword />
        </AuthLayout>
      </Route>

      {/* Dashboard Routes */}
      <Route path="/">
        <DashboardLayout>
          <Dashboard />
        </DashboardLayout>
      </Route>
      <Route path="/users">
        <DashboardLayout>
          <Users />
        </DashboardLayout>
      </Route>
      <Route path="/tasks">
        <DashboardLayout>
          <Tasks />
        </DashboardLayout>
      </Route>
      <Route path="/reports">
        <DashboardLayout>
          <Reports />
        </DashboardLayout>
      </Route>
      <Route path="/agents">
        <DashboardLayout>
          <Agents />
        </DashboardLayout>
      </Route>
      <Route path="/agent-shop">
        <DashboardLayout>
          <AgentShop />
        </DashboardLayout>
      </Route>
      <Route path="/modules">
        <DashboardLayout>
          <Modules />
        </DashboardLayout>
      </Route>
      <Route path="/settings">
        <DashboardLayout>
          <Settings />
        </DashboardLayout>
      </Route>

      {/* Fallback to 404 */}
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;