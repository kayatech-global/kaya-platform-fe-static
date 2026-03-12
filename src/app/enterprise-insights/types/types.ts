export type TimeRangeFilter = '24h' | '7d' | '30d' | '90d' | 'custom';

export interface AnomalySeverity {
    level: 'critical' | 'high' | 'medium' | 'low';
    color: string;
}

export interface Anomaly {
    id: string;
    severity: AnomalySeverity['level'];
    resource: string;
    resourceType: 'workflow' | 'agent' | 'workspace';
    description: string;
    timestamp: Date;
    workspaceId?: string;
    workspaceName?: string;
}

export interface KPIMetric {
    value: number | string;
    trend: number;
    trendDirection: 'up' | 'down' | 'neutral';
    previousValue?: number | string;
}

export interface PlatformKPIs {
    totalWorkspaces: KPIMetric;
    totalWorkflows: KPIMetric;
    totalAgents: KPIMetric;
    totalExecutions: KPIMetric;
    successRate: KPIMetric;
    totalTokens: KPIMetric;
    anomaliesDetected: KPIMetric;
    platformHealthScore: KPIMetric;
}

export interface WorkflowExecutionData {
    date: string;
    success: number;
    failure: number;
    total: number;
}

export interface AgentExecutionData {
    date: string;
    success: number;
    failure: number;
    total: number;
}

export interface TokenUsageData {
    date: string;
    tokens: number;
}

export interface TopPerformer {
    id: string;
    name: string;
    workspaceId: string;
    workspaceName: string;
    count: number;
    successRate?: number;
    failureRate?: number;
}

export interface ROIMetrics {
    automationEfficiency: number;
    costPerExecution: number;
    platformAdoptionGrowth: number;
    roiScore: number;
    timesSaved: number;
    costSavings: number;
}

export interface EnterpriseInsightsData {
    kpis: PlatformKPIs;
    workflowExecutions: WorkflowExecutionData[];
    agentExecutions: AgentExecutionData[];
    tokenUsage: TokenUsageData[];
    topWorkflowsByVolume: TopPerformer[];
    worstWorkflowsByFailure: TopPerformer[];
    topAgentsByVolume: TopPerformer[];
    worstAgentsByFailure: TopPerformer[];
    topTokenConsumers: TopPerformer[];
    anomalies: Anomaly[];
    roiMetrics: ROIMetrics;
}

export interface WorkspaceFilterOption {
    id: string;
    name: string;
}
