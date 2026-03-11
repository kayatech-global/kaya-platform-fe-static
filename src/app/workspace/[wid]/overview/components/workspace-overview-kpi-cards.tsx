'use client';

import React from 'react';
import DashboardDataCard, { DashboardDataCardProps } from '@/components/atoms/dashboard-data-card';
import { Carousel, CarouselContent, CarouselItem } from '@/components/atoms/carousel';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/atoms/tooltip';
import { useBreakpoint } from '@/hooks/use-breakpoints';
import { cn } from '@/lib/utils';
import { WorkspaceOverviewMetrics, WorkspaceOverviewPermissions, TimeRangeFilter, HealthIndexLevel } from '../types/types';
import { Workflow, Play, CheckCircle, Coins, AlertTriangle, TrendingUp, TrendingDown, Minus, Activity, Info } from 'lucide-react';

interface WorkspaceOverviewKPICardsProps {
    metrics: WorkspaceOverviewMetrics;
    permissions: WorkspaceOverviewPermissions;
    timeRange: TimeRangeFilter;
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

const getTrendIcon = (trendValue: number): React.ElementType => {
    if (trendValue > 0) return TrendingUp;
    if (trendValue < 0) return TrendingDown;
    return Minus;
};

const getTrendColor = (trendValue: number, isPositiveGood: boolean = true): string => {
    if (trendValue === 0) return 'text-gray-500';
    const isPositive = trendValue > 0;
    if (isPositiveGood) {
        return isPositive ? 'text-green-600' : 'text-red-500';
    }
    return isPositive ? 'text-red-500' : 'text-green-600';
};

const formatTrendValue = (value: number): string => {
    const absValue = Math.abs(value);
    const prefix = value > 0 ? '+' : value < 0 ? '-' : '';
    if (absValue >= 1000) {
        return `${prefix}${(absValue / 1000).toFixed(1)}K`;
    }
    return `${prefix}${absValue}`;
};

const getTimeRangeLabel = (timeRange: TimeRangeFilter): string => {
    switch (timeRange) {
        case 'last24h':
            return 'last 24 hours';
        case 'last7d':
            return 'last 7 days';
        case 'last30d':
            return 'last 30 days';
        default:
            return 'selected period';
    }
};

const getHealthIndexColor = (level: HealthIndexLevel): string => {
    switch (level) {
        case 'High':
            return 'text-green-600 dark:text-green-400';
        case 'Medium':
            return 'text-amber-500 dark:text-amber-400';
        case 'Low':
            return 'text-red-500 dark:text-red-400';
        default:
            return 'text-gray-500';
    }
};

const getHealthIndexBgColor = (level: HealthIndexLevel): string => {
    switch (level) {
        case 'High':
            return 'bg-green-50 dark:bg-green-900/20';
        case 'Medium':
            return 'bg-amber-50 dark:bg-amber-900/20';
        case 'Low':
            return 'bg-red-50 dark:bg-red-900/20';
        default:
            return 'bg-gray-50 dark:bg-gray-800';
    }
};

interface KPICardWithTooltipProps extends DashboardDataCardProps {
    tooltipContent: React.ReactNode;
}

const KPICardWithTooltip: React.FC<KPICardWithTooltipProps> = ({ tooltipContent, ...cardProps }) => {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div className="relative h-full">
                    <DashboardDataCard {...cardProps} width={undefined} />
                    <div className="absolute top-2 right-2">
                        <Info size={14} className="text-gray-400 dark:text-gray-500" />
                    </div>
                </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[280px] p-3">
                {tooltipContent}
            </TooltipContent>
        </Tooltip>
    );
};

