export type AgentFramework = 'PI Agents' | 'OpenClaw';
export type AgentStatus = 'running' | 'stopped' | 'error' | 'deploying';
export type SessionMode = 'single' | 'per-workflow' | 'per-execution';
export type ExecutionMode = 'synchronous' | 'asynchronous' | 'fire-and-forget';
export type Protocol = 'A2A' | 'ACP';
export type AuthType = 'none' | 'bearer' | 'api-key';

export interface StandaloneAgent {
    id: string;
    name: string;
    description: string;
    framework: AgentFramework;
    status: AgentStatus;
    lastActive: string;
    model: string;
    systemPrompt: string;
    endpointUrl: string;
    version: string;
    createdAt: string;
    uptime: string;
    namespace: string;
    image: string;
    cpu: string;
    memory: string;
    replicas: number;
    sessionMode: SessionMode;
    tools: string[];
    connectors: string[];
    envVars: { key: string; value: string }[];
}

export const MOCK_AGENTS: StandaloneAgent[] = [
    {
        id: 'agent-001',
        name: 'Customer Support Agent',
        description: 'Handles tier-1 customer support queries using knowledge base retrieval and ticket escalation.',
        framework: 'PI Agents',
        status: 'running',
        lastActive: '2 minutes ago',
        model: 'gpt-4o',
        systemPrompt: 'You are a helpful customer support agent...',
        endpointUrl: 'https://agents.kaya.io/v1/agent/agent-001',
        version: '1.3.2',
        createdAt: '2025-01-15T10:30:00Z',
        uptime: '14d 6h 22m',
        namespace: 'kaya-agents-prod',
        image: 'kayatech/pi-agent-runtime:1.3.2',
        cpu: '500m',
        memory: '512Mi',
        replicas: 2,
        sessionMode: 'per-workflow',
        tools: ['shell', 'memory', 'web-browse'],
        connectors: ['Zendesk Connector', 'Slack Connector'],
        envVars: [
            { key: 'LOG_LEVEL', value: 'info' },
            { key: 'MAX_RETRIES', value: '3' },
        ],
    },
    {
        id: 'agent-002',
        name: 'Code Review Agent',
        description: 'Performs automated code review, security scanning, and suggests refactoring opportunities.',
        framework: 'OpenClaw',
        status: 'running',
        lastActive: '1 hour ago',
        model: 'claude-3-5-sonnet',
        systemPrompt: 'You are an expert code reviewer...',
        endpointUrl: 'https://agents.kaya.io/v1/agent/agent-002',
        version: '2.1.0',
        createdAt: '2025-02-03T09:00:00Z',
        uptime: '3d 12h 05m',
        namespace: 'kaya-agents-prod',
        image: 'kayatech/openclaw-runtime:2.1.0',
        cpu: '1000m',
        memory: '1Gi',
        replicas: 1,
        sessionMode: 'per-execution',
        tools: ['shell', 'code-exec', 'file-tools'],
        connectors: ['GitHub Connector'],
        envVars: [
            { key: 'REVIEW_DEPTH', value: 'deep' },
        ],
    },
    {
        id: 'agent-003',
        name: 'Data Analysis Agent',
        description: 'Analyzes datasets, generates visualizations, and produces summary reports on demand.',
        framework: 'PI Agents',
        status: 'stopped',
        lastActive: '3 days ago',
        model: 'gpt-4o-mini',
        systemPrompt: 'You are a data analysis specialist...',
        endpointUrl: 'https://agents.kaya.io/v1/agent/agent-003',
        version: '1.0.5',
        createdAt: '2025-01-28T14:15:00Z',
        uptime: '0m',
        namespace: 'kaya-agents-staging',
        image: 'kayatech/pi-agent-runtime:1.0.5',
        cpu: '250m',
        memory: '256Mi',
        replicas: 1,
        sessionMode: 'single',
        tools: ['code-exec', 'file-tools', 'memory'],
        connectors: ['S3 Connector', 'PostgreSQL Connector'],
        envVars: [
            { key: 'OUTPUT_FORMAT', value: 'json' },
        ],
    },
    {
        id: 'agent-004',
        name: 'Email Drafting Agent',
        description: 'Drafts professional emails based on context, tone preferences, and previous correspondence.',
        framework: 'OpenClaw',
        status: 'error',
        lastActive: '5 minutes ago',
        model: 'gemini-1.5-pro',
        systemPrompt: 'You are a professional email writer...',
        endpointUrl: 'https://agents.kaya.io/v1/agent/agent-004',
        version: '1.2.1',
        createdAt: '2025-03-01T08:00:00Z',
        uptime: '0m',
        namespace: 'kaya-agents-prod',
        image: 'kayatech/openclaw-runtime:1.2.1',
        cpu: '500m',
        memory: '512Mi',
        replicas: 2,
        sessionMode: 'per-workflow',
        tools: ['email', 'memory'],
        connectors: ['Gmail Connector'],
        envVars: [
            { key: 'DEFAULT_TONE', value: 'professional' },
        ],
    },
    {
        id: 'agent-005',
        name: 'Research Assistant Agent',
        description: 'Conducts web research, summarizes findings, and compiles structured reports.',
        framework: 'PI Agents',
        status: 'deploying',
        lastActive: 'Just now',
        model: 'gpt-4o',
        systemPrompt: 'You are a thorough research assistant...',
        endpointUrl: 'https://agents.kaya.io/v1/agent/agent-005',
        version: '3.0.0-beta',
        createdAt: '2025-03-18T07:30:00Z',
        uptime: '0m',
        namespace: 'kaya-agents-staging',
        image: 'kayatech/pi-agent-runtime:3.0.0-beta',
        cpu: '750m',
        memory: '768Mi',
        replicas: 3,
        sessionMode: 'per-execution',
        tools: ['web-browse', 'browser-use', 'file-tools', 'memory'],
        connectors: ['Notion Connector'],
        envVars: [
            { key: 'SEARCH_DEPTH', value: '10' },
            { key: 'SUMMARIZE', value: 'true' },
        ],
    },
    {
        id: 'agent-006',
        name: 'HR Onboarding Agent',
        description: 'Guides new employees through the onboarding process, answers policy questions.',
        framework: 'PI Agents',
        status: 'running',
        lastActive: '30 minutes ago',
        model: 'gpt-4o-mini',
        systemPrompt: 'You are an HR onboarding guide...',
        endpointUrl: 'https://agents.kaya.io/v1/agent/agent-006',
        version: '1.1.0',
        createdAt: '2025-02-20T11:00:00Z',
        uptime: '22d 3h 10m',
        namespace: 'kaya-agents-prod',
        image: 'kayatech/pi-agent-runtime:1.1.0',
        cpu: '250m',
        memory: '256Mi',
        replicas: 1,
        sessionMode: 'single',
        tools: ['memory', 'file-tools'],
        connectors: ['HR Portal Connector'],
        envVars: [],
    },
];

