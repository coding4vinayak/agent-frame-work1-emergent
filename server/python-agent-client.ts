
import axios from 'axios';

const PYTHON_AGENT_URL = process.env.PYTHON_AGENT_URL || 'http://0.0.0.0:8000';

interface ExecutionRequest {
  module_id: string;
  org_id: string;
  task_id?: string;
  input_data: any;
}

interface ExecutionResponse {
  execution_id: string;
  status: 'completed' | 'failed' | 'pending';
  output?: any;
  error?: string;
}

export class PythonAgentClient {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  async executeModule(
    moduleId: string,
    orgId: string,
    inputData: any,
    taskId?: string
  ): Promise<ExecutionResponse> {
    try {
      const response = await axios.post<ExecutionResponse>(
        `${PYTHON_AGENT_URL}/execute`,
        {
          module_id: moduleId,
          org_id: orgId,
          task_id: taskId,
          input_data: inputData
        } as ExecutionRequest,
        {
          headers: {
            'X-API-Key': this.apiKey,
            'Content-Type': 'application/json'
          },
          timeout: 60000 // 60 seconds
        }
      );
      
      return response.data;
    } catch (error: any) {
      throw new Error(`Python agent execution failed: ${error.message}`);
    }
  }
  
  async healthCheck(): Promise<{ status: string; service?: string; error?: string }> {
    try {
      const response = await axios.get(`${PYTHON_AGENT_URL}/health`, {
        timeout: 5000
      });
      return response.data;
    } catch (error: any) {
      return { 
        status: 'unhealthy', 
        error: error.message 
      };
    }
  }
}
