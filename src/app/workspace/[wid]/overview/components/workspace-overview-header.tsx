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
                className={cn('flex justify-between gap-4', {
                    'flex-col': isMobile,
                    'flex-row items-start': !isMobile,
                })}
            >
                <div className="flex flex-col gap-y-1 min-w-0 flex-1">
                    <h1 className="text-xl font-semibold text-foreground">
                        {workspaceName || 'Workspace'} Overview
                    </h1>
                    {workspaceDescription && (
                        <p className="text-sm text-muted-foreground max-w-2xl line-clamp-2">
                            {workspaceDescription}
                        </p>
                    )}
                </div>

                {/* Primary Actions */}
                <div className={cn('flex items-center gap-3 flex-shrink-0', { 'w-full': isMobile })}>
                    <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 transition-colors"
                        aria-label="Test Red Button"
                    >
                        Test Red Button
                    </button>

                    <div className={cn('flex-shrink-0', { 'w-full': isMobile, 'w-44': !isMobile })}>
                        <Select
                            options={selectOptions}
                            value={timeRange}
                            onChange={(e) => onTimeRangeChange(e.target.value as TimeRangeFilter)}
                            aria-label="Select time range"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
