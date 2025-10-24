
# Abetworks - Complete AI Automation Platform Transformation Guide

## Table of Contents
1. [Overview](#overview)
2. [Platform Identity & Rebranding](#platform-identity--rebranding)
3. [Architecture & Tech Stack](#architecture--tech-stack)
4. [Implementation Blueprint](#implementation-blueprint)
5. [Database Schema](#database-schema)
6. [Python Agent System](#python-agent-system)
7. [Node.js Integration Layer](#nodejs-integration-layer)
8. [Frontend Components](#frontend-components)
9. [Security & Multi-Tenancy](#security--multi-tenancy)
10. [Deployment Configuration](#deployment-configuration)
11. [Complete File Changes Checklist](#complete-file-changes-checklist)

---

## Overview

**Platform Name**: Abetworks - Modular AI Automation Platform

**Core Concept**: Transform from CRM/sales automation to a modular AI automation platform where Python-based AI agents can be dynamically connected, managed, and orchestrated through a TypeScript/React frontend.

**Key Differentiators**:
- Modular architecture for pluggable AI agents
- Python microservices for AI/ML workloads
- Node.js API gateway for orchestration
- Multi-tenant isolation at every layer
- Real-time workflow execution
- Dynamic module loading system

---

## Platform Identity & Rebranding

### Core Positioning Changes

**FROM (CRM Focus)**:
- Multi-tenant CRM
- Sales automation
- Lead generation
- Customer relationship management

**TO (AI Automation Focus)**:
- Modular AI automation platform
- Workflow automation modules
- Intelligent task orchestration
- Agent-driven automation

### Terminology Mapping

| OLD (CRM) | NEW (AI Platform) |
|-----------|-------------------|
| CRM | Platform / Automation System |
| Sales automation | AI automation / Workflow automation |
| Lead generation | Data collection / Input processing |
| Leads | Inputs / Data points |
| Customer | User / Entity |
| Sales | Automation / Workflows |
| Close deals | Complete workflows |

### Value Propositions

**New Marketing Messages**:
- ✅ "Build intelligent workflows with modular AI automation"
- ✅ "Automate complex workflows effortlessly"
- ✅ "Scale your operations with AI"
- ✅ "Build custom automation modules"
- ✅ "Connect any AI agent to your workflows"

**Remove**:
- ❌ "Streamline your sales process"
- ❌ "Close more deals faster"
- ❌ "Never miss a lead"

---

## Architecture & Tech Stack

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + TS)                     │
│  - Dashboard  - Module Manager  - Workflow Builder           │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST
┌──────────────────────▼──────────────────────────────────────┐
│              Node.js API Gateway (Express + TS)              │
│  - Auth  - Multi-tenant routing  - Module orchestration      │
└──────────┬───────────────────────────────────┬──────────────┘
           │                                   │
           │ PostgreSQL                        │ HTTP/REST
           │                                   │
┌──────────▼──────────┐            ┌──────────▼──────────────┐
│  Shared Database    │            │  Python Agent Runtime    │
│  (Multi-tenant)     │◄───────────┤  - NLP  - Data  - ML     │
└─────────────────────┘            └─────────────────────────┘
```

### Tech Stack Components

**Frontend**:
- React 18+ with TypeScript
- Tailwind CSS + shadcn/ui
- TanStack Query for state management
- React Router for navigation

**Backend API**:
- Node.js + Express + TypeScript
- JWT authentication
- PostgreSQL (via Drizzle ORM)
- RESTful API design

**Agent Runtime**:
- Python 3.11+
- FastAPI for REST endpoints
- psycopg2 for database access
- OpenAI, LangChain for AI capabilities

**Database**:
- PostgreSQL (Neon for production)
- Multi-tenant schema with org_id isolation
- Drizzle ORM for migrations

**Communication Layer**:
- REST API (primary)
- Optional: Redis for message queue
- Optional: WebSocket for real-time updates

### Communication Options Analysis

#### Option 1: REST API ⭐ (Recommended)
**When to use**: MVP, simple request/response patterns
```typescript
// Node.js → Python
const result = await axios.post('http://0.0.0.0:8000/execute', {
  module_id: 'nlp_processor',
  org_id: 'org_123',
  input_data: { text: 'Hello world' }
});
```

**Pros**: Simple, HTTP-based, easy debugging
**Cons**: No real-time bidirectional communication

#### Option 2: Message Queue (Redis/RabbitMQ)
**When to use**: Long-running tasks, async workflows, high scale
**Pros**: Asynchronous, retry mechanisms, decoupled
**Cons**: Additional infrastructure

#### Option 3: gRPC
**When to use**: High-performance requirements, type-safe contracts
**Pros**: Fast, bidirectional streaming
**Cons**: Complex setup, .proto file management

---

## Implementation Blueprint

### Phase 1: Database Schema (Week 1)

#### New Tables Required

**1. Modules Table** - Tracks Python agent modules
```typescript
export const modules = pgTable("modules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(), // "nlp", "data", "automation", "ml"
  pythonModule: text("python_module").notNull(), // "agents.nlp_processor"
  endpoint: text("endpoint"), // REST endpoint URL
  config: text("config"), // JSON configuration
  status: agentStatusEnum("status").notNull().default("active"),
  orgId: varchar("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const moduleRelations = relations(modules, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [modules.orgId],
    references: [organizations.id],
  }),
  executions: many(moduleExecutions),
}));
```

**2. Module Executions Table** - Tracks execution history
```typescript
export const moduleExecutions = pgTable("module_executions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  moduleId: varchar("module_id").notNull().references(() => modules.id, { onDelete: "cascade" }),
  taskId: varchar("task_id").references(() => tasks.id, { onDelete: "set null" }),
  input: text("input"), // JSON input data
  output: text("output"), // JSON output data
  status: taskStatusEnum("status").notNull().default("pending"),
  error: text("error"),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  duration: integer("duration"), // milliseconds
  orgId: varchar("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
});

export const moduleExecutionRelations = relations(moduleExecutions, ({ one }) => ({
  module: one(modules, {
    fields: [moduleExecutions.moduleId],
    references: [modules.id],
  }),
  task: one(tasks, {
    fields: [moduleExecutions.taskId],
    references: [tasks.id],
  }),
  organization: one(organizations, {
    fields: [moduleExecutions.orgId],
    references: [organizations.id],
  }),
}));
```

**3. Workflows Table** - Chain multiple agents
```typescript
export const workflows = pgTable("workflows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  steps: text("steps"), // JSON array of module IDs and configs
  trigger: text("trigger"), // "manual", "schedule", "webhook"
  status: agentStatusEnum("status").notNull().default("active"),
  orgId: varchar("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
```

### Phase 2: Python Agent Infrastructure (Week 2)

#### Directory Structure
```
/python-agents/
├── requirements.txt
├── config.py
├── main.py                    # FastAPI server
├── .env.example
├── agents/
│   ├── __init__.py
│   ├── base_agent.py         # Abstract base class
│   ├── nlp_agent.py          # NLP processing
│   ├── data_agent.py         # Data transformation
│   ├── vision_agent.py       # Image processing
│   └── automation_agent.py   # Workflow automation
├── utils/
│   ├── __init__.py
│   ├── db_connector.py       # PostgreSQL connection
│   ├── api_client.py         # Node.js API client
│   └── logger.py             # Logging utility
└── tests/
    ├── test_base_agent.py
    └── test_nlp_agent.py
```

#### requirements.txt
```txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
psycopg2-binary==2.9.9
pydantic==2.5.0
pydantic-settings==2.1.0
python-dotenv==1.0.0
httpx==0.26.0
python-jose[cryptography]==3.3.0

# AI/ML libraries
openai==1.10.0
langchain==0.1.0
langchain-openai==0.0.5
anthropic==0.8.0

# Data processing
pandas==2.1.4
numpy==1.26.3

# Optional: Message queue
redis==5.0.1
celery==5.3.6

# Monitoring
prometheus-client==0.19.0
```

#### Base Agent Class (agents/base_agent.py)
```python
from abc import ABC, abstractmethod
from typing import Any, Dict, Optional
import psycopg2
from datetime import datetime
import json
import os

class BaseAgent(ABC):
    """Abstract base class for all modular AI agents"""
    
    def __init__(self, org_id: str, config: Optional[Dict[str, Any]] = None):
        self.org_id = org_id
        self.config = config or {}
        self.db_conn = None
        self._connect_db()
    
    def _connect_db(self):
        """Establish database connection"""
        try:
            self.db_conn = psycopg2.connect(os.getenv("DATABASE_URL"))
        except Exception as e:
            print(f"Database connection error: {e}")
            raise
    
    @abstractmethod
    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main execution method - MUST be implemented by each agent
        
        Args:
            input_data: Input data for the agent
            
        Returns:
            Dict with 'status', 'output', and optional 'error'
        """
        pass
    
    async def validate_org_access(self, resource_id: str, table: str) -> bool:
        """Ensure multi-tenant isolation"""
        cursor = self.db_conn.cursor()
        try:
            cursor.execute(
                f"SELECT org_id FROM {table} WHERE id = %s",
                (resource_id,)
            )
            result = cursor.fetchone()
            return result and result[0] == self.org_id
        finally:
            cursor.close()
    
    async def log_execution(
        self,
        module_id: str,
        task_id: Optional[str],
        status: str,
        output: Optional[Any] = None,
        error: Optional[str] = None,
        duration: Optional[int] = None
    ):
        """Log execution to module_executions table"""
        cursor = self.db_conn.cursor()
        try:
            cursor.execute(
                """
                INSERT INTO module_executions 
                (module_id, task_id, org_id, status, output, error, duration, started_at, completed_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
                RETURNING id
                """,
                (
                    module_id,
                    task_id,
                    self.org_id,
                    status,
                    json.dumps(output) if output else None,
                    error,
                    duration
                )
            )
            self.db_conn.commit()
            return cursor.fetchone()[0]
        except Exception as e:
            self.db_conn.rollback()
            print(f"Error logging execution: {e}")
        finally:
            cursor.close()
    
    def __del__(self):
        """Cleanup database connection"""
        if self.db_conn:
            self.db_conn.close()
```

#### Example NLP Agent (agents/nlp_agent.py)
```python
from .base_agent import BaseAgent
from typing import Dict, Any
import openai
import os

class NLPAgent(BaseAgent):
    """Natural Language Processing agent using OpenAI"""
    
    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            text = input_data.get('text', '')
            task_type = input_data.get('task', 'summarize')  # summarize, sentiment, extract
            
            # Configure OpenAI
            openai.api_key = os.getenv("OPENAI_API_KEY")
            
            # Build prompt based on task type
            prompts = {
                'summarize': f"Summarize the following text concisely:\n\n{text}",
                'sentiment': f"Analyze the sentiment of this text (positive/negative/neutral):\n\n{text}",
                'extract': f"Extract key information from this text:\n\n{text}",
            }
            
            # Execute OpenAI request
            response = openai.ChatCompletion.create(
                model=self.config.get('model', 'gpt-4'),
                messages=[
                    {"role": "system", "content": "You are a helpful AI assistant."},
                    {"role": "user", "content": prompts.get(task_type, prompts['summarize'])}
                ],
                temperature=0.7,
                max_tokens=self.config.get('max_tokens', 500)
            )
            
            result = response.choices[0].message.content
            
            return {
                "status": "success",
                "output": {
                    "result": result,
                    "task_type": task_type,
                    "model": self.config.get('model', 'gpt-4'),
                    "tokens_used": response.usage.total_tokens
                }
            }
            
        except Exception as e:
            return {
                "status": "error",
                "error": str(e)
            }
```

#### FastAPI Server (main.py)
```python
from fastapi import FastAPI, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional, Dict, Any
import os
from dotenv import load_dotenv
import time

# Import agents
from agents.nlp_agent import NLPAgent
from agents.data_agent import DataAgent

load_dotenv()

app = FastAPI(
    title="Abetworks AI Automation Platform",
    description="Modular AI automation agents",
    version="1.0.0"
)

# Request/Response models
class ExecutionRequest(BaseModel):
    module_id: str
    org_id: str
    task_id: Optional[str] = None
    input_data: Dict[str, Any]

class ExecutionResponse(BaseModel):
    execution_id: str
    status: str
    output: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    duration: Optional[int] = None

# Authentication
async def verify_api_key(x_api_key: str = Header(...)):
    """Verify API key from Node.js backend"""
    # In production, verify against database
    valid_key = os.getenv("PYTHON_API_KEY", "abw_dev_key")
    if x_api_key != valid_key:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return x_api_key

# Module registry - maps module_id to agent class
MODULE_REGISTRY = {
    "nlp_processor": NLPAgent,
    "data_processor": DataAgent,
}

@app.post("/execute", response_model=ExecutionResponse)
async def execute_module(
    request: ExecutionRequest,
    api_key: str = Depends(verify_api_key)
):
    """Execute a Python agent module"""
    start_time = time.time()
    
    try:
        # Get agent class from registry
        agent_class = MODULE_REGISTRY.get(request.module_id)
        if not agent_class:
            raise HTTPException(status_code=404, detail=f"Module {request.module_id} not found")
        
        # Instantiate and execute agent
        agent = agent_class(org_id=request.org_id)
        result = await agent.execute(request.input_data)
        
        duration = int((time.time() - start_time) * 1000)  # milliseconds
        
        # Log execution
        execution_id = await agent.log_execution(
            module_id=request.module_id,
            task_id=request.task_id,
            status=result.get("status", "completed"),
            output=result.get("output"),
            error=result.get("error"),
            duration=duration
        )
        
        return ExecutionResponse(
            execution_id=execution_id or f"exec_{request.task_id}",
            status=result.get("status", "completed"),
            output=result.get("output"),
            error=result.get("error"),
            duration=duration
        )
        
    except Exception as e:
        duration = int((time.time() - start_time) * 1000)
        return ExecutionResponse(
            execution_id="",
            status="failed",
            error=str(e),
            duration=duration
        )

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "python-agents",
        "modules": list(MODULE_REGISTRY.keys())
    }

@app.get("/modules")
async def list_modules(api_key: str = Depends(verify_api_key)):
    """List available modules"""
    return {
        "modules": [
            {"id": module_id, "name": agent_class.__name__}
            for module_id, agent_class in MODULE_REGISTRY.items()
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
```

#### .env.example
```bash
DATABASE_URL=postgresql://user:password@host:5432/database
NODE_API_URL=http://0.0.0.0:5000
PYTHON_API_KEY=abw_your_api_key_here
OPENAI_API_KEY=sk-your-openai-key
```

### Phase 3: Node.js Integration (Week 2-3)

#### Python Agent Client (server/python-agent-client.ts)
```typescript
import axios, { AxiosError } from 'axios';

const PYTHON_AGENT_URL = process.env.PYTHON_AGENT_URL || 'http://0.0.0.0:8000';

interface ExecutionRequest {
  module_id: string;
  org_id: string;
  task_id?: string;
  input_data: any;
}

interface ExecutionResponse {
  execution_id: string;
  status: string;
  output?: any;
  error?: string;
  duration?: number;
}

export class PythonAgentClient {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  async executeModule(
    moduleId: string,
    orgId: string,
    inputData: any,
    taskId?: string
  ): Promise<ExecutionResponse> {
    try {
      const response = await axios.post<ExecutionResponse>(
        `${PYTHON_AGENT_URL}/execute`,
        {
          module_id: moduleId,
          org_id: orgId,
          task_id: taskId,
          input_data: inputData
        } as ExecutionRequest,
        {
          headers: {
            'X-API-Key': this.apiKey,
            'Content-Type': 'application/json'
          },
          timeout: 60000 // 60 seconds
        }
      );
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        throw new Error(
          `Python agent execution failed: ${axiosError.response?.data || axiosError.message}`
        );
      }
      throw error;
    }
  }
  
  async healthCheck(): Promise<{ status: string; service: string; modules?: string[] }> {
    try {
      const response = await axios.get(`${PYTHON_AGENT_URL}/health`, {
        timeout: 5000
      });
      return response.data;
    } catch (error) {
      return {
        status: 'unhealthy',
        service: 'python-agents',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  async listModules(): Promise<{ modules: Array<{ id: string; name: string }> }> {
    try {
      const response = await axios.get(`${PYTHON_AGENT_URL}/modules`, {
        headers: {
          'X-API-Key': this.apiKey
        },
        timeout: 5000
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to list modules: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
```

#### API Routes Addition (add to server/routes.ts)
```typescript
// Execute Python module
app.post("/api/modules/:id/execute", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { inputData, taskId } = req.body;
    
    // Get organization's API key for Python service
    const apiKeys = await storage.getAllApiKeys(req.user!.orgId);
    if (!apiKeys.length) {
      return res.status(400).json({ message: "No API key configured for Python agents" });
    }
    
    const client = new PythonAgentClient(apiKeys[0].key);
    const result = await client.executeModule(
      id,
      req.user!.orgId,
      inputData,
      taskId
    );
    
    res.json(result);
  } catch (error: any) {
    console.error("Module execution error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Check Python agent health
app.get("/api/modules/health", requireAuth, async (req: AuthRequest, res) => {
  try {
    const apiKeys = await storage.getAllApiKeys(req.user!.orgId);
    if (!apiKeys.length) {
      return res.status(400).json({ message: "No API key configured" });
    }
    
    const client = new PythonAgentClient(apiKeys[0].key);
    const health = await client.healthCheck();
    res.json(health);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// List available Python modules
app.get("/api/modules/available", requireAuth, async (req: AuthRequest, res) => {
  try {
    const apiKeys = await storage.getAllApiKeys(req.user!.orgId);
    if (!apiKeys.length) {
      return res.status(400).json({ message: "No API key configured" });
    }
    
    const client = new PythonAgentClient(apiKeys[0].key);
    const modules = await client.listModules();
    res.json(modules);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});
```

### Phase 4: Frontend Updates (Week 3)

#### Update Agents Page UI
Focus on module management rather than generic agents.

---

## Security & Multi-Tenancy

### Critical Security Rules

1. **Always validate org_id** in every Python agent query
2. **Use API keys** for Node.js ↔ Python authentication
3. **Database queries MUST filter by org_id**
4. **Never trust client-side org_id** - always get from JWT
5. **Sanitize all inputs** before passing to Python agents

### Example Secure Query Pattern
```python
# ✅ CORRECT - Filters by org_id
def get_tasks(self, org_id: str):
    cursor = self.db_conn.cursor()
    cursor.execute(
        "SELECT * FROM tasks WHERE org_id = %s",
        (org_id,)
    )
    return cursor.fetchall()

# ❌ WRONG - No org_id filter
def get_tasks_wrong(self):
    cursor = self.db_conn.cursor()
    cursor.execute("SELECT * FROM tasks")  # Exposes all orgs!
    return cursor.fetchall()
```

---

## Deployment Configuration

### Environment Variables

**Node.js (.env)**
```bash
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
PYTHON_AGENT_URL=http://0.0.0.0:8000
NODE_ENV=production
```

**Python (.env in /python-agents)**
```bash
DATABASE_URL=postgresql://...
NODE_API_URL=http://0.0.0.0:5000
PYTHON_API_KEY=abw_production_key
OPENAI_API_KEY=sk-...
```

### Running Both Services

**Development (Replit)**
Create workflow that runs both services:
```bash
# Terminal 1: Node.js
npm run dev

# Terminal 2: Python agents
cd python-agents && uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Production Configuration**
Update deployment to run both:
```bash
npm run start & cd python-agents && uvicorn main:app --host 0.0.0.0 --port 8000
```

---

## Complete File Changes Checklist

### Rebranding Changes

#### README.md
- [ ] Title: "Abetworks - Modular AI Automation Platform"
- [ ] Description: Focus on AI automation, not CRM
- [ ] Features: Replace sales/leads with modules/workflows
- [ ] Add: AI agent architecture section

#### client/index.html
- [ ] Line 6: Update meta description
- [ ] Line 8: Title → "Abetworks - AI Automation Platform"
- [ ] Lines 14-16: Update Open Graph tags

#### replit.md
- [ ] Line 1: Update title
- [ ] Overview: Replace CRM language

#### design_guidelines.md
- [ ] Line 1: Update title
- [ ] Replace all CRM references

#### docs/API.md
- [ ] Update title and descriptions
- [ ] Focus on automation modules

#### docs/SETUP.md
- [ ] Update introduction
- [ ] Add Python agent setup section

### UI Text Changes

#### client/src/pages/dashboard.tsx
Replace metrics:
- [ ] "Leads Generated" → "Workflows Active"
- [ ] Add "Active Modules" metric

#### client/src/pages/agents.tsx
- [ ] Line 19: "Modular AI agents for intelligent automation"
- [ ] Line 38: Update description for automation focus

#### client/src/pages/tasks.tsx
- [ ] Update to show "automation workflows"

### Code Structure Changes

#### shared/schema.ts
- [ ] Add `modules` table
- [ ] Add `moduleExecutions` table
- [ ] Add `workflows` table (optional)

#### server/python-agent-client.ts
- [ ] Implement PythonAgentClient class
- [ ] Add executeModule, healthCheck, listModules methods

#### server/routes.ts
- [ ] Add `/api/modules/:id/execute` endpoint
- [ ] Add `/api/modules/health` endpoint
- [ ] Add `/api/modules/available` endpoint

#### Python Infrastructure
- [ ] Create `/python-agents` directory
- [ ] Add requirements.txt
- [ ] Implement base_agent.py
- [ ] Create example agents (nlp_agent.py, data_agent.py)
- [ ] Implement main.py FastAPI server
- [ ] Add .env.example

---

## Migration Timeline

### Week 1: Foundation
- [ ] Review and approve architecture
- [ ] Set up Python environment on Replit
- [ ] Create database schema changes
- [ ] Run migrations

### Week 2: Integration
- [ ] Implement Python base agent class
- [ ] Create FastAPI server
- [ ] Build PythonAgentClient in Node.js
- [ ] Test basic connectivity

### Week 3: Agents & UI
- [ ] Build first Python agent (NLP)
- [ ] Add API routes for module execution
- [ ] Update frontend for module management
- [ ] Test end-to-end workflow

### Week 4: Production
- [ ] Apply all rebranding changes
- [ ] Configure dual-service deployment
- [ ] Security audit (multi-tenancy)
- [ ] Performance testing
- [ ] Documentation updates

---

## Future Enhancements

1. **Module Marketplace**: Allow users to install pre-built agents
2. **Visual Workflow Builder**: Drag-and-drop workflow orchestration
3. **Real-time Monitoring**: WebSocket for live execution updates
4. **Agent Learning**: Store execution history for optimization
5. **Custom Agent SDK**: Let users build their own agents
6. **Integration Hub**: Pre-built connectors for popular APIs

---

## Appendix: Quick Reference

### Key Commands
```bash
# Start Node.js
npm run dev

# Start Python agents
cd python-agents && uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Run migrations
npm run db:push

# Install Python deps
cd python-agents && pip install -r requirements.txt
```

### Important Ports
- **5000**: Node.js API
- **8000**: Python agents
- **5432**: PostgreSQL

### Critical Files
- `shared/schema.ts` - Database schema
- `server/python-agent-client.ts` - Python communication
- `python-agents/agents/base_agent.py` - Agent base class
- `python-agents/main.py` - FastAPI server

---

**End of Guide**

This document serves as the complete blueprint for transforming the application into a modular AI automation platform. All sections can be implemented independently or as a complete migration.
