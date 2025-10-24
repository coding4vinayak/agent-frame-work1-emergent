
# Rebranding: CRM → Modular AI Automation Platform

## Overview
This document outlines all changes needed to rebrand the application from "Abetworks CRM - Multi-Tenant Sales Automation Platform" to "Abetworks - Modular AI Automation Platform".

---

## 1. Core Concept Changes

### FROM (CRM Focus):
- Multi-tenant CRM
- Sales automation
- Lead generation
- Customer relationship management

### TO (AI Automation Focus):
- Modular AI automation platform
- Workflow automation modules
- Intelligent task orchestration
- Agent-driven automation

---

## 2. File Changes Required

### 2.1 README.md
**Current:** "Abetworks CRM - Multi-Tenant Sales Automation Platform"
**Change to:** "Abetworks - Modular AI Automation Platform"

**Current description:** "A production-ready, multi-tenant CRM and sales automation platform..."
**Change to:** "A production-ready, modular AI automation platform built for intelligent workflow orchestration..."

**Features to update:**
- Remove: "Lead generation", "Sales automation", "CRM features"
- Add: "AI-powered workflow automation", "Modular agent system", "Custom automation modules", "Intelligent task orchestration"

### 2.2 client/index.html
**Line 6:** 
```html
<!-- Current -->
<meta name="description" content="Abetworks CRM - Modern multi-tenant CRM and sales automation platform for managing teams, tasks, and workflows efficiently." />

<!-- Change to -->
<meta name="description" content="Abetworks - Modular AI automation platform for intelligent workflow orchestration and task automation." />
```

**Line 8:**
```html
<!-- Current -->
<title>Abetworks CRM - Sales Automation Platform</title>

<!-- Change to -->
<title>Abetworks - AI Automation Platform</title>
```

**Lines 14-16 (Open Graph):**
```html
<!-- Current -->
<meta property="og:title" content="Abetworks CRM - Sales Automation Platform" />
<meta property="og:description" content="Modern multi-tenant CRM and sales automation platform for managing teams, tasks, and workflows efficiently." />

<!-- Change to -->
<meta property="og:title" content="Abetworks - AI Automation Platform" />
<meta property="og:description" content="Modular AI automation platform for intelligent workflow orchestration and task automation." />
```

### 2.3 replit.md
**Line 1:** 
```markdown
# Abetworks CRM - Multi-Tenant Sales Automation Platform
```
**Change to:**
```markdown
# Abetworks - Modular AI Automation Platform
```

**Overview section:**
Replace "CRM and sales automation" language with "AI automation and workflow orchestration"

### 2.4 design_guidelines.md
**Line 1:**
```markdown
# Design Guidelines: Multi-Tenant CRM & Sales Automation Platform
```
**Change to:**
```markdown
# Design Guidelines: Modular AI Automation Platform
```

### 2.5 docs/API.md
**Title and descriptions:**
- Update all references from "CRM" to "AI Automation Platform"
- Update endpoint descriptions to focus on automation modules rather than sales/leads

### 2.6 docs/SETUP.md
**Title:**
```markdown
# Setup and Deployment Guide
```
**Change introduction from "Abetworks CRM platform" to "Abetworks AI Automation Platform"**

---

## 3. UI Text Changes

### 3.1 Dashboard (client/src/pages/dashboard.tsx)
**Current metrics:**
- "Active Users"
- "Tasks Done"
- "Leads Generated" ← REMOVE/REPLACE
- "Tasks Pending"

**Suggested new metrics:**
- "Active Modules"
- "Automations Completed"
- "Workflows Active"
- "Tasks Queued"

### 3.2 Agents Page (client/src/pages/agents.tsx)
**Line 19:**
```tsx
// Current
<p className="text-sm text-muted-foreground mt-2">
  AI agents to automate your workflows (coming soon)
</p>

// Change to
<p className="text-sm text-muted-foreground mt-2">
  Modular AI agents for intelligent automation
</p>
```

**Line 38:**
```tsx
// Current
AI agents are powerful automation tools that will be available soon.
They'll help you streamline workflows, process data, and complete tasks automatically.

// Change to
AI automation modules enable intelligent workflow orchestration.
Configure agents to handle complex tasks, process data, and execute workflows automatically.
```

### 3.3 Tasks Page (client/src/pages/tasks.tsx)
**Update description from "automation tasks" to "automation workflows"**

---

## 4. Database Schema Considerations

### 4.1 shared/schema.ts
**Optional additions for AI automation focus:**

```typescript
// Add new automation-specific fields
export const modules = pgTable("modules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(), // e.g., "data", "communication", "analytics"
  capabilities: text("capabilities"), // JSON string of module capabilities
  status: agentStatusEnum("status").notNull().default("active"),
  orgId: varchar("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Rename/repurpose existing tables:
// - Keep "agents" table (it's already modular)
// - Rename "tasks" → "workflows" (optional, but more aligned)
// - Add "automation_runs" for execution history
```

---

## 5. Terminology Changes Throughout Codebase

### Global Find & Replace:
1. **"CRM"** → Remove or replace with "Platform"
2. **"Sales automation"** → "AI automation" or "Workflow automation"
3. **"Lead generation"** → "Data collection" or "Input processing"
4. **"Leads"** → "Inputs" or "Data points"
5. **"Customer"** → "User" or "Entity"
6. **"Sales"** → "Automation" or "Workflows"

### Keep as-is:
- "Organization" (multi-tenant structure)
- "Tasks" (can represent automation workflows)
- "Agents" (perfect for modular AI)
- "Users" and "Teams"

---

## 6. API Endpoint Descriptions

### Update in server/routes.ts comments:
```typescript
// Current: "// ===== CRM Routes ====="
// Change to: "// ===== Automation Routes ====="

// Current: "Sales Assistant"
// Change to: "Automation Assistant" or "Workflow Orchestrator"

// Current: "Support Bot"
// Change to: "Support Automation Module"
```

---

## 7. Environment & Configuration

### No changes needed in:
- `.env` files
- Database connection strings
- JWT secrets
- Port configurations

---

## 8. New Features to Highlight

Add these concepts to documentation:

1. **Modular Architecture**
   - Pluggable automation modules
   - Custom agent development
   - Module marketplace (future)

2. **Workflow Orchestration**
   - Chain multiple agents
   - Conditional logic
   - Event-driven triggers

3. **AI Capabilities**
   - Natural language processing
   - Intelligent decision making
   - Learning from execution history

4. **Integration Framework**
   - Connect any API
   - Custom data sources
   - Third-party module support

---

## 9. Marketing Copy Updates

### Hero/Landing Page:
**FROM:** "Streamline your sales process with intelligent automation"
**TO:** "Build intelligent workflows with modular AI automation"

### Value Propositions:
- ❌ "Close more deals faster"
- ❌ "Never miss a lead"
- ✅ "Automate complex workflows effortlessly"
- ✅ "Scale your operations with AI"
- ✅ "Build custom automation modules"

---

## 10. Implementation Priority

### Phase 1 (Critical - Do First):
1. Update README.md
2. Update client/index.html (meta tags, title)
3. Update main dashboard metrics
4. Update agent descriptions

### Phase 2 (Important):
1. Update all documentation files
2. Update API descriptions
3. Update UI copy throughout pages

### Phase 3 (Nice to Have):
1. Add new automation-specific features
2. Create module marketplace concept
3. Enhanced agent configuration UI

---

## Notes:
- This rebranding maintains the same technical architecture
- No breaking changes to database schema required
- All existing features remain functional
- Focus shifts from "sales CRM" to "general automation platform"
- More scalable positioning for future AI modules