export const MOCK_LOGS = [
    { id: 1, timestamp: '2025-03-19T08:32:11Z', severity: 'info', message: 'Agent initialized successfully. Session ID: sess-abc123' },
    { id: 2, timestamp: '2025-03-19T08:32:12Z', severity: 'info', message: 'Loading system prompt from configuration...' },
    { id: 3, timestamp: '2025-03-19T08:32:13Z', severity: 'info', message: 'Connected to memory store: kaya-mem-01' },
    { id: 4, timestamp: '2025-03-19T08:34:22Z', severity: 'info', message: 'Received request from workflow wf-8821. Processing...' },
    { id: 5, timestamp: '2025-03-19T08:34:23Z', severity: 'info', message: 'Invoking LLM: gpt-4o with 1024 tokens context' },
    { id: 6, timestamp: '2025-03-19T08:34:26Z', severity: 'info', message: 'LLM response received. Latency: 2341ms' },
    { id: 7, timestamp: '2025-03-19T08:34:27Z', severity: 'warn', message: 'Memory store lookup returned stale entry (TTL expired). Refreshing...' },
    { id: 8, timestamp: '2025-03-19T08:34:28Z', severity: 'info', message: 'Tool call: web-browse -> https://example.com/support/article-42' },
    { id: 9, timestamp: '2025-03-19T08:34:31Z', severity: 'info', message: 'Tool call completed. Retrieved 3412 chars.' },
    { id: 10, timestamp: '2025-03-19T08:35:01Z', severity: 'info', message: 'Request completed. Response sent to workflow. Total latency: 4872ms' },
    { id: 11, timestamp: '2025-03-19T08:38:44Z', severity: 'error', message: 'Failed to connect to connector: Zendesk Connector. Timeout after 5000ms. Retrying (1/3)...' },
    { id: 12, timestamp: '2025-03-19T08:38:49Z', severity: 'error', message: 'Retry 1 failed. Connection refused: ECONNREFUSED. Retrying (2/3)...' },
    { id: 13, timestamp: '2025-03-19T08:38:54Z', severity: 'warn', message: 'Retry 2 succeeded with degraded connectivity. Proceeding with limited functionality.' },
    { id: 14, timestamp: '2025-03-19T08:40:00Z', severity: 'info', message: 'Health check passed. Uptime: 14d 6h 22m' },
    { id: 15, timestamp: '2025-03-19T08:41:12Z', severity: 'info', message: 'Received request from workflow wf-9134. Processing...' },
];

export const MOCK_SESSIONS = [
    { id: 'sess-abc123', type: 'per-workflow', workflowId: 'wf-8821', started: '2025-03-19T08:32:11Z', lastActivity: '2025-03-19T08:35:01Z', status: 'completed', messageCount: 4 },
    { id: 'sess-def456', type: 'per-workflow', workflowId: 'wf-8830', started: '2025-03-19T08:41:12Z', lastActivity: '2025-03-19T08:41:22Z', status: 'active', messageCount: 1 },
    { id: 'sess-ghi789', type: 'per-workflow', workflowId: 'wf-8812', started: '2025-03-19T07:12:00Z', lastActivity: '2025-03-19T07:22:40Z', status: 'completed', messageCount: 8 },
    { id: 'sess-jkl012', type: 'per-workflow', workflowId: 'wf-8799', started: '2025-03-18T16:00:00Z', lastActivity: '2025-03-18T16:18:22Z', status: 'completed', messageCount: 12 },
    { id: 'sess-mno345', type: 'per-workflow', workflowId: 'wf-8788', started: '2025-03-18T14:30:00Z', lastActivity: '2025-03-18T14:30:05Z', status: 'error', messageCount: 1 },
];

export const MOCK_VERSIONS = [
    { version: '1.3.2', deployedAt: '2025-03-10T12:00:00Z', deployedBy: 'admin@kaya.io', status: 'active', notes: 'Performance improvements and memory optimization' },
    { version: '1.3.1', deployedAt: '2025-02-28T09:30:00Z', deployedBy: 'dev@kaya.io', status: 'inactive', notes: 'Hotfix: memory leak in session handling' },
    { version: '1.3.0', deployedAt: '2025-02-15T14:00:00Z', deployedBy: 'admin@kaya.io', status: 'inactive', notes: 'Added web-browse tool integration' },
    { version: '1.2.0', deployedAt: '2025-01-20T10:00:00Z', deployedBy: 'admin@kaya.io', status: 'inactive', notes: 'Initial stable release' },
];