export const WorkspaceOverviewKPICards: React.FC<WorkspaceOverviewKPICardsProps> = ({
    metrics,
    permissions,
    timeRange,
}) => {
    const { isSm, isMobile } = useBreakpoint();
    const timeRangeLabel = getTimeRangeLabel(timeRange);

    const kpiCards: { card: DashboardDataCardProps; tooltip: React.ReactNode }[] = [
        // Workflows Card - Shows Active / Total
        {
            card: {
                title: 'Workflows',
                value: (
                    <p className="text-d-md font-semibold text-gray-800 dark:text-gray-300">
                        <span className="text-blue-600 dark:text-blue-400">{metrics.activeWorkflows}</span>
                        <span className="text-gray-400 dark:text-gray-500 text-sm font-normal"> / {metrics.totalWorkflows}</span>
                    </p>
                ),
                description: 'Active / Total',
                trendValue: '',
                trendColor: 'text-gray-500',
                Icon: Workflow,
                TrendIcon: Minus,
                showTrendIcon: false,
            },
            tooltip: (
                <div className="space-y-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">Workflows</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                        Total number of workflows in this workspace. Shows active (Published) vs total (all statuses including Draft).
                    </p>
                </div>
            ),
        },
        // Executions Card
        {
            card: {
                title: 'Executions',
                value: (
                    <p className="text-d-md font-semibold text-gray-800 dark:text-gray-300">
                        {formatNumber(metrics.totalExecutions)}
                    </p>
                ),
                description: `in ${timeRangeLabel}`,
                trendValue: formatTrendValue(metrics.trendComparedToPrevious.executions),
                trendColor: getTrendColor(metrics.trendComparedToPrevious.executions, true),
                Icon: Play,
                TrendIcon: getTrendIcon(metrics.trendComparedToPrevious.executions),
                showTrendIcon: metrics.trendComparedToPrevious.executions !== 0,
            },
            tooltip: (
                <div className="space-y-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">Executions</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                        Total count of workflow executions in this workspace during the {timeRangeLabel}.
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                        Time window: {timeRangeLabel}
                    </p>
                </div>
            ),
        },
        // Success Rate Card
        {
            card: {
                title: 'Success Rate',
                value: (
                    <p className="text-d-md font-semibold text-gray-800 dark:text-gray-300">
                        {metrics.successRate.toFixed(1)}%
                    </p>
                ),
                description: 'vs previous period',
                trendValue: `${metrics.trendComparedToPrevious.successRate > 0 ? '+' : ''}${metrics.trendComparedToPrevious.successRate.toFixed(1)}%`,
                trendColor: getTrendColor(metrics.trendComparedToPrevious.successRate, true),
                Icon: CheckCircle,
                TrendIcon: getTrendIcon(metrics.trendComparedToPrevious.successRate),
                showTrendIcon: metrics.trendComparedToPrevious.successRate !== 0,
            },
            tooltip: (
                <div className="space-y-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">Success Rate</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                        Percentage of successful workflow executions. Calculated as: (Successful Executions / Total Executions) x 100.
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                        Time window: {timeRangeLabel}
                    </p>
                </div>
            ),
        },
        // Failed Executions Card
        {
            card: {
                title: 'Failed Executions',
                value: (
                    <p className="text-d-md font-semibold text-gray-800 dark:text-gray-300">
                        {formatNumber(metrics.failedExecutions)}
                    </p>
                ),
                description: 'vs previous period',
                trendValue: formatTrendValue(metrics.trendComparedToPrevious.failedExecutions),
                trendColor: getTrendColor(metrics.trendComparedToPrevious.failedExecutions, false),
                Icon: AlertTriangle,
                TrendIcon: getTrendIcon(metrics.trendComparedToPrevious.failedExecutions),
                showTrendIcon: metrics.trendComparedToPrevious.failedExecutions !== 0,
            },
            tooltip: (
                <div className="space-y-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">Failed Executions</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                        Count of failed workflow execution events in the workspace during the selected time window.
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                        Time window: {timeRangeLabel}
                    </p>
                </div>
            ),
        },
    ];

    // Add token usage card if user has permission
    if (permissions.canViewTokenUsage) {
        kpiCards.push({
            card: {
                title: 'Tokens',
                value: (
                    <p className="text-d-md font-semibold text-gray-800 dark:text-gray-300">
                        {formatNumber(metrics.totalTokens)}
                    </p>
                ),
                description: `in ${timeRangeLabel}`,
                trendValue: formatTrendValue(metrics.trendComparedToPrevious.tokens),
                trendColor: getTrendColor(metrics.trendComparedToPrevious.tokens, false),
                Icon: Coins,
                TrendIcon: getTrendIcon(metrics.trendComparedToPrevious.tokens),
                showTrendIcon: metrics.trendComparedToPrevious.tokens !== 0,
            },
            tooltip: (
                <div className="space-y-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">Token Usage</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                        Sum of tokens consumed by all workflows in this workspace (input + output tokens).
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                        Time window: {timeRangeLabel}
                    </p>
                </div>
            ),
        });
    }

    // Add ROI/Health Index Card
    kpiCards.push({
        card: {
            title: 'Workspace Health',
            value: (
                <div className={cn('inline-flex items-center gap-x-2 px-3 py-1 rounded-full', getHealthIndexBgColor(metrics.healthIndex))}>
                    <span className={cn('text-d-md font-semibold', getHealthIndexColor(metrics.healthIndex))}>
                        {metrics.healthIndex}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        ({metrics.healthIndexScore}/100)
                    </span>
                </div>
            ),
            description: 'ROI Index',
            trendValue: '',
            trendColor: 'text-gray-500',
            Icon: Activity,
            TrendIcon: Minus,
            showTrendIcon: false,
        },
        tooltip: (
            <div className="space-y-2">
                <p className="font-medium text-gray-900 dark:text-gray-100">Workspace Health Index</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                    A composite indicator of workspace performance based on:
                </p>
                <ul className="text-xs text-gray-600 dark:text-gray-400 list-disc pl-4 space-y-0.5">
                    <li>Successful execution rate</li>
                    <li>Workflow activity level</li>
                    <li>Cost vs usage efficiency</li>
                </ul>
                <p className="text-xs text-gray-500 dark:text-gray-500 pt-1 border-t border-gray-100 dark:border-gray-700">
                    <strong>High:</strong> 80-100 | <strong>Medium:</strong> 50-79 | <strong>Low:</strong> 0-49
                </p>
            </div>
        ),
    });

    // Use carousel on small screens, grid on larger screens
    if (isSm || isMobile) {
        return (
            <Carousel
                opts={{
                    align: 'start',
                }}
            >
                <CarouselContent>
                    {kpiCards.map((item, index) => (
                        <CarouselItem key={index} className="basis-[85%] sm:basis-1/2">
                            <KPICardWithTooltip {...item.card} tooltipContent={item.tooltip} />
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        );
    }

    return (
        <div
            className={cn(
                'workspace-kpi-cards grid gap-6',
                {
                    'grid-cols-5': kpiCards.length === 5,
                    'grid-cols-6': kpiCards.length === 6,
                }
            )}
        >
            {kpiCards.map((item, index) => (
                <KPICardWithTooltip key={index} {...item.card} tooltipContent={item.tooltip} />
            ))}
        </div>
    );
};
