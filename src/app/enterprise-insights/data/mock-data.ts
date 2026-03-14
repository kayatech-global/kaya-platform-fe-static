import {
    EnterpriseInsightsData,
    WorkflowExecutionData,
    AgentExecutionData,
    TokenUsageData,
    TopPerformer,
    Anomaly,
    TimeRangeFilter,
    WorkspaceFilterOption,
} from '../types/types';

const workspaces: WorkspaceFilterOption[] = [
    { id: 'ws-1', name: 'Production Workspace' },
    { id: 'ws-2', name: 'Development Workspace' },
    { id: 'ws-3', name: 'Customer Support AI' },
    { id: 'ws-4', name: 'Sales Automation' },
    { id: 'ws-5', name: 'HR Operations' },
];

export const getWorkspaceOptions = (): WorkspaceFilterOption[] => workspaces;

const generateDateRange = (timeRange: TimeRangeFilter): string[] => {
    const dates: string[] = [];
    const now = new Date();
    let days: number;

    switch (timeRange) {
        case '24h':
            days = 1;
            for (let i = 23; i >= 0; i--) {
                const date = new Date(now);
                date.setHours(date.getHours() - i);
                dates.push(date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
            }
            return dates;
        case '7d':
            days = 7;
            break;
        case '30d':
            days = 30;
            break;
        case '90d':
            days = 90;
            break;
        default:
            days = 7;
    }

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }

    return dates;
};

const generateWorkflowExecutions = (timeRange: TimeRangeFilter): WorkflowExecutionData[] => {
    const dates = generateDateRange(timeRange);
    return dates.map(date => {
        const total = Math.floor(Math.random() * 2000) + 500;
        const successRate = 0.85 + Math.random() * 0.12;
        const success = Math.floor(total * successRate);
        const failure = total - success;
        return { date, success, failure, total };
    });
};

const generateAgentExecutions = (timeRange: TimeRangeFilter): AgentExecutionData[] => {
    const dates = generateDateRange(timeRange);
    return dates.map(date => {
        const total = Math.floor(Math.random() * 1500) + 300;
        const successRate = 0.88 + Math.random() * 0.1;
        const success = Math.floor(total * successRate);
        const failure = total - success;
        return { date, success, failure, total };
    });
};

const generateTokenUsage = (timeRange: TimeRangeFilter): TokenUsageData[] => {
    const dates = generateDateRange(timeRange);
    return dates.map(date => ({
        date,
        tokens: Math.floor(Math.random() * 5000000) + 1000000,
    }));
};

const generateTopWorkflows = (): TopPerformer[] => [
    { id: 'wf-1', name: 'Customer Inquiry Handler', workspaceId: 'ws-3', workspaceName: 'Customer Support AI', count: 45234, successRate: 97.2 },
    { id: 'wf-2', name: 'Lead Qualification Bot', workspaceId: 'ws-4', workspaceName: 'Sales Automation', count: 32156, successRate: 94.8 },
    { id: 'wf-3', name: 'Document Processor', workspaceId: 'ws-1', workspaceName: 'Production Workspace', count: 28943, successRate: 99.1 },
    { id: 'wf-4', name: 'Email Responder', workspaceId: 'ws-3', workspaceName: 'Customer Support AI', count: 21567, successRate: 92.3 },
    { id: 'wf-5', name: 'Data Enrichment Pipeline', workspaceId: 'ws-4', workspaceName: 'Sales Automation', count: 18234, successRate: 96.7 },
];

const generateWorstWorkflows = (): TopPerformer[] => [
    { id: 'wf-10', name: 'Legacy Integration Handler', workspaceId: 'ws-2', workspaceName: 'Development Workspace', count: 1234, failureRate: 23.4 },
    { id: 'wf-11', name: 'External API Connector', workspaceId: 'ws-1', workspaceName: 'Production Workspace', count: 2341, failureRate: 18.7 },
    { id: 'wf-12', name: 'Batch Processing Job', workspaceId: 'ws-5', workspaceName: 'HR Operations', count: 567, failureRate: 15.2 },
    { id: 'wf-13', name: 'Report Generator', workspaceId: 'ws-4', workspaceName: 'Sales Automation', count: 891, failureRate: 12.8 },
    { id: 'wf-14', name: 'Notification Dispatcher', workspaceId: 'ws-3', workspaceName: 'Customer Support AI', count: 3456, failureRate: 9.4 },
];

const generateTopAgents = (): TopPerformer[] => [
    { id: 'ag-1', name: 'Support Assistant', workspaceId: 'ws-3', workspaceName: 'Customer Support AI', count: 67890, successRate: 96.5 },
    { id: 'ag-2', name: 'Sales Rep Bot', workspaceId: 'ws-4', workspaceName: 'Sales Automation', count: 45678, successRate: 93.2 },
    { id: 'ag-3', name: 'Document Analyst', workspaceId: 'ws-1', workspaceName: 'Production Workspace', count: 34567, successRate: 98.1 },
    { id: 'ag-4', name: 'HR Assistant', workspaceId: 'ws-5', workspaceName: 'HR Operations', count: 23456, successRate: 91.7 },
    { id: 'ag-5', name: 'Code Reviewer', workspaceId: 'ws-2', workspaceName: 'Development Workspace', count: 12345, successRate: 94.9 },
];

