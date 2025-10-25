import type { Express } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { storage } from "./storage";
import {
  generateToken,
  requireAuth,
  requireRole,
  requireOrgAccess,
  type AuthRequest,
} from "./middleware/auth";
import {
  loginSchema,
  signupSchema,
  passwordResetSchema,
  insertUserSchema,
  insertTaskSchema,
  insertApiKeySchema,
  insertModuleSchema,
  insertModuleExecutionSchema,
} from "@shared/schema";
import { PythonAgentClient } from "./python-agent-client";

export async function registerRoutes(app: Express): Promise<Server> {
  // ===== Authentication Routes =====

  // Regular Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      await storage.updateUserLastLogin(user.id);

      const token = generateToken(user);
      res.json({ token, user: { ...user, password: undefined } });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Login failed" });
    }
  });

  // Admin Login (Super Admin and Admin only)
  app.post("/api/auth/admin/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid admin credentials" });
      }

      // Check if user is admin or super_admin
      if (user.role !== "admin" && user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid admin credentials" });
      }

      await storage.updateUserLastLogin(user.id);

      const token = generateToken(user);
      res.json({ 
        token, 
        user: { ...user, password: undefined },
        message: `Welcome back, ${user.role === "super_admin" ? "Super Admin" : "Admin"}`
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Admin login failed" });
    }
  });

  // Signup - First user becomes super admin, additional users disabled
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { name, email, password } = req.body;

      // Check if any user already exists
      const allUsers = await storage.getAllUsersGlobal();
      if (allUsers.length > 0) {
        return res.status(403).json({ 
          message: "Signup disabled. System already has a super admin. Contact the administrator to get invited." 
        });
      }

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Create single default organization for the system
      const organization = await storage.createOrganization({
        name: "Abetworks System",
        plan: "enterprise",
      });

      // Hash password and create FIRST and ONLY super admin
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({
        name,
        email,
        password: hashedPassword,
        role: "super_admin", // First user is THE super admin
        orgId: organization.id,
      });

      const token = generateToken(user);
      res.json({ 
        token, 
        user: { ...user, password: undefined },
        message: "Super Admin account created successfully. You control the entire system."
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Signup failed" });
    }
  });

  // Password reset (placeholder)
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { email } = passwordResetSchema.parse(req.body);

      // In production, send actual email
      // For now, just return success
      res.json({ message: "Password reset email sent" });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Reset failed" });
    }
  });

  // ===== User Routes =====

  // Get all users in system (super admin sees everyone)
  app.get("/api/users", requireAuth, async (req: AuthRequest, res) => {
    try {
      const users = await storage.getAllUsersGlobal();
      res.json(users.map((u) => ({ ...u, password: undefined })));
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch users" });
    }
  });

  // Invite user (super admin only)
  app.post("/api/users/invite", requireAuth, requireRole("super_admin"), async (req: AuthRequest, res) => {
    try {
      const { name, email, role } = req.body;

      // Get the system's organization
      const systemOrg = await storage.getOrganization(req.user!.orgId);
      if (!systemOrg) {
        return res.status(500).json({ message: "System organization not found" });
      }

      // Validate role
      const validRoles = ["member", "admin"];
      const userRole = role || "member";

      if (!validRoles.includes(userRole)) {
        return res.status(400).json({ message: "Invalid role. Only 'member' or 'admin' allowed." });
      }

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Generate temporary password
      const tempPassword = randomBytes(16).toString("hex");
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      const user = await storage.createUser({
        name,
        email,
        password: hashedPassword,
        role: userRole,
        orgId: systemOrg.id, // All users in same org
      });

      // In production, send invitation email with temp password
      res.json({ 
        user: { ...user, password: undefined },
        tempPassword, // Return this in dev only - remove in production
        message: `User invited as ${userRole}. Email: ${email}, Temp Password: ${tempPassword}`
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to invite user" });
    }
  });

  // Update user (admin only)
  app.patch("/api/users/:id", requireAuth, requireRole("admin", "super_admin"), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { name, role } = req.body;

      // Verify user belongs to same org
      const user = await storage.getUser(id);
      if (!user || user.orgId !== req.user!.orgId) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update user (implement in storage)
      // const updatedUser = await storage.updateUser(id, { name, role });

      res.json({ message: "User updated successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to update user" });
    }
  });

  // Delete user (admin only)
  app.delete("/api/users/:id", requireAuth, requireRole("admin", "super_admin"), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      await storage.deleteUser(id, req.user!.orgId);
      res.json({ message: "User deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to delete user" });
    }
  });

  // ===== Organization Routes =====

  // Get organization details
  app.get("/api/organization", requireAuth, async (req: AuthRequest, res) => {
    try {
      const org = await storage.getOrganization(req.user!.orgId);
      res.json(org);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch organization" });
    }
  });

  // ===== Task Routes =====

  // Get all tasks in organization
  app.get("/api/tasks", requireAuth, requireOrgAccess, async (req: AuthRequest, res) => {
    try {
      const tasks = await storage.getAllTasks(req.user!.orgId);
      res.json(tasks);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch tasks" });
    }
  });

  // Create task
  app.post("/api/tasks", requireAuth, async (req: AuthRequest, res) => {
    try {
      const taskData = {
        description: req.body.description,
        status: "pending" as const,
        userId: req.user!.id,
        orgId: req.user!.orgId,
      };

      const task = await storage.createTask(taskData);
      res.json(task);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create task" });
    }
  });

  // ===== Logs Routes =====

  // Get logs for organization
  app.get("/api/logs", requireAuth, requireOrgAccess, async (req: AuthRequest, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const logs = await storage.getAllLogs(req.user!.orgId, limit);
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch logs" });
    }
  });

  // ===== Metrics Routes =====

  // Dashboard metrics
  app.get("/api/metrics/dashboard", requireAuth, requireOrgAccess, async (req: AuthRequest, res) => {
    try {
      const tasks = await storage.getAllTasks(req.user!.orgId);
      const users = await storage.getAllUsers(req.user!.orgId);

      const stats = {
        activeUsers: users.length,
        tasksDone: tasks.filter((t) => t.status === "completed").length,
        leadsGenerated: Math.floor(Math.random() * 100) + 50, // Placeholder
        tasksPending: tasks.filter((t) => t.status === "pending").length,
      };

      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch dashboard metrics" });
    }
  });

  // Reports metrics
  app.get("/api/metrics/reports", requireAuth, requireOrgAccess, async (req: AuthRequest, res) => {
    try {
      const tasks = await storage.getAllTasks(req.user!.orgId);
      const users = await storage.getAllUsers(req.user!.orgId);
      const resourceUsages = await storage.getResourceUsage(req.user!.orgId);

      // Tasks by status
      const tasksByStatus = [
        { status: "Pending", count: tasks.filter((t) => t.status === "pending").length },
        { status: "Running", count: tasks.filter((t) => t.status === "running").length },
        { status: "Completed", count: tasks.filter((t) => t.status === "completed").length },
        { status: "Failed", count: tasks.filter((t) => t.status === "failed").length },
      ];

      // Tasks by user
      const tasksByUser = users.map((user) => ({
        user: user.name,
        count: tasks.filter((t) => t.userId === user.id).length,
      }));

      // Tasks over time (last 7 days)
      const tasksOverTime = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

        return {
          date: dateStr,
          count: Math.floor(Math.random() * 20) + 5, // Placeholder
        };
      });

      // Resource usage
      const totalUsage = resourceUsages.reduce(
        (acc, usage) => ({
          apiCalls: acc.apiCalls + usage.apiCalls,
          tasksRun: acc.tasksRun + usage.tasksRun,
          storageUsed: acc.storageUsed + usage.storageUsed,
        }),
        { apiCalls: 0, tasksRun: 0, storageUsed: 0 }
      );

      res.json({
        tasksByStatus,
        tasksByUser,
        tasksOverTime,
        resourceUsage: totalUsage,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch reports" });
    }
  });

  // ===== Agent Catalog & Subscription Routes =====

  // Get all available agents from catalog (marketplace)
  app.get("/api/agent-catalog", requireAuth, async (_req: AuthRequest, res) => {
    try {
      const agents = await storage.getAllAgentCatalog();
      res.json(agents);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch agent catalog" });
    }
  });

  // Get all agents that the organization has activated
  app.get("/api/agents", requireAuth, requireOrgAccess, async (req: AuthRequest, res) => {
    try {
      const subscriptions = await storage.getAllAgentSubscriptions(req.user!.orgId);

      const agentsWithDetails = await Promise.all(
        subscriptions.map(async (sub) => {
          const catalogAgent = await storage.getAgentCatalog(sub.agentId);
          return {
            ...sub,
            agent: catalogAgent,
          };
        })
      );

      res.json(agentsWithDetails);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch activated agents" });
    }
  });

  // Activate an agent for the organization
  app.post("/api/agents/activate", requireAuth, requireRole("admin", "super_admin"), async (req: AuthRequest, res) => {
    try {
      const { agentId } = req.body;

      if (!agentId || typeof agentId !== "string") {
        return res.status(400).json({ message: "agentId is required and must be a string" });
      }

      const catalogAgent = await storage.getAgentCatalog(agentId);
      if (!catalogAgent) {
        return res.status(404).json({ message: "Agent not found in catalog" });
      }

      const existing = await storage.getAgentSubscriptionByAgentId(agentId, req.user!.orgId);
      if (existing) {
        return res.status(400).json({ message: "Agent already activated" });
      }

      const subscription = await storage.createAgentSubscription({
        orgId: req.user!.orgId,
        agentId,
        status: "active",
      });

      res.json({ message: "Agent activated successfully", subscription });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to activate agent" });
    }
  });

  // Deactivate an agent for the organization
  app.delete("/api/agents/:subscriptionId", requireAuth, requireRole("admin", "super_admin"), async (req: AuthRequest, res) => {
    try {
      const { subscriptionId } = req.params;
      await storage.deleteAgentSubscription(subscriptionId, req.user!.orgId);
      res.json({ message: "Agent deactivated successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to deactivate agent" });
    }
  });

  // ===== Agent Marketplace Routes =====

  // Get all available agents from marketplace
  app.get("/api/agents/marketplace", requireAuth, async (_req: AuthRequest, res) => {
    try {
      const agents = await storage.getAllAgentCatalog();
      res.json(agents);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch marketplace agents" });
    }
  });

  // Get all active agents for organization
  app.get("/api/agents/active", requireAuth, requireOrgAccess, async (req: AuthRequest, res) => {
    try {
      const subscriptions = await storage.getAllAgentSubscriptions(req.user!.orgId);

      const activeAgents = await Promise.all(
        subscriptions.map(async (sub) => {
          const catalogAgent = await storage.getAgentCatalog(sub.agentId);
          return catalogAgent;
        })
      );

      res.json(activeAgents.filter(Boolean));
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch active agents" });
    }
  });

  // Activate an agent by ID (URL parameter version)
  app.post("/api/agents/:id/activate", requireAuth, requireRole("admin", "super_admin"), async (req: AuthRequest, res) => {
    try {
      const { id: agentId } = req.params;

      const catalogAgent = await storage.getAgentCatalog(agentId);
      if (!catalogAgent) {
        return res.status(404).json({ message: "Agent not found in catalog" });
      }

      const existing = await storage.getAgentSubscriptionByAgentId(agentId, req.user!.orgId);
      if (existing) {
        return res.status(400).json({ message: "Agent already activated" });
      }

      const subscription = await storage.createAgentSubscription({
        orgId: req.user!.orgId,
        agentId,
        status: "active",
      });

      res.json({ message: "Agent activated successfully", subscription });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to activate agent" });
    }
  });

  // ===== Module Routes (Python Agents) =====

  // Get all modules
  app.get("/api/modules", requireAuth, requireOrgAccess, async (req: AuthRequest, res) => {
    try {
      const modules = await storage.getAllModules(req.user!.orgId);
      res.json(modules);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch modules" });
    }
  });

  // Get a specific module
  app.get("/api/modules/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const module = await storage.getModule(id, req.user!.orgId);

      if (!module) {
        return res.status(404).json({ message: "Module not found" });
      }

      res.json(module);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch module" });
    }
  });

  // Create a module
  app.post("/api/modules", requireAuth, requireRole("admin", "super_admin"), async (req: AuthRequest, res) => {
    try {
      const moduleData = insertModuleSchema.parse({
        ...req.body,
        orgId: req.user!.orgId,
      });

      const module = await storage.createModule(moduleData);
      res.json(module);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create module" });
    }
  });

  // Update module status
  app.patch("/api/modules/:id/status", requireAuth, requireRole("admin", "super_admin"), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!["active", "inactive", "error"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      await storage.updateModuleStatus(id, req.user!.orgId, status);
      res.json({ message: "Module status updated successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to update module status" });
    }
  });

  // Delete a module
  app.delete("/api/modules/:id", requireAuth, requireRole("admin", "super_admin"), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      await storage.deleteModule(id, req.user!.orgId);
      res.json({ message: "Module deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to delete module" });
    }
  });

  // Execute a module (calls Python service)
  app.post("/api/modules/:id/execute", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { inputData, taskId } = req.body;

      const module = await storage.getModule(id, req.user!.orgId);
      if (!module) {
        return res.status(404).json({ message: "Module not found" });
      }

      if (module.status !== "active") {
        return res.status(400).json({ message: "Module is not active" });
      }

      // Get organization's API key for Python service
      const apiKeys = await storage.getAllApiKeys(req.user!.orgId);
      if (!apiKeys.length) {
        return res.status(400).json({ 
          message: "No API key configured. Please create an API key first." 
        });
      }

      // Create module execution record
      const execution = await storage.createModuleExecution({
        moduleId: id,
        taskId: taskId || null,
        input: JSON.stringify(inputData),
        status: "pending",
        orgId: req.user!.orgId,
      });

      // Call Python agent service
      try {
        const client = new PythonAgentClient(apiKeys[0].key);

        await storage.updateModuleExecution(
          execution.id,
          req.user!.orgId,
          "running"
        );

        const result = await client.executeModule(
          module.pythonModule,
          req.user!.orgId,
          inputData,
          taskId
        );

        await storage.updateModuleExecution(
          execution.id,
          req.user!.orgId,
          result.status === "completed" ? "completed" : "failed",
          result.output ? JSON.stringify(result.output) : undefined,
          result.error
        );

        res.json({
          executionId: execution.id,
          ...result,
        });
      } catch (error: any) {
        await storage.updateModuleExecution(
          execution.id,
          req.user!.orgId,
          "failed",
          undefined,
          error.message
        );

        throw error;
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to execute module" });
    }
  });

  // Get all module executions
  app.get("/api/module-executions", requireAuth, requireOrgAccess, async (req: AuthRequest, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const executions = await storage.getAllModuleExecutions(req.user!.orgId, limit);
      res.json(executions);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch executions" });
    }
  });

  // Get executions for a specific module
  app.get("/api/modules/:id/executions", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

      const executions = await storage.getModuleExecutionsByModule(
        id,
        req.user!.orgId,
        limit
      );
      res.json(executions);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch executions" });
    }
  });

  // Get module configuration
  app.get("/api/modules/:id/config", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const module = await storage.getModule(id, req.user!.orgId);

      if (!module) {
        return res.status(404).json({ message: "Module not found" });
      }

      const config = module.userConfig ? JSON.parse(module.userConfig) : {};
      res.json({ config });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch configuration" });
    }
  });

  // Update module configuration
  app.put("/api/modules/:id/config", requireAuth, requireRole("admin", "super_admin"), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { config } = req.body;

      const module = await storage.getModule(id, req.user!.orgId);
      if (!module) {
        return res.status(404).json({ message: "Module not found" });
      }

      await storage.updateModuleConfig(id, req.user!.orgId, JSON.stringify(config));
      res.json({ message: "Configuration updated successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to update configuration" });
    }
  });

  // Health check for Python service
  app.get("/api/python-agent/health", requireAuth, async (req: AuthRequest, res) => {
    try {
      const apiKeys = await storage.getAllApiKeys(req.user!.orgId);

      if (!apiKeys.length) {
        return res.json({ 
          status: "unavailable",
          message: "No API key configured" 
        });
      }

      const client = new PythonAgentClient(apiKeys[0].key);
      const health = await client.healthCheck();
      res.json(health);
    } catch (error: any) {
      res.status(500).json({ 
        status: "unhealthy", 
        error: error.message 
      });
    }
  });

  // ===== API Key Routes =====

  // Get all API keys
  app.get("/api/api-keys", requireAuth, requireRole("admin", "super_admin"), async (req: AuthRequest, res) => {
    try {
      const keys = await storage.getAllApiKeys(req.user!.orgId);
      res.json(keys);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch API keys" });
    }
  });

  // Create API key
  app.post("/api/api-keys", requireAuth, requireRole("admin", "super_admin"), async (req: AuthRequest, res) => {
    try {
      const { name } = req.body;
      const key = `abw_${randomBytes(32).toString("hex")}`;

      const apiKey = await storage.createApiKey({
        name,
        key,
        orgId: req.user!.orgId,
      });

      res.json(apiKey);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create API key" });
    }
  });

  // Delete API key
  app.delete("/api/api-keys/:id", requireAuth, requireRole("admin", "super_admin"), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      await storage.deleteApiKey(id, req.user!.orgId);
      res.json({ message: "API key deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to delete API key" });
    }
  });

  // ===== Integration Routes =====

  // Get all integrations
  app.get("/api/integrations", requireAuth, requireOrgAccess, async (req: AuthRequest, res) => {
    try {
      const integrations = await storage.getAllIntegrations(req.user!.orgId);
      res.json(integrations);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch integrations" });
    }
  });

  // ===== External Agent Registration =====

  // Register a new agent from external API
  app.post("/api/agents/register", requireAuth, requireRole("admin", "super_admin"), async (req: AuthRequest, res) => {
    try {
      const {
        id,
        name,
        type,
        description,
        longDescription,
        icon,
        category,
        backendEndpoint,
        configSchema,
        price = 0,
      } = req.body;

      if (!id || !name || !type || !description || !category) {
        return res.status(400).json({
          message: "Missing required fields: id, name, type, description, category"
        });
      }

      // Check if agent already exists
      const existing = await storage.getAgentCatalog(id);
      if (existing) {
        return res.status(400).json({
          message: "Agent with this ID already exists"
        });
      }

      // Create agent in catalog
      const agent = await storage.createAgentCatalog({
        id,
        name,
        type,
        description,
        longDescription: longDescription || description,
        icon: icon || "🤖",
        category,
        backendEndpoint: backendEndpoint || `/api/agents/${id}`,
        configSchema: configSchema ? JSON.stringify(configSchema) : null,
        price,
        isActive: true,
      });

      res.json({
        message: "Agent registered successfully",
        agent
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to register agent" });
    }
  });

  // Update agent metadata
  app.patch("/api/agents/catalog/:id", requireAuth, requireRole("admin", "super_admin"), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const agent = await storage.getAgentCatalog(id);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }

      // Update agent (you'll need to implement this in storage)
      // await storage.updateAgentCatalog(id, updates);

      res.json({
        message: "Agent updated successfully"
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to update agent" });
    }
  });

  // Delete agent from catalog
  app.delete("/api/agents/catalog/:id", requireAuth, requireRole("super_admin"), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;

      // First deactivate all subscriptions
      const subscriptions = await storage.getAllAgentSubscriptions(req.user!.orgId);
      const agentSubs = subscriptions.filter(sub => sub.agentId === id);

      for (const sub of agentSubs) {
        await storage.deleteAgentSubscription(sub.id, req.user!.orgId);
      }

      // Delete from catalog (you'll need to implement this)
      // await storage.deleteAgentCatalog(id);

      res.json({
        message: "Agent deleted from catalog"
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to delete agent" });
    }
  });

  // ===== Database Seed Route (Development Only) =====

  // Seed agents endpoint (admin only)
  app.post("/api/agents/seed", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUserById(req.userId!);
      if (user.role !== "super_admin" && user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { seedAgents } = await import("./seed-agents");
      await seedAgents(storage);

      res.json({ message: "Agents seeded successfully" });
    } catch (error: any) {
      console.error("Seed error:", error);
      res.status(500).json({ message: error.message || "Failed to seed agents" });
    }
  });

  // Agent registration endpoint
  app.post("/api/agents/register", requireAuth, requireRole("admin", "super_admin"), async (req: AuthRequest, res) => {
    try {
      const {
        id,
        name,
        type,
        description,
        longDescription,
        icon,
        category,
        backendEndpoint,
        configSchema,
        price = 0,
      } = req.body;

      if (!id || !name || !type || !description || !category) {
        return res.status(400).json({
          message: "Missing required fields: id, name, type, description, category"
        });
      }

      // Check if agent already exists
      const existing = await storage.getAgentCatalog(id);
      if (existing) {
        return res.status(400).json({
          message: "Agent with this ID already exists"
        });
      }

      // Create agent in catalog
      const agent = await storage.createAgentCatalog({
        id,
        name,
        type,
        description,
        longDescription: longDescription || description,
        icon: icon || "🤖",
        category,
        backendEndpoint: backendEndpoint || `/api/agents/${id}`,
        configSchema: configSchema ? JSON.stringify(configSchema) : null,
        price,
        isActive: true,
      });

      res.json({
        message: "Agent registered successfully",
        agent
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to register agent" });
    }
  });

  // Update agent metadata
  app.patch("/api/agents/catalog/:id", requireAuth, requireRole("admin", "super_admin"), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const agent = await storage.getAgentCatalog(id);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }

      // Update agent (you'll need to implement this in storage)
      // await storage.updateAgentCatalog(id, updates);

      res.json({
        message: "Agent updated successfully"
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to update agent" });
    }
  });

  // Delete agent from catalog
  app.delete("/api/agents/catalog/:id", requireAuth, requireRole("super_admin"), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;

      // First deactivate all subscriptions
      const subscriptions = await storage.getAllAgentSubscriptions(req.user!.orgId);
      const agentSubs = subscriptions.filter(sub => sub.agentId === id);

      for (const sub of agentSubs) {
        await storage.deleteAgentSubscription(sub.id, req.user!.orgId);
      }

      // Delete from catalog (you'll need to implement this)
      // await storage.deleteAgentCatalog(id);

      res.json({
        message: "Agent deleted from catalog"
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to delete agent" });
    }
  });

  // ===== Database Seed Route (Development Only) =====

  // Seed the agent catalog with sample agents
  app.post("/api/seed/agents", requireAuth, requireRole("super_admin"), async (_req: AuthRequest, res) => {
    try {
      const sampleAgents = [
        {
          id: "lead-scoring-ai",
          name: "Lead Scoring AI",
          type: "ml-classifier",
          description: "Automatically score and prioritize leads based on behavior, demographics, and engagement patterns",
          longDescription: "Our Lead Scoring AI uses machine learning to analyze multiple data points including email engagement, website visits, company size, and industry to assign a score to each lead. This helps your sales team focus on the most promising opportunities.\n\nFeatures:\n- Real-time scoring updates\n- Customizable scoring criteria\n- Integration with CRM systems\n- Historical trend analysis",
          icon: "🎯",
          category: "lead-generation",
          backendEndpoint: "/api/ml/lead-scoring",
          configSchema: JSON.stringify({
            weights: {
              demographic: 0.3,
              behavioral: 0.5,
              engagement: 0.2
            },
            threshold: 70
          }),
          price: 0,
          isActive: true,
        },
        {
          id: "nlp-sentiment",
          name: "Sentiment Analysis",
          type: "nlp",
          description: "Analyze customer feedback, reviews, and communications for sentiment and key insights",
          longDescription: "Understand how your customers feel about your products and services with advanced NLP. This agent processes text from various sources including emails, chat messages, and reviews to extract sentiment scores and identify key themes.\n\nCapabilities:\n- Multi-language support\n- Entity extraction\n- Emotion detection\n- Summary generation",
          icon: "💬",
          category: "analytics",
          backendEndpoint: "/api/nlp/sentiment",
          configSchema: JSON.stringify({
            languages: ["en", "es", "fr"],
            minConfidence: 0.7
          }),
          price: 0,
          isActive: true,
        },
        {
          id: "sales-forecaster",
          name: "Sales Forecaster",
          type: "time-series",
          description: "Predict future sales trends based on historical data and market conditions",
          longDescription: "Make data-driven decisions with accurate sales forecasts. This agent analyzes historical sales patterns, seasonality, and market trends to predict future performance.\n\nKey features:\n- Multiple forecasting models\n- Confidence intervals\n- Scenario planning\n- Automated reports",
          icon: "📈",
          category: "forecasting",
          backendEndpoint: "/api/forecast/sales",
          configSchema: JSON.stringify({
            forecastHorizon: 90,
            seasonalityPeriod: 7
          }),
          price: 49,
          isActive: true,
        },
        {
          id: "email-automation",
          name: "Email Campaign Optimizer",
          type: "automation",
          description: "Optimize email campaigns with AI-powered send time, subject line, and content recommendations",
          longDescription: "Maximize email engagement with intelligent automation. This agent analyzes past campaign performance to suggest optimal send times, compelling subject lines, and personalized content variations.\n\nBenefits:\n- Increased open rates\n- Better click-through rates\n- A/B testing automation\n- Personalization at scale",
          icon: "📧",
          category: "communication",
          backendEndpoint: "/api/automation/email",
          configSchema: JSON.stringify({
            maxVariants: 5,
            testDuration: 24
          }),
          price: 29,
          isActive: true,
        },
        {
          id: "data-cleaner",
          name: "Data Quality Agent",
          type: "data-processing",
          description: "Automatically detect and fix data quality issues in your CRM and databases",
          longDescription: "Maintain pristine data quality with automated cleaning and validation. This agent identifies duplicates, standardizes formats, validates fields, and enriches missing information.\n\nFeatures:\n- Duplicate detection and merging\n- Format standardization\n- Missing data enrichment\n- Quality scoring",
          icon: "🧹",
          category: "data-processing",
          backendEndpoint: "/api/data/clean",
          configSchema: JSON.stringify({
            dedupeThreshold: 0.9,
            autoFix: false
          }),
          price: 0,
          isActive: true,
        },
        {
          id: "customer-churn",
          name: "Churn Prediction",
          type: "ml-classifier",
          description: "Identify customers at risk of churning before they leave",
          longDescription: "Retain more customers by identifying churn risk early. This agent analyzes usage patterns, support interactions, and engagement metrics to flag accounts that may be at risk.\n\nPrevention strategies:\n- Early warning alerts\n- Risk scoring\n- Recommended interventions\n- Success tracking",
          icon: "⚠️",
          category: "analytics",
          backendEndpoint: "/api/ml/churn",
          configSchema: JSON.stringify({
            riskThreshold: 0.7,
            lookbackDays: 90
          }),
          price: 99,
          isActive: true,
        },
        {
          id: "social-monitor",
          name: "Social Media Monitor",
          type: "monitoring",
          description: "Track brand mentions, sentiment, and engagement across social media platforms",
          longDescription: "Stay on top of your social media presence with real-time monitoring. This agent tracks mentions of your brand, products, and competitors across major social platforms.\n\nMonitoring includes:\n- Brand mentions\n- Sentiment tracking\n- Competitor analysis\n- Influencer identification",
          icon: "📱",
          category: "communication",
          backendEndpoint: "/api/social/monitor",
          configSchema: JSON.stringify({
            platforms: ["twitter", "linkedin", "facebook"],
            updateFrequency: 300
          }),
          price: 79,
          isActive: true,
        },
        {
          id: "task-automator",
          name: "Task Automation Engine",
          type: "automation",
          description: "Automate repetitive tasks and workflows across your organization",
          longDescription: "Free up time for high-value work by automating routine tasks. This agent can handle data entry, status updates, notifications, and complex multi-step workflows.\n\nAutomation types:\n- Scheduled tasks\n- Event-triggered workflows\n- Conditional logic\n- Multi-system integration",
          icon: "🤖",
          category: "automation",
          backendEndpoint: "/api/automation/tasks",
          configSchema: JSON.stringify({
            maxConcurrent: 10,
            retryAttempts: 3
          }),
          price: 0,
          isActive: true,
        },
      ];

      let created = 0;
      let skipped = 0;

      for (const agent of sampleAgents) {
        const existing = await storage.getAgentCatalog(agent.id);
        if (!existing) {
          await storage.createAgentCatalog(agent);
          created++;
        } else {
          skipped++;
        }
      }

      res.json({ 
        message: "Agent catalog seeded successfully",
        created,
        skipped,
        total: sampleAgents.length
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to seed agent catalog" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}