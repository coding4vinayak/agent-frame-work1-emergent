import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const roleEnum = pgEnum("role", ["member", "admin", "super_admin"]);
export const taskStatusEnum = pgEnum("task_status", ["pending", "running", "completed", "failed"]);
export const agentStatusEnum = pgEnum("agent_status", ["active", "inactive", "error"]);
export const integrationTypeEnum = pgEnum("integration_type", ["google", "email", "whatsapp"]);

// Organizations table
export const organizations = pgTable("organizations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  logo: text("logo"),
  plan: text("plan").notNull().default("free"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: roleEnum("role").notNull().default("member"),
  orgId: varchar("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Agent Catalog (Master list of all available agents)
export const agentCatalog = pgTable("agent_catalog", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  description: text("description").notNull(),
  longDescription: text("long_description"),
  icon: text("icon").notNull(),
  category: text("category").notNull(),
  backendEndpoint: text("backend_endpoint"),
  configSchema: text("config_schema"),
  price: integer("price").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Agent Subscriptions (Which agents each organization has activated)
export const agentSubscriptions = pgTable("agent_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orgId: varchar("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  agentId: varchar("agent_id").notNull().references(() => agentCatalog.id, { onDelete: "cascade" }),
  status: agentStatusEnum("status").notNull().default("active"),
  config: text("config"),
  activatedAt: timestamp("activated_at").notNull().defaultNow(),
  lastUsedAt: timestamp("last_used_at"),
});

// Agent Data (Stores agent-specific data for each organization)
export const agentData = pgTable("agent_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subscriptionId: varchar("subscription_id").notNull().references(() => agentSubscriptions.id, { onDelete: "cascade" }),
  orgId: varchar("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  agentId: varchar("agent_id").notNull().references(() => agentCatalog.id, { onDelete: "cascade" }),
  dataType: text("data_type").notNull(),
  data: text("data").notNull(),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subscriptionId: varchar("subscription_id").references(() => agentSubscriptions.id, { onDelete: "set null" }),
  description: text("description").notNull(),
  status: taskStatusEnum("status").notNull().default("pending"),
  result: text("result"),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  orgId: varchar("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Logs table
export const logs = pgTable("logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subscriptionId: varchar("subscription_id").references(() => agentSubscriptions.id, { onDelete: "set null" }),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
  orgId: varchar("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  response: text("response"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// Integrations table
export const integrations = pgTable("integrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orgId: varchar("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  type: integrationTypeEnum("type").notNull(),
  apiKey: text("api_key"),
  status: text("status").notNull().default("inactive"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// API Keys table (for organization API keys)
export const apiKeys = pgTable("api_keys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orgId: varchar("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  key: text("key").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastUsed: timestamp("last_used"),
});

// Resource Usage table
export const resourceUsage = pgTable("resource_usage", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orgId: varchar("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
  apiCalls: integer("api_calls").notNull().default(0),
  tasksRun: integer("tasks_run").notNull().default(0),
  storageUsed: integer("storage_used").notNull().default(0),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// Modules table (Python agent modules)
export const modules = pgTable("modules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(),
  pythonModule: text("python_module").notNull(),
  endpoint: text("endpoint"),
  config: text("config"),
  status: agentStatusEnum("status").notNull().default("active"),
  orgId: varchar("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Module Executions table (track module execution history)
export const moduleExecutions = pgTable("module_executions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  moduleId: varchar("module_id").notNull().references(() => modules.id, { onDelete: "cascade" }),
  taskId: varchar("task_id").references(() => tasks.id, { onDelete: "set null" }),
  input: text("input"),
  output: text("output"),
  status: taskStatusEnum("status").notNull().default("pending"),
  error: text("error"),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  orgId: varchar("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
});

// Relations
export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  agentSubscriptions: many(agentSubscriptions),
  agentData: many(agentData),
  tasks: many(tasks),
  logs: many(logs),
  integrations: many(integrations),
  apiKeys: many(apiKeys),
  resourceUsage: many(resourceUsage),
  modules: many(modules),
  moduleExecutions: many(moduleExecutions),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.orgId],
    references: [organizations.id],
  }),
  tasks: many(tasks),
  logs: many(logs),
  resourceUsage: many(resourceUsage),
}));

export const agentCatalogRelations = relations(agentCatalog, ({ many }) => ({
  subscriptions: many(agentSubscriptions),
  agentData: many(agentData),
}));

export const agentSubscriptionsRelations = relations(agentSubscriptions, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [agentSubscriptions.orgId],
    references: [organizations.id],
  }),
  agent: one(agentCatalog, {
    fields: [agentSubscriptions.agentId],
    references: [agentCatalog.id],
  }),
  tasks: many(tasks),
  logs: many(logs),
  agentData: many(agentData),
}));

export const agentDataRelations = relations(agentData, ({ one }) => ({
  organization: one(organizations, {
    fields: [agentData.orgId],
    references: [organizations.id],
  }),
  agent: one(agentCatalog, {
    fields: [agentData.agentId],
    references: [agentCatalog.id],
  }),
  subscription: one(agentSubscriptions, {
    fields: [agentData.subscriptionId],
    references: [agentSubscriptions.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [tasks.orgId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
  subscription: one(agentSubscriptions, {
    fields: [tasks.subscriptionId],
    references: [agentSubscriptions.id],
  }),
  moduleExecutions: many(moduleExecutions),
}));

export const logsRelations = relations(logs, ({ one }) => ({
  organization: one(organizations, {
    fields: [logs.orgId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [logs.userId],
    references: [users.id],
  }),
  subscription: one(agentSubscriptions, {
    fields: [logs.subscriptionId],
    references: [agentSubscriptions.id],
  }),
}));

export const integrationsRelations = relations(integrations, ({ one }) => ({
  organization: one(organizations, {
    fields: [integrations.orgId],
    references: [organizations.id],
  }),
}));

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  organization: one(organizations, {
    fields: [apiKeys.orgId],
    references: [organizations.id],
  }),
}));

export const resourceUsageRelations = relations(resourceUsage, ({ one }) => ({
  organization: one(organizations, {
    fields: [resourceUsage.orgId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [resourceUsage.userId],
    references: [users.id],
  }),
}));

export const modulesRelations = relations(modules, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [modules.orgId],
    references: [organizations.id],
  }),
  executions: many(moduleExecutions),
}));

export const moduleExecutionsRelations = relations(moduleExecutions, ({ one }) => ({
  organization: one(organizations, {
    fields: [moduleExecutions.orgId],
    references: [organizations.id],
  }),
  module: one(modules, {
    fields: [moduleExecutions.moduleId],
    references: [modules.id],
  }),
  task: one(tasks, {
    fields: [moduleExecutions.taskId],
    references: [tasks.id],
  }),
}));

// Zod schemas for validation
export const insertOrganizationSchema = createInsertSchema(organizations).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  lastLogin: true,
});

