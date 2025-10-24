# Abetworks CRM - Multi-Tenant Sales Automation Platform

## Overview

A production-ready, multi-tenant CRM and sales automation platform built with modern web technologies. The system provides comprehensive user management, task tracking, reporting, and agent placeholders for future AI integration.

## Tech Stack

### Frontend
- React 18+ with TypeScript
- Tailwind CSS for styling
- Shadcn UI component library
- Recharts for data visualization
- React Query (TanStack Query) for data fetching
- Wouter for routing

### Backend
- Node.js + Express
- PostgreSQL (Neon serverless)
- Drizzle ORM
- JWT authentication
- bcrypt for password hashing

## Architecture

### Multi-Tenant Design
- Organization-based isolation with `orgId` enforced on all database queries
- Role-based access control (Member, Admin, Super Admin)
- Secure JWT authentication with database verification
- Complete data isolation between organizations

### Security Features
- JWT tokens stored in localStorage with Authorization header injection
- All protected routes require authentication
- User verification from database on every request (not just token decoding)
- Multi-tenant isolation enforced at storage layer
- Password hashing with bcrypt
- Role-based access control middleware

## Database Schema

### Core Tables
- **Users**: id, name, email, password, role, org_id, last_login, created_at
- **Organizations**: id, name, logo, plan, created_at
- **Agents**: id, name, type, description, status, org_id, created_at (placeholder)
- **Tasks**: id, agent_id, description, status, result, user_id, org_id, created_at, completed_at
- **Logs**: id, agent_id, user_id, org_id, message, response, timestamp
- **Integrations**: id, org_id, type, api_key, status, created_at
- **ApiKeys**: id, org_id, name, key, created_at, last_used
- **ResourceUsage**: id, org_id, user_id, api_calls, tasks_run, storage_used, timestamp

## Features

### Authentication
- ✅ Email/password login
- ✅ User signup with organization creation
- ✅ Password reset workflow (email placeholder)
- ✅ JWT-based session management

### Dashboard
- ✅ Overview metrics (Active Users, Tasks Done, Leads Generated, Pending Tasks)
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
- ✅ Create tasks
- ✅ View all tasks
- ✅ Filter by status (Pending, Running, Completed, Failed)
- ✅ Search tasks
- ✅ Task status tracking

### Reports & Metrics
- ✅ Dashboard overview with key metrics
- ✅ Tasks by status (bar chart)
- ✅ Tasks by user (bar chart)
- ✅ Tasks over time (line chart)
- ✅ Resource usage tracking

### Settings
- ✅ Organization details
- ✅ API key management (generate, view, delete)
- ✅ Integration placeholders (Google, Email, WhatsApp)
- ✅ Admin-only access controls

### Agents (Placeholder)
- ✅ Agent list view
- ✅ Agent status display
- ✅ Run agent placeholder
- ✅ Ready for future AI module integration

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

### Metrics
- `GET /api/metrics/dashboard` - Dashboard statistics
- `GET /api/metrics/reports` - Detailed reports with charts

### Agents
- `GET /api/agents` - Get all agents
- `POST /api/agents/:id/run` - Run agent (placeholder)

### API Keys
- `GET /api/api-keys` - Get all API keys (Admin only)
- `POST /api/api-keys` - Generate new API key (Admin only)
- `DELETE /api/api-keys/:id` - Delete API key (Admin only)

### Integrations
- `GET /api/integrations` - Get all integrations

## Design System

Follows professional Linear/Notion-inspired design:
- Clean, minimal interface
- Consistent spacing (2, 3, 4, 6, 8, 12, 16 units)
- Typography hierarchy (Inter font family)
- Blue accent color scheme
- Responsive design (mobile, tablet, desktop)
- Professional data-dense layouts

## Development

### Setup
```bash
npm install
npm run db:push
npm run dev
```

### Database Migrations
```bash
npm run db:push --force
```

## Recent Changes

**Latest Update**: Multi-tenant CRM platform implementation
- Complete authentication system with JWT
- Multi-tenant architecture with organization isolation
- User management with role-based access control
- Task management with status tracking
- Reports and metrics with interactive charts
- Settings page with API key management
- Agent placeholder system for future AI integration
- Security hardening: Auth header injection, database user verification, multi-tenant isolation

## User Preferences

- Professional, clean UI design
- Multi-tenant architecture from the start
- Production-ready security
- Modular, scalable codebase
- Database persistence for all features
