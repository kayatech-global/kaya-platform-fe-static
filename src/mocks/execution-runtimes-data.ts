export interface ExecutionRuntimeData {
    id: string;
    name: string;
    description: string;
    provider: 'kaya-runtime' | 'aws-agentcore' | 'gcp-adk' | 'azure-ai';
    status: 'active' | 'provisioning' | 'error' | 'inactive';
    region?: string;
    iamRole?: string;
    memory?: number;
    timeout?: number;
    linkedWorkflows: number;
    createdAt: string;
    updatedAt: string;
    environmentVariables?: Array<{ name: string; value: string }>;
    tags?: Array<{ key: string; value: string }>;
    providerConfig?: {
        agentCoreEndpoint?: string;
        runtimeArn?: string;
        clusterName?: string;
    };
    metrics?: {
        avgExecutionTime: number;
        totalExecutions: number;
        successRate: number;
        lastExecutedAt: string;
    };
}

export const RUNTIME_PROVIDERS = [
    { value: 'kaya-runtime', name: 'Kaya Runtime', description: 'Built-in LangGraph orchestration runtime' },
    { value: 'aws-agentcore', name: 'AWS Bedrock AgentCore', description: 'Amazon Bedrock AgentCore runtime' },
    { value: 'gcp-adk', name: 'GCP ADK', description: 'Google Cloud Agent Development Kit', disabled: true },
    { value: 'azure-ai', name: 'Azure AI', description: 'Microsoft Azure AI Agent Service', disabled: true },
];

export const AWS_REGIONS = [
    { value: 'us-east-1', name: 'US East (N. Virginia)' },
    { value: 'us-east-2', name: 'US East (Ohio)' },
    { value: 'us-west-1', name: 'US West (N. California)' },
    { value: 'us-west-2', name: 'US West (Oregon)' },
    { value: 'eu-west-1', name: 'EU (Ireland)' },
    { value: 'eu-west-2', name: 'EU (London)' },
    { value: 'eu-central-1', name: 'EU (Frankfurt)' },
    { value: 'ap-southeast-1', name: 'Asia Pacific (Singapore)' },
    { value: 'ap-southeast-2', name: 'Asia Pacific (Sydney)' },
    { value: 'ap-northeast-1', name: 'Asia Pacific (Tokyo)' },
];

export const MEMORY_OPTIONS = [
    { value: '128', name: '128 MB' },
    { value: '256', name: '256 MB' },
    { value: '512', name: '512 MB' },
    { value: '1024', name: '1024 MB' },
    { value: '2048', name: '2048 MB' },
    { value: '4096', name: '4096 MB' },
    { value: '8192', name: '8192 MB' },
];

export const TIMEOUT_OPTIONS = [
    { value: '30', name: '30 seconds' },
    { value: '60', name: '1 minute' },
    { value: '120', name: '2 minutes' },
    { value: '300', name: '5 minutes' },
    { value: '600', name: '10 minutes' },
    { value: '900', name: '15 minutes' },
];

