import { DeploymentInfo, ChatMessage, CodeSnippet } from './types';

export const mockDeployment: DeploymentInfo = {
    workflowName: 'Customer Support Agent',
    workflowVersion: '13.0',
    runtimeName: 'DemoRT3',
    region: 'us-east-1',
    sourceArtifact: 's3://my-bucket/workflows/v13/agent.zip',
    status: 'ready',
    deploymentId: 'dep-m1n2o3p4',
    deployedAt: '2026-03-28T14:30:00Z',
};

export const mockChatMessages: ChatMessage[] = [
    {
        id: '1',
        role: 'system',
        content: 'AgentCore validation session started. Connected to DemoRT3 (us-east-1).',
        timestamp: '14:30:15',
    },
    {
        id: '2',
        role: 'user',
        content: 'Hello, I need help with my order #12345. It shows as shipped but I haven\'t received it yet.',
        timestamp: '14:30:45',
    },
    {
        id: '3',
        role: 'assistant',
        content: 'I\'d be happy to help you track your order #12345. Let me look up the shipping details for you.\n\nI can see your order was shipped on March 25th via FedEx. According to the tracking information, it\'s currently at a local distribution center and is scheduled for delivery tomorrow by 5 PM.\n\nWould you like me to send you the tracking number so you can monitor its progress?',
        timestamp: '14:31:02',
        isAgentCore: true,
    },
    {
        id: '4',
        role: 'user',
        content: 'Yes please, that would be helpful.',
        timestamp: '14:31:30',
    },
    {
        id: '5',
        role: 'assistant',
        content: 'Here\'s your tracking information:\n\n**Tracking Number:** FX789012345678\n**Carrier:** FedEx Ground\n**Estimated Delivery:** March 29, 2026 by 5:00 PM\n\nYou can track your package at [fedex.com/tracking](https://fedex.com/tracking).\n\nIs there anything else I can help you with?',
        timestamp: '14:31:45',
        isAgentCore: true,
    },
];

export const codeSnippets: Record<string, CodeSnippet> = {
    python: {
        language: 'python',
        code: `from kaya_agentcore import AgentCoreClient

# Initialize the client
client = AgentCoreClient(
    deployment_id="dep-m1n2o3p4",
    region="us-east-1"
)

# Send a message to the agent
response = client.invoke(
    message="Hello, I need help with my order",
    session_id="session-123",
    streaming=True
)

# Handle streaming response
for chunk in response:
    print(chunk.content, end="", flush=True)`,
    },
    javascript: {
        language: 'javascript',
        code: `import { AgentCoreClient } from '@kaya/agentcore-sdk';

// Initialize the client
const client = new AgentCoreClient({
  deploymentId: 'dep-m1n2o3p4',
  region: 'us-east-1'
});

// Send a message to the agent
const response = await client.invoke({
  message: 'Hello, I need help with my order',
  sessionId: 'session-123',
  streaming: true
});

// Handle streaming response
for await (const chunk of response) {
  process.stdout.write(chunk.content);
}`,
    },
};
