'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useWorkspaceOverview } from '../hooks/use-workspace-overview';
import { WorkspaceOverviewSkeleton } from './workspace-overview-skeleton';
import { WorkspaceOverviewHeader } from './workspace-overview-header';
import { WorkspaceOverviewKPICards } from './workspace-overview-kpi-cards';
import { ExecutionTrendChart } from './execution-trend-chart';
import { TopWorkflowsChart } from './top-workflows-chart';
import { TokenUsageChart } from './token-usage-chart';
import { RecentlyModifiedWorkflows } from './recently-modified-workflows';
import { WorkspaceOverviewEmptyState } from './workspace-overview-empty-state';
import { TimeRangeFilter } from '../types/types';
import { cn } from '@/lib/utils';
import { useBreakpoint } from '@/hooks/use-breakpoints';

// Helper to get saved time range from session storage
const getSavedTimeRange = (workspaceId: string): TimeRangeFilter => {
    if (typeof window === 'undefined') return 'last7d';
    const saved = sessionStorage.getItem(`workspace-overview-timerange-${workspaceId}`);
    if (saved && ['last24h', 'last7d', 'last30d'].includes(saved)) {
        return saved as TimeRangeFilter;
    }
    return 'last7d'; // Default is last 7 days per requirements
};

export const WorkspaceOverviewContainer = () => {
    const params = useParams();
    const workspaceId = params.wid as string;
    const [timeRange, setTimeRange] = useState<TimeRangeFilter>('last7d');
    const [isInitialized, setIsInitialized] = useState(false);
    const { isMobile, isSm } = useBreakpoint();

    // Initialize time range from session storage on mount
    useEffect(() => {
        if (workspaceId && !isInitialized) {
            const savedRange = getSavedTimeRange(workspaceId);
            setTimeRange(savedRange);
            setIsInitialized(true);
        }
    }, [workspaceId, isInitialized]);

    // Save time range to session storage when it changes
    useEffect(() => {
        if (typeof window !== 'undefined' && workspaceId && isInitialized) {
            sessionStorage.setItem(`workspace-overview-timerange-${workspaceId}`, timeRange);
        }
    }, [timeRange, workspaceId, isInitialized]);

    const {
        isFetching,
        metrics,
        executionTrendData,
        topWorkflowsData,
        tokenUsageData,
        recentlyModifiedWorkflows,
        hasWorkflows,
        hasExecutions,
        workspaceName,
        workspaceDescription,
        permissions,
        refetch,
    } = useWorkspaceOverview(timeRange);

    const handleTimeRangeChange = (newRange: TimeRangeFilter) => {
        setTimeRange(newRange);
    };

    if (isFetching) {
        return <WorkspaceOverviewSkeleton />;
    }

    // Empty state when no workflows exist
    if (!hasWorkflows) {
        return (
            <div className="flex flex-col gap-y-6">
                <WorkspaceOverviewHeader
                    workspaceName={workspaceName}
                    workspaceDescription={workspaceDescription}
                    timeRange={timeRange}
                    onTimeRangeChange={handleTimeRangeChange}
                />
                <WorkspaceOverviewEmptyState type="no-workflows" />
            </div>
        );
    }

    return (
        <div className="workspace-overview-container pb-8">
            <div className="flex flex-col gap-y-6">
                {/* Header with breadcrumb and time filter */}
                <WorkspaceOverviewHeader
                    workspaceName={workspaceName}
                    workspaceDescription={workspaceDescription}
                    timeRange={timeRange}
                    onTimeRangeChange={handleTimeRangeChange}
                />

                {/* Summary KPI Cards */}
                <WorkspaceOverviewKPICards
                    metrics={metrics}
                    permissions={permissions}
                    timeRange={timeRange}
                />

                {/* Charts Section */}
                {hasExecutions ? (
                    <>
                        {/* Execution Trend and Top Workflows Row */}
                        <div
                            className={cn('grid gap-6', {
                                'grid-cols-1': isMobile || isSm,
                                'grid-cols-2': !isMobile && !isSm,
                            })}
                        >
                            <ExecutionTrendChart data={executionTrendData} />
                            <TopWorkflowsChart data={topWorkflowsData} />
                        </div>

                        {/* Token Usage Chart */}
                        <TokenUsageChart
                            data={tokenUsageData}
                            canViewTokenUsage={permissions.canViewTokenUsage}
                        />
                    </>
                ) : (
                    <WorkspaceOverviewEmptyState type="no-executions" timeRange={timeRange} />
                )}

                {/* Recently Modified Workflows Tile Grid */}
                <RecentlyModifiedWorkflows
                    workflows={recentlyModifiedWorkflows}
                    timeRange={timeRange}
                    canViewTokenUsage={permissions.canViewTokenUsage}
                />
            </div>
        </div>
    );
};
