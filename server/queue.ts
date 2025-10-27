
import Bull from 'bull';

const agentQueue = new Bull('agent-executions', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379')
  }
});

export interface AgentJob {
  moduleId: string;
  orgId: string;
  taskId?: string;
  inputData: any;
  executionId: string;
}

// Process jobs with concurrency control
agentQueue.process(5, async (job) => {
  const { moduleId, orgId, taskId, inputData, executionId } = job.data as AgentJob;
  
  const { PythonAgentClient } = await import('./python-agent-client');
  const { storage } = await import('./storage');
  
  // Get API key
  const apiKeys = await storage.getAllApiKeys(orgId);
  if (!apiKeys.length) {
    throw new Error('No API key configured');
  }
  
  const client = new PythonAgentClient(apiKeys[0].key);
  
  // Update status to running
  await storage.updateModuleExecution(executionId, orgId, 'running');
  
  try {
    const result = await client.executeModule(moduleId, orgId, inputData, taskId);
    
    await storage.updateModuleExecution(
      executionId,
      orgId,
      result.status === 'completed' ? 'completed' : 'failed',
      result.output ? JSON.stringify(result.output) : undefined,
      result.error
    );
    
    return result;
  } catch (error: any) {
    await storage.updateModuleExecution(
      executionId,
      orgId,
      'failed',
      undefined,
      error.message
    );
    throw error;
  }
});

export async function queueAgentExecution(data: AgentJob) {
  return await agentQueue.add(data, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  });
}

export { agentQueue };
