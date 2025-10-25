
# Developer Guide: Adding Agents to Abetworks

## Overview

This guide explains how to add new AI agents to the Abetworks platform using code. It covers the complete process from creating the Python agent to registering it in the system.

---

## Quick Start: Adding a New Agent in 5 Steps

### Step 1: Create Python Agent Class

Create a new file in `python-agents/agents/` directory.

**Example: `python-agents/agents/email_agent.py`**

```python
from .base_agent import BaseAgent
from typing import Any, Dict
import os

class EmailAgent(BaseAgent):
    """
    Email automation agent for sending and processing emails
    """
    
    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute email automation task
        
        Args:
            input_data: Dict containing:
                - action: 'send' | 'validate' | 'template'
                - recipient: email address (for send)
                - subject: email subject (for send)
                - body: email body (for send)
                - template_id: template identifier (for template)
                
        Returns:
            Dict with success status and output data
        """
        try:
            action = input_data.get("action")
            
            if not action:
                return {
                    "success": False,
                    "error": "Action is required (send, validate, or template)"
                }
            
            if action == "send":
                return await self._send_email(input_data)
            elif action == "validate":
                return await self._validate_email(input_data)
            elif action == "template":
                return await self._generate_template(input_data)
            else:
                return {
                    "success": False,
                    "error": f"Unknown action: {action}"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def _send_email(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Send an email"""
        recipient = data.get("recipient")
        subject = data.get("subject")
        body = data.get("body")
        
        if not recipient or not subject or not body:
            return {
                "success": False,
                "error": "recipient, subject, and body are required"
            }
        
        # TODO: Implement actual email sending logic
        # For now, return success simulation
        
        return {
            "success": True,
            "output": {
                "message": f"Email sent to {recipient}",
                "recipient": recipient,
                "subject": subject,
                "sent_at": "2024-01-15T10:30:00Z"
            }
        }
    
    async def _validate_email(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate email address format"""
        email = data.get("email")
        
        if not email:
            return {
                "success": False,
                "error": "email is required"
            }
        
        # Basic email validation
        import re
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        is_valid = bool(re.match(pattern, email))
        
        return {
            "success": True,
            "output": {
                "email": email,
                "is_valid": is_valid,
                "validation_message": "Valid email format" if is_valid else "Invalid email format"
            }
        }
    
    async def _generate_template(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate email template"""
        template_id = data.get("template_id", "welcome")
        name = data.get("name", "User")
        
        templates = {
            "welcome": {
                "subject": f"Welcome to Abetworks, {name}!",
                "body": f"Hi {name},\n\nWelcome to Abetworks! We're excited to have you on board.\n\nBest regards,\nThe Abetworks Team"
            },
            "reminder": {
                "subject": f"Reminder: Task pending",
                "body": f"Hi {name},\n\nThis is a reminder about your pending task.\n\nBest regards,\nThe Abetworks Team"
            }
        }
        
        template = templates.get(template_id, templates["welcome"])
        
        return {
            "success": True,
            "output": {
                "template_id": template_id,
                "subject": template["subject"],
                "body": template["body"]
            }
        }
```

### Step 2: Register Agent in Python Service

Edit `python-agents/main.py` to import and register your agent:

```python
# Add import at the top
from agents.email_agent import EmailAgent

# Add to MODULE_REGISTRY
MODULE_REGISTRY = {
    "nlp_processor": NLPAgent,
    "data_processor": DataAgent,
    "email_agent": EmailAgent,  # Add this line
}
```

### Step 3: Register Agent via API

Use the registration endpoint to add the agent to the catalog:

```bash
curl -X POST http://0.0.0.0:5000/api/agents/register \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "email-automation",
    "name": "Email Automation",
    "type": "communication",
    "description": "Automate email sending, validation, and template generation",
    "longDescription": "Complete email automation solution with sending, validation, and template features. Perfect for marketing campaigns and customer communication.",
    "icon": "📧",
    "category": "communication",
    "backendEndpoint": "/api/agents/email-automation",
    "price": 0,
    "configSchema": {
      "smtpServer": {
        "type": "string",
        "required": false,
        "description": "SMTP server address"
      },
      "smtpPort": {
        "type": "number",
        "default": 587,
        "description": "SMTP port number"
      }
    }
  }'
```

### Step 4: Add Backend Endpoint (Optional)

If you need custom backend logic, add it to `server/routes.ts`:

