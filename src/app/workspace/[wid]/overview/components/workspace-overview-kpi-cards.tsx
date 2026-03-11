'use client';

import React from 'react';
import DashboardDataCard, { DashboardDataCardProps } from '@/components/atoms/dashboard-data-card';
import { Carousel, CarouselContent, CarouselItem } from '@/components/atoms/carousel';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/atoms/tooltip';
import { useBreakpoint } from '@/hooks/use-breakpoints';
import { cn } from '@/lib/utils';
import { WorkspaceOverviewMetrics, WorkspaceOverviewPermissions, TimeRangeFilter } from '../types/types';
import { Workflow, Play, CheckCircle, Coins, TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';

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

interface KPICardWithTooltipProps extends DashboardDataCardProps {
    tooltipContent: React.ReactNode;
}

const KPICardWithTooltip: React.FC<KPICardWithTooltipProps> = ({ tooltipContent, ...cardProps }) => {
    const IconComponent = cardProps.Icon;
    const TrendIconComponent = cardProps.TrendIcon;
    
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div className="relative h-full w-full">
                    <div className="dashboard-data-card bg-[rgba(255,255,255,0.6)] h-[124px] rounded-lg backdrop-blur-[7px] border border-gray-200 px-6 py-3 flex flex-col gap-y-[10px] dark:bg-[rgba(31,41,55,0.8)] dark:border-gray-700 w-full">
                        <div className="flex justify-between">
                            <div className="flex flex-col gap-y-1">
                                {typeof cardProps.title === 'string' ? (
                                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{cardProps.title}</p>
                                ) : (
                                    <div>{cardProps.title}</div>
                                )}
                                {cardProps.value}
                            </div>
                            <div className="w-[42px] h-[42px] bg-[rgba(49,111,237,0.3)] rounded-lg flex items-center justify-center flex-shrink-0">
                                <IconComponent size={24} className="stroke-1 text-blue-700 dark:text-blue-600" />
                            </div>
                        </div>
                        <div className="flex items-center gap-x-2" title={cardProps.trendValue + ' ' + cardProps.description}>
                            {cardProps.showTrendIcon && <TrendIconComponent size={24} className={cn(cardProps.trendColor)} />}
                            <p className="text-sm font-normal text-gray-700 dark:text-gray-300 truncate">
                                <span className={cn('text-sm font-medium pr-1', cardProps.trendColor)}>{cardProps.trendValue}</span>
                                {cardProps.description}
                            </p>
                        </div>
                    </div>
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
                    'grid-cols-3': kpiCards.length === 3,
                    'grid-cols-4': kpiCards.length === 4,
                }
            )}
        >
            {kpiCards.map((item, index) => (
                <KPICardWithTooltip key={index} {...item.card} tooltipContent={item.tooltip} />
            ))}
        </div>
    );
};