export const mockExecutionRuntimes: ExecutionRuntimeData[] = [
    {
        id: 'rt-001',
        name: 'kaya-default-runtime',
        description: 'Default Kaya orchestration runtime for standard workflow execution',
        provider: 'kaya-runtime',
        status: 'active',
        linkedWorkflows: 12,
        createdAt: '2025-12-10T10:30:00Z',
        updatedAt: '2026-03-20T14:15:00Z',
        metrics: {
            avgExecutionTime: 1240,
            totalExecutions: 15823,
            successRate: 99.2,
            lastExecutedAt: '2026-03-25T08:45:12Z',
        },
    },
    {
        id: 'rt-002',
        name: 'agentcore-production',
        description: 'AWS AgentCore runtime for production customer-facing workflows',
        provider: 'aws-agentcore',
        status: 'active',
        region: 'us-east-1',
        iamRole: 'arn:aws:iam::123456789012:role/kaya-agentcore-exec',
        memory: 2048,
        timeout: 300,
        linkedWorkflows: 5,
        createdAt: '2026-01-15T09:00:00Z',
        updatedAt: '2026-03-18T16:20:00Z',
        environmentVariables: [
            { name: 'LOG_LEVEL', value: 'INFO' },
            { name: 'MAX_RETRIES', value: '3' },
        ],
        tags: [
            { key: 'environment', value: 'production' },
            { key: 'team', value: 'platform' },
        ],
        providerConfig: {
            agentCoreEndpoint: 'https://bedrock-agentcore.us-east-1.amazonaws.com',
            runtimeArn: 'arn:aws:bedrock:us-east-1:123456789012:agent-runtime/abc123',
        },
        metrics: {
            avgExecutionTime: 890,
            totalExecutions: 4521,
            successRate: 98.7,
            lastExecutedAt: '2026-03-25T09:12:34Z',
        },
    },
    {
        id: 'rt-003',
        name: 'agentcore-staging',
        description: 'AWS AgentCore runtime for staging and testing',
        provider: 'aws-agentcore',
        status: 'active',
        region: 'us-west-2',
        iamRole: 'arn:aws:iam::123456789012:role/kaya-agentcore-staging',
        memory: 1024,
        timeout: 120,
        linkedWorkflows: 3,
        createdAt: '2026-02-01T11:00:00Z',
        updatedAt: '2026-03-22T10:30:00Z',
        environmentVariables: [
            { name: 'LOG_LEVEL', value: 'DEBUG' },
        ],
        tags: [
            { key: 'environment', value: 'staging' },
        ],
        providerConfig: {
            agentCoreEndpoint: 'https://bedrock-agentcore.us-west-2.amazonaws.com',
            runtimeArn: 'arn:aws:bedrock:us-west-2:123456789012:agent-runtime/def456',
        },
        metrics: {
            avgExecutionTime: 1050,
            totalExecutions: 1230,
            successRate: 97.5,
            lastExecutedAt: '2026-03-24T17:45:00Z',
        },
    },
    {
        id: 'rt-004',
        name: 'agentcore-eu-prod',
        description: 'AWS AgentCore runtime for EU region compliance workflows',
        provider: 'aws-agentcore',
        status: 'provisioning',
        region: 'eu-central-1',
        iamRole: 'arn:aws:iam::123456789012:role/kaya-agentcore-eu',
        memory: 4096,
        timeout: 600,
        linkedWorkflows: 0,
        createdAt: '2026-03-25T08:00:00Z',
        updatedAt: '2026-03-25T08:00:00Z',
        tags: [
            { key: 'environment', value: 'production' },
            { key: 'region', value: 'eu' },
            { key: 'compliance', value: 'gdpr' },
        ],
        providerConfig: {
            agentCoreEndpoint: 'https://bedrock-agentcore.eu-central-1.amazonaws.com',
        },
        metrics: {
            avgExecutionTime: 0,
            totalExecutions: 0,
            successRate: 0,
            lastExecutedAt: '',
        },
    },
    {
        id: 'rt-005',
        name: 'agentcore-failed-config',
        description: 'AgentCore runtime with configuration error',
        provider: 'aws-agentcore',
        status: 'error',
        region: 'ap-southeast-1',
        memory: 512,
        timeout: 60,
        linkedWorkflows: 0,
        createdAt: '2026-03-20T14:00:00Z',
        updatedAt: '2026-03-20T14:05:00Z',
        tags: [
            { key: 'environment', value: 'development' },
        ],
        metrics: {
            avgExecutionTime: 0,
            totalExecutions: 0,
            successRate: 0,
            lastExecutedAt: '',
        },
    },
];

export const mockLinkedWorkflows = [
    { id: 'wf-001', name: 'Customer Support Agent', version: 'v2.1', lastExecuted: '2026-03-25T08:30:00Z', status: 'active' },
    { id: 'wf-002', name: 'Claims Processing Pipeline', version: 'v1.5', lastExecuted: '2026-03-24T22:15:00Z', status: 'active' },
    { id: 'wf-003', name: 'Document Classification', version: 'v3.0', lastExecuted: '2026-03-25T09:00:00Z', status: 'active' },
    { id: 'wf-004', name: 'KYC Verification Flow', version: 'v1.2', lastExecuted: '2026-03-23T16:45:00Z', status: 'draft' },
    { id: 'wf-005', name: 'Sales Lead Qualifier', version: 'v2.0', lastExecuted: '2026-03-25T07:20:00Z', status: 'active' },
];
