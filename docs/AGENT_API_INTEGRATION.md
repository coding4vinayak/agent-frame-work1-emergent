
# Agent API Integration Guide

Complete guide for integrating external agents into the Abetworks platform via API.

## Overview

The Abetworks platform allows you to register custom AI agents through our REST API and make them available in the marketplace for your organization.

## Authentication

All API requests require a valid JWT token or API key.

```bash
# Using JWT Token
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://your-replit-url.repl.co/api/agents/register

# Using API Key
curl -H "X-API-Key: YOUR_API_KEY" \
  https://your-replit-url.repl.co/api/agents/register
```

## Registering an Agent

### Endpoint

```
POST /api/agents/register
```

### Required Headers

```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier for the agent (e.g., "custom-nlp-agent") |
| `name` | string | Yes | Display name of the agent |
| `type` | string | Yes | Agent type identifier |
| `description` | string | Yes | Short description (1-2 sentences) |
| `category` | string | Yes | Category: `lead-generation`, `analytics`, `automation`, `communication`, `data-processing`, or `forecasting` |
| `longDescription` | string | No | Detailed description with features and benefits |
| `icon` | string | No | Emoji icon (default: 🤖) |
| `backendEndpoint` | string | No | API endpoint for execution (default: `/api/agents/{id}`) |
| `configSchema` | object | No | JSON schema for configuration options |
| `price` | number | No | Monthly price in USD (default: 0) |

### Example Request

```bash
curl -X POST https://your-replit-url.repl.co/api/agents/register \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "sentiment-analyzer",
    "name": "Advanced Sentiment Analyzer",
    "type": "nlp-sentiment",
    "description": "Analyze text sentiment with 95% accuracy using state-of-the-art NLP models",
    "longDescription": "Our Advanced Sentiment Analyzer uses the latest transformer models to detect emotions, sentiment polarity, and key topics in text data. Perfect for analyzing customer feedback, social media posts, and review data.",
    "icon": "😊",
    "category": "analytics",
    "backendEndpoint": "/api/agents/sentiment-analyzer",
    "configSchema": {
      "apiKey": {
        "type": "string",
        "required": true,
        "description": "API key for sentiment analysis service"
      },
      "language": {
        "type": "string",
        "default": "en",
        "description": "Language code (en, es, fr, etc.)"
      },
      "threshold": {
        "type": "number",
        "default": 0.7,
        "min": 0,
        "max": 1,
        "description": "Minimum confidence threshold"
      }
    },
    "price": 29
  }'
```

### Success Response (200)

```json
{
  "message": "Agent registered successfully",
  "agent": {
    "id": "sentiment-analyzer",
    "name": "Advanced Sentiment Analyzer",
    "type": "nlp-sentiment",
    "description": "Analyze text sentiment with 95% accuracy...",
    "longDescription": "Our Advanced Sentiment Analyzer uses...",
    "icon": "😊",
    "category": "analytics",
    "backendEndpoint": "/api/agents/sentiment-analyzer",
    "configSchema": "{\"apiKey\":...}",
    "price": 29,
    "isActive": true
  }
}
```

### Error Response (400)

```json
{
  "message": "Missing required fields: id, name, type, description, category"
}
```

## Updating an Agent

### Endpoint

```
PATCH /api/agents/catalog/:id
```

### Example Request

```bash
curl -X PATCH https://your-replit-url.repl.co/api/agents/catalog/sentiment-analyzer \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 39,
    "description": "Updated description with new features"
  }'
```

## Deleting an Agent

### Endpoint

```
DELETE /api/agents/catalog/:id
```

**Note:** This requires Super Admin role and will deactivate all subscriptions before deletion.

### Example Request

```bash
curl -X DELETE https://your-replit-url.repl.co/api/agents/catalog/sentiment-analyzer \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Frontend Integration

### Using the UI

1. Navigate to the **Agent Marketplace** page
2. Click the **Register Agent** button in the top-right
3. Fill out the registration form with agent details
4. Submit to add the agent to your catalog

### Programmatic Integration

```typescript
import { apiRequest } from "@/lib/queryClient";

async function registerAgent() {
  const agent = {
    id: "my-custom-agent",
    name: "My Custom Agent",
    type: "custom-processor",
    description: "Does amazing things",
    category: "automation",
    price: 0
  };

  try {
    const response = await apiRequest("POST", "/api/agents/register", agent);
    console.log("Agent registered:", response);
  } catch (error) {
    console.error("Registration failed:", error);
  }
}
```

## Implementing Agent Execution

Once registered, you need to implement the backend endpoint that executes your agent.

### Python Agent Example

```python
# python-agents/agents/custom_agent.py
from .base_agent import BaseAgent
from typing import Any, Dict

class CustomAgent(BaseAgent):
    """Your custom agent implementation"""
    
    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            # Your agent logic here
            result = self.process_data(input_data)
            
            return {
                "success": True,
                "output": result
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
```

### Register in FastAPI

```python
# python-agents/main.py
from agents.custom_agent import CustomAgent

MODULE_REGISTRY = {
    "custom_agent": CustomAgent,
    # ... other agents
}
```

## Testing Your Agent

### Via API

```bash
curl -X POST https://your-replit-url.repl.co/api/modules/custom_agent/execute \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "inputData": {
      "text": "Test input",
      "options": {}
    }
  }'
```

### Via Frontend

1. Go to **Modules** page
2. Find your agent
3. Click **Test** button
4. Enter sample input
5. View results

## Best Practices

### Agent IDs
- Use lowercase with hyphens: `my-agent-name`
- Keep them short and descriptive
- Never change IDs after registration

### Descriptions
- **Short**: 1-2 sentences, max 150 characters
- **Long**: Include features, benefits, use cases
- Use bullet points for readability

### Configuration Schema
- Provide clear descriptions for each field
- Set sensible defaults
- Include validation rules (min, max, required)

### Pricing
- Start at $0 for testing
- Research competitor pricing
- Consider value provided

### Categories
Choose the most appropriate category:
- **lead-generation**: Capture and generate leads
- **analytics**: Data analysis and insights
- **automation**: Workflow automation
- **communication**: Email, SMS, chat
- **data-processing**: Transform and clean data
- **forecasting**: Predictions and trends

## Error Handling

### Common Errors

| Status | Error | Solution |
|--------|-------|----------|
| 400 | Missing required fields | Check all required fields are provided |
| 400 | Agent already exists | Use a different ID or update existing |
| 401 | Authentication required | Include valid JWT token |
| 403 | Insufficient permissions | Contact admin for role upgrade |
| 500 | Server error | Check logs, contact support |

## Rate Limits

Currently no rate limits are enforced, but this may change in production.

## Support

For questions or issues:
- Check documentation: `/docs`
- Review examples: `/docs/AGENT_DEVELOPMENT.md`
- API reference: `/docs/API.md`

## Changelog

- **v1.0** - Initial agent registration API
- Added frontend registration form
- Added catalog management endpoints
