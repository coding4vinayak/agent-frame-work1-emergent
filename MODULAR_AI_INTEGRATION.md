
# Modular AI Automation Platform - Integration Guide

## Overview
This guide explains how to transform the current application into a modular AI automation platform with Python-based agents that can be connected and managed through the existing Node.js/TypeScript infrastructure.

## Architecture Changes

### Current Stack
- **Frontend**: React + TypeScript
- **Backend API**: Node.js + Express + TypeScript
- **Database**: PostgreSQL (Neon)
- **Auth**: JWT

### New Modular Architecture
- **Frontend**: React + TypeScript (unchanged)
- **API Gateway**: Node.js + Express (unchanged)
- **Agent Runtime**: Python microservices
- **Communication**: REST API + WebSocket for real-time updates
- **Database**: Shared PostgreSQL (multi-tenant isolation maintained)

## Tech Stack Compatibility

### Node.js ↔ Python Communication Options

#### Option 1: REST API (Recommended for MVP)
**Pros:**
- Simple to implement
- Language agnostic
- Easy debugging
- HTTP-based, works with existing infrastructure

**Cons:**
- Slightly higher latency
- No real-time bidirectional communication (without polling)

#### Option 2: Message Queue (Redis/RabbitMQ)
**Pros:**
- Asynchronous processing
- Better for long-running tasks
- Built-in retry mechanisms

**Cons:**
- Additional infrastructure complexity
- Requires Redis/RabbitMQ setup

#### Option 3: gRPC
**Pros:**
- High performance
- Strong typing
- Bidirectional streaming

**Cons:**
- More complex setup
- Requires .proto file management

**Recommendation**: Start with REST API (Option 1), migrate to Message Queue (Option 2) as you scale.

---

## Implementation Steps

### Phase 1: Database Schema Updates

Add module-specific tables to `shared/schema.ts`:

```typescript
// New table for Python agent modules
export const modules = pgTable("modules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(), // e.g., "nlp", "data", "automation"
  pythonModule: text("python_module").notNull(), // e.g., "agents.nlp_processor"
  endpoint: text("endpoint"), // Optional REST endpoint
  config: text("config"), // JSON config for the module
  status: agentStatusEnum("status").notNull().default("active"),
  orgId: varchar("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Track module executions
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
  orgId: varchar("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
});
```

### Phase 2: Python Agent Infrastructure

#### Directory Structure
```
/python-agents
├── requirements.txt          # Python dependencies
├── config.py                 # Configuration management
├── main.py                   # FastAPI server entry point
├── agents/
│   ├── __init__.py
│   ├── base_agent.py        # Abstract base class for all agents
│   ├── nlp_agent.py         # Example: NLP processing agent
│   ├── data_agent.py        # Example: Data processing agent
│   └── automation_agent.py  # Example: Workflow automation agent
├── utils/
│   ├── __init__.py
│   ├── db_connector.py      # PostgreSQL connection
│   └── api_client.py        # Node.js API client
└── tests/
    └── test_agents.py
```

#### Python Dependencies (requirements.txt)
```txt
fastapi==0.109.0
uvicorn==0.27.0
psycopg2-binary==2.9.9
pydantic==2.5.0
python-dotenv==1.0.0
httpx==0.26.0
openai==1.10.0              # For AI agents
langchain==0.1.0            # For AI orchestration
redis==5.0.1                # Optional: for message queue
celery==5.3.6               # Optional: for async tasks
```

#### Base Agent Class (python-agents/agents/base_agent.py)
```python
from abc import ABC, abstractmethod
from typing import Any, Dict
import psycopg2
from datetime import datetime

class BaseAgent(ABC):
    """Abstract base class for all modular agents"""
    
    def __init__(self, org_id: str, config: Dict[str, Any] = None):
        self.org_id = org_id
        self.config = config or {}
        self.db_conn = None
    
    @abstractmethod
    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main execution method - must be implemented by each agent
        
        Args:
            input_data: Input data for the agent
            
        Returns:
            Dict with result and metadata
        """
        pass
    
    async def log_execution(self, module_id: str, task_id: str, status: str, output: Any = None, error: str = None):
        """Log execution to database"""
        # Implementation to log to module_executions table
        pass
    
    def validate_org_access(self, resource_id: str) -> bool:
        """Ensure multi-tenant isolation"""
        # Implementation to verify org_id matches
        pass
```

#### FastAPI Server (python-agents/main.py)
```python
from fastapi import FastAPI, HTTPException, Depends, Header
from pydantic import BaseModel
import os
from typing import Optional
from agents.nlp_agent import NLPAgent
from agents.data_agent import DataAgent

app = FastAPI(title="Abetworks AI Automation Modules")

# Request/Response models
class ExecutionRequest(BaseModel):
    module_id: str
    org_id: str
    task_id: Optional[str] = None
    input_data: dict

class ExecutionResponse(BaseModel):
    execution_id: str
    status: str
    output: Optional[dict] = None
    error: Optional[str] = None

# Authentication middleware
async def verify_api_key(x_api_key: str = Header(...)):
    # Verify API key against your PostgreSQL database
    # This should match the api_keys table in your Node.js app
    if not x_api_key or not x_api_key.startswith("abw_"):
        raise HTTPException(status_code=401, detail="Invalid API key")
    return x_api_key

@app.post("/execute", response_model=ExecutionResponse)
async def execute_module(
    request: ExecutionRequest,
    api_key: str = Depends(verify_api_key)
):
    """Execute a Python agent module"""
    try:
        # Route to appropriate agent based on module_id
        # This is where you'd load the module dynamically
        
        if request.module_id == "nlp_processor":
            agent = NLPAgent(org_id=request.org_id)
            result = await agent.execute(request.input_data)
        elif request.module_id == "data_processor":
            agent = DataAgent(org_id=request.org_id)
            result = await agent.execute(request.input_data)
        else:
            raise HTTPException(status_code=404, detail="Module not found")
        
        return ExecutionResponse(
            execution_id=result["execution_id"],
            status="completed",
            output=result["output"]
        )
    except Exception as e:
        return ExecutionResponse(
            execution_id="",
            status="failed",
            error=str(e)
        )

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "python-agents"}
```

