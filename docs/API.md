
# API Documentation

Complete API reference for the Abetworks CRM platform.

## Base URL

```
Development: http://localhost:5000
Production: https://your-repl-url.repl.co
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer {your_jwt_token}
```

### Error Responses

All endpoints may return the following error responses:

| Status Code | Description |
|-------------|-------------|
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |

## Endpoints

### Authentication Endpoints

#### POST /api/auth/login

Authenticate a user and receive a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "role": "admin",
    "orgId": 1,
    "lastLogin": "2024-01-15T10:30:00Z",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

**Error Response (401):**
```json
{
  "message": "Invalid credentials"
}
```

---

#### POST /api/auth/signup

Create a new user account and organization.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "securepassword",
  "organizationName": "Acme Corp"
}
```

**Success Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "role": "super_admin",
    "orgId": 1,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Response (400):**
```json
{
  "message": "Email already exists"
}
```

---

#### POST /api/auth/reset-password

Request password reset (placeholder).

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**
```json
{
  "message": "Password reset email sent (placeholder)"
}
```

---

### User Endpoints

#### GET /api/users

Get all users in the authenticated user's organization.

**Authentication Required:** Yes

**Success Response (200):**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin",
    "orgId": 1,
    "lastLogin": "2024-01-15T10:30:00Z",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  {
    "id": 2,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "member",
    "orgId": 1,
    "lastLogin": "2024-01-14T15:20:00Z",
    "createdAt": "2024-01-02T00:00:00Z"
  }
]
```

---

#### POST /api/users/invite

Invite a new user to the organization (Admin/Super Admin only).

**Authentication Required:** Yes (Admin or Super Admin)

**Request Body:**
```json
{
  "name": "New User",
  "email": "newuser@example.com",
  "role": "member"
}
```

