# Abetworks - Modular AI Automation Platform

A production-ready, modular AI automation platform built for intelligent workflow orchestration. The system provides comprehensive user management, task tracking, reporting, and a powerful Python-based agent system for AI/ML workloads.

## 🚀 Features

### Core Functionality
- ✅ **Multi-tenant Architecture** - Complete data isolation between organizations
- ✅ **User Management** - Role-based access control (Member, Admin, Super Admin)
- ✅ **Task Management** - Create, track, and manage automation workflows
- ✅ **Dashboard Analytics** - Real-time metrics and reporting with interactive charts
- ✅ **API Key Management** - Generate and manage API keys for integrations
- ✅ **Modular Agent System** - Python-based AI agents with dynamic module loading
- ✅ **Workflow Orchestration** - Chain multiple agents for complex automation
- ✅ **Secure Authentication** - JWT-based authentication with database verification

### AI Automation Features
- Python microservices for AI/ML processing
- Modular agent architecture (NLP, data processing, ML models)
- Real-time execution tracking
- Agent execution history and analytics
- Custom module configuration
- Agent testing interface
- Live agent settings management

### Security Features
- Password hashing with bcrypt
- JWT token authentication
- Multi-tenant data isolation
- Role-based access control
- Secure API key generation
- Python ↔ Node.js authentication

## 🛠 Tech Stack

### Frontend
- **React 18+** with TypeScript
- **Tailwind CSS** for styling
- **Shadcn UI** component library
- **Recharts** for data visualization
- **React Query** (TanStack Query) for data fetching
- **Wouter** for routing

### Backend API (Node.js)
- **Node.js** + Express + TypeScript
- **PostgreSQL** (Neon serverless)
- **Drizzle ORM**
- **JWT** authentication
- **bcrypt** for password hashing

### Agent Runtime (Python)
- **Python 3.11+**
- **FastAPI** for REST endpoints
- **psycopg2** for database access
- **OpenAI** and **LangChain** for AI capabilities
- **Pandas** and **NumPy** for data processing

## 📋 Prerequisites

- Node.js 18+ 
- Python 3.11+
- PostgreSQL database (Neon serverless recommended)
- npm or yarn package manager

## 🚀 Quick Start

### 1. Installation

```bash
npm install
cd python-agents
pip install -r requirements.txt
cd ..
```

### 2. Environment Setup

**Create a `.env` file in the root directory:**

```env
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
JWT_SECRET=your_secure_jwt_secret_minimum_32_characters
NODE_ENV=development
PYTHON_AGENT_URL=http://0.0.0.0:8000
PYTHON_API_KEY=your_secure_api_key
```

**Create a `.env` file in the `python-agents` directory:**

```env
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
NODE_API_URL=http://0.0.0.0:5000
PYTHON_API_KEY=your_secure_api_key
OPENAI_API_KEY=sk-your-openai-api-key
```

**Important:** Use the same `DATABASE_URL` and `PYTHON_API_KEY` in both files.

### 3. Database Setup

Push the database schema:

```bash
npm run db:push
```

For force migration:

```bash
npm run db:push --force
```

### 4. Start Development Servers

**Terminal 1 - Node.js API:**
```bash
npm run dev
```

**Terminal 2 - Python Agents:**
```bash
cd python-agents
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The application will be available at the URL shown in the Replit webview.

## 📁 Project Structure

```
abetworks/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # UI components (Shadcn)
│   │   │   ├── agent-displays/  # Agent-specific visualizations
│   │   │   ├── ui/              # Shadcn UI components
│   │   │   ├── agent-config-modal.tsx
│   │   │   ├── agent-status.tsx
│   │   │   ├── agent-test-interface.tsx
│   │   │   └── app-sidebar.tsx
│   │   ├── pages/         # Application pages
│   │   │   ├── dashboard.tsx
│   │   │   ├── modules.tsx         # Active modules dashboard
│   │   │   ├── execution-history.tsx
│   │   │   ├── agent-shop.tsx
│   │   │   ├── agents.tsx
│   │   │   ├── tasks.tsx
│   │   │   ├── users.tsx
│   │   │   ├── reports.tsx
│   │   │   └── settings.tsx
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and configurations
│   │   └── App.tsx        # Main application component
│   └── index.html
├── server/                # Backend Express application
│   ├── middleware/        # Authentication middleware
│   ├── db.ts             # Database connection
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Database operations
│   ├── python-agent-client.ts  # Python agent communication
│   └── index.ts          # Server entry point
├── python-agents/         # Python AI agent runtime
│   ├── agents/           # Agent implementations
│   │   ├── base_agent.py # Abstract base class
│   │   ├── nlp_agent.py  # NLP processing agent
│   │   └── data_agent.py # Data transformation agent
│   ├── main.py           # FastAPI server
│   ├── .env              # Python environment variables
│   └── requirements.txt  # Python dependencies
├── shared/
│   └── schema.ts         # Shared TypeScript types & DB schema
├── docs/                 # Documentation
│   ├── API.md
│   ├── SETUP.md
│   ├── AGENT_DEVELOPMENT.md
│   └── REMAINING_TASKS.md
└── design_guidelines.md  # UI/UX design system
```

## 🔐 Authentication

### Login
Users can log in with email and password. JWT tokens are stored in localStorage and sent via Authorization header on protected requests.

### Signup
New users can create accounts, which automatically creates a new organization. The user becomes a Super Admin of their organization.

### Password Reset
Password reset workflow is implemented with email placeholder functionality.

## 👥 User Roles

| Role | Permissions |
|------|-------------|
| **Member** | View tasks, create tasks, view reports |
| **Admin** | All Member permissions + manage users, manage API keys, manage modules |
| **Super Admin** | All Admin permissions + full organization control |

## 📊 Database Schema

### Core Tables
- **Users**: User accounts with role-based access
- **Organizations**: Multi-tenant organization data
- **Tasks**: Automation workflow tasks
- **Modules**: Python agent module registry
- **ModuleExecutions**: Agent execution history and results
- **Agents**: Agent configurations (legacy)
- **ApiKeys**: API authentication keys
- **Logs**: Activity and execution logs

### AI Agent Tables
- **Modules**: Tracks available Python agent modules
  - id, name, category, pythonModule, endpoint, config, status, orgId
- **ModuleExecutions**: Execution history and analytics
  - id, moduleId, taskId, input, output, status, error, duration, startedAt, completedAt

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/reset-password` - Password reset

