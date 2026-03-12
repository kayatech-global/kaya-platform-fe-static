'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery } from 'react-query';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context';
import { $fetch } from '@/utils';
import moment from 'moment';
import {
    TimeRangeFilter,
    WorkspaceOverviewMetrics,
    ExecutionTrendDataPoint,
    TopWorkflowByExecution,
    TokenUsageByWorkflow,
    RecentlyModifiedWorkflow,
    WorkspaceOverviewPermissions,
    HealthIndexLevel,
} from '../types/types';

// Helper function to get date range based on filter
const getDateRange = (timeRange: TimeRangeFilter): { from: string; to: string } => {
    const now = moment();
    let from: moment.Moment;

    switch (timeRange) {
        case 'last24h':
            from = moment().subtract(24, 'hours');
            break;
        case 'last7d':
            from = moment().subtract(7, 'days');
            break;
        case 'last30d':
        default:
            from = moment().subtract(30, 'days');
            break;
    }

    return {
        from: from.format('YYYY-MM-DDTHH:mm:ss.sss'),
        to: now.format('YYYY-MM-DDTHH:mm:ss.sss'),
    };
};

// Helper function to get previous period date range for trend comparison
const getPreviousPeriodRange = (timeRange: TimeRangeFilter): { from: string; to: string } => {
    let periodDays: number;

    switch (timeRange) {
        case 'last24h':
            periodDays = 1;
            break;
        case 'last7d':
            periodDays = 7;
            break;
        case 'last30d':
        default:
            periodDays = 30;
            break;
    }

    const from = moment().subtract(periodDays * 2, 'days');
    const to = moment().subtract(periodDays, 'days');

    return {
        from: from.format('YYYY-MM-DDTHH:mm:ss.sss'),
        to: to.format('YYYY-MM-DDTHH:mm:ss.sss'),
    };
};

// Mock data generator for development
const generateMockData = (
    timeRange: TimeRangeFilter,
    workspaceId: string
): {
    metrics: WorkspaceOverviewMetrics;
    executionTrend: ExecutionTrendDataPoint[];
    topWorkflows: TopWorkflowByExecution[];
    tokenUsage: TokenUsageByWorkflow[];
    recentWorkflows: RecentlyModifiedWorkflow[];
    workspaceName: string;
    workspaceDescription: string;
} => {
    // Generate execution trend data
    const days = timeRange === 'last24h' ? 24 : timeRange === 'last7d' ? 7 : 30;
    const executionTrend: ExecutionTrendDataPoint[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
        const date = timeRange === 'last24h' 
            ? moment().subtract(i, 'hours').format('YYYY-MM-DDTHH:00:00')
            : moment().subtract(i, 'days').format('YYYY-MM-DD');
        executionTrend.push({
            date,
            executions: Math.floor(Math.random() * 500) + 50,
        });
    }

    // Generate top workflows data
    const workflowNames = [
        'Claims Processing Workflow',
        'Customer Support Bot',
        'Invoice Processing',
        'Email Classification',
        'Document Extraction',
        'Sentiment Analysis Pipeline',
        'Lead Scoring Agent',
        'Data Enrichment Flow',
        'Report Generator',
        'Compliance Checker',
    ];

    const topWorkflows: TopWorkflowByExecution[] = workflowNames.map((name, index) => ({
        workflowId: `wf-${index + 1}`,
        workflowName: name,
        executionCount: Math.floor(Math.random() * 2000) + 100,
        lastExecutedAt: moment().subtract(Math.floor(Math.random() * 24), 'hours').toISOString(),
    })).sort((a, b) => b.executionCount - a.executionCount);

    // Generate token usage data
    const tokenUsage: TokenUsageByWorkflow[] = workflowNames.map((name, index) => ({
        workflowId: `wf-${index + 1}`,
        workflowName: name,
        totalTokens: Math.floor(Math.random() * 500000) + 10000,
        averageTokensPerExecution: Math.floor(Math.random() * 5000) + 500,
    })).sort((a, b) => b.totalTokens - a.totalTokens);

    // Generate recently modified workflows
    const statuses: ('Draft' | 'Published')[] = ['Draft', 'Published'];
    const recentWorkflows: RecentlyModifiedWorkflow[] = workflowNames.slice(0, 6).map((name, index) => ({
        id: `wf-${index + 1}`,
        name,
        description: `This workflow handles ${name.toLowerCase()} tasks automatically using AI agents and integrations.`,
        status: statuses[Math.floor(Math.random() * 2)],
        lastModifiedAt: moment().subtract(index * 2 + Math.floor(Math.random() * 5), 'hours').toISOString(),
        totalExecutions: Math.floor(Math.random() * 1000) + 50,
        successRate: Math.random() * 20 + 80,
        totalTokens: Math.floor(Math.random() * 100000) + 5000,
    }));

    // Calculate metrics
    const totalExecutions = executionTrend.reduce((sum, point) => sum + point.executions, 0);
    const successRate = Math.random() * 15 + 85;
    const activeWorkflows = Math.floor(workflowNames.length * 0.8); // ~80% are published/active
    
    // Calculate health index score based on success rate, activity level, and efficiency
    const healthIndexScore = Math.floor(
        (successRate * 0.5) + // 50% weight on success rate
        (Math.min(totalExecutions / 100, 30) * 0.3) + // 30% weight on activity (capped at 30)
        (Math.random() * 20) // 20% other factors
    );
    
    // Determine health index level
    let healthIndex: HealthIndexLevel = 'Low';
    if (healthIndexScore >= 80) healthIndex = 'High';
    else if (healthIndexScore >= 50) healthIndex = 'Medium';

    const metrics: WorkspaceOverviewMetrics = {
        totalWorkflows: workflowNames.length,
        activeWorkflows,
        totalExecutions,
        successRate,
        totalTokens: tokenUsage.reduce((sum, wf) => sum + wf.totalTokens, 0),
        failedExecutions: Math.floor(totalExecutions * (Math.random() * 0.1 + 0.02)),
        healthIndex,
        healthIndexScore,
        trendComparedToPrevious: {
            executions: Math.floor(Math.random() * 200) - 100,
            successRate: Math.random() * 10 - 5,
            tokens: Math.floor(Math.random() * 50000) - 25000,
            failedExecutions: Math.floor(Math.random() * 50) - 25,
        },
    };

    return {
        metrics,
        executionTrend,
        topWorkflows,
        tokenUsage,
        recentWorkflows,
        workspaceName: 'Claims Operations',
        workspaceDescription: 'Automated claims processing and customer support workflows for the insurance division.',
    };
};

