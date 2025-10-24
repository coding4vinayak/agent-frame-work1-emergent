
# Setup and Deployment Guide

Complete guide for setting up and deploying the Abetworks CRM platform.

## Local Development Setup

### Prerequisites

Ensure you have the following installed:
- Node.js 18 or higher
- npm (comes with Node.js)
- Git
- A Neon PostgreSQL database account (or any PostgreSQL provider)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd abetworks-crm
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages for both frontend and backend.

### Step 3: Database Setup

#### Create a Neon Database

1. Go to [Neon](https://neon.tech) and create a free account
2. Create a new project
3. Copy the connection string

#### Configure Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
JWT_SECRET=your_very_secure_random_string_here
NODE_ENV=development
```

**Important:** Never commit the `.env` file to version control!

#### Push Database Schema

```bash
npm run db:push
```

This will create all necessary tables in your database.

### Step 4: Start Development Server

```bash
npm run dev
```

The application will start on port 5000. You can access:
- Frontend: Via the Replit webview
- Backend API: `http://localhost:5000/api`

## Replit Setup

### Environment Variables

In Replit, use the Secrets tool to add:

1. `DATABASE_URL` - Your Neon PostgreSQL connection string
2. `JWT_SECRET` - A secure random string for JWT signing

### Database Initialization

Run in the Replit Shell:

```bash
npm run db:push
```

### Starting the Application

Click the "Run" button in Replit, which will execute:

```bash
npm run dev
```

## Production Deployment on Replit

### Step 1: Configure Secrets

Ensure all environment variables are set in Replit Secrets:
- `DATABASE_URL`
- `JWT_SECRET`

### Step 2: Database Migration

Ensure your production database schema is up to date:

```bash
npm run db:push
```

### Step 3: Deploy

1. Click the "Deploy" button in Replit
2. Configure your deployment settings
3. Set a custom domain if desired

### Deployment Configuration

The deployment is configured in `.replit`:

```toml
[deployment]
run = "npm run dev"
build = ""
ignorePorts = true
```

### Post-Deployment

After deployment:

1. Test all functionality
2. Create your first Super Admin account via signup
3. Configure integrations as needed
4. Invite team members

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

## Monitoring and Logging

### Application Logs

Monitor the Replit console for:
- Server startup messages
- API request logs
- Error messages
- Database connection status

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

### Frontend

- Code splitting is already configured via Vite
- Images should be optimized before upload
- Use React Query caching effectively

### Backend

- API responses are kept minimal
- Database queries use proper filtering
- Multi-tenant isolation is enforced at query level

## Security Checklist

Before going to production:

- [ ] All environment variables set in Replit Secrets
- [ ] Strong JWT secret (at least 32 random characters)
- [ ] Database uses SSL connections
- [ ] CORS configured properly (if needed)
- [ ] Rate limiting implemented (recommended)
- [ ] Input validation on all endpoints
- [ ] SQL injection protection via Drizzle ORM
- [ ] Password requirements enforced

## Troubleshooting

### Database Connection Issues

**Problem:** Cannot connect to database

**Solutions:**
- Verify `DATABASE_URL` in Secrets
- Check Neon database is active
- Ensure SSL mode is required in connection string
- Verify network connectivity

### Authentication Issues

**Problem:** Users can't log in

**Solutions:**
- Check JWT_SECRET is set
- Verify user exists in database
- Check password hash matches
- Review browser console for errors

### Build Failures

**Problem:** Application won't start

**Solutions:**
- Run `npm install` to ensure dependencies are installed
- Check for TypeScript errors
- Verify all environment variables are set
- Review console logs for specific errors

### Port Issues

**Problem:** Port 5000 already in use

**Solutions:**
- Kill existing process on port 5000
- Restart the Repl
- Check for zombie processes

## Scaling Considerations

### Database

- Neon provides automatic scaling on paid plans
- Consider read replicas for heavy read workloads
- Monitor connection pool usage

### Application

- Replit deployments auto-scale based on traffic
- Consider caching layer (Redis) for high-traffic scenarios
- Use CDN for static assets if needed

### Multi-Region

For global deployments:
- Deploy database in region closest to users
- Consider multi-region deployment strategy
- Use CDN for static content delivery

## Maintenance Tasks

### Regular Tasks

- **Weekly:** Review application logs
- **Weekly:** Monitor database size and performance
- **Monthly:** Review and rotate API keys
- **Monthly:** Update dependencies
- **Quarterly:** Security audit
- **Quarterly:** Performance review

### Updates

To update dependencies:

```bash
npm update
npm audit fix
```

Test thoroughly after updates!

## Support and Resources

- **Replit Docs:** https://docs.replit.com
- **Drizzle ORM:** https://orm.drizzle.team
- **React Query:** https://tanstack.com/query
- **Shadcn UI:** https://ui.shadcn.com

---

For additional help, refer to the main [README.md](../README.md) or contact the development team.
