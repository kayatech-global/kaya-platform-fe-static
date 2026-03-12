'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { TimeRangeFilter, EnterpriseInsightsData, WorkspaceFilterOption } from '../types/types';
import { generateMockData, getWorkspaceOptions } from '../data/mock-data';
import { EnterpriseInsightsHeader } from './enterprise-insights-header';
import { EnterpriseInsightsKPICards } from './enterprise-insights-kpi-cards';
import { WorkflowExecutionChart } from './workflow-execution-chart';
import { AgentExecutionChart } from './agent-execution-chart';
import { TokenUsageChart } from './token-usage-chart';
import { AnomalySummary } from './anomaly-summary';
import { ROIMetricsPanel } from './roi-metrics-panel';
import { EnterpriseInsightsSkeleton } from './enterprise-insights-skeleton';

export const EnterpriseInsightsContainer = () => {
    const [timeRange, setTimeRange] = useState<TimeRangeFilter>('7d');
    const [workspaceFilter, setWorkspaceFilter] = useState<string>('all');
    const [data, setData] = useState<EnterpriseInsightsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [sectionErrors, setSectionErrors] = useState<Record<string, boolean>>({});
    const [workspaceOptions, setWorkspaceOptions] = useState<WorkspaceFilterOption[]>([]);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockData = generateMockData(timeRange, workspaceFilter === 'all' ? undefined : workspaceFilter);
        setData(mockData);
        setWorkspaceOptions(getWorkspaceOptions());
        setIsLoading(false);
    }, [timeRange, workspaceFilter]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleTimeRangeChange = (newRange: TimeRangeFilter) => {
        setTimeRange(newRange);
    };

    const handleWorkspaceFilterChange = (workspaceId: string) => {
        setWorkspaceFilter(workspaceId);
    };

    const handleSectionRetry = (section: string) => {
        setSectionErrors(prev => ({ ...prev, [section]: false }));
        loadData();
    };

    if (isLoading || !data) {
        return <EnterpriseInsightsSkeleton />;
    }

    return (
        <div className="enterprise-insights-container pt-6 pb-8 px-8">
            <div className="max-w-[1800px] mx-auto flex flex-col gap-y-6">
                {/* Header with title and filters */}
                <EnterpriseInsightsHeader
                    timeRange={timeRange}
                    onTimeRangeChange={handleTimeRangeChange}
                    workspaceFilter={workspaceFilter}
                    onWorkspaceFilterChange={handleWorkspaceFilterChange}
                    workspaceOptions={workspaceOptions}
                />

                {/* KPI Summary Cards */}
                <EnterpriseInsightsKPICards kpis={data.kpis} timeRange={timeRange} />

                {/* Charts Grid - Workflow and Agent Execution */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <WorkflowExecutionChart
                        data={data.workflowExecutions}
                        topPerformers={data.topWorkflowsByVolume}
                        worstPerformers={data.worstWorkflowsByFailure}
                        isError={sectionErrors['workflow']}
                        onRetry={() => handleSectionRetry('workflow')}
                    />
                    <AgentExecutionChart
                        data={data.agentExecutions}
                        topPerformers={data.topAgentsByVolume}
                        worstPerformers={data.worstAgentsByFailure}
                        isError={sectionErrors['agent']}
                        onRetry={() => handleSectionRetry('agent')}
                    />
                </div>

                {/* Token Usage */}
                <TokenUsageChart
                    data={data.tokenUsage}
                    topConsumers={data.topTokenConsumers}
                    isError={sectionErrors['token']}
                    onRetry={() => handleSectionRetry('token')}
                />

                {/* Bottom Grid - Anomalies and ROI */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <AnomalySummary
                        anomalies={data.anomalies}
                        isError={sectionErrors['anomaly']}
                        onRetry={() => handleSectionRetry('anomaly')}
                    />
                    <ROIMetricsPanel
                        metrics={data.roiMetrics}
                        isError={sectionErrors['roi']}
                        onRetry={() => handleSectionRetry('roi')}
                    />
                </div>
            </div>
        </div>
    );
};