**Success Response (201):**
```json
{
  "id": 3,
  "name": "New User",
  "email": "newuser@example.com",
  "role": "member",
  "orgId": 1,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**Error Response (403):**
```json
{
  "message": "Admin access required"
}
```

---

#### DELETE /api/users/:id

Remove a user from the organization (Admin/Super Admin only).

**Authentication Required:** Yes (Admin or Super Admin)

**Success Response (200):**
```json
{
  "message": "User deleted successfully"
}
```

---

### Organization Endpoints

#### GET /api/organization

Get the authenticated user's organization details.

**Authentication Required:** Yes

**Success Response (200):**
```json
{
  "id": 1,
  "name": "Acme Corp",
  "logo": "https://example.com/logo.png",
  "plan": "professional",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

### Task Endpoints

#### GET /api/tasks

Get all tasks for the authenticated user's organization.

**Authentication Required:** Yes

**Query Parameters:**
- `status` (optional): Filter by status (pending, running, completed, failed)

**Success Response (200):**
```json
[
  {
    "id": 1,
    "agentId": 2,
    "description": "Follow up with lead from website",
    "status": "completed",
    "result": "Email sent successfully",
    "userId": 1,
    "orgId": 1,
    "createdAt": "2024-01-15T09:00:00Z",
    "completedAt": "2024-01-15T09:15:00Z"
  },
  {
    "id": 2,
    "agentId": 1,
    "description": "Analyze Q4 sales data",
    "status": "pending",
    "result": null,
    "userId": 2,
    "orgId": 1,
    "createdAt": "2024-01-15T10:00:00Z",
    "completedAt": null
  }
]
```

---

#### POST /api/tasks

Create a new task.

**Authentication Required:** Yes

**Request Body:**
```json
{
  "description": "Send follow-up email to prospect",
  "agentId": 1
}
```

**Success Response (201):**
```json
{
  "id": 3,
  "agentId": 1,
  "description": "Send follow-up email to prospect",
  "status": "pending",
  "result": null,
  "userId": 1,
  "orgId": 1,
  "createdAt": "2024-01-15T10:30:00Z",
  "completedAt": null
}
```

---

### Agent Endpoints

#### GET /api/agents

Get all agents for the authenticated user's organization.

**Authentication Required:** Yes

**Success Response (200):**
```json
[
  {
    "id": 1,
    "name": "Sales Assistant",
    "type": "sales",
    "description": "Automates follow-up emails and lead qualification",
    "status": "active",
    "orgId": 1,
    "createdAt": "2024-01-01T00:00:00Z"
  },
  {
    "id": 2,
    "name": "Support Bot",
    "type": "support",
    "description": "Handles customer support inquiries",
    "status": "active",
    "orgId": 1,
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

---

#### POST /api/agents/:id/run

Run an agent (placeholder functionality).

**Authentication Required:** Yes

**Success Response (200):**
```json
{
  "message": "Agent 'Sales Assistant' execution started (placeholder)"
}
```

---

### Metrics Endpoints

#### GET /api/metrics/dashboard

Get dashboard overview metrics.

**Authentication Required:** Yes

**Success Response (200):**
```json
{
  "activeUsers": 5,
  "tasksDone": 42,
  "leadsGenerated": 87,
  "tasksPending": 12
}
```

---

#### GET /api/metrics/reports

Get detailed reports with chart data.

**Authentication Required:** Yes

**Success Response (200):**
```json
{
  "tasksByStatus": [
    { "status": "Completed", "count": 42 },
    { "status": "Pending", "count": 12 },
    { "status": "Running", "count": 3 },
    { "status": "Failed", "count": 2 }
  ],
  "tasksByUser": [
    { "user": "John Doe", "count": 25 },
    { "user": "Jane Smith", "count": 20 }
  ],
  "tasksOverTime": [
    { "date": "2024-01-01", "count": 5 },
    { "date": "2024-01-02", "count": 8 },
    { "date": "2024-01-03", "count": 12 }
  ]
}
```

---

### API Key Endpoints

#### GET /api/api-keys

Get all API keys for the organization (Admin/Super Admin only).

**Authentication Required:** Yes (Admin or Super Admin)

**Success Response (200):**
```json
[
  {
    "id": 1,
    "orgId": 1,
    "name": "Production API Key",
    "key": "ak_1234567890abcdef",
    "createdAt": "2024-01-01T00:00:00Z",
    "lastUsed": "2024-01-15T10:00:00Z"
  }
]
```

---

#### POST /api/api-keys

Generate a new API key (Admin/Super Admin only).

**Authentication Required:** Yes (Admin or Super Admin)

**Request Body:**
```json
{
  "name": "Development API Key"
}
```

**Success Response (201):**
```json
{
  "id": 2,
  "orgId": 1,
  "name": "Development API Key",
  "key": "ak_abcdef1234567890",
  "createdAt": "2024-01-15T10:30:00Z",
  "lastUsed": null
}
```

---

#### DELETE /api/api-keys/:id

Delete an API key (Admin/Super Admin only).

**Authentication Required:** Yes (Admin or Super Admin)

**Success Response (200):**
```json
{
  "message": "API key deleted successfully"
}
```

---

### Integration Endpoints

#### GET /api/integrations

Get all integrations for the organization.

**Authentication Required:** Yes

**Success Response (200):**
```json
[
  {
    "id": 1,
    "orgId": 1,
    "type": "google",
    "apiKey": "encrypted_key",
    "status": "active",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

---

### Log Endpoints

#### GET /api/logs

Get activity logs for the organization.

**Authentication Required:** Yes

**Query Parameters:**
- `limit` (optional): Number of logs to return (default: 50)

**Success Response (200):**
```json
[
  {
    "id": 1,
    "agentId": 1,
    "userId": 1,
    "orgId": 1,
    "message": "Task completed successfully",
    "response": "Email sent to 5 recipients",
    "timestamp": "2024-01-15T10:30:00Z"
  }
]
```

---

## Rate Limiting

Currently no rate limiting is implemented. This should be added in production.

## Versioning

API Version: 1.0  
No versioning strategy currently implemented.
