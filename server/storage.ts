// Reference: javascript_database blueprint integration
import {
  users,
  organizations,
  agents,
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
  type Agent,
  type InsertAgent,
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
  deleteUser(id: string, orgId: string): Promise<void>;
  updateUserLastLogin(id: string): Promise<void>;

  // Organizations
  getOrganization(id: string): Promise<Organization | undefined>;
  createOrganization(org: InsertOrganization): Promise<Organization>;

  // Agents
  getAllAgents(orgId: string): Promise<Agent[]>;
  getAgent(id: string, orgId: string): Promise<Agent | undefined>;
  createAgent(agent: InsertAgent): Promise<Agent>;

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
  createResourceUsage(usage: InsertResourceUsage): Promise<ResourceUsage>;

  // Modules
  getAllModules(orgId: string): Promise<Module[]>;
  getModule(id: string, orgId: string): Promise<Module | undefined>;
  createModule(module: InsertModule): Promise<Module>;
  updateModuleStatus(
    id: string,
    orgId: string,
    status: "active" | "inactive" | "error"
  ): Promise<void>;
  deleteModule(id: string, orgId: string): Promise<void>;

  // Module Executions
  getAllModuleExecutions(orgId: string, limit?: number): Promise<ModuleExecution[]>;
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

  async deleteUser(id: string, orgId: string): Promise<void> {
    await db.delete(users).where(and(eq(users.id, id), eq(users.orgId, orgId)));
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

  async createOrganization(org: InsertOrganization): Promise<Organization> {
    const [organization] = await db
      .insert(organizations)
      .values(org)
      .returning();
    return organization;
  }

  // Agents
  async getAllAgents(orgId: string): Promise<Agent[]> {
    return await db.select().from(agents).where(eq(agents.orgId, orgId));
  }

  async getAgent(id: string, orgId: string): Promise<Agent | undefined> {
    const [agent] = await db.select().from(agents).where(and(eq(agents.id, id), eq(agents.orgId, orgId)));
    return agent || undefined;
  }

  async createAgent(agent: InsertAgent): Promise<Agent> {
    const [newAgent] = await db.insert(agents).values(agent).returning();
    return newAgent;
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

  async createResourceUsage(usage: InsertResourceUsage): Promise<ResourceUsage> {
    const [newUsage] = await db
      .insert(resourceUsage)
      .values(usage)
      .returning();
    return newUsage;
  }

  // Modules
  async getAllModules(orgId: string): Promise<Module[]> {
    return await db
      .select()
      .from(modules)
      .where(eq(modules.orgId, orgId))
      .orderBy(desc(modules.createdAt));
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

  // Module Executions
  async getAllModuleExecutions(orgId: string, limit = 100): Promise<ModuleExecution[]> {
    return await db
      .select()
      .from(moduleExecutions)
      .where(eq(moduleExecutions.orgId, orgId))
      .orderBy(desc(moduleExecutions.startedAt))
      .limit(limit);
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
    limit = 50
  ): Promise<ModuleExecution[]> {
    return await db
      .select()
      .from(moduleExecutions)
      .where(and(eq(moduleExecutions.moduleId, moduleId), eq(moduleExecutions.orgId, orgId)))
      .orderBy(desc(moduleExecutions.startedAt))
      .limit(limit);
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
