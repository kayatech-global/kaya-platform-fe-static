export type StandaloneAgentStatus = 'running' | 'stopped' | 'deploying' | 'error' | 'pending';
export type AgentFramework = 'PI Agents' | 'OpenClaw';

export interface StandaloneAgent {
    id: string;
    name: string;
    description: string;
    framework: AgentFramework;
    status: StandaloneAgentStatus;
    version: string;
    createdAt: string;
    updatedAt: string;
    sessionMode: 'single' | 'per-workflow' | 'per-execution';
    cluster: string;
    namespace: string;
    replicas: number;
    cpuUsage: number; // percentage
    memoryUsage: number; // percentage
    totalSessions: number;
    activeSessions: number;
    avgResponseTimeMs: number;
    errorRate: number; // percentage
    tags: string[];
    intelligenceSource: string;
}

export const MOCK_STANDALONE_AGENTS: StandaloneAgent[] = [
    {
        id: 'sa-001',
        name: 'Customer Support Bot',
        description: 'Handles tier-1 customer support queries with contextual memory and escalation logic.',
        framework: 'PI Agents',
        status: 'running',
        version: '2.4.1',
        createdAt: '2025-11-10T08:00:00Z',
        updatedAt: '2026-03-17T14:22:00Z',
        sessionMode: 'per-workflow',
        cluster: 'prod-k8s-01',
        namespace: 'agents',
        replicas: 3,
        cpuUsage: 42,
        memoryUsage: 61,
        totalSessions: 18420,
        activeSessions: 14,
        avgResponseTimeMs: 312,
        errorRate: 0.8,
        tags: ['support', 'production'],
        intelligenceSource: 'GPT-4o',
    },
    {
        id: 'sa-002',
        name: 'Data Analysis Agent',
        description: 'Processes structured datasets, generates insights, and creates visual summaries.',
        framework: 'OpenClaw',
        status: 'running',
        version: '1.1.0',
        createdAt: '2026-01-05T09:30:00Z',
        updatedAt: '2026-03-18T11:05:00Z',
        sessionMode: 'per-execution',
        cluster: 'prod-k8s-01',
        namespace: 'analytics',
        replicas: 2,
        cpuUsage: 68,
        memoryUsage: 74,
        totalSessions: 4201,
        activeSessions: 3,
        avgResponseTimeMs: 1840,
        errorRate: 2.1,
        tags: ['analytics', 'production'],
        intelligenceSource: 'Claude 3.5 Sonnet',
    },
    {
        id: 'sa-003',
        name: 'Legal Doc Reviewer',
        description: 'Reviews contract documents for compliance, risks, and missing clauses.',
        framework: 'PI Agents',
        status: 'stopped',
        version: '1.0.3',
        createdAt: '2025-12-20T13:00:00Z',
        updatedAt: '2026-02-14T09:00:00Z',
        sessionMode: 'single',
        cluster: 'staging-k8s-01',
        namespace: 'legal',
        replicas: 0,
        cpuUsage: 0,
        memoryUsage: 0,
        totalSessions: 882,
        activeSessions: 0,
        avgResponseTimeMs: 2100,
        errorRate: 0.3,
        tags: ['legal', 'staging'],
        intelligenceSource: 'GPT-4o',
    },
    {
        id: 'sa-004',
        name: 'HR Onboarding Assistant',
        description: 'Guides new employees through onboarding documents, FAQs, and policy acknowledgements.',
        framework: 'PI Agents',
        status: 'deploying',
        version: '3.0.0',
        createdAt: '2026-03-01T10:00:00Z',
        updatedAt: '2026-03-19T07:45:00Z',
        sessionMode: 'per-workflow',
        cluster: 'prod-k8s-01',
        namespace: 'hr',
        replicas: 2,
        cpuUsage: 12,
        memoryUsage: 28,
        totalSessions: 0,
        activeSessions: 0,
        avgResponseTimeMs: 0,
        errorRate: 0,
        tags: ['hr', 'production'],
        intelligenceSource: 'Gemini 1.5 Pro',
    },
    {
        id: 'sa-005',
        name: 'Code Review Agent',
        description: 'Performs automated static code analysis, suggests refactors, and checks for security vulnerabilities.',
        framework: 'OpenClaw',
        status: 'error',
        version: '2.0.1',
        createdAt: '2025-10-18T12:00:00Z',
        updatedAt: '2026-03-16T16:30:00Z',
        sessionMode: 'per-execution',
        cluster: 'dev-k8s-01',
        namespace: 'devtools',
        replicas: 1,
        cpuUsage: 98,
        memoryUsage: 92,
        totalSessions: 7600,
        activeSessions: 1,
        avgResponseTimeMs: 5400,
        errorRate: 18.5,
        tags: ['devtools', 'dev'],
        intelligenceSource: 'GPT-4o',
    },
    {
        id: 'sa-006',
        name: 'Sales Intelligence Bot',
        description: 'Enriches CRM data, scores leads, and suggests next best actions for sales reps.',
        framework: 'PI Agents',
        status: 'running',
        version: '1.7.2',
        createdAt: '2025-09-01T07:00:00Z',
        updatedAt: '2026-03-18T18:00:00Z',
        sessionMode: 'per-workflow',
        cluster: 'prod-k8s-02',
        namespace: 'sales',
        replicas: 4,
        cpuUsage: 35,
        memoryUsage: 52,
        totalSessions: 31000,
        activeSessions: 28,
        avgResponseTimeMs: 280,
        errorRate: 0.4,
        tags: ['sales', 'production', 'crm'],
        intelligenceSource: 'Claude 3.5 Sonnet',
    },
];
