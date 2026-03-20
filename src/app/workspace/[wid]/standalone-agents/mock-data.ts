// ─── Type Definitions ───

export type AgentFramework = 'pi-agents' | 'openclaw';
export type AgentStatus = 'running' | 'stopped' | 'error' | 'deploying';
export type SessionMode = 'single' | 'per-workflow' | 'per-execution';
export type DeploymentStrategy = 'template-repo' | 'base-image';
export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface StandaloneAgent {
    id: string;
    name: string;
    description: string;
    framework: AgentFramework;
    status: AgentStatus;
    a2aEndpoint: string;
    version: string;
    lastDeployed: string;
    llmProvider: string;
    llmModel: string;
    sessionMode: SessionMode;
    cluster: string;
    cpuLimit: string;
    memoryLimit: string;
    tools: string[];
}

export interface MonitoringMetric {
    timestamp: string;
    requestCount: number;
    avgResponseTime: number;
    cpuUsage: number;
    memoryUsage: number;
}

export interface LogEntry {
    id: string;
    timestamp: string;
    level: LogLevel;
    message: string;
    source: string;
}

export interface AgentSession {
    id: string;
    type: SessionMode;
    sessionId: string;
    createdAt: string;
    lastActivity: string;
    status: 'active' | 'idle' | 'expired';
}

export interface AgentVersion {
    version: string;
    deployedAt: string;
    status: 'active' | 'previous' | 'rolled-back';
    configDiffSummary: string;
    deployedBy: string;
}

export interface VariableMapping {
    id: string;
    sourceVar: string;
    targetVar: string;
}

// ─── Mock Data ───

export const mockAgents: StandaloneAgent[] = [
    {
        id: 'agent-001',
        name: 'Customer Support Agent',
        description: 'Handles customer inquiries and ticket resolution via A2A protocol',
        framework: 'pi-agents',
        status: 'running',
        a2aEndpoint: 'https://agents.kaya.ai/a2a/customer-support',
        version: '2.1.0',
        lastDeployed: '2026-03-15T14:30:00Z',
        llmProvider: 'OpenAI',
        llmModel: 'gpt-4o',
        sessionMode: 'per-workflow',
        cluster: 'prod-us-east-1',
        cpuLimit: '500m',
        memoryLimit: '512Mi',
        tools: ['email', 'web', 'memory', 'workflow-variables'],
    },
    {
        id: 'agent-002',
        name: 'Code Review Agent',
        description: 'Automated code review and suggestions using OpenClaw framework',
        framework: 'openclaw',
        status: 'running',
        a2aEndpoint: 'https://agents.kaya.ai/a2a/code-review',
        version: '1.3.0',
        lastDeployed: '2026-03-14T09:15:00Z',
        llmProvider: 'Anthropic',
        llmModel: 'claude-sonnet-4-20250514',
        sessionMode: 'per-execution',
        cluster: 'prod-us-east-1',
        cpuLimit: '1000m',
        memoryLimit: '1Gi',
        tools: ['shell', 'code-execution', 'file-ops', 'memory'],
    },
    {
        id: 'agent-003',
        name: 'Data Pipeline Orchestrator',
        description: 'Manages ETL pipelines and data transformations',
        framework: 'pi-agents',
        status: 'stopped',
        a2aEndpoint: 'https://agents.kaya.ai/a2a/data-pipeline',
        version: '1.0.2',
        lastDeployed: '2026-03-10T11:00:00Z',
        llmProvider: 'OpenAI',
        llmModel: 'gpt-4o-mini',
        sessionMode: 'single',
        cluster: 'prod-eu-west-1',
        cpuLimit: '2000m',
        memoryLimit: '2Gi',
        tools: ['shell', 'code-execution', 'file-ops', 'task-scheduling', 'retry'],
    },
    {
        id: 'agent-004',
        name: 'QA Test Generator',
        description: 'Generates test cases and automation scripts from requirements',
        framework: 'openclaw',
        status: 'error',
        a2aEndpoint: 'https://agents.kaya.ai/a2a/qa-test-gen',
        version: '0.9.1',
        lastDeployed: '2026-03-12T16:45:00Z',
        llmProvider: 'Google',
        llmModel: 'gemini-2.0-flash',
        sessionMode: 'per-execution',
        cluster: 'staging-us-east-1',
        cpuLimit: '500m',
        memoryLimit: '512Mi',
        tools: ['code-execution', 'file-ops', 'browser', 'planning'],
    },
    {
        id: 'agent-005',
        name: 'Document Summarizer',
        description: 'Summarizes documents and extracts key insights using PI Agents',
        framework: 'pi-agents',
        status: 'deploying',
        a2aEndpoint: 'https://agents.kaya.ai/a2a/doc-summarizer',
        version: '3.0.0',
        lastDeployed: '2026-03-19T08:00:00Z',
        llmProvider: 'OpenAI',
        llmModel: 'gpt-4o',
        sessionMode: 'per-workflow',
        cluster: 'prod-us-east-1',
        cpuLimit: '500m',
        memoryLimit: '1Gi',
        tools: ['file-ops', 'memory', 'web', 'planning'],
    },
    {
        id: 'agent-006',
        name: 'Sales Lead Qualifier',
        description: 'Qualifies and scores sales leads from CRM data',
        framework: 'openclaw',
        status: 'running',
        a2aEndpoint: 'https://agents.kaya.ai/a2a/sales-qualifier',
        version: '1.5.0',
        lastDeployed: '2026-03-18T12:30:00Z',
        llmProvider: 'Anthropic',
        llmModel: 'claude-sonnet-4-20250514',
        sessionMode: 'single',
        cluster: 'prod-us-east-1',
        cpuLimit: '500m',
        memoryLimit: '512Mi',
        tools: ['email', 'web', 'workflow-variables', 'self-configuration'],
    },
];

