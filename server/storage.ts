// Reference: javascript_database blueprint integration
import {
  users,
  organizations,
  agentCatalog,
  agentSubscriptions,
  agentData,
  tasks,
  logs,
  integrations,
  apiKeys,
  resourceUsage,
  modules,
  moduleExecutions,
  type User,
  type InsertUser,
  type Organization,
  type InsertOrganization,
  type AgentCatalog,
  type InsertAgentCatalog,
  type AgentSubscription,
  type InsertAgentSubscription,
  type AgentData,
  type InsertAgentData,
  type Task,
  type InsertTask,
  type Log,
  type InsertLog,
  type Integration,
  type InsertIntegration,
  type ApiKey,
  type InsertApiKey,
  type ResourceUsage,
  type InsertResourceUsage,
  type Module,
  type InsertModule,
  type ModuleExecution,
  type InsertModuleExecution,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(orgId: string): Promise<User[]>;
  getAllUsersGlobal(): Promise<User[]>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<void>;
  deleteUser(id: string, orgId?: string): Promise<void>;
  updateUserLastLogin(id: string): Promise<void>;

  // Organizations
  getOrganization(id: string): Promise<Organization | undefined>;
  getAllOrganizations(): Promise<Organization[]>;
  createOrganization(org: InsertOrganization): Promise<Organization>;

  // Agent Catalog
  getAllAgentCatalog(): Promise<AgentCatalog[]>;
  getAgentCatalog(id: string): Promise<AgentCatalog | undefined>;
  createAgentCatalog(agent: InsertAgentCatalog): Promise<AgentCatalog>;
  updateAgentCatalog(id: string, updates: Partial<typeof agentCatalog.$inferInsert>): Promise<void>;
  deleteAgentCatalog(id: string): Promise<void>;

  // Agent Subscriptions (Which agents each org has activated)
  getAllAgentSubscriptions(orgId: string): Promise<AgentSubscription[]>;
  getAgentSubscription(id: string, orgId: string): Promise<AgentSubscription | undefined>;
  getAgentSubscriptionByAgentId(agentId: string, orgId: string): Promise<AgentSubscription | undefined>;
  createAgentSubscription(subscription: InsertAgentSubscription): Promise<AgentSubscription>;
  updateAgentSubscriptionStatus(id: string, orgId: string, status: "active" | "inactive" | "error"): Promise<void>;
  deleteAgentSubscription(id: string, orgId: string): Promise<void>;

  // Agent Data (Store agent-specific data)
  getAllAgentData(subscriptionId: string, orgId: string): Promise<AgentData[]>;
  getAgentData(id: string, orgId: string): Promise<AgentData | undefined>;
  createAgentData(data: InsertAgentData): Promise<AgentData>;
  updateAgentData(id: string, orgId: string, data: string): Promise<void>;

  // Tasks
  getAllTasks(orgId: string): Promise<Task[]>;
  getTask(id: string, orgId: string): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTaskStatus(
    id: string,
    orgId: string,
    status: "pending" | "running" | "completed" | "failed",
    result?: string
  ): Promise<void>;

  // Logs
  getAllLogs(orgId: string, limit?: number): Promise<Log[]>;
  createLog(log: InsertLog): Promise<Log>;

  // Integrations
  getAllIntegrations(orgId: string): Promise<Integration[]>;
  createIntegration(integration: InsertIntegration): Promise<Integration>;

  // API Keys
  getAllApiKeys(orgId: string): Promise<ApiKey[]>;
  createApiKey(apiKey: InsertApiKey): Promise<ApiKey>;
  deleteApiKey(id: string, orgId: string): Promise<void>;

  // Resource Usage
  getResourceUsage(orgId: string): Promise<ResourceUsage[]>;
  getAllResourceUsage(): Promise<ResourceUsage[]>;
  createResourceUsage(usage: InsertResourceUsage): Promise<ResourceUsage>;

  // Modules
  getAllModules(orgId?: string): Promise<Module[]>;
  getModule(id: string, orgId: string): Promise<Module | undefined>;
  createModule(module: InsertModule): Promise<Module>;
  updateModuleStatus(
    id: string,
    orgId: string,
    status: "active" | "inactive" | "error"
  ): Promise<void>;
  deleteModule(id: string, orgId: string): Promise<void>;
  updateModuleConfig(id: string, orgId: string, userConfig: string): Promise<void>;

  // Module Executions
  getAllModuleExecutions(orgId?: string, limit?: number): Promise<ModuleExecution[]>;
  getModuleExecution(id: string, orgId: string): Promise<ModuleExecution | undefined>;
  getModuleExecutionsByModule(moduleId: string, orgId: string, limit?: number): Promise<ModuleExecution[]>;
  createModuleExecution(execution: InsertModuleExecution): Promise<ModuleExecution>;
  updateModuleExecution(
    id: string,
    orgId: string,
    status: "pending" | "running" | "completed" | "failed",
    output?: string,
    error?: string
  ): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAllUsers(orgId: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.orgId, orgId));
  }

  async getAllUsersGlobal(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<void> {
    await db.update(users).set(updates).where(eq(users.id, id));
  }

  async deleteUser(id: string, orgId?: string): Promise<void> {
    if (orgId) {
      await db.delete(users).where(and(eq(users.id, id), eq(users.orgId, orgId)));
    } else {
      await db.delete(users).where(eq(users.id, id));
    }
  }

  async updateUserLastLogin(id: string): Promise<void> {
    await db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, id));
  }

  // Organizations
  async getOrganization(id: string): Promise<Organization | undefined> {
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, id));
    return org || undefined;
  }

  async getAllOrganizations(): Promise<Organization[]> {
    return await db.select().from(organizations);
  }

  async createOrganization(org: InsertOrganization): Promise<Organization> {
    const [organization] = await db
      .insert(organizations)
      .values(org)
      .returning();
    return organization;
  }

  // Agent Catalog
  async getAllAgentCatalog(): Promise<AgentCatalog[]> {
    return await db.select().from(agentCatalog).where(eq(agentCatalog.isActive, true));
  }

  async getAgentCatalog(id: string): Promise<AgentCatalog | undefined> {
    const [agent] = await db
      .select()
      .from(agentCatalog)
      .where(eq(agentCatalog.id, id))
      .limit(1);
    return agent;
  }

  async updateAgentCatalog(id: string, updates: Partial<typeof agentCatalog.$inferInsert>) {
    await db
      .update(agentCatalog)
      .set(updates)
      .where(eq(agentCatalog.id, id));
  }

  async deleteAgentCatalog(id: string) {
    await db
      .delete(agentCatalog)
      .where(eq(agentCatalog.id, id));
  }

  async createAgentCatalog(agent: InsertAgentCatalog): Promise<AgentCatalog> {
    const [newAgent] = await db.insert(agentCatalog).values(agent).returning();
    return newAgent;
  }

  // Agent Subscriptions
  async getAllAgentSubscriptions(orgId: string): Promise<AgentSubscription[]> {
    return await db.select().from(agentSubscriptions).where(eq(agentSubscriptions.orgId, orgId));
  }

  async getAgentSubscription(id: string, orgId: string): Promise<AgentSubscription | undefined> {
    const [subscription] = await db.select().from(agentSubscriptions).where(
      and(eq(agentSubscriptions.id, id), eq(agentSubscriptions.orgId, orgId))
    );
    return subscription || undefined;
  }

  async getAgentSubscriptionByAgentId(agentId: string, orgId: string): Promise<AgentSubscription | undefined> {
    const [subscription] = await db.select().from(agentSubscriptions).where(
      and(eq(agentSubscriptions.agentId, agentId), eq(agentSubscriptions.orgId, orgId))
    );
    return subscription || undefined;
  }

  async createAgentSubscription(subscription: InsertAgentSubscription): Promise<AgentSubscription> {
    const [newSubscription] = await db.insert(agentSubscriptions).values(subscription).returning();
    return newSubscription;
  }

  async updateAgentSubscriptionStatus(id: string, orgId: string, status: "active" | "inactive" | "error"): Promise<void> {
    await db.update(agentSubscriptions).set({ status, lastUsedAt: new Date() }).where(
      and(eq(agentSubscriptions.id, id), eq(agentSubscriptions.orgId, orgId))
    );
  }

  async deleteAgentSubscription(id: string, orgId: string): Promise<void> {
    await db.delete(agentSubscriptions).where(
      and(eq(agentSubscriptions.id, id), eq(agentSubscriptions.orgId, orgId))
    );
  }

  // Agent Data
  async getAllAgentData(subscriptionId: string, orgId: string): Promise<AgentData[]> {
    return await db.select().from(agentData).where(
      and(eq(agentData.subscriptionId, subscriptionId), eq(agentData.orgId, orgId))
    );
  }

  async getAgentData(id: string, orgId: string): Promise<AgentData | undefined> {
    const [data] = await db.select().from(agentData).where(
      and(eq(agentData.id, id), eq(agentData.orgId, orgId))
    );
    return data || undefined;
  }

  async createAgentData(data: InsertAgentData): Promise<AgentData> {
    const [newData] = await db.insert(agentData).values(data).returning();
    return newData;
  }

  async updateAgentData(id: string, orgId: string, data: string): Promise<void> {
    await db.update(agentData).set({ data, updatedAt: new Date() }).where(
      and(eq(agentData.id, id), eq(agentData.orgId, orgId))
    );
  }

  // Tasks
  async getAllTasks(orgId: string): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.orgId, orgId))
      .orderBy(desc(tasks.createdAt));
  }

  async getTask(id: string, orgId: string): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(and(eq(tasks.id, id), eq(tasks.orgId, orgId)));
    return task || undefined;
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async updateTaskStatus(
    id: string,
    orgId: string,
    status: "pending" | "running" | "completed" | "failed",
    result?: string
  ): Promise<void> {
    const updateData: any = { status };
    if (status === "completed" || status === "failed") {
      updateData.completedAt = new Date();
    }
    if (result) {
      updateData.result = result;
    }
    await db.update(tasks).set(updateData).where(and(eq(tasks.id, id), eq(tasks.orgId, orgId)));
  }

  // Logs
  async getAllLogs(orgId: string, limit = 50): Promise<Log[]> {
    return await db
      .select()
      .from(logs)
      .where(eq(logs.orgId, orgId))
      .orderBy(desc(logs.timestamp))
      .limit(limit);
  }

  async createLog(log: InsertLog): Promise<Log> {
    const [newLog] = await db.insert(logs).values(log).returning();
    return newLog;
  }

  // Integrations
  async getAllIntegrations(orgId: string): Promise<Integration[]> {
    return await db
      .select()
      .from(integrations)
      .where(eq(integrations.orgId, orgId));
  }

  async createIntegration(
    integration: InsertIntegration
  ): Promise<Integration> {
    const [newIntegration] = await db
      .insert(integrations)
      .values(integration)
      .returning();
    return newIntegration;
  }

  // API Keys
  async getAllApiKeys(orgId: string): Promise<ApiKey[]> {
    return await db.select().from(apiKeys).where(eq(apiKeys.orgId, orgId));
  }

  async createApiKey(apiKey: InsertApiKey): Promise<ApiKey> {
    const [newApiKey] = await db.insert(apiKeys).values(apiKey).returning();
    return newApiKey;
  }

  async deleteApiKey(id: string, orgId: string): Promise<void> {
    await db.delete(apiKeys).where(and(eq(apiKeys.id, id), eq(apiKeys.orgId, orgId)));
  }

  // Resource Usage
  async getResourceUsage(orgId: string): Promise<ResourceUsage[]> {
    return await db
      .select()
      .from(resourceUsage)
      .where(eq(resourceUsage.orgId, orgId))
      .orderBy(desc(resourceUsage.timestamp));
  }

  async getAllResourceUsage(): Promise<ResourceUsage[]> {
    return await db
      .select()
      .from(resourceUsage)
      .orderBy(desc(resourceUsage.timestamp));
  }

  async createResourceUsage(usage: InsertResourceUsage): Promise<ResourceUsage> {
    const [newUsage] = await db
      .insert(resourceUsage)
      .values(usage)
      .returning();
    return newUsage;
  }

  // Modules
  async getAllModules(orgId?: string): Promise<Module[]> {
    if (orgId) {
      return await db
        .select()
        .from(modules)
        .where(eq(modules.orgId, orgId))
        .orderBy(desc(modules.createdAt));
    } else {
      return await db
        .select()
        .from(modules)
        .orderBy(desc(modules.createdAt));
    }
  }

  async getModule(id: string, orgId: string): Promise<Module | undefined> {
    const [module] = await db
      .select()
      .from(modules)
      .where(and(eq(modules.id, id), eq(modules.orgId, orgId)));
    return module || undefined;
  }

  async createModule(module: InsertModule): Promise<Module> {
    const [newModule] = await db.insert(modules).values(module).returning();
    return newModule;
  }

  async updateModuleStatus(
    id: string,
    orgId: string,
    status: "active" | "inactive" | "error"
  ): Promise<void> {
    await db
      .update(modules)
      .set({ status })
      .where(and(eq(modules.id, id), eq(modules.orgId, orgId)));
  }

  async deleteModule(id: string, orgId: string): Promise<void> {
    await db
      .delete(modules)
      .where(and(eq(modules.id, id), eq(modules.orgId, orgId)));
  }

  async updateModuleConfig(
    id: string,
    orgId: string,
    userConfig: string
  ): Promise<void> {
    await db.update(modules).set({ userConfig, updatedAt: new Date() }).where(
      and(eq(modules.id, id), eq(modules.orgId, orgId))
    );
  }

  // Module Executions
  async getAllModuleExecutions(orgId?: string, limit = 100): Promise<ModuleExecution[]> {
    if (orgId) {
      return await db
        .select()
        .from(moduleExecutions)
        .where(eq(moduleExecutions.orgId, orgId))
        .orderBy(desc(moduleExecutions.startedAt))
        .limit(limit);
    } else {
      return await db
        .select()
        .from(moduleExecutions)
        .orderBy(desc(moduleExecutions.startedAt))
        .limit(limit);
    }
  }

  async getModuleExecution(id: string, orgId: string): Promise<ModuleExecution | undefined> {
    const [execution] = await db
      .select()
      .from(moduleExecutions)
      .where(and(eq(moduleExecutions.id, id), eq(moduleExecutions.orgId, orgId)));
    return execution || undefined;
  }

  async getModuleExecutionsByModule(
    moduleId: string,
    orgId: string,
    limit?: number
  ): Promise<ModuleExecution[]> {
    const query = limit
      ? sql`SELECT * FROM module_executions 
            WHERE module_id = ${moduleId} AND org_id = ${orgId} 
            ORDER BY created_at DESC LIMIT ${limit}`
      : sql`SELECT * FROM module_executions 
            WHERE module_id = ${moduleId} AND org_id = ${orgId} 
            ORDER BY created_at DESC`;
    const result = await db.execute(query);
    return result.rows as ModuleExecution[];
  }

  async createModuleExecution(execution: InsertModuleExecution): Promise<ModuleExecution> {
    const [newExecution] = await db
      .insert(moduleExecutions)
      .values(execution)
      .returning();
    return newExecution;
  }

  async updateModuleExecution(
    id: string,
    orgId: string,
    status: "pending" | "running" | "completed" | "failed",
    output?: string,
    error?: string
  ): Promise<void> {
    const updateData: any = { status };
    if (status === "completed" || status === "failed") {
      updateData.completedAt = new Date();
    }
    if (output) {
      updateData.output = output;
    }
    if (error) {
      updateData.error = error;
    }
    await db
      .update(moduleExecutions)
      .set(updateData)
      .where(and(eq(moduleExecutions.id, id), eq(moduleExecutions.orgId, orgId)));
  }
}

export const storage = new DatabaseStorage();