export const insertAgentCatalogSchema = createInsertSchema(agentCatalog).omit({
  createdAt: true,
});

export const insertAgentSubscriptionSchema = createInsertSchema(agentSubscriptions).omit({
  id: true,
  activatedAt: true,
  lastUsedAt: true,
});

export const insertAgentDataSchema = createInsertSchema(agentData).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertLogSchema = createInsertSchema(logs).omit({
  id: true,
  timestamp: true,
});

export const insertIntegrationSchema = createInsertSchema(integrations).omit({
  id: true,
  createdAt: true,
});

export const insertApiKeySchema = createInsertSchema(apiKeys).omit({
  id: true,
  createdAt: true,
  lastUsed: true,
});

export const insertResourceUsageSchema = createInsertSchema(resourceUsage).omit({
  id: true,
  timestamp: true,
});

export const insertModuleSchema = createInsertSchema(modules).omit({
  id: true,
  createdAt: true,
});

export const insertModuleExecutionSchema = createInsertSchema(moduleExecutions).omit({
  id: true,
  startedAt: true,
  completedAt: true,
});

// Login schema
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Signup schema
export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  organizationName: z.string().min(2, "Organization name must be at least 2 characters"),
});

// Password reset schema
export const passwordResetSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// Super Admin schemas
export const createUserAdminSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["member", "admin", "super_admin"]).optional(),
  orgId: z.string().min(1, "Organization ID is required"),
});

export const updateUserAdminSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(["member", "admin", "super_admin"]).optional(),
  orgId: z.string().min(1).optional(),
});

export const updateAgentCatalogSchema = z.object({
  name: z.string().optional(),
  type: z.string().optional(),
  description: z.string().optional(),
  longDescription: z.string().optional(),
  icon: z.string().optional(),
  category: z.string().optional(),
  price: z.number().optional(),
  isActive: z.boolean().optional(),
});

// TypeScript types
export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type AgentCatalog = typeof agentCatalog.$inferSelect;
export type InsertAgentCatalog = z.infer<typeof insertAgentCatalogSchema>;

export type AgentSubscription = typeof agentSubscriptions.$inferSelect;
export type InsertAgentSubscription = z.infer<typeof insertAgentSubscriptionSchema>;

export type AgentData = typeof agentData.$inferSelect;
export type InsertAgentData = z.infer<typeof insertAgentDataSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type Log = typeof logs.$inferSelect;
export type InsertLog = z.infer<typeof insertLogSchema>;

export type Integration = typeof integrations.$inferSelect;
export type InsertIntegration = z.infer<typeof insertIntegrationSchema>;

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;

export type ResourceUsage = typeof resourceUsage.$inferSelect;
export type InsertResourceUsage = z.infer<typeof insertResourceUsageSchema>;

export type Module = typeof modules.$inferSelect;
export type InsertModule = z.infer<typeof insertModuleSchema>;

export type ModuleExecution = typeof moduleExecutions.$inferSelect;
export type InsertModuleExecution = z.infer<typeof insertModuleExecutionSchema>;

export type LoginData = z.infer<typeof loginSchema>;
export type SignupData = z.infer<typeof signupSchema>;
export type PasswordResetData = z.infer<typeof passwordResetSchema>;

// ===== NEW TABLES FOR MARKETPLACE & LICENSE MANAGEMENT =====

// User Agent Licenses (Track which users have access to which agents)
export const userAgentLicenses = pgTable("user_agent_licenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  agentId: varchar("agent_id").notNull().references(() => agentCatalog.id, { onDelete: "cascade" }),
  orgId: varchar("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  apiCallLimit: integer("api_call_limit").notNull().default(-1), // -1 = unlimited
  apiCallsUsed: integer("api_calls_used").notNull().default(0),
  status: agentStatusEnum("status").notNull().default("active"),
  grantedBy: varchar("granted_by").references(() => users.id, { onDelete: "set null" }), // Super admin who granted
  grantedAt: timestamp("granted_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"), // null = never expires
});

// API Usage Tracking (Track all API calls per user per agent)
export const apiUsageTracking = pgTable("api_usage_tracking", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  agentId: varchar("agent_id").notNull().references(() => agentCatalog.id, { onDelete: "cascade" }),
  orgId: varchar("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  licenseId: varchar("license_id").references(() => userAgentLicenses.id, { onDelete: "set null" }),
  endpoint: text("endpoint"),
  statusCode: integer("status_code"),
  duration: integer("duration"), // milliseconds
  error: text("error"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// Agent Access Requests (Users request access to agents)
export const agentAccessRequests = pgTable("agent_access_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  agentId: varchar("agent_id").notNull().references(() => agentCatalog.id, { onDelete: "cascade" }),
  orgId: varchar("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  requestReason: text("request_reason"),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  requestedAt: timestamp("requested_at").notNull().defaultNow(),
  reviewedBy: varchar("reviewed_by").references(() => users.id, { onDelete: "set null" }),
  reviewedAt: timestamp("reviewed_at"),
  reviewNote: text("review_note"),
});

// Error Logs (Comprehensive error tracking)
export const errorLogs = pgTable("error_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
  orgId: varchar("org_id").references(() => organizations.id, { onDelete: "cascade" }),
  agentId: varchar("agent_id").references(() => agentCatalog.id, { onDelete: "set null" }),
  errorType: text("error_type").notNull(), // api_error, agent_error, system_error, auth_error
  errorCode: text("error_code"),
  errorMessage: text("error_message").notNull(),
  stackTrace: text("stack_trace"),
  endpoint: text("endpoint"),
  method: text("method"),
  requestBody: text("request_body"),
  severity: text("severity").notNull().default("medium"), // low, medium, high, critical
  resolved: boolean("resolved").notNull().default(false),
  resolvedBy: varchar("resolved_by").references(() => users.id, { onDelete: "set null" }),
  resolvedAt: timestamp("resolved_at"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// Relations for new tables
export const userAgentLicensesRelations = relations(userAgentLicenses, ({ one }) => ({
  user: one(users, {
    fields: [userAgentLicenses.userId],
    references: [users.id],
  }),
  agent: one(agentCatalog, {
    fields: [userAgentLicenses.agentId],
    references: [agentCatalog.id],
  }),
  organization: one(organizations, {
    fields: [userAgentLicenses.orgId],
    references: [organizations.id],
  }),
  grantedByUser: one(users, {
    fields: [userAgentLicenses.grantedBy],
    references: [users.id],
  }),
}));

export const apiUsageTrackingRelations = relations(apiUsageTracking, ({ one }) => ({
  user: one(users, {
    fields: [apiUsageTracking.userId],
    references: [users.id],
  }),
  agent: one(agentCatalog, {
    fields: [apiUsageTracking.agentId],
    references: [agentCatalog.id],
  }),
  organization: one(organizations, {
    fields: [apiUsageTracking.orgId],
    references: [organizations.id],
  }),
  license: one(userAgentLicenses, {
    fields: [apiUsageTracking.licenseId],
    references: [userAgentLicenses.id],
  }),
}));

export const agentAccessRequestsRelations = relations(agentAccessRequests, ({ one }) => ({
  user: one(users, {
    fields: [agentAccessRequests.userId],
    references: [users.id],
  }),
  agent: one(agentCatalog, {
    fields: [agentAccessRequests.agentId],
    references: [agentCatalog.id],
  }),
  organization: one(organizations, {
    fields: [agentAccessRequests.orgId],
    references: [organizations.id],
  }),
  reviewedByUser: one(users, {
    fields: [agentAccessRequests.reviewedBy],
    references: [users.id],
  }),
}));

export const errorLogsRelations = relations(errorLogs, ({ one }) => ({
  user: one(users, {
    fields: [errorLogs.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [errorLogs.orgId],
    references: [organizations.id],
  }),
  agent: one(agentCatalog, {
    fields: [errorLogs.agentId],
    references: [agentCatalog.id],
  }),
  resolvedByUser: one(users, {
    fields: [errorLogs.resolvedBy],
    references: [users.id],
  }),
}));

// Zod schemas for new tables
export const insertUserAgentLicenseSchema = createInsertSchema(userAgentLicenses).omit({
  id: true,
  grantedAt: true,
  apiCallsUsed: true,
});

export const insertApiUsageTrackingSchema = createInsertSchema(apiUsageTracking).omit({
  id: true,
  timestamp: true,
});

export const insertAgentAccessRequestSchema = createInsertSchema(agentAccessRequests).omit({
  id: true,
  requestedAt: true,
  reviewedAt: true,
});

export const insertErrorLogSchema = createInsertSchema(errorLogs).omit({
  id: true,
  timestamp: true,
  resolvedAt: true,
});

// TypeScript types for new tables
export type UserAgentLicense = typeof userAgentLicenses.$inferSelect;
export type InsertUserAgentLicense = z.infer<typeof insertUserAgentLicenseSchema>;

export type ApiUsageTracking = typeof apiUsageTracking.$inferSelect;
export type InsertApiUsageTracking = z.infer<typeof insertApiUsageTrackingSchema>;

export type AgentAccessRequest = typeof agentAccessRequests.$inferSelect;
export type InsertAgentAccessRequest = z.infer<typeof insertAgentAccessRequestSchema>;

export type ErrorLog = typeof errorLogs.$inferSelect;
export type InsertErrorLog = z.infer<typeof insertErrorLogSchema>;
