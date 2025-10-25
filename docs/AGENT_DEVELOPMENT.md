
# Agent Development Guide

## Overview

This document outlines the agent system architecture, what's currently built, what remains to be built, and how to easily add new agents to the platform.

---

## 📋 Current Status

### ✅ What's Built

1. **Python Agent Infrastructure**
   - Base agent class (`python-agents/agents/base_agent.py`)
   - NLP Agent (`python-agents/agents/nlp_agent.py`)
   - Data Agent (`python-agents/agents/data_agent.py`)
   - FastAPI server (`python-agents/main.py`)
   - Database connectivity with multi-tenant isolation
   - Execution logging system

2. **Backend API Integration**
   - Python agent client (`server/python-agent-client.ts`)
   - Module execution endpoints
   - Health check endpoints
   - Module listing endpoints

3. **Database Schema**
   - `modules` table for agent registry
   - `module_executions` table for execution history
   - Multi-tenant isolation via `org_id`

4. **Frontend Pages**
   - Basic agents page (`client/src/pages/agents.tsx`)
   - Modules page placeholder (`client/src/pages/modules.tsx`)

---

## 🚧 What Remains to Build

### 1. Agent Marketplace/Shop Interface

**Location**: `client/src/pages/agent-shop.tsx` (needs to be created)

**Required Features**:
- Browse available agents by category
- Search and filter agents
- View agent details (description, pricing, features)
- One-click agent activation
- Show which agents are already active
- Agent configuration modal

**Backend Requirements**:
- `GET /api/agents/marketplace` - List all available agents
- `POST /api/agents/activate` - Activate an agent for organization
- `GET /api/agents/active` - List organization's active agents

### 2. Active Agents Dashboard

**Location**: `client/src/pages/modules.tsx` (needs enhancement)

**Required Features**:
- Grid/list view of active agents
- Real-time status indicators (running, idle, error)
- Recent execution history per agent
- Quick execution buttons
- Configuration access
- Performance metrics (execution count, success rate, avg duration)

### 3. Agent-Specific Display Components

**Location**: `client/src/components/agent-displays/` (needs to be created)

**Required Components**:
- `NLPAgentDisplay.tsx` - Show NLP processing results
- `DataAgentDisplay.tsx` - Show data transformation results
- `LeadScoringDisplay.tsx` - Show lead scores and insights
- `ChatbotDisplay.tsx` - Show conversation history
- `ForecastingDisplay.tsx` - Show prediction charts
- Generic `AgentResultDisplay.tsx` for fallback

### 4. Agent Activation & Testing System

**Backend Endpoints Needed**:
- `POST /api/modules/:id/test` - Test agent with sample data
- `GET /api/modules/:id/executions` - Get execution history
- `GET /api/modules/:id/stats` - Get agent statistics

**Frontend Components Needed**:
- Agent test interface with sample inputs
- Execution result viewer
- Error handling and debugging tools

---

## 🔧 How to Add a New Agent (Easy Guide)

### Step 1: Create Python Agent Class

Create a new file: `python-agents/agents/your_agent_name.py`

```python
from .base_agent import BaseAgent
from typing import Any, Dict

class YourAgentName(BaseAgent):
    """Description of what your agent does"""
    
    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute your agent's main task
        
        Args:
            input_data: Dict with required input fields
            
        Returns:
            Dict with 'success' boolean and 'output' data
        """
        try:
            # 1. Extract input parameters
            param1 = input_data.get("param1")
            param2 = input_data.get("param2", "default_value")
            
            # 2. Validate inputs
            if not param1:
                return {
                    "success": False,
                    "error": "param1 is required"
                }
            
            # 3. Perform your agent's logic here
            result = self._process_data(param1, param2)
            
            # 4. Return success response
            return {
                "success": True,
                "output": {
                    "result": result,
                    "metadata": {
                        "param1": param1,
                        "param2": param2
                    }
                }
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def _process_data(self, param1, param2):
        """Your internal processing logic"""
        # Implement your logic here
        return f"Processed: {param1} with {param2}"
```

### Step 2: Register Agent in FastAPI Server

Edit `python-agents/main.py` and add your agent:

```python
# At the top, import your agent
from agents.your_agent_name import YourAgentName

# In the MODULE_REGISTRY dictionary, add:
MODULE_REGISTRY = {
    "nlp_processor": NLPAgent,
    "data_processor": DataAgent,
    "your_agent_id": YourAgentName,  # Add this line
}
```

### Step 3: Add Agent Metadata to Database

Create a seed file or add to `server/seed-agents.ts`:

```typescript
{
  id: "your_agent_id",
  name: "Your Agent Name",
  type: "agent-category",
  description: "Short description",
  longDescription: "Detailed description of capabilities",
  icon: "IconName", // Lucide icon name
  category: "category-name",
  backendEndpoint: "/api/agents/your-agent",
  price: 0,
  isActive: true,
}
```

### Step 4: Test Your Agent

**Via API**:
```bash
curl -X POST http://0.0.0.0:8000/execute \
  -H "X-API-Key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "module_id": "your_agent_id",
    "org_id": "org_123",
    "input_data": {
      "param1": "test_value",
      "param2": "optional_value"
    }
  }'
```

**Via Frontend**:
Once the shop interface is built, you can test through the UI.

---

## 📊 Agent Categories

Organize agents by category for better discovery:

1. **lead-generation** - Form collection, web scraping, data capture
2. **customer-engagement** - Chatbots, email automation, SMS
3. **lead-qualification** - Scoring, validation, enrichment
4. **analytics** - Forecasting, reporting, trend analysis
5. **marketing** - Campaign automation, A/B testing, personalization
6. **data-processing** - Transformation, cleaning, enrichment
7. **automation** - Workflow orchestration, task automation

---

## 🧪 Testing Checklist for New Agents

Before deploying a new agent, verify:

- [ ] Agent executes successfully with valid input
- [ ] Agent handles missing/invalid input gracefully
- [ ] Agent respects `org_id` for multi-tenant isolation
- [ ] Execution is logged to `module_executions` table
- [ ] Error messages are clear and actionable
- [ ] Response format matches expected schema
- [ ] Agent is registered in `MODULE_REGISTRY`
- [ ] Agent metadata is in database
- [ ] API endpoint returns expected results
- [ ] Frontend can display agent results

---

## 🔐 Security Requirements

Every agent MUST:

1. **Validate org_id**: Always filter database queries by `org_id`
2. **Sanitize inputs**: Never trust user input directly
3. **Handle secrets**: Use environment variables for API keys
4. **Log executions**: Track all agent runs for auditing
5. **Error handling**: Never expose sensitive error details to frontend

---

## 📈 Performance Best Practices

1. **Database Connections**: Reuse connections, don't create new ones per request
2. **External API Calls**: Implement retry logic and timeout handling
3. **Large Data Sets**: Use pagination and streaming when possible
4. **Caching**: Cache frequently accessed data (e.g., enrichment lookups)
5. **Async Operations**: Use `async/await` for non-blocking operations

---

## 🎯 Quick Reference: Agent File Locations

```
python-agents/
├── agents/
│   ├── base_agent.py          # Base class (inherit from this)
│   ├── nlp_agent.py           # Example: NLP processing
│   ├── data_agent.py          # Example: Data transformation
│   └── your_agent.py          # Your new agent
├── main.py                     # FastAPI server (register here)
└── requirements.txt            # Add dependencies here

server/
├── python-agent-client.ts      # Node.js ↔ Python communication
├── routes.ts                   # Add API endpoints here
└── seed-agents.ts              # Agent metadata

client/src/
├── pages/
│   ├── agent-shop.tsx         # Browse & activate agents (TO BUILD)
│   ├── modules.tsx            # Active agents dashboard (TO ENHANCE)
│   └── agents.tsx             # Current basic agent list
└── components/
    └── agent-displays/         # Agent-specific UI components (TO BUILD)
```

---

## 🚀 Next Steps

1. **Build Agent Shop** - Allow users to browse and activate agents
2. **Enhance Modules Page** - Show active agents with real-time status
3. **Create Display Components** - Agent-specific result visualization
4. **Add Testing UI** - In-app agent testing with sample data
5. **Implement Agent Marketplace** - Public/private agent sharing

---

**Last Updated**: 2024
**Version**: 1.0