// API fetch function (with mock data fallback for development)
const fetchWorkspaceOverview = async (
    workspaceId: string,
    timeRange: TimeRangeFilter
): Promise<{
    metrics: WorkspaceOverviewMetrics;
    executionTrend: ExecutionTrendDataPoint[];
    topWorkflows: TopWorkflowByExecution[];
    tokenUsage: TokenUsageByWorkflow[];
    recentWorkflows: RecentlyModifiedWorkflow[];
    workspaceName: string;
    workspaceDescription: string;
}> => {
    const { from, to } = getDateRange(timeRange);

    try {
        // Try to fetch real data from API
        const response = await $fetch<{
            metrics: WorkspaceOverviewMetrics;
            executionTrend: ExecutionTrendDataPoint[];
            topWorkflowsByExecution: TopWorkflowByExecution[];
            tokenUsageByWorkflow: TokenUsageByWorkflow[];
            recentlyModifiedWorkflows: RecentlyModifiedWorkflow[];
            workspaceName: string;
            workspaceDescription: string;
        }>(`/workspaces/${workspaceId}/overview`, {
            method: 'POST',
            body: JSON.stringify({ from, to, timeRange }),
            headers: {
                'x-workspace-id': workspaceId,
            },
        });

        if (response?.data) {
            return {
                metrics: response.data.metrics,
                executionTrend: response.data.executionTrend,
                topWorkflows: response.data.topWorkflowsByExecution,
                tokenUsage: response.data.tokenUsageByWorkflow,
                recentWorkflows: response.data.recentlyModifiedWorkflows,
                workspaceName: response.data.workspaceName,
                workspaceDescription: response.data.workspaceDescription,
            };
        }

        // Fallback to mock data if API returns no data
        return generateMockData(timeRange, workspaceId);
    } catch (error) {
        // Use mock data for development when API is not available
        console.warn('[WorkspaceOverview] API not available, using mock data');
        return generateMockData(timeRange, workspaceId);
    }
};

export const useWorkspaceOverview = (timeRange: TimeRangeFilter) => {
    const params = useParams();
    const workspaceId = params.wid as string;
    const { token, user } = useAuth();

    // Default empty metrics
    const defaultMetrics: WorkspaceOverviewMetrics = {
        totalWorkflows: 0,
        activeWorkflows: 0,
        totalExecutions: 0,
        successRate: 0,
        totalTokens: 0,
        failedExecutions: 0,
        healthIndex: 'Low',
        healthIndexScore: 0,
        trendComparedToPrevious: {
            executions: 0,
            successRate: 0,
            tokens: 0,
            failedExecutions: 0,
        },
    };

    // Default permissions (can be enhanced based on user role)
    const [permissions] = useState<WorkspaceOverviewPermissions>({
        canViewTokenUsage: true, // Default to true, can be set based on user role
        canViewCostMetrics: true,
    });

    // Query key includes timeRange to refetch when filter changes
    const queryKey = ['workspace-overview', workspaceId, timeRange];

    const {
        data,
        isFetching,
        refetch,
    } = useQuery(
        queryKey,
        () => fetchWorkspaceOverview(workspaceId, timeRange),
        {
            enabled: !!token && !!workspaceId,
            refetchOnWindowFocus: false,
            staleTime: 5 * 60 * 1000, // 5 minutes
            keepPreviousData: true,
        }
    );



    const hasWorkflows = useMemo(() => {
        return (data?.metrics.totalWorkflows ?? 0) > 0;
    }, [data?.metrics.totalWorkflows]);

    const hasExecutions = useMemo(() => {
        return (data?.metrics.totalExecutions ?? 0) > 0;
    }, [data?.metrics.totalExecutions]);

    return {
        isFetching,
        metrics: data?.metrics ?? defaultMetrics,
        executionTrendData: data?.executionTrend ?? [],
        topWorkflowsData: data?.topWorkflows ?? [],
        tokenUsageData: data?.tokenUsage ?? [],
        recentlyModifiedWorkflows: data?.recentWorkflows ?? [],
        hasWorkflows,
        hasExecutions,
        workspaceName: data?.workspaceName ?? 'Workspace',
        workspaceDescription: data?.workspaceDescription ?? '',
        permissions,
        refetch,
    };
};
