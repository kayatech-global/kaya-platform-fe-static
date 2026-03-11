'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/atoms/breadcrumb';
import { Select, OptionModel } from '@/components/atoms/select';
import { TimeRangeFilter, TimeRangeOption } from '../types/types';
import { cn } from '@/lib/utils';
import { useBreakpoint } from '@/hooks/use-breakpoints';

interface WorkspaceOverviewHeaderProps {
    workspaceName: string;
    workspaceDescription?: string;
    timeRange: TimeRangeFilter;
    onTimeRangeChange: (range: TimeRangeFilter) => void;
}

const TIME_RANGE_OPTIONS: TimeRangeOption[] = [
    { label: 'Last 24 hours', value: 'last24h' },
    { label: 'Last 7 days', value: 'last7d' },
    { label: 'Last 30 days', value: 'last30d' },
];

export const WorkspaceOverviewHeader: React.FC<WorkspaceOverviewHeaderProps> = ({
    workspaceName,
    workspaceDescription,
    timeRange,
    onTimeRangeChange,
}) => {
    const params = useParams();
    const { isMobile } = useBreakpoint();
    const workspaceId = params.wid as string;

    const selectOptions: OptionModel[] = TIME_RANGE_OPTIONS.map((option) => ({
        name: option.label,
        value: option.value,
    }));

    return (
        <div className="workspace-overview-header flex flex-col gap-y-4">
            {/* Breadcrumb Navigation */}
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/workspaces">All Workspaces</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href={`/workspace/${workspaceId}`}>{workspaceName || 'Workspace'}</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Overview</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Header Row with Title and Filter */}
            <div
                className={cn('flex items-start justify-between', {
                    'flex-col gap-y-4': isMobile,
                    'flex-row items-center': !isMobile,
                })}
            >
                <div className="flex flex-col gap-y-1">
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        {workspaceName || 'Workspace'} Overview
                    </h1>
                    {workspaceDescription && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-[600px] line-clamp-2">
                            {workspaceDescription}
                        </p>
                    )}
                </div>

                {/* Time Range Filter */}
                <div className={cn('flex-shrink-0', { 'w-full': isMobile, 'w-[180px]': !isMobile })}>
                    <Select
                        options={selectOptions}
                        value={timeRange}
                        onChange={(e) => onTimeRangeChange(e.target.value as TimeRangeFilter)}
                        aria-label="Select time range"
                    />
                </div>
            </div>
        </div>
    );
};
