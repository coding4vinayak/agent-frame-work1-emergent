
# Abetworks CRM - Multi-Tenant Sales Automation Platform

A production-ready, multi-tenant CRM and sales automation platform built with modern web technologies. The system provides comprehensive user management, task tracking, reporting, and agent placeholders for future AI integration.

## 🚀 Features

### Core Functionality
- ✅ **Multi-tenant Architecture** - Complete data isolation between organizations
- ✅ **User Management** - Role-based access control (Member, Admin, Super Admin)
- ✅ **Task Management** - Create, track, and manage tasks with status workflows
- ✅ **Dashboard Analytics** - Real-time metrics and reporting with interactive charts
- ✅ **API Key Management** - Generate and manage API keys for integrations
- ✅ **Agent System** - Placeholder infrastructure for AI agent integration
- ✅ **Secure Authentication** - JWT-based authentication with database verification

### Security Features
- Password hashing with bcrypt
- JWT token authentication
- Multi-tenant data isolation
- Role-based access control
- Secure API key generation

## 🛠 Tech Stack

### Frontend
- **React 18+** with TypeScript
- **Tailwind CSS** for styling
- **Shadcn UI** component library
- **Recharts** for data visualization
- **React Query** (TanStack Query) for data fetching
- **Wouter** for routing

### Backend
- **Node.js** + Express
- **PostgreSQL** (Neon serverless)
- **Drizzle ORM**
- **JWT** authentication
- **bcrypt** for password hashing

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database (Neon serverless recommended)
- npm or yarn package manager

## 🚀 Quick Start

### 1. Installation

```bash
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_secure_jwt_secret
NODE_ENV=development
```

### 3. Database Setup

Push the database schema:

```bash
npm run db:push
```

For force migration:

```bash
npm run db:push --force
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at the URL shown in the Replit webview.

## 📁 Project Structure

```
abetworks-crm/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # UI components (Shadcn)
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and configurations
│   │   └── App.tsx        # Main application component
│   └── index.html
├── server/                # Backend Express application
│   ├── middleware/        # Authentication middleware
│   ├── db.ts             # Database connection
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Database operations
│   └── index.ts          # Server entry point
├── shared/
│   └── schema.ts         # Shared TypeScript types
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
| **Admin** | All Member permissions + manage users, manage API keys, manage integrations |
| **Super Admin** | All Admin permissions + full organization control |

## 📊 Database Schema

### Users
- `id`: Unique identifier
- `name`: User's full name
- `email`: Login email (unique per organization)
- `password`: Hashed password
- `role`: User role (member, admin, super_admin)
- `orgId`: Organization identifier
- `lastLogin`: Last login timestamp
- `createdAt`: Account creation timestamp

### Organizations
- `id`: Unique identifier
- `name`: Organization name
- `logo`: Organization logo URL
- `plan`: Subscription plan
- `createdAt`: Organization creation timestamp

### Tasks
- `id`: Unique identifier
- `agentId`: Associated agent (nullable)
- `description`: Task description
- `status`: Task status (pending, running, completed, failed)
- `result`: Task result (nullable)
- `userId`: Creator user ID
- `orgId`: Organization ID
- `createdAt`: Task creation timestamp
- `completedAt`: Task completion timestamp (nullable)

### Agents
- `id`: Unique identifier
- `name`: Agent name
- `type`: Agent type (sales, support, analytics)
- `description`: Agent description
- `status`: Agent status (active, inactive)
- `orgId`: Organization ID
- `createdAt`: Agent creation timestamp

### API Keys
- `id`: Unique identifier
- `orgId`: Organization ID
- `name`: Key name/description
- `key`: Generated API key
- `createdAt`: Key creation timestamp
- `lastUsed`: Last usage timestamp (nullable)

## 🔌 API Endpoints

### Authentication

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "role": "admin",
    "orgId": 1
  }
}
```

#### Signup
```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123",
  "organizationName": "Acme Corp"
}
```

### Users

#### Get All Users
```http
GET /api/users
Authorization: Bearer {token}
```

#### Invite User (Admin only)
```http
POST /api/users/invite
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "role": "member"
}
```

#### Delete User (Admin only)
```http
DELETE /api/users/:id
Authorization: Bearer {token}
```

### Tasks

#### Get All Tasks
```http
GET /api/tasks
Authorization: Bearer {token}
```

#### Create Task
```http
POST /api/tasks
Authorization: Bearer {token}
Content-Type: application/json

{
  "description": "Follow up with lead",
  "agentId": 1
}
```

### Metrics

#### Dashboard Metrics
```http
GET /api/metrics/dashboard
Authorization: Bearer {token}
```

**Response:**
```json
{
  "activeUsers": 5,
  "tasksDone": 42,
  "leadsGenerated": 87,
  "tasksPending": 12
}
```

#### Reports
```http
GET /api/metrics/reports
Authorization: Bearer {token}
```

### Agents

#### Get All Agents
```http
GET /api/agents
Authorization: Bearer {token}
```

#### Run Agent
```http
POST /api/agents/:id/run
Authorization: Bearer {token}
```

### API Keys (Admin only)

#### Get All API Keys
```http
GET /api/api-keys
Authorization: Bearer {token}
```

#### Generate API Key
```http
POST /api/api-keys
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Production API Key"
}
```

#### Delete API Key
```http
DELETE /api/api-keys/:id
Authorization: Bearer {token}
```

## 🎨 Design System

The application follows a professional Linear/Notion-inspired design system. Key principles:

- **Clean, minimal interface** with data-dense layouts
- **Consistent spacing** using Tailwind units (2, 3, 4, 6, 8, 12, 16)
- **Typography hierarchy** with Inter font family
- **Blue accent color** scheme
- **Responsive design** for mobile, tablet, and desktop

See [design_guidelines.md](./design_guidelines.md) for complete design specifications.

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit `.env` files. Use Replit Secrets for sensitive data.
2. **JWT Tokens**: Tokens are verified against the database on every request.
3. **Password Hashing**: All passwords are hashed with bcrypt before storage.
4. **Multi-tenant Isolation**: All queries are scoped to the user's organization.
5. **Role-based Access**: Middleware enforces role requirements on protected routes.

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio (database GUI)

### Adding New Features

1. **Database Changes**: Update `shared/schema.ts` and run `npm run db:push`
2. **Backend Routes**: Add endpoints in `server/routes.ts`
3. **Frontend Pages**: Create new pages in `client/src/pages/`
4. **UI Components**: Use Shadcn components from `client/src/components/ui/`

## 📦 Deployment

The application is configured for deployment on Replit:

1. Ensure all environment variables are set in Replit Secrets
2. Database should be accessible from production
3. Click the "Deploy" button in Replit
4. Configure custom domain if needed

## 🤝 Contributing

1. Follow the existing code structure
2. Maintain multi-tenant isolation in all new features
3. Add proper TypeScript types
4. Follow the design system guidelines
5. Test with multiple organizations and user roles

## 📝 License

Proprietary - Abetworks CRM

## 🆘 Support

For issues, questions, or feature requests:
- Check existing documentation in `replit.md` and `design_guidelines.md`
- Review API endpoints and examples above
- Contact the development team

---

**Version:** 1.0.0  
**Last Updated:** 2024