### Users
- `GET /api/users` - Get all users in organization
- `POST /api/users/invite` - Invite new user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

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

## 🤖 Python Agent System

### Agent Architecture

The platform uses a modular Python agent system where each agent inherits from `BaseAgent`:

```python
class NLPAgent(BaseAgent):
    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        # Agent implementation
        pass
```

### Available Agent Types

1. **NLP Agent** (`nlp_processor`): Natural language processing with OpenAI
2. **Data Agent** (`data_processor`): Data transformation with Pandas
3. **Custom Agents**: Extend `BaseAgent` to create your own

### Creating Custom Agents

1. Create a new file in `python-agents/agents/`
2. Inherit from `BaseAgent`
3. Implement the `execute()` method
4. Register in `MODULE_REGISTRY` in `main.py`

### Execution Flow

```
Frontend → Node.js API → Python FastAPI → Agent Module → Database
   ↓           ↓              ↓              ↓            ↓
Response ← JSON Result ← Execution Log ← Processing ← Multi-tenant Check
```

## 🎨 Design System

The application follows a professional Linear/Notion-inspired design system. Key principles:

- **Clean, minimal interface** with data-dense layouts
- **Consistent spacing** using Tailwind units (2, 3, 4, 6, 8, 12, 16)
- **Typography hierarchy** with Inter font family
- **Blue accent color** scheme
- **Responsive design** for mobile, tablet, and desktop
- **Professional data-dense layouts**

See [design_guidelines.md](./design_guidelines.md) for complete design specifications.

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit `.env` files. Use Replit Secrets for sensitive data.
2. **JWT Tokens**: Tokens are verified against the database on every request.
3. **Password Hashing**: All passwords are hashed with bcrypt before storage.
4. **Multi-tenant Isolation**: All queries are scoped to the user's organization.
5. **Role-based Access**: Middleware enforces role requirements on protected routes.
6. **Python Agent Security**: API key authentication for Node.js ↔ Python communication.
7. **Database Isolation**: All Python agent queries filter by `org_id`.

## 🧪 Development

### Available Scripts

- `npm run dev` - Start Node.js development server
- `npm run build` - Build for production
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio (database GUI)

### Python Agent Development

```bash
cd python-agents
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Adding New Features

1. **Database Changes**: Update `shared/schema.ts` and run `npm run db:push`
2. **Backend Routes**: Add endpoints in `server/routes.ts`
3. **Python Agents**: Create new agent in `python-agents/agents/`
4. **Frontend Pages**: Create new pages in `client/src/pages/`
5. **UI Components**: Use Shadcn components from `client/src/components/ui/`

## 📦 Deployment on Replit

### Step 1: Configure Secrets

In Replit Secrets, add the following environment variables:

**Required Secrets:**
1. `DATABASE_URL` - Your Neon PostgreSQL connection string
2. `JWT_SECRET` - A secure random string (minimum 32 characters)
3. `PYTHON_AGENT_URL` - `http://0.0.0.0:8000`
4. `PYTHON_API_KEY` - Secure API key for Python service auth
5. `OPENAI_API_KEY` - Your OpenAI API key (optional, for NLP agent)

**Generate secure keys:**
```bash
# Generate JWT secret
openssl rand -base64 32

# Generate API key
openssl rand -hex 32
```

### Step 2: Database Migration

Ensure your production database schema is up to date:

```bash
npm run db:push
```

### Step 3: Update Python .env

The Python agents also need the same `DATABASE_URL`:

1. Open `python-agents/.env`
2. Ensure `DATABASE_URL` matches the one in Replit Secrets
3. Ensure `PYTHON_API_KEY` matches the one in Replit Secrets

### Step 4: Deploy

1. Click the "Deploy" button in Replit
2. The application will run both Node.js and Python services
3. Configure custom domain if desired

### Post-Deployment Checklist

- [ ] All environment variables set in Replit Secrets
- [ ] Database schema pushed successfully
- [ ] Python agents `.env` file updated
- [ ] Both Node.js (port 5000) and Python (port 8000) services running
- [ ] Test login/signup functionality
- [ ] Test agent execution
- [ ] Verify multi-tenant isolation

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 🤝 Contributing

1. Follow the existing code structure
2. Maintain multi-tenant isolation in all new features
3. Add proper TypeScript types
4. Follow the design system guidelines
5. Test with multiple organizations and user roles
6. Ensure Python agents respect `org_id` isolation

## 📝 License

Proprietary - Abetworks

## 🆘 Support

For issues, questions, or feature requests:
- Check existing documentation in `docs/` directory
- Review API endpoints in `docs/API.md`
- See agent development guide in `docs/AGENT_DEVELOPMENT.md`
- See complete platform guide in `COMPLETE_AI_PLATFORM_GUIDE.md`
- Contact the development team

---

**Version:** 2.0.0 (AI Automation Platform)  
**Last Updated:** 2024