
from fastapi import FastAPI, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional, Dict, Any
import os
import uuid
from dotenv import load_dotenv
from agents import NLPAgent, DataAgent

load_dotenv()

app = FastAPI(
    title="Abetworks AI Automation Platform",
    description="Modular AI automation agents",
    version="1.0.0"
)

# Request/Response models
class ExecutionRequest(BaseModel):
    module_id: str
    org_id: str
    task_id: Optional[str] = None
    input_data: Dict[str, Any]

class ExecutionResponse(BaseModel):
    execution_id: str
    status: str
    output: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

# Module registry mapping module IDs to agent classes
MODULE_REGISTRY = {
    "nlp_processor": NLPAgent,
    "nlp_agent": NLPAgent,
    "data_processor": DataAgent,
    "data_agent": DataAgent,
}

# Authentication
async def verify_api_key(x_api_key: str = Header(...)):
    """Verify API key from Node.js backend"""
    valid_key = os.getenv("API_KEY", "")
    
    if not valid_key:
        return x_api_key
    
    if not x_api_key or x_api_key != valid_key:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return x_api_key

@app.get("/")
async def root():
    return {
        "service": "Abetworks AI Automation Platform",
        "status": "running",
        "version": "1.0.0",
        "available_modules": list(MODULE_REGISTRY.keys())
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "python-agents",
        "available_modules": list(MODULE_REGISTRY.keys())
    }

@app.get("/modules")
async def list_modules(api_key: str = Depends(verify_api_key)):
    """List all available agent modules"""
    return {
        "modules": [
            {
                "id": "nlp_processor",
                "name": "NLP Processor",
                "category": "nlp",
                "description": "Natural language processing using OpenAI"
            },
            {
                "id": "data_processor",
                "name": "Data Processor",
                "category": "data",
                "description": "Data transformation and analysis using pandas"
            }
        ]
    }

@app.post("/execute", response_model=ExecutionResponse)
async def execute_module(
    request: ExecutionRequest,
    api_key: str = Depends(verify_api_key)
):
    """Execute a Python agent module"""
    execution_id = f"exec_{uuid.uuid4().hex[:8]}"
    
    try:
        agent_class = MODULE_REGISTRY.get(request.module_id)
        
        if not agent_class:
            return ExecutionResponse(
                execution_id=execution_id,
                status="failed",
                error=f"Module '{request.module_id}' not found. Available modules: {list(MODULE_REGISTRY.keys())}"
            )
        
        agent = agent_class(org_id=request.org_id)
        
        result = await agent.execute(request.input_data)
        
        agent.close_db()
        
        return ExecutionResponse(
            execution_id=execution_id,
            status="completed",
            output=result
        )
        
    except Exception as e:
        return ExecutionResponse(
            execution_id=execution_id,
            status="failed",
            error=str(e)
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