export const mockMonitoringMetrics: MonitoringMetric[] = Array.from({ length: 24 }, (_, i) => ({
    timestamp: new Date(2026, 2, 19, i, 0, 0).toISOString(),
    requestCount: Math.floor(Math.random() * 150) + 20,
    avgResponseTime: Math.floor(Math.random() * 800) + 200,
    cpuUsage: Math.floor(Math.random() * 60) + 15,
    memoryUsage: Math.floor(Math.random() * 40) + 30,
}));

export const mockLogEntries: LogEntry[] = [
    {
        id: 'log-001',
        timestamp: '2026-03-19T10:15:32.123Z',
        level: 'info',
        message: 'Agent started successfully on port 8080',
        source: 'runtime',
    },
    {
        id: 'log-002',
        timestamp: '2026-03-19T10:15:33.456Z',
        level: 'info',
        message: 'A2A protocol handler registered at /a2a/customer-support',
        source: 'a2a-server',
    },
    {
        id: 'log-003',
        timestamp: '2026-03-19T10:16:01.789Z',
        level: 'debug',
        message: 'Received task request from workflow wf-12345: "Resolve ticket #4892"',
        source: 'task-handler',
    },
    {
        id: 'log-004',
        timestamp: '2026-03-19T10:16:02.012Z',
        level: 'info',
        message: 'Processing task with session ctx-abc123, model: gpt-4o',
        source: 'llm-bridge',
    },
    {
        id: 'log-005',
        timestamp: '2026-03-19T10:16:05.345Z',
        level: 'warn',
        message: 'LLM response latency exceeded threshold: 3200ms (limit: 3000ms)',
        source: 'llm-bridge',
    },
    {
        id: 'log-006',
        timestamp: '2026-03-19T10:16:06.678Z',
        level: 'info',
        message: 'Task completed successfully. Artifacts: 1 response, 2 tool calls',
        source: 'task-handler',
    },
    {
        id: 'log-007',
        timestamp: '2026-03-19T10:17:12.901Z',
        level: 'error',
        message: 'Failed to connect to memory store: connection timeout after 5000ms',
        source: 'memory-connector',
    },
    {
        id: 'log-008',
        timestamp: '2026-03-19T10:17:13.234Z',
        level: 'warn',
        message: 'Falling back to in-process memory cache',
        source: 'memory-connector',
    },
    {
        id: 'log-009',
        timestamp: '2026-03-19T10:18:00.567Z',
        level: 'debug',
        message: 'Health check passed: CPU 34%, Memory 256Mi/512Mi',
        source: 'health-monitor',
    },
    {
        id: 'log-010',
        timestamp: '2026-03-19T10:19:45.890Z',
        level: 'info',
        message: 'Session ctx-abc123 completed. Total tool calls: 5, Duration: 223s',
        source: 'session-manager',
    },
];

export const mockSessions: AgentSession[] = [
    {
        id: 'sess-001',
        type: 'per-workflow',
        sessionId: 'ctx-abc123',
        createdAt: '2026-03-19T09:00:00Z',
        lastActivity: '2026-03-19T10:19:45Z',
        status: 'active',
    },
    {
        id: 'sess-002',
        type: 'per-execution',
        sessionId: 'ctx-def456',
        createdAt: '2026-03-19T08:30:00Z',
        lastActivity: '2026-03-19T09:45:00Z',
        status: 'idle',
    },
    {
        id: 'sess-003',
        type: 'per-workflow',
        sessionId: 'ctx-ghi789',
        createdAt: '2026-03-18T14:00:00Z',
        lastActivity: '2026-03-18T16:30:00Z',
        status: 'expired',
    },
    {
        id: 'sess-004',
        type: 'single',
        sessionId: 'ctx-jkl012',
        createdAt: '2026-03-19T10:00:00Z',
        lastActivity: '2026-03-19T10:20:00Z',
        status: 'active',
    },
    {
        id: 'sess-005',
        type: 'per-execution',
        sessionId: 'ctx-mno345',
        createdAt: '2026-03-19T07:15:00Z',
        lastActivity: '2026-03-19T07:45:00Z',
        status: 'idle',
    },
];

