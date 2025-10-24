
# API Documentation

Complete API reference for the Abetworks Modular AI Automation Platform.

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
    "description": "Process customer feedback with NLP",
    "status": "completed",
    "result": "Sentiment analysis completed",
    "userId": 1,
    "orgId": 1,
    "createdAt": "2024-01-15T09:00:00Z",
    "completedAt": "2024-01-15T09:15:00Z"
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
  "description": "Analyze sales data for Q4",
  "agentId": 1
}
```

**Success Response (201):**
```json
{
  "id": 3,
  "agentId": 1,
  "description": "Analyze sales data for Q4",
  "status": "pending",
  "result": null,
  "userId": 1,
  "orgId": 1,
  "createdAt": "2024-01-15T10:30:00Z",
  "completedAt": null
}
```

---

### Python Agent Module Endpoints

#### POST /api/modules/:id/execute

Execute a Python agent module.

**Authentication Required:** Yes

**URL Parameters:**
- `id`: Module ID (e.g., `nlp_processor`, `data_processor`)

**Request Body:**
```json
{
  "inputData": {
    "text": "This is sample text to process",
    "task": "summarize"
  },
  "taskId": "task_123"
}
```

**Success Response (200):**
```json
{
  "execution_id": "exec_abc123",
  "status": "success",
  "output": {
    "result": "Processed summary of the text...",
    "task_type": "summarize",
    "model": "gpt-4",
    "tokens_used": 150
  },
  "duration": 1250
}
```

**Error Response (500):**
```json
{
  "execution_id": "",
  "status": "failed",
  "error": "OpenAI API error: Rate limit exceeded",
  "duration": 500
}
```

---

#### GET /api/modules/health

Check Python agent service health status.

**Authentication Required:** Yes

**Success Response (200):**
```json
{
  "status": "healthy",
  "service": "python-agents",
  "modules": ["nlp_processor", "data_processor"]
}
```

**Error Response (500):**
```json
{
  "status": "unhealthy",
  "service": "python-agents",
  "error": "Connection refused"
}
```

---

#### GET /api/modules/available

List all available Python agent modules.

**Authentication Required:** Yes

**Success Response (200):**
```json
{
  "modules": [
    {
      "id": "nlp_processor",
      "name": "NLPAgent"
    },
    {
      "id": "data_processor",
      "name": "DataAgent"
    }
  ]
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
  "workflowsActive": 8,
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
    { "date": "2024-01-02", "count": 8 }
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
  "name": "Python Agent API Key"
}
```

**Success Response (201):**
```json
{
  "id": 2,
  "orgId": 1,
  "name": "Python Agent API Key",
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

## Python Agent Module API

The Python agent service runs on port 8000 and provides the following endpoints:

### POST /execute

Execute a Python agent module directly (internal use).

**Headers:**
- `X-API-Key`: API key for authentication

**Request Body:**
```json
{
  "module_id": "nlp_processor",
  "org_id": "org_123",
  "task_id": "task_456",
  "input_data": {
    "text": "Sample text",
    "task": "summarize"
  }
}
```

**Response:**
```json
{
  "execution_id": "exec_789",
  "status": "success",
  "output": { /* module-specific output */ },
  "duration": 1250
}
```

---

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "service": "python-agents",
  "modules": ["nlp_processor", "data_processor"]
}
```

---

### GET /modules

List available modules (requires API key).

**Headers:**
- `X-API-Key`: API key for authentication

**Response:**
```json
{
  "modules": [
    { "id": "nlp_processor", "name": "NLPAgent" },
    { "id": "data_processor", "name": "DataAgent" }
  ]
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. This should be added in production.

## Versioning

API Version: 2.0 (AI Automation Platform)  
No versioning strategy currently implemented.
