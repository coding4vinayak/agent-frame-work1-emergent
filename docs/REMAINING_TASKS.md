
# Remaining Development Tasks

## Priority 1: Agent Shop & Discovery

### Task 1.1: Create Agent Marketplace UI
**File**: `client/src/pages/agent-shop.tsx`

**Requirements**:
- Grid layout with agent cards
- Category filters (lead-generation, analytics, automation, etc.)
- Search functionality
- Agent detail modal showing:
  - Long description
  - Configuration options
  - Sample use cases
  - Pricing (if applicable)
- "Activate" button for each agent
- "Already Active" badge for activated agents

**API Endpoints Needed**:
```typescript
GET /api/agents/marketplace  // List all available agents
POST /api/agents/:id/activate  // Activate agent for org
GET /api/agents/active  // Get org's active agents
```

### Task 1.2: Add Agent Marketplace Route
**File**: `client/src/App.tsx`

Add route for agent shop:
```typescript
<Route path="/agent-shop" component={AgentShop} />
```

Add navigation link in sidebar:
```typescript
// In app-sidebar.tsx
<SidebarMenuItem>
  <SidebarMenuButton asChild>
    <Link to="/agent-shop">
      <Store className="mr-2 h-4 w-4" />
      Agent Shop
    </Link>
  </SidebarMenuButton>
</SidebarMenuItem>
```

---

## Priority 2: Active Agents Dashboard

### Task 2.1: Enhance Modules Page
**File**: `client/src/pages/modules.tsx`

**Requirements**:
- Show only activated agents for the organization
- Real-time status indicators:
  - 🟢 Idle (agent available)
  - 🟡 Running (currently executing)
  - 🔴 Error (last execution failed)
  - ⚪ Unknown
- Recent execution history (last 5 runs)
- Quick action buttons:
  - "Run" - Execute with test data
  - "Configure" - Open settings modal
  - "View History" - See all executions
- Performance metrics card per agent:
  - Total executions
  - Success rate
  - Average duration
  - Last run timestamp

### Task 2.2: Create Agent Status Component
**File**: `client/src/components/agent-status.tsx`

```typescript
interface AgentStatusProps {
  agentId: string;
  status: 'idle' | 'running' | 'error' | 'unknown';
  lastRun?: string;
}

export function AgentStatus({ agentId, status, lastRun }: AgentStatusProps) {
  // Component implementation
}
```

---

## Priority 3: Agent-Specific Display Components

### Task 3.1: Create Agent Display Folder
**Location**: `client/src/components/agent-displays/`

### Task 3.2: NLP Agent Display
**File**: `client/src/components/agent-displays/NLPAgentDisplay.tsx`

**Shows**:
- Original text input
- Processed/summarized output
- Sentiment analysis (if available)
- Key entities extracted
- Confidence scores

### Task 3.3: Data Agent Display
**File**: `client/src/components/agent-displays/DataAgentDisplay.tsx`

**Shows**:
- Input data summary (rows, columns)
- Transformation applied
- Output data preview (table)
- Statistics (before/after comparison)

### Task 3.4: Lead Scoring Display
**File**: `client/src/components/agent-displays/LeadScoringDisplay.tsx`

**Shows**:
- Lead score (0-100 with color coding)
- Score breakdown by factor:
  - Demographic score
  - Behavioral score
  - Engagement score
- Recommended action (hot lead, nurture, cold)
- Historical score trend

### Task 3.5: Forecasting Display
**File**: `client/src/components/agent-displays/ForecastingDisplay.tsx`

**Shows**:
- Line chart with historical data + forecast
- Confidence intervals
- Key metrics (predicted revenue, growth rate)
- Scenario comparison (if available)

### Task 3.6: Generic Agent Display
**File**: `client/src/components/agent-displays/GenericAgentDisplay.tsx`

**Shows**:
- JSON viewer for any agent output
- Fallback when specific display doesn't exist

---

## Priority 4: Agent Testing System

### Task 4.1: Add Test Endpoint
**File**: `server/routes.ts`

```typescript
app.post("/api/modules/:id/test", requireAuth, async (req, res) => {
  // Execute agent with test data
  // Return results immediately
});
```

### Task 4.2: Create Test Interface Component
**File**: `client/src/components/agent-test-interface.tsx`

**Requirements**:
- Form to input test data (JSON editor)
- Sample data templates per agent type
- "Run Test" button
- Loading state during execution
- Result display using agent-specific component
- Error handling with clear messages

### Task 4.3: Add Test Modal to Modules Page
**File**: `client/src/pages/modules.tsx`

Add "Test" button that opens modal with test interface.

---

## Priority 5: Agent Execution History

### Task 5.1: Create Execution History Endpoint
**File**: `server/routes.ts`

```typescript
GET /api/modules/:id/executions
// Returns paginated list of executions
// Filters: status, date range
// Includes: input, output, duration, status, error
```

### Task 5.2: Create Execution History Page
**File**: `client/src/pages/execution-history.tsx`

**Shows**:
- Table with all executions
- Columns: Timestamp, Agent, Status, Duration, User
- Expandable rows showing input/output
- Filter by agent, status, date range
- Export to CSV

### Task 5.3: Add Agent Stats Endpoint
**File**: `server/routes.ts`

```typescript
GET /api/modules/:id/stats
// Returns: total_executions, success_rate, avg_duration,
//          last_run, error_count, executions_by_day
```

---

## Priority 6: Agent Configuration System

### Task 6.1: Add Agent Config Storage
**Database**: Add `agent_configs` table (or use existing `modules` table)

```sql
-- If needed, modify modules table to store config JSON
ALTER TABLE modules ADD COLUMN user_config TEXT;
```

### Task 6.2: Create Config Modal Component
**File**: `client/src/components/agent-config-modal.tsx`

**Features**:
- Form fields based on agent's config schema
- JSON editor for advanced users
- Save/Cancel buttons
- Validation before save

### Task 6.3: Add Config Endpoints
**File**: `server/routes.ts`

```typescript
GET /api/modules/:id/config  // Get current config
PUT /api/modules/:id/config  // Update config
```

---

## Priority 7: Workflow Builder (Future)

### Task 7.1: Design Workflow Schema
- Chain multiple agents
- Pass output from one agent as input to next
- Conditional branching
- Error handling

### Task 7.2: Create Visual Workflow Builder
- Drag-and-drop interface
- Agent nodes
- Connection lines
- Execution flow visualization

### Task 7.3: Workflow Execution Engine
- Backend service to execute workflows
- Handle agent chaining
- Track workflow state
- Resume on failure

---

## Quick Win Tasks (Can Do Now)

### Quick Win 1: Update Navigation
**File**: `client/src/components/app-sidebar.tsx`

Add link to "Agent Shop" (even if page doesn't exist yet):
```typescript
<SidebarMenuButton asChild>
  <Link to="/agent-shop">
    <Store className="mr-2 h-4 w-4" />
    Agent Shop
  </Link>
</SidebarMenuButton>
```

### Quick Win 2: Add Agent Category Badges
**File**: `client/src/pages/agents.tsx`

Display category badges on agent cards with color coding.

### Quick Win 3: Add Execution Count to Dashboard
**File**: `client/src/pages/dashboard.tsx`

Add new metric: "Agent Executions (Today)"

### Quick Win 4: Create Empty State for Modules
**File**: `client/src/pages/modules.tsx`

If no agents activated, show:
- "No Active Agents Yet"
- "Browse Agent Shop" button
- Visual illustration

---

## Testing Checklist

Before marking tasks complete:

- [ ] Feature works in development
- [ ] Multi-tenant isolation verified
- [ ] Error handling tested
- [ ] Loading states implemented
- [ ] Mobile responsive
- [ ] API documented in `docs/API.md`
- [ ] User permissions respected
- [ ] No console errors
- [ ] Works with sample data

---

## Estimated Time

| Task | Priority | Estimated Hours |
|------|----------|----------------|
| Agent Shop UI | P1 | 8-12 hours |
| Active Agents Dashboard | P2 | 6-8 hours |
| Display Components | P3 | 10-15 hours |
| Testing System | P4 | 6-8 hours |
| Execution History | P5 | 4-6 hours |
| Config System | P6 | 6-8 hours |
| **Total** | | **40-57 hours** |

---

**Last Updated**: 2024
