
# Abetworks - Modular AI Automation Platform

## Overview

A production-ready, modular AI automation platform built for intelligent workflow orchestration. The system provides comprehensive user management, task tracking, reporting, and a powerful Python-based agent system for AI/ML workloads with seamless Node.js integration.

## Tech Stack

### Frontend
- React 18+ with TypeScript
- Tailwind CSS for styling
- Shadcn UI component library
- Recharts for data visualization
- React Query (TanStack Query) for data fetching
- Wouter for routing

### Backend API (Node.js)
- Node.js + Express + TypeScript
- PostgreSQL (Neon serverless)
- Drizzle ORM
- JWT authentication
- bcrypt for password hashing

### Agent Runtime (Python)
- Python 3.11+ with FastAPI
- OpenAI and LangChain for AI
- Pandas and NumPy for data processing
- psycopg2 for database access
- Multi-tenant isolation enforcement

## Architecture

### System Design

The platform uses a dual-service architecture:

```
Frontend (React) → Node.js API Gateway → Python Agent Runtime
                         ↓                        ↓
                   PostgreSQL (Shared Database)
```

### Multi-Tenant Design
- Organization-based isolation with `orgId` enforced on all database queries
- Role-based access control (Member, Admin, Super Admin)
- Secure JWT authentication with database verification
- Complete data isolation between organizations
- Python agents validate `org_id` on every operation

### Security Features
- JWT tokens stored in localStorage with Authorization header injection
- All protected routes require authentication
- User verification from database on every request
- Multi-tenant isolation enforced at storage layer
- Password hashing with bcrypt
- Role-based access control middleware
- API key authentication for Python agent communication

## Database Schema

### Core Tables
- **Users**: id, name, email, password, role, org_id, last_login, created_at
- **Organizations**: id, name, logo, plan, created_at
- **Tasks**: id, agent_id, description, status, result, user_id, org_id, created_at, completed_at
- **Logs**: id, agent_id, user_id, org_id, message, response, timestamp
- **Integrations**: id, org_id, type, api_key, status, created_at
- **ApiKeys**: id, org_id, name, key, created_at, last_used
- **ResourceUsage**: id, org_id, user_id, api_calls, tasks_run, storage_used, timestamp

### AI Agent Tables
- **Modules**: id, name, category, python_module, endpoint, config, status, org_id, created_at
- **ModuleExecutions**: id, module_id, task_id, input, output, status, error, duration, started_at, completed_at, org_id

## Features

### Authentication
- ✅ Email/password login
- ✅ User signup with organization creation
- ✅ Password reset workflow (email placeholder)
- ✅ JWT-based session management

### Dashboard
- ✅ Overview metrics (Active Modules, Automations Completed, Workflows Active, Tasks Queued)
- ✅ Recent activity feed
- ✅ Quick action links
- ✅ Professional sidebar navigation

### User Management
- ✅ View all users in organization
- ✅ Invite new users (Admin/Super Admin only)
- ✅ Assign roles (Member, Admin, Super Admin)
- ✅ Remove users
- ✅ Search and filter users

### Task Management
- ✅ Create automation tasks
- ✅ View all tasks
- ✅ Filter by status (Pending, Running, Completed, Failed)
- ✅ Search tasks
- ✅ Task status tracking

### Python Agent System
- ✅ Modular agent architecture
- ✅ NLP processing with OpenAI
- ✅ Data transformation with Pandas
- ✅ Module execution tracking
- ✅ Real-time health monitoring
- ✅ Custom module configuration
- ✅ Execution history and analytics

### Reports & Metrics
- ✅ Dashboard overview with key metrics
- ✅ Tasks by status (bar chart)
- ✅ Tasks by user (bar chart)
- ✅ Tasks over time (line chart)
- ✅ Module execution analytics

### Settings
- ✅ Organization details
- ✅ API key management (generate, view, delete)
- ✅ Integration placeholders (Google, Email, WhatsApp)
- ✅ Admin-only access controls
- ✅ Python agent configuration

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/reset-password` - Password reset

### Users
- `GET /api/users` - Get all users in organization
- `POST /api/users/invite` - Invite new user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

### Organization
- `GET /api/organization` - Get organization details

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task

### Python Agent Modules
- `POST /api/modules/:id/execute` - Execute a Python agent module
- `GET /api/modules/health` - Check Python agent service health
- `GET /api/modules/available` - List available Python modules

### Metrics
- `GET /api/metrics/dashboard` - Dashboard statistics
- `GET /api/metrics/reports` - Detailed reports with charts

### API Keys
- `GET /api/api-keys` - Get all API keys (Admin only)
- `POST /api/api-keys` - Generate new API key (Admin only)
- `DELETE /api/api-keys/:id` - Delete API key (Admin only)

### Integrations
- `GET /api/integrations` - Get all integrations

## Python Agent System

### Agent Architecture

All Python agents inherit from `BaseAgent`:

```python
class BaseAgent(ABC):
    def __init__(self, org_id: str, config: Dict[str, Any] = None)
    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]
    async def validate_org_access(self, resource_id: str, table: str) -> bool
    async def log_execution(...)
```

### Available Modules

1. **NLP Agent** (`nlp_processor`):
   - Text summarization
   - Sentiment analysis
   - Information extraction
   - Powered by OpenAI GPT-4

2. **Data Agent** (`data_processor`):
   - Data transformation
   - Statistical analysis
   - Pandas-based processing

### Communication Protocol

Node.js ↔ Python communication uses REST API with API key authentication:

```typescript
// Node.js → Python
const client = new PythonAgentClient(apiKey);
const result = await client.executeModule(
  moduleId,
  orgId,
  inputData,
  taskId
);
```

### Multi-Tenant Security

Every Python agent operation:
1. Validates `org_id` from request
2. Filters all database queries by `org_id`
3. Logs execution to `module_executions` table
4. Returns results scoped to organization

## Design System

Follows professional Linear/Notion-inspired design:
- Clean, minimal interface with data-dense layouts
- Consistent spacing (2, 3, 4, 6, 8, 12, 16 units)
- Typography hierarchy (Inter font family)
- Blue accent color scheme
- Responsive design (mobile, tablet, desktop)

See [design_guidelines.md](./design_guidelines.md) for complete design specifications.

## Development

### Setup
```bash
# Install Node.js dependencies
npm install

# Install Python dependencies
cd python-agents
pip install -r requirements.txt
cd ..

# Push database schema
npm run db:push

# Start Node.js API (Terminal 1)
npm run dev

# Start Python agents (Terminal 2)
cd python-agents
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Environment Variables

**Node.js (.env)**:
```bash
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
PYTHON_AGENT_URL=http://0.0.0.0:8000
PYTHON_API_KEY=your-api-key
```

**Python (python-agents/.env)**:
```bash
DATABASE_URL=postgresql://...
NODE_API_URL=http://0.0.0.0:5000
PYTHON_API_KEY=your-api-key
OPENAI_API_KEY=sk-...
```

### Database Migrations
```bash
npm run db:push --force
```

## Recent Changes

**Latest Update**: Modular AI Automation Platform Implementation
- Complete Python agent runtime with FastAPI
- NLP and data processing modules
- Node.js ↔ Python communication layer
- Module execution tracking and analytics
- Multi-tenant isolation in Python agents
- Real-time health monitoring
- Modular agent architecture
- Execution history and reporting
- Rebranded from CRM to AI automation platform

## User Preferences

- Professional, clean UI design
- Multi-tenant architecture from the start
- Production-ready security
- Modular, scalable codebase
- Database persistence for all features
- Python agents for AI/ML workloads
- Real-time execution tracking