const generateWorstAgents = (): TopPerformer[] => [
    { id: 'ag-10', name: 'Legacy Data Migrator', workspaceId: 'ws-2', workspaceName: 'Development Workspace', count: 456, failureRate: 28.3 },
    { id: 'ag-11', name: 'API Tester Bot', workspaceId: 'ws-2', workspaceName: 'Development Workspace', count: 789, failureRate: 21.6 },
    { id: 'ag-12', name: 'Translation Agent', workspaceId: 'ws-3', workspaceName: 'Customer Support AI', count: 1234, failureRate: 16.8 },
    { id: 'ag-13', name: 'Compliance Checker', workspaceId: 'ws-5', workspaceName: 'HR Operations', count: 567, failureRate: 14.2 },
    { id: 'ag-14', name: 'Budget Analyzer', workspaceId: 'ws-4', workspaceName: 'Sales Automation', count: 890, failureRate: 11.5 },
];

const generateTopTokenConsumers = (): TopPerformer[] => [
    { id: 'tc-1', name: 'Document Processor', workspaceId: 'ws-1', workspaceName: 'Production Workspace', count: 12500000 },
    { id: 'tc-2', name: 'Support Assistant', workspaceId: 'ws-3', workspaceName: 'Customer Support AI', count: 8900000 },
    { id: 'tc-3', name: 'Code Reviewer', workspaceId: 'ws-2', workspaceName: 'Development Workspace', count: 6700000 },
    { id: 'tc-4', name: 'Sales Rep Bot', workspaceId: 'ws-4', workspaceName: 'Sales Automation', count: 5400000 },
    { id: 'tc-5', name: 'HR Assistant', workspaceId: 'ws-5', workspaceName: 'HR Operations', count: 3200000 },
];

const generateAnomalies = (): Anomaly[] => [
    {
        id: 'an-1',
        severity: 'critical',
        resource: 'Legacy Integration Handler',
        resourceType: 'workflow',
        description: 'Failure rate exceeded 20% threshold - currently at 23.4%',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        workspaceId: 'ws-2',
        workspaceName: 'Development Workspace',
    },
    {
        id: 'an-2',
        severity: 'high',
        resource: 'Customer Support AI',
        resourceType: 'workspace',
        description: 'Token consumption spike detected - 340% above normal',
        timestamp: new Date(Date.now() - 1000 * 60 * 45),
        workspaceId: 'ws-3',
        workspaceName: 'Customer Support AI',
    },
    {
        id: 'an-3',
        severity: 'medium',
        resource: 'Legacy Data Migrator',
        resourceType: 'agent',
        description: 'Response latency increased by 180% in the last hour',
        timestamp: new Date(Date.now() - 1000 * 60 * 90),
        workspaceId: 'ws-2',
        workspaceName: 'Development Workspace',
    },
    {
        id: 'an-4',
        severity: 'low',
        resource: 'Batch Processing Job',
        resourceType: 'workflow',
        description: 'Execution time variance above normal parameters',
        timestamp: new Date(Date.now() - 1000 * 60 * 180),
        workspaceId: 'ws-5',
        workspaceName: 'HR Operations',
    },
    {
        id: 'an-5',
        severity: 'high',
        resource: 'External API Connector',
        resourceType: 'workflow',
        description: 'Third-party API timeout errors increasing - 18.7% failure rate',
        timestamp: new Date(Date.now() - 1000 * 60 * 240),
        workspaceId: 'ws-1',
        workspaceName: 'Production Workspace',
    },
];

export const generateMockData = (
    timeRange: TimeRangeFilter,
    _workspaceFilter?: string
): EnterpriseInsightsData => {
    const totalExecutions = 156782;
    const successfulExecutions = Math.floor(totalExecutions * 0.943);

    return {
        kpis: {
            totalWorkspaces: {
                value: 24,
                trend: 8.3,
                trendDirection: 'up',
                previousValue: 22,
            },
            totalWorkflows: {
                value: 187,
                trend: 12.5,
                trendDirection: 'up',
                previousValue: 166,
            },
            totalAgents: {
                value: 89,
                trend: 15.6,
                trendDirection: 'up',
                previousValue: 77,
            },
            totalExecutions: {
                value: totalExecutions,
                trend: 23.4,
                trendDirection: 'up',
                previousValue: 127043,
            },
            successRate: {
                value: 94.3,
                trend: 1.2,
                trendDirection: 'up',
                previousValue: 93.1,
            },
            totalTokens: {
                value: 47800000,
                trend: 18.9,
                trendDirection: 'up',
                previousValue: 40200000,
            },
            anomaliesDetected: {
                value: 5,
                trend: -16.7,
                trendDirection: 'down',
                previousValue: 6,
            },
            platformHealthScore: {
                value: 92,
                trend: 3.4,
                trendDirection: 'up',
                previousValue: 89,
            },
        },
        workflowExecutions: generateWorkflowExecutions(timeRange),
        agentExecutions: generateAgentExecutions(timeRange),
        tokenUsage: generateTokenUsage(timeRange),
        topWorkflowsByVolume: generateTopWorkflows(),
        worstWorkflowsByFailure: generateWorstWorkflows(),
        topAgentsByVolume: generateTopAgents(),
        worstAgentsByFailure: generateWorstAgents(),
        topTokenConsumers: generateTopTokenConsumers(),
        anomalies: generateAnomalies(),
        roiMetrics: {
            automationEfficiency: 87.4,
            costPerExecution: 0.0023,
            platformAdoptionGrowth: 34.2,
            roiScore: 4.7,
            timesSaved: 12450,
            costSavings: 89500,
        },
    };
};
