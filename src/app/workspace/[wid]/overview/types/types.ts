import { ChartConfig } from '@/components/atoms/chart';

// Time range filter options
export type TimeRangeFilter = 'last24h' | 'last7d' | 'last30d';

export interface TimeRangeOption {
    label: string;
    value: TimeRangeFilter;
}

// Workflow status
export type WorkflowStatus = 'Draft' | 'Published';

// ROI/Health Index values
export type HealthIndexLevel = 'High' | 'Medium' | 'Low';

// Summary KPI data
export interface WorkspaceOverviewMetrics {
    totalWorkflows: number;
    activeWorkflows: number;
    totalExecutions: number;
    successRate: number;
    totalTokens: number;
    failedExecutions: number;
    healthIndex: HealthIndexLevel;
    healthIndexScore: number; // 0-100 score
    trendComparedToPrevious: {
        executions: number;
        successRate: number;
        tokens: number;
        failedExecutions: number;
    };
}

// Execution trend data point
export interface ExecutionTrendDataPoint {
    date: string;
    executions: number;
}

// Top workflow by executions
export interface TopWorkflowByExecution {
    workflowId: string;
    workflowName: string;
    executionCount: number;
    lastExecutedAt: string;
}

// Token usage by workflow
export interface TokenUsageByWorkflow {
    workflowId: string;
    workflowName: string;
    totalTokens: number;
    averageTokensPerExecution: number;
}

// Recently modified workflow tile
export interface RecentlyModifiedWorkflow {
    id: string;
    name: string;
    description: string;
    status: WorkflowStatus;
    lastModifiedAt: string;
    totalExecutions: number;
    successRate: number;
    totalTokens: number;
}

// Chart data structures
export interface ExecutionTrendChartData {
    data: ExecutionTrendDataPoint[];
    config: ChartConfig;
}

export interface TopWorkflowsChartData {
    data: TopWorkflowByExecution[];
    config: ChartConfig;
}

export interface TokenUsageChartData {
    data: TokenUsageByWorkflow[];
    config: ChartConfig;
}

// API Response interfaces
export interface WorkspaceOverviewResponse {
    metrics: WorkspaceOverviewMetrics;
    executionTrend: ExecutionTrendDataPoint[];
    topWorkflowsByExecution: TopWorkflowByExecution[];
    tokenUsageByWorkflow: TokenUsageByWorkflow[];
    recentlyModifiedWorkflows: RecentlyModifiedWorkflow[];
}

// Permission context
export interface WorkspaceOverviewPermissions {
    canViewTokenUsage: boolean;
    canViewCostMetrics: boolean;
}