export const mockVersions: AgentVersion[] = [
    {
        version: '2.1.0',
        deployedAt: '2026-03-15T14:30:00Z',
        status: 'active',
        configDiffSummary: 'Updated LLM model to gpt-4o, increased memory limit to 512Mi',
        deployedBy: 'john.doe@kaya.ai',
    },
    {
        version: '2.0.0',
        deployedAt: '2026-03-08T10:00:00Z',
        status: 'previous',
        configDiffSummary: 'Major refactor: migrated to A2A protocol, added email tool',
        deployedBy: 'jane.smith@kaya.ai',
    },
    {
        version: '1.5.2',
        deployedAt: '2026-02-28T16:00:00Z',
        status: 'previous',
        configDiffSummary: 'Bug fix: resolved session leak in per-workflow mode',
        deployedBy: 'john.doe@kaya.ai',
    },
    {
        version: '1.5.1',
        deployedAt: '2026-02-20T09:30:00Z',
        status: 'rolled-back',
        configDiffSummary: 'Added browser tool capability (rolled back due to stability)',
        deployedBy: 'jane.smith@kaya.ai',
    },
    {
        version: '1.5.0',
        deployedAt: '2026-02-15T12:00:00Z',
        status: 'previous',
        configDiffSummary: 'Initial per-workflow session support, upgraded to claude-sonnet-4-20250514',
        deployedBy: 'john.doe@kaya.ai',
    },
];

export interface ToolDefinition {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: 'agent-capability' | 'platform-tool';
}

export const defaultTools: ToolDefinition[] = [
    // Default Agent Capabilities
    { id: 'shell', name: 'Shell Access', description: 'Execute shell commands (npm/npx)', icon: 'Terminal', category: 'agent-capability' },
    { id: 'code-execution', name: 'Code Execution', description: 'Run code in sandboxed environment', icon: 'Code', category: 'agent-capability' },
    { id: 'file-ops', name: 'File Operations', description: 'Read, write, and manage files', icon: 'FileText', category: 'agent-capability' },
    { id: 'memory', name: 'Memory', description: 'Persistent context across sessions', icon: 'Brain', category: 'agent-capability' },
    { id: 'email', name: 'Email', description: 'Send and receive emails', icon: 'Mail', category: 'agent-capability' },
    { id: 'web', name: 'Web Access', description: 'Fetch and browse web content', icon: 'Globe', category: 'agent-capability' },
    { id: 'browser', name: 'Browser', description: 'Full browser automation', icon: 'Monitor', category: 'agent-capability' },
    { id: 'workflow-variables', name: 'Workflow Variables', description: 'Access shared workflow state', icon: 'Variable', category: 'agent-capability' },
    { id: 'planning', name: 'Planning', description: 'Task decomposition and planning', icon: 'ListTodo', category: 'agent-capability' },
    { id: 'task-scheduling', name: 'Task Scheduling', description: 'Schedule async tasks', icon: 'Clock', category: 'agent-capability' },
    { id: 'retry', name: 'Retry Logic', description: 'Automatic retry with backoff', icon: 'RefreshCw', category: 'agent-capability' },
    { id: 'self-configuration', name: 'Self Configuration', description: 'Dynamic self-tuning', icon: 'Settings', category: 'agent-capability' },
    // Platform Workflow Tools
    { id: 'api-connector', name: 'API Configurations', description: 'Invoke configured REST/GraphQL APIs', icon: 'CloudCog', category: 'platform-tool' },
    { id: 'db-connector', name: 'Database Connector', description: 'Query configured databases', icon: 'Database', category: 'platform-tool' },
    { id: 'mcp-server', name: 'MCP Server', description: 'Connect to Model Context Protocol servers', icon: 'ServerCog', category: 'platform-tool' },
    { id: 'vector-rag', name: 'Vector RAG', description: 'Semantic search over vector knowledge bases', icon: 'Search', category: 'platform-tool' },
    { id: 'graph-rag', name: 'Graph RAG', description: 'Query graph-based knowledge sources', icon: 'Network', category: 'platform-tool' },
    { id: 'data-connector', name: 'Data Connector', description: 'Ingest data from external sources', icon: 'Plug', category: 'platform-tool' },
    { id: 'guardrails', name: 'Guardrails', description: 'Apply input/output safety guardrails', icon: 'ShieldCheck', category: 'platform-tool' },
    { id: 'message-broker', name: 'Message Broker', description: 'Publish/subscribe to message queues', icon: 'Radio', category: 'platform-tool' },
];