```typescript
// Add this endpoint
app.post("/api/agents/email-automation", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { action, recipient, subject, body, email, template_id, name } = req.body;
    
    // Get organization's API key
    const apiKeys = await storage.getAllApiKeys(req.user!.orgId);
    if (!apiKeys.length) {
      return res.status(400).json({ 
        message: "No API key configured" 
      });
    }
    
    // Call Python agent
    const client = new PythonAgentClient(apiKeys[0].key);
    const result = await client.executeModule(
      "email_agent",
      req.user!.orgId,
      { action, recipient, subject, body, email, template_id, name }
    );
    
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ 
      message: error.message || "Email agent execution failed" 
    });
  }
});
```

### Step 5: Test Your Agent

**Via API:**
```bash
curl -X POST http://0.0.0.0:5000/api/modules/email_agent/execute \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "inputData": {
      "action": "send",
      "recipient": "user@example.com",
      "subject": "Test Email",
      "body": "This is a test email from Abetworks"
    }
  }'
```

**Via Frontend:**
1. Go to **Agent Marketplace** page
2. Find "Email Automation" agent
3. Click **Activate**
4. Test the agent through the UI

---

## Advanced Examples

### Example 1: Database-Connected Agent

```python
from .base_agent import BaseAgent
from typing import Any, Dict

class CustomerAgent(BaseAgent):
    """
    Customer data management agent with database access
    """
    
    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute customer management task
        """
        try:
            action = input_data.get("action")
            
            if action == "get_customers":
                return await self._get_customers()
            elif action == "add_customer":
                return await self._add_customer(input_data)
            else:
                return {
                    "success": False,
                    "error": f"Unknown action: {action}"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def _get_customers(self) -> Dict[str, Any]:
        """Get all customers for organization"""
        try:
            conn = self.connect_db()
            cursor = conn.cursor()
            
            # IMPORTANT: Always filter by org_id for multi-tenant isolation
            cursor.execute(
                """
                SELECT id, name, email, created_at 
                FROM customers 
                WHERE org_id = %s
                ORDER BY created_at DESC
                LIMIT 100
                """,
                (self.org_id,)
            )
            
            customers = []
            for row in cursor.fetchall():
                customers.append({
                    "id": row[0],
                    "name": row[1],
                    "email": row[2],
                    "created_at": row[3].isoformat()
                })
            
            cursor.close()
            
            return {
                "success": True,
                "output": {
                    "customers": customers,
                    "count": len(customers)
                }
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Database error: {str(e)}"
            }
    
    async def _add_customer(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Add new customer"""
        name = data.get("name")
        email = data.get("email")
        
        if not name or not email:
            return {
                "success": False,
                "error": "name and email are required"
            }
        
        try:
            conn = self.connect_db()
            cursor = conn.cursor()
            
            cursor.execute(
                """
                INSERT INTO customers (name, email, org_id)
                VALUES (%s, %s, %s)
                RETURNING id
                """,
                (name, email, self.org_id)
            )
            
            customer_id = cursor.fetchone()[0]
            conn.commit()
            cursor.close()
            
            return {
                "success": True,
                "output": {
                    "customer_id": customer_id,
                    "name": name,
                    "email": email
                }
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to add customer: {str(e)}"
            }
```

### Example 2: Agent with External API Integration

```python
from .base_agent import BaseAgent
from typing import Any, Dict
import os
import requests

class WeatherAgent(BaseAgent):
    """
    Weather information agent using external API
    """
    
    def __init__(self, org_id: str, config: Dict[str, Any] = None):
        super().__init__(org_id, config)
        self.api_key = os.getenv("WEATHER_API_KEY")
    
    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Get weather information for a location
        
        Args:
            input_data: Dict containing:
                - city: City name
                - country: Country code (optional)
        """
        try:
            city = input_data.get("city")
            
            if not city:
                return {
                    "success": False,
                    "error": "city is required"
                }
            
            if not self.api_key:
                return {
                    "success": False,
                    "error": "Weather API key not configured"
                }
            
            # Call external weather API
            country = input_data.get("country", "")
            location = f"{city},{country}" if country else city
            
            url = f"http://api.openweathermap.org/data/2.5/weather"
            params = {
                "q": location,
                "appid": self.api_key,
                "units": "metric"
            }
            
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                return {
                    "success": True,
                    "output": {
                        "city": data["name"],
                        "temperature": data["main"]["temp"],
                        "feels_like": data["main"]["feels_like"],
                        "humidity": data["main"]["humidity"],
                        "description": data["weather"][0]["description"],
                        "wind_speed": data["wind"]["speed"]
                    }
                }
            else:
                return {
                    "success": False,
                    "error": f"Weather API error: {response.status_code}"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
```

---

## Agent Configuration Schema

When registering agents, you can define a `configSchema` to allow users to customize agent behavior:

