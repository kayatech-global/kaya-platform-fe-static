'use client';

import React from 'react';
import DashboardDataCard, { DashboardDataCardProps } from '@/components/atoms/dashboard-data-card';
import { Carousel, CarouselContent, CarouselItem } from '@/components/atoms/carousel';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/atoms/tooltip';
import { useBreakpoint } from '@/hooks/use-breakpoints';
import { cn } from '@/lib/utils';
import { WorkspaceOverviewMetrics, WorkspaceOverviewPermissions } from '../types/types';
import { Workflow, Play, CheckCircle, Coins, Minus, Info } from 'lucide-react';

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

interface KPICardWithTooltipProps {
    title: string | React.ReactNode;
    value: React.ReactNode;
    description: string;
    Icon: React.ElementType;
    tooltipContent: React.ReactNode;
}

const KPICardWithTooltip: React.FC<KPICardWithTooltipProps> = ({ 
    title,
    value,
    description,
    Icon: IconComponent,
    tooltipContent,
}) => {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div className="relative h-full w-full">
                    <div className="dashboard-data-card bg-[rgba(255,255,255,0.6)] h-[124px] rounded-lg backdrop-blur-[7px] border border-gray-200 px-6 py-3 flex flex-col gap-y-[10px] dark:bg-[rgba(31,41,55,0.8)] dark:border-gray-700 w-full">
                        <div className="flex justify-between">
                            <div className="flex flex-col gap-y-1">
                                {typeof title === 'string' ? (
                                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{title}</p>
                                ) : (
                                    <div>{title}</div>
                                )}
                                {value}
                            </div>
                            <div className="w-[42px] h-[42px] bg-[rgba(49,111,237,0.3)] rounded-lg flex items-center justify-center flex-shrink-0">
                                <IconComponent size={24} className="stroke-1 text-blue-700 dark:text-blue-600" />
                            </div>
                        </div>
                        <p className="text-sm font-normal text-gray-700 dark:text-gray-300 truncate">
                            {description}
                        </p>
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
}) => {
    const { isSm, isMobile } = useBreakpoint();

    const kpiCards: KPICardWithTooltipProps[] = [
        // Workflows Card - Shows Active / Total
        {
            title: 'Workflows',
            value: (
                <p className="text-d-md font-semibold text-gray-800 dark:text-gray-300">
                    <span className="text-blue-600 dark:text-blue-400">{metrics.activeWorkflows}</span>
                    <span className="text-gray-400 dark:text-gray-500 text-sm font-normal"> / {metrics.totalWorkflows}</span>
                </p>
            ),
            description: 'Active / Total',
            Icon: Workflow,
            tooltipContent: (
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
            title: 'Executions',
            value: (
                <p className="text-d-md font-semibold text-gray-800 dark:text-gray-300">
                    {formatNumber(metrics.totalExecutions)}
                </p>
            ),
            description: 'Total executions',
            Icon: Play,
            tooltipContent: (
                <div className="space-y-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">Executions</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                        Total count of workflow executions in this workspace.
                    </p>
                </div>
            ),
        },
        // Success Rate Card
        {
            title: 'Success Rate',
            value: (
                <p className="text-d-md font-semibold text-gray-800 dark:text-gray-300">
                    {metrics.successRate.toFixed(1)}%
                </p>
            ),
            description: 'Overall success rate',
            Icon: CheckCircle,
            tooltipContent: (
                <div className="space-y-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">Success Rate</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                        Percentage of successful workflow executions. Calculated as: (Successful Executions / Total Executions) x 100.
                    </p>
                </div>
            ),
        },
    ];

    // Add token usage card if user has permission
    if (permissions.canViewTokenUsage) {
        kpiCards.push({
            title: 'Tokens',
            value: (
                <p className="text-d-md font-semibold text-gray-800 dark:text-gray-300">
                    {formatNumber(metrics.totalTokens)}
                </p>
            ),
            description: 'Total tokens used',
            Icon: Coins,
            tooltipContent: (
                <div className="space-y-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">Token Usage</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                        Sum of tokens consumed by all workflows in this workspace (input + output tokens).
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
                            <KPICardWithTooltip {...item} />
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
                <KPICardWithTooltip key={index} {...item} />
            ))}
        </div>
    );
};
