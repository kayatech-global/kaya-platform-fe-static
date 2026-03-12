'use client';

import React from 'react';
import { TimeRangeFilter, WorkspaceFilterOption } from '../types/types';
import { cn } from '@/lib/utils';
import { Activity, Building2, ChevronDown } from 'lucide-react';

interface EnterpriseInsightsHeaderProps {
    timeRange: TimeRangeFilter;
    onTimeRangeChange: (range: TimeRangeFilter) => void;
    workspaceFilter: string;
    onWorkspaceFilterChange: (workspaceId: string) => void;
    workspaceOptions: WorkspaceFilterOption[];
}

const timeRangeOptions: { value: TimeRangeFilter; label: string }[] = [
    { value: '24h', label: '24 Hours' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
];

export const EnterpriseInsightsHeader: React.FC<EnterpriseInsightsHeaderProps> = ({
    timeRange,
    onTimeRangeChange,
    workspaceFilter,
    onWorkspaceFilterChange,
    workspaceOptions,
}) => {
    return (
        <div className="flex flex-col gap-y-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Title and description */}
            <div className="flex items-center gap-x-3">
                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                    <Activity size={24} className="text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        Enterprise Insights
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Platform-wide performance analytics and health monitoring
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-x-3">
                {/* Workspace Filter */}
                <div className="relative">
                    <div className="flex items-center gap-x-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <Building2 size={16} className="text-gray-500 dark:text-gray-400" />
                        <select
                            value={workspaceFilter}
                            onChange={e => onWorkspaceFilterChange(e.target.value)}
                            className="appearance-none bg-transparent border-none text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none cursor-pointer pr-6"
                        >
                            <option value="all">All Workspaces</option>
                            {workspaceOptions.map(ws => (
                                <option key={ws.id} value={ws.id}>
                                    {ws.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {/* Time Range Selector */}
                <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
                    {timeRangeOptions.map(option => (
                        <button
                            key={option.value}
                            onClick={() => onTimeRangeChange(option.value)}
                            className={cn(
                                'px-3 py-1.5 text-sm font-medium rounded-md transition-all',
                                timeRange === option.value
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                            )}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
