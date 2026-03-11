'use client';

import React from 'react';
import DashboardDataCard, { DashboardDataCardProps } from '@/components/atoms/dashboard-data-card';
import { Carousel, CarouselContent, CarouselItem } from '@/components/atoms/carousel';
import { useBreakpoint } from '@/hooks/use-breakpoints';
import { cn } from '@/lib/utils';
import { WorkspaceOverviewMetrics, WorkspaceOverviewPermissions } from '../types/types';
import { Workflow, Play, CheckCircle, Coins, AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface WorkspaceOverviewKPICardsProps {
    metrics: WorkspaceOverviewMetrics;
    permissions: WorkspaceOverviewPermissions;
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

export const WorkspaceOverviewKPICards: React.FC<WorkspaceOverviewKPICardsProps> = ({
    metrics,
    permissions,
}) => {
    const { isSm, isMobile } = useBreakpoint();

    const kpiCards: DashboardDataCardProps[] = [
        {
            title: 'Total Workflows',
            value: (
                <p className="text-d-md font-semibold text-gray-800 dark:text-gray-300">
                    {metrics.totalWorkflows}
                </p>
            ),
            description: 'workflows in workspace',
            trendValue: '',
            trendColor: 'text-gray-500',
            Icon: Workflow,
            TrendIcon: Minus,
            showTrendIcon: false,
        },
        {
            title: 'Total Executions',
            value: (
                <p className="text-d-md font-semibold text-gray-800 dark:text-gray-300">
                    {formatNumber(metrics.totalExecutions)}
                </p>
            ),
            description: 'vs previous period',
            trendValue: formatTrendValue(metrics.trendComparedToPrevious.executions),
            trendColor: getTrendColor(metrics.trendComparedToPrevious.executions, true),
            Icon: Play,
            TrendIcon: getTrendIcon(metrics.trendComparedToPrevious.executions),
            showTrendIcon: metrics.trendComparedToPrevious.executions !== 0,
        },
        {
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
        {
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
    ];

    // Add token usage card if user has permission
    if (permissions.canViewTokenUsage) {
        kpiCards.push({
            title: 'Total Tokens',
            value: (
                <p className="text-d-md font-semibold text-gray-800 dark:text-gray-300">
                    {formatNumber(metrics.totalTokens)}
                </p>
            ),
            description: 'vs previous period',
            trendValue: formatTrendValue(metrics.trendComparedToPrevious.tokens),
            trendColor: getTrendColor(metrics.trendComparedToPrevious.tokens, false),
            Icon: Coins,
            TrendIcon: getTrendIcon(metrics.trendComparedToPrevious.tokens),
            showTrendIcon: metrics.trendComparedToPrevious.tokens !== 0,
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
                    {kpiCards.map((card, index) => (
                        <CarouselItem key={index} className="basis-[85%] sm:basis-1/2">
                            <DashboardDataCard {...card} width={undefined} />
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        );
    }

    return (
        <div
            className={cn(
                'workspace-kpi-cards grid gap-4',
                {
                    'grid-cols-4': kpiCards.length === 4,
                    'grid-cols-5': kpiCards.length === 5,
                }
            )}
        >
            {kpiCards.map((card, index) => (
                <DashboardDataCard key={index} {...card} width={undefined} />
            ))}
        </div>
    );
};
