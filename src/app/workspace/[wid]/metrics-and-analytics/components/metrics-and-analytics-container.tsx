'use client';
import React, { useRef, useState } from 'react';
import ActivityFeed from '@/components/molecules/activity-feed/activity-feed';
import DashboardDataCardList from '@/components/molecules/dashboard-card-list/dashboard-data-card-list';
import { useMetrics } from '@/hooks/use-metrics';
import { MetricsAndAnalyticsTableContainer } from './metrics-and-analytics-table-container';
import { useBreakpoint } from '@/hooks/use-breakpoints';
import { cn } from '@/lib/utils';
import { Button } from '@/components';
import AppDrawer from '@/components/molecules/drawer/app-drawer';
import { PlatformConfigurationSuiteSkeleton } from '@/components/organisms';

export const MetricsAndAnalyticsContainer = () => {
    const {
        isFetching,
        workspaceDataCardInfo,
        activityData,
        bottomRef,
        llmExecutions,
        onLLMExecutionFilter,
        slmExecutions,
        onSLMExecutionFilter,
        workflowExecutions,
        onWorkflowExecutionFilter,
        apiExecutions,
        onApiExecutionFilter,
    } = useMetrics();
    const { isLg, isMobile } = useBreakpoint();

    const metricPageRef = useRef<HTMLDivElement | null>(null);
    const [metricPageHeighInDrawer, setMetricPageHeighInDrawer] = useState<number | undefined>(undefined);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const handleClick = () => {
        setMetricPageHeighInDrawer(window.innerHeight - 141);
        setIsDrawerOpen(true);
    };

    if (isFetching) return <PlatformConfigurationSuiteSkeleton />;

    return (
        <React.Fragment>
            <div className="metric-page pb-4">
                <div className="flex justify-between gap-x-9">
                    <div
                        ref={metricPageRef}
                        className={cn('dashboard-left-section flex flex-col w-full', {
                            'gap-y-9': isLg,
                        })}
                    >
                        <DashboardDataCardList data={workspaceDataCardInfo} />
                        {/* This button will open recent activity drawer for small screens */}
                        <div className="w-full flex justify-end my-4">
                            <Button variant={'link'} size={'sm'} onClick={handleClick}>
                                Recent Activities
                            </Button>
                        </div>
                        <MetricsAndAnalyticsTableContainer
                            llmExecutions={llmExecutions}
                            slmExecutions={slmExecutions}
                            workflowExecutions={workflowExecutions}
                            onLLMExecutionFilter={onLLMExecutionFilter}
                            onSLMExecutionFilter={onSLMExecutionFilter}
                            onWorkflowExecutionFilter={onWorkflowExecutionFilter}
                            apiExecutions={apiExecutions}
                            onApiExecutionFilter={onApiExecutionFilter}
                        />
                    </div>
                </div>
            </div>
            {/* Recent activities will be shown in the below drawer on small screens */}
            <AppDrawer
                open={isDrawerOpen}
                direction={isMobile ? 'bottom' : 'right'}
                isPlainContentSheet
                setOpen={setIsDrawerOpen}
                footer={
                    <div className="flex justify-end">
                        <Button variant={'secondary'} size={'sm'} onClick={() => setIsDrawerOpen(false)}>
                            Cancel
                        </Button>
                    </div>
                }
                content={
                    <div className={cn('activity-feed-container')}>
                        <ActivityFeed
                            data={activityData}
                            bottomRef={bottomRef}
                            activityBodyHeight={metricPageHeighInDrawer}
                        />
                    </div>
                }
            />
        </React.Fragment>
    );
};
