'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/atoms/card';
import { Badge } from '@/components/atoms/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/atoms/tooltip';
import { RecentlyModifiedWorkflow, TimeRangeFilter } from '../types/types';
import { cn } from '@/lib/utils';
import { Play, CheckCircle, Coins, Lock } from 'lucide-react';

interface WorkflowTileProps {
    workflow: RecentlyModifiedWorkflow;
    timeRange: TimeRangeFilter;
    canViewTokenUsage: boolean;
}

const formatNumber = (value: number): string => {
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
};

const getTimeRangeTooltip = (timeRange: TimeRangeFilter): string => {
    switch (timeRange) {
        case 'last24h':
            return 'in the last 24 hours';
        case 'last7d':
            return 'in the last 7 days';
        case 'last30d':
            return 'in the last 30 days';
        default:
            return '';
    }
};

export const WorkflowTile: React.FC<WorkflowTileProps> = ({
    workflow,
    timeRange,
    canViewTokenUsage,
}) => {
    const params = useParams();
    const workspaceId = params.wid as string;

    const statusVariant = workflow.status === 'Published' ? 'default' : 'secondary';
    const statusColor = workflow.status === 'Published' 
        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';

    const timeRangeTooltip = getTimeRangeTooltip(timeRange);

    return (
        <Link href={`/editor/${workspaceId}/${workflow.id}`}>
            <Card
                className={cn(
                    'h-full cursor-pointer transition-all duration-200',
                    'bg-[rgba(255,255,255,0.8)] backdrop-blur-[7px] border border-gray-200',
                    'dark:bg-[rgba(31,41,55,0.9)] dark:border-gray-700',
                    'hover:border-blue-300 hover:shadow-md dark:hover:border-blue-600',
                    'group'
                )}
            >
                <CardContent className="p-4 flex flex-col h-full">
                    {/* Status Badge */}
                    <div className="mb-3">
                        <Badge 
                            variant={statusVariant}
                            className={cn('text-xs font-medium', statusColor)}
                        >
                            {workflow.status}
                        </Badge>
                    </div>

                    {/* Workflow Name */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-1 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {workflow.name}
                            </h3>
                        </TooltipTrigger>
                        {workflow.name.length > 30 && (
                            <TooltipContent side="top" className="max-w-[300px]">
                                {workflow.name}
                            </TooltipContent>
                        )}
                    </Tooltip>

                    {/* Workflow Description */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-4 flex-grow">
                                {workflow.description || 'No description available'}
                            </p>
                        </TooltipTrigger>
                        {workflow.description && workflow.description.length > 80 && (
                            <TooltipContent side="bottom" className="max-w-[300px]">
                                {workflow.description}
                            </TooltipContent>
                        )}
                    </Tooltip>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                        {/* Total Executions */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex flex-col items-center text-center">
                                    <Play size={14} className="text-blue-500 mb-1" />
                                    <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                                        {formatNumber(workflow.totalExecutions)}
                                    </span>
                                    <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                        Executions
                                    </span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                                {workflow.totalExecutions.toLocaleString()} executions {timeRangeTooltip}
                            </TooltipContent>
                        </Tooltip>

                        {/* Success Rate */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex flex-col items-center text-center">
                                    <CheckCircle size={14} className="text-green-500 mb-1" />
                                    <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                                        {workflow.successRate.toFixed(0)}%
                                    </span>
                                    <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                        Success
                                    </span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                                {workflow.successRate.toFixed(1)}% success rate {timeRangeTooltip}
                            </TooltipContent>
                        </Tooltip>

                        {/* Total Tokens */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex flex-col items-center text-center">
                                    {canViewTokenUsage ? (
                                        <>
                                            <Coins size={14} className="text-amber-500 mb-1" />
                                            <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                                                {formatNumber(workflow.totalTokens)}
                                            </span>
                                            <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                                Tokens
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <Lock size={14} className="text-gray-400 mb-1" />
                                            <span className="text-xs font-semibold text-gray-400">
                                                --
                                            </span>
                                            <span className="text-[10px] text-gray-400">
                                                Tokens
                                            </span>
                                        </>
                                    )}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                                {canViewTokenUsage 
                                    ? `${workflow.totalTokens.toLocaleString()} tokens ${timeRangeTooltip}`
                                    : 'You do not have permission to view token usage'
                                }
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
};
