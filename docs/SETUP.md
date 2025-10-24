
# Setup and Deployment Guide

Complete guide for setting up and deploying the Abetworks Modular AI Automation Platform.

## Local Development Setup

### Prerequisites

Ensure you have the following installed:
- Node.js 18 or higher
- Python 3.11 or higher
- npm (comes with Node.js)
- pip (comes with Python)
- Git
- A Neon PostgreSQL database account (or any PostgreSQL provider)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd abetworks
```

### Step 2: Install Dependencies

**Node.js Dependencies:**
```bash
npm install
```

**Python Dependencies:**
```bash
cd python-agents
pip install -r requirements.txt
cd ..
```

This will install all required packages for both the Node.js API and Python agent runtime.

### Step 3: Database Setup

#### Create a Neon Database

1. Go to [Neon](https://neon.tech) and create a free account
2. Create a new project
3. Copy the connection string

#### Configure Environment Variables

**Root `.env` file (Node.js):**
```env
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
JWT_SECRET=your_very_secure_random_string_here
NODE_ENV=development
PYTHON_AGENT_URL=http://0.0.0.0:8000
PYTHON_API_KEY=your_secure_api_key_here
```

**Python `.env` file (`python-agents/.env`):**
```env
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
NODE_API_URL=http://0.0.0.0:5000
PYTHON_API_KEY=your_secure_api_key_here
OPENAI_API_KEY=sk-your-openai-api-key
```

**Important:** 
- Never commit `.env` files to version control!
- Use the same `PYTHON_API_KEY` in both files
- Use the same `DATABASE_URL` in both files

#### Push Database Schema

```bash
npm run db:push
```

This will create all necessary tables including:
- Users, Organizations, Tasks (core tables)
- Modules, ModuleExecutions (AI agent tables)
- API Keys, Logs, Integrations

### Step 4: Start Development Servers

You need to run both services simultaneously.

**Terminal 1 - Node.js API:**
```bash
npm run dev
```

**Terminal 2 - Python Agent Runtime:**
```bash
cd python-agents
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The application will start:
- Node.js API: Port 5000
- Python Agents: Port 8000
- Frontend: Via the Replit webview

## Replit Setup

### Environment Variables

In Replit, use the Secrets tool to add:

**Node.js Secrets:**
1. `DATABASE_URL` - Your Neon PostgreSQL connection string
2. `JWT_SECRET` - A secure random string for JWT signing
3. `PYTHON_AGENT_URL` - `http://0.0.0.0:8000`
4. `PYTHON_API_KEY` - Secure API key for Python agent auth
5. `OPENAI_API_KEY` - Your OpenAI API key (optional, for NLP agent)

### Database Initialization

Run in the Replit Shell:

```bash
npm run db:push
```

### Starting Both Services

**Option 1: Two Terminals (Recommended for Development)**

Terminal 1:
```bash
npm run dev
```

Terminal 2:
```bash
cd python-agents
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Option 2: Single Command (Production)**

```bash
npm run start & cd python-agents && uvicorn main:app --host 0.0.0.0 --port 8000
```

## Production Deployment on Replit

### Step 1: Configure Secrets

Ensure all environment variables are set in Replit Secrets:
- `DATABASE_URL`
- `JWT_SECRET`
- `PYTHON_AGENT_URL`
- `PYTHON_API_KEY`
- `OPENAI_API_KEY` (if using AI features)

### Step 2: Database Migration

Ensure your production database schema is up to date:

```bash
npm run db:push
```

### Step 3: Create API Key

After the application starts:
1. Sign up as a Super Admin
2. Go to Settings → API Keys
3. Generate a new API key
4. This key will be used by the Node.js backend to communicate with Python agents

### Step 4: Deploy

1. Click the "Deploy" button in Replit
2. Configure your deployment settings
3. Set a custom domain if desired

### Deployment Configuration

Update `.replit` for dual-service deployment if needed.

### Post-Deployment

After deployment:

1. Test all functionality
2. Create your first Super Admin account via signup
3. Generate API key in Settings
4. Test Python agent execution
5. Invite team members

## Database Management

### Viewing Database

Use Drizzle Studio to view and edit database contents:

```bash
npm run db:studio
```

### Backup Strategy

For production:

1. **Neon Backups**: Neon provides automatic backups on paid plans
2. **Manual Exports**: Use PostgreSQL dump tools for manual backups
3. **Scheduled Backups**: Set up automated backup scripts

### Migration Strategy

When updating the schema:

1. Update `shared/schema.ts`
2. Test locally first
3. Run `npm run db:push` in development
4. Verify changes in Drizzle Studio
5. Deploy to production
6. Run `npm run db:push` in production

## Python Agent Configuration

### Adding New Agents

1. Create a new file in `python-agents/agents/`:
```python
from .base_agent import BaseAgent
from typing import Dict, Any

class MyCustomAgent(BaseAgent):
    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        # Your implementation
        return {
            "status": "success",
            "output": { /* your results */ }
        }
```

2. Register in `python-agents/main.py`:
```python
from agents.my_custom_agent import MyCustomAgent

