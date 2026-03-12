'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/atoms/button';
import { cn } from '@/lib/utils';
import { TimeRangeFilter } from '../types/types';
import { Workflow, BarChart3, Plus } from 'lucide-react';

interface WorkspaceOverviewEmptyStateProps {
    type: 'no-workflows' | 'no-executions';
    timeRange?: TimeRangeFilter;
}

const getTimeRangeLabel = (timeRange?: TimeRangeFilter): string => {
    switch (timeRange) {
        case 'last24h':
            return 'the last 24 hours';
        case 'last7d':
            return 'the last 7 days';
        case 'last30d':
            return 'the last 30 days';
        default:
            return 'the selected period';
    }
};

export const WorkspaceOverviewEmptyState: React.FC<WorkspaceOverviewEmptyStateProps> = ({
    type,
    timeRange,
}) => {
    const params = useParams();
    const workspaceId = params.wid as string;

    if (type === 'no-workflows') {
        return (
            <div
                className={cn(
                    'flex flex-col items-center justify-center py-16 px-6',
                    'bg-[rgba(255,255,255,0.6)] rounded-lg backdrop-blur-[7px] border border-gray-200',
                    'dark:bg-[rgba(31,41,55,0.8)] dark:border-gray-700'
                )}
            >
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                    <Workflow size={32} className="text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    No workflows yet in this workspace
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-[400px] mb-6">
                    Create your first workflow to start automating tasks and see performance insights on this dashboard.
                </p>
                <Link href={`/workspace/${workspaceId}/workflows/workflow-authoring`}>
                    <Button variant="primary" leadingIcon={<Plus size={16} />}>
                        Create New Workflow
                    </Button>
                </Link>
            </div>
        );
    }

    // no-executions
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center py-12 px-6',
                'bg-[rgba(255,255,255,0.6)] rounded-lg backdrop-blur-[7px] border border-gray-200',
                'dark:bg-[rgba(31,41,55,0.8)] dark:border-gray-700'
            )}
        >
            <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4">
                <BarChart3 size={28} className="text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No workflow executions recorded
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-[400px] mb-4">
                No workflow executions were recorded in {getTimeRangeLabel(timeRange)}. Try selecting a longer time range or execute some workflows to see analytics.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
                Tip: Try a longer time range to see historical data
            </p>
        </div>
    );
};