```json
{
  "configSchema": {
    "apiKey": {
      "type": "string",
      "required": true,
      "description": "API key for external service"
    },
    "maxRetries": {
      "type": "number",
      "default": 3,
      "min": 1,
      "max": 10,
      "description": "Maximum number of retry attempts"
    },
    "enableLogging": {
      "type": "boolean",
      "default": true,
      "description": "Enable detailed logging"
    },
    "region": {
      "type": "string",
      "enum": ["us-east", "us-west", "eu-central"],
      "default": "us-east",
      "description": "Service region"
    }
  }
}
```

---

## Best Practices

### 1. Multi-Tenant Isolation

**Always filter by `org_id` in database queries:**

```python
# CORRECT ✅
cursor.execute(
    "SELECT * FROM tasks WHERE org_id = %s AND status = %s",
    (self.org_id, status)
)

# WRONG ❌ - Missing org_id filter
cursor.execute(
    "SELECT * FROM tasks WHERE status = %s",
    (status,)
)
```

### 2. Error Handling

**Return structured error responses:**

```python
try:
    # Your logic here
    result = perform_operation()
    return {
        "success": True,
        "output": result
    }
except ValueError as e:
    return {
        "success": False,
        "error": f"Invalid input: {str(e)}"
    }
except Exception as e:
    return {
        "success": False,
        "error": f"Unexpected error: {str(e)}"
    }
```

### 3. Input Validation

**Validate all inputs before processing:**

```python
async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
    # Required fields
    required = ["field1", "field2"]
    missing = [f for f in required if f not in input_data]
    
    if missing:
        return {
            "success": False,
            "error": f"Missing required fields: {', '.join(missing)}"
        }
    
    # Type validation
    if not isinstance(input_data.get("count"), int):
        return {
            "success": False,
            "error": "count must be an integer"
        }
    
    # Process validated input
    # ...
```

### 4. Execution Logging

**Log all agent executions:**

```python
async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
    try:
        result = await self._process(input_data)
        
        # Log successful execution
        await self.log_execution(
            module_id="my_agent",
            task_id=input_data.get("task_id"),
            status="completed",
            output=result
        )
        
        return result
        
    except Exception as e:
        # Log failed execution
        await self.log_execution(
            module_id="my_agent",
            task_id=input_data.get("task_id"),
            status="failed",
            error=str(e)
        )
        
        return {
            "success": False,
            "error": str(e)
        }
```

---

## Testing Checklist

Before deploying your agent, verify:

- [ ] Agent executes successfully with valid input
- [ ] Agent handles missing/invalid input gracefully
- [ ] Agent respects `org_id` for multi-tenant isolation
- [ ] Execution is logged to database
- [ ] Error messages are clear and actionable
- [ ] Response format is consistent
- [ ] Agent is registered in `MODULE_REGISTRY`
- [ ] Agent metadata is in catalog
- [ ] External API calls have timeout handling
- [ ] Database connections are properly closed

---

## Troubleshooting

### Agent Not Found

**Problem:** `Module 'my_agent' not found`

**Solution:**
1. Check agent is imported in `python-agents/main.py`
2. Verify agent is in `MODULE_REGISTRY`
3. Restart Python service

### Database Connection Errors

**Problem:** `psycopg2.OperationalError: connection failed`

**Solution:**
1. Check `DATABASE_URL` in `python-agents/.env`
2. Verify database is accessible
3. Check connection string format

### Multi-Tenant Violations

**Problem:** User sees data from other organizations

**Solution:**
1. Add `org_id` filter to ALL database queries
2. Use `self.validate_org_access()` method
3. Test with multiple organizations

---

## File Locations Reference

```
python-agents/
├── agents/
│   ├── __init__.py
│   ├── base_agent.py        # Base class to inherit from
│   ├── your_agent.py        # Your new agent here
│   └── ...
├── main.py                   # Register agent in MODULE_REGISTRY
├── requirements.txt          # Add dependencies here
└── .env                      # Configuration

server/
├── routes.ts                 # Add custom endpoints here
└── python-agent-client.ts    # Node.js ↔ Python communication
```

---

## Next Steps

1. Create your agent class in `python-agents/agents/`
2. Register it in `python-agents/main.py`
3. Use the API to register agent metadata
4. Test via API or frontend
5. Deploy and monitor

For more information, see:
- [AGENT_DEVELOPMENT.md](./AGENT_DEVELOPMENT.md)
- [AGENT_API_INTEGRATION.md](./AGENT_API_INTEGRATION.md)
- [API.md](./API.md)

---

**Version:** 1.0  
**Last Updated:** 2024