MODULE_REGISTRY = {
    "nlp_processor": NLPAgent,
    "data_processor": DataAgent,
    "my_custom_agent": MyCustomAgent,  # Add here
}
```

3. Restart the Python service

### Testing Agents

Test individual agents:
```bash
cd python-agents
python -m pytest tests/
```

### Agent Health Monitoring

Check agent health via API:
```bash
curl http://0.0.0.0:8000/health
```

Or through the Node.js API:
```bash
curl http://0.0.0.0:5000/api/modules/health \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Monitoring and Logging

### Application Logs

Monitor the Replit console for:
- Server startup messages
- API request logs
- Error messages
- Database connection status
- Python agent execution logs

### Python Agent Logs

Python agent logs appear in Terminal 2:
- Module execution status
- OpenAI API calls
- Database queries
- Error traces

### Error Tracking

Consider adding error tracking service integration:
- Sentry (recommended)
- LogRocket
- Rollbar

## Performance Optimization

### Database

- Ensure proper indexes on frequently queried columns
- Use connection pooling (configured in Drizzle)
- Monitor query performance
- Filter by `org_id` in all queries

### Frontend

- Code splitting is already configured via Vite
- Images should be optimized before upload
- Use React Query caching effectively

### Backend

- API responses are kept minimal
- Database queries use proper filtering
- Multi-tenant isolation is enforced at query level

### Python Agents

- Use connection pooling for database
- Cache OpenAI responses when appropriate
- Implement timeout handling
- Log execution duration

## Security Checklist

Before going to production:

- [ ] All environment variables set in Replit Secrets
- [ ] Strong JWT secret (at least 32 random characters)
- [ ] Secure PYTHON_API_KEY generated
- [ ] Database uses SSL connections
- [ ] CORS configured properly (if needed)
- [ ] Rate limiting implemented (recommended)
- [ ] Input validation on all endpoints
- [ ] SQL injection protection via Drizzle ORM
- [ ] Python agent `org_id` validation enforced
- [ ] API key authentication between services
- [ ] Password requirements enforced

## Troubleshooting

### Database Connection Issues

**Problem:** Cannot connect to database

**Solutions:**
- Verify `DATABASE_URL` in Secrets
- Check Neon database is active
- Ensure SSL mode is required in connection string
- Verify network connectivity
- Check both Node.js and Python have same `DATABASE_URL`

### Python Agent Connection Issues

**Problem:** Node.js cannot connect to Python agents

**Solutions:**
- Verify Python service is running on port 8000
- Check `PYTHON_AGENT_URL` is set to `http://0.0.0.0:8000`
- Verify `PYTHON_API_KEY` matches in both services
- Check firewall/port settings
- Review Python service logs

### Authentication Issues

**Problem:** Users can't log in or API key errors

**Solutions:**
- Check JWT_SECRET is set
- Verify user exists in database
- Check password hash matches
- Review browser console for errors
- Verify API key is generated in Settings

### Module Execution Failures

**Problem:** Python agent modules fail to execute

**Solutions:**
- Check OpenAI API key is valid (for NLP agent)
- Verify `org_id` isolation is working
- Review Python agent logs for errors
- Check input data format
- Verify module is registered in MODULE_REGISTRY

### Build Failures

**Problem:** Application won't start

**Solutions:**
- Run `npm install` to ensure dependencies are installed
- Run `pip install -r requirements.txt` for Python
- Check for TypeScript errors
- Verify all environment variables are set
- Review console logs for specific errors

### Port Issues

**Problem:** Port 5000 or 8000 already in use

**Solutions:**
- Kill existing process on ports
- Restart the Repl
- Check for zombie processes
- Use `lsof -i :5000` or `lsof -i :8000`

## Scaling Considerations

### Database

- Neon provides automatic scaling on paid plans
- Consider read replicas for heavy read workloads
- Monitor connection pool usage

### Application

- Replit deployments auto-scale based on traffic
- Consider caching layer (Redis) for high-traffic scenarios
- Use CDN for static assets if needed

### Python Agents

- Scale Python service independently
- Consider message queue for async processing
- Implement rate limiting on OpenAI calls
- Cache frequently used results

## Maintenance Tasks

### Regular Tasks

- **Weekly:** Review application and agent logs
- **Weekly:** Monitor database size and performance
- **Monthly:** Review and rotate API keys
- **Monthly:** Update dependencies
- **Quarterly:** Security audit
- **Quarterly:** Performance review

### Updates

To update dependencies:

**Node.js:**
```bash
npm update
npm audit fix
```

**Python:**
```bash
cd python-agents
pip install --upgrade -r requirements.txt
```

Test thoroughly after updates!

## Support and Resources

- **Replit Docs:** https://docs.replit.com
- **Drizzle ORM:** https://orm.drizzle.team
- **FastAPI:** https://fastapi.tiangolo.com
- **React Query:** https://tanstack.com/query
- **Shadcn UI:** https://ui.shadcn.com
- **OpenAI API:** https://platform.openai.com/docs

---

For additional help, refer to:
- Main [README.md](../README.md)
- [COMPLETE_AI_PLATFORM_GUIDE.md](../COMPLETE_AI_PLATFORM_GUIDE.md)
- [DEPLOYMENT.md](../DEPLOYMENT.md)
- Contact the development team