### Phase 3: Node.js Integration

#### Add Python Agent Client (server/python-agent-client.ts)
```typescript
import axios from 'axios';

const PYTHON_AGENT_URL = process.env.PYTHON_AGENT_URL || 'http://0.0.0.0:8000';

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
  ) {
    try {
      const response = await axios.post(
        `${PYTHON_AGENT_URL}/execute`,
        {
          module_id: moduleId,
          org_id: orgId,
          task_id: taskId,
          input_data: inputData
        },
        {
          headers: {
            'X-API-Key': this.apiKey
          },
          timeout: 60000 // 60 seconds
        }
      );
      
      return response.data;
    } catch (error: any) {
      throw new Error(`Python agent execution failed: ${error.message}`);
    }
  }
  
  async healthCheck() {
    try {
      const response = await axios.get(`${PYTHON_AGENT_URL}/health`);
      return response.data;
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }
}
```

#### Update Routes (add to server/routes.ts)
```typescript
import { PythonAgentClient } from './python-agent-client';

// Execute Python module
app.post("/api/modules/:id/execute", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { inputData } = req.body;
    
    // Get organization's API key for Python service
    const apiKeys = await storage.getAllApiKeys(req.user!.orgId);
    if (!apiKeys.length) {
      return res.status(400).json({ message: "No API key configured" });
    }
    
    const client = new PythonAgentClient(apiKeys[0].key);
    const result = await client.executeModule(
      id,
      req.user!.orgId,
      inputData
    );
    
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});
```

### Phase 4: Frontend Module Management

Update the Agents page to support module configuration and Python agent connections.

---

## Admin Connection Setup

### Environment Variables

**Node.js (.env)**
```bash
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
PYTHON_AGENT_URL=http://0.0.0.0:8000
```

**Python (.env in /python-agents)**
```bash
DATABASE_URL=postgresql://...
NODE_API_URL=http://0.0.0.0:5000
API_KEY=abw_...
```

### Running Both Services

**Development (Local)**
```bash
# Terminal 1: Node.js API
npm run dev

# Terminal 2: Python agents
cd python-agents
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Production (Replit)**
Update `.replit` to run both services:
```toml
[deployment]
run = ["sh", "-c", "npm run start & cd python-agents && uvicorn main:app --host 0.0.0.0 --port 8000"]
```

---

## Multi-Tenant Security

### Critical Points
1. **Always pass `org_id`** to Python agents
2. **Validate org_id** in Python before any database query
3. **Use API keys** for Node.js ↔ Python authentication
4. **Database isolation**: All Python queries MUST filter by `org_id`

Example secure query in Python:
```python
def get_tasks(self, org_id: str):
    cursor = self.db_conn.cursor()
    cursor.execute(
        "SELECT * FROM tasks WHERE org_id = %s",
        (org_id,)
    )
    return cursor.fetchall()
```

---

## Migration Path

### Week 1: Setup
- [ ] Create `/python-agents` directory structure
- [ ] Install Python dependencies
- [ ] Set up FastAPI server
- [ ] Test basic connectivity

### Week 2: Integration
- [ ] Add `modules` table to database
- [ ] Create PythonAgentClient in Node.js
- [ ] Add API routes for module execution
- [ ] Test end-to-end flow

### Week 3: Agents
- [ ] Build first Python agent (e.g., NLP)
- [ ] Test multi-tenant isolation
- [ ] Add frontend UI for module management

### Week 4: Production
- [ ] Configure deployment for dual services
- [ ] Add monitoring and logging
- [ ] Performance testing
- [ ] Security audit

---

## Example Use Cases

### 1. NLP Processing Agent
```python
# python-agents/agents/nlp_agent.py
import openai
from .base_agent import BaseAgent

class NLPAgent(BaseAgent):
    async def execute(self, input_data):
        text = input_data.get('text')
        
        # Process with OpenAI
        response = await openai.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role": "user", "content": text}]
        )
        
        return {
            "execution_id": "exec_123",
            "output": {
                "processed_text": response.choices[0].message.content
            }
        }
```

### 2. Data Transformation Agent
```python
# python-agents/agents/data_agent.py
import pandas as pd
from .base_agent import BaseAgent

class DataAgent(BaseAgent):
    async def execute(self, input_data):
        data = input_data.get('data')
        
        # Process with pandas
        df = pd.DataFrame(data)
        result = df.describe().to_dict()
        
        return {
            "execution_id": "exec_456",
            "output": result
        }
```

---

## Benefits of This Architecture

1. **Language Flexibility**: Use Python for AI/ML, Node.js for API
2. **Modular**: Add new agents without changing core system
3. **Scalable**: Python services can scale independently
4. **Maintainable**: Clear separation of concerns
5. **Multi-tenant Safe**: Isolation enforced at every layer
6. **Cost Effective**: Only run Python agents when needed

---

## Next Steps

1. Review this architecture with your team
2. Set up Python environment on Replit
3. Build proof-of-concept with one agent
4. Test multi-tenant isolation thoroughly
5. Gradually migrate functionality from Node.js to Python modules where AI/ML is needed
