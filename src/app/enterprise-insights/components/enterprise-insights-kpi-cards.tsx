'use client';

import React from 'react';
import { PlatformKPIs, TimeRangeFilter } from '../types/types';
import { cn } from '@/lib/utils';
import {
    Building2,
    Workflow,
    Bot,
    Play,
    CheckCircle,
    Coins,
    AlertTriangle,
    HeartPulse,
    TrendingUp,
    TrendingDown,
    Minus,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/atoms/tooltip';

interface EnterpriseInsightsKPICardsProps {
    kpis: PlatformKPIs;
    timeRange: TimeRangeFilter;
}

interface KPICardProps {
    title: string;
    value: number | string;
    trend: number;
    trendDirection: 'up' | 'down' | 'neutral';
    icon: React.ElementType;
    iconBgColor: string;
    iconColor: string;
    isPositiveGood?: boolean;
    isWarning?: boolean;
    tooltipContent: string;
    suffix?: string;
    formatValue?: (value: number | string) => string;
}

const formatLargeNumber = (num: number): string => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
};

const KPICard: React.FC<KPICardProps> = ({
    title,
    value,
    trend,
    trendDirection,
    icon: Icon,
    iconBgColor,
    iconColor,
    isPositiveGood = true,
    isWarning = false,
    tooltipContent,
    suffix = '',
    formatValue,
}) => {
    const getTrendIcon = () => {
        if (trendDirection === 'up') return TrendingUp;
        if (trendDirection === 'down') return TrendingDown;
        return Minus;
    };

    const getTrendColor = () => {
        if (trendDirection === 'neutral') return 'text-gray-500';
        const isPositive = trendDirection === 'up';
        if (isPositiveGood) {
            return isPositive ? 'text-green-600 dark:text-green-500' : 'text-red-500';
        }
        return isPositive ? 'text-red-500' : 'text-green-600 dark:text-green-500';
    };

    const TrendIcon = getTrendIcon();
    const displayValue = formatValue ? formatValue(value) : value;

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div
                    className={cn(
                        'relative flex flex-col gap-y-2 p-4 rounded-lg border bg-white dark:bg-gray-800',
                        isWarning
                            ? 'border-amber-300 dark:border-amber-600'
                            : 'border-gray-200 dark:border-gray-700',
                        'hover:shadow-md transition-shadow cursor-default'
                    )}
                >
                    {isWarning && (
                        <div className="absolute top-2 right-2">
                            <AlertTriangle size={14} className="text-amber-500" />
                        </div>
                    )}
                    <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-y-1">
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                                {title}
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {displayValue}
                                {suffix && <span className="text-lg font-semibold">{suffix}</span>}
                            </p>
                        </div>
                        <div
                            className={cn(
                                'w-10 h-10 rounded-lg flex items-center justify-center',
                                iconBgColor
                            )}
                        >
                            <Icon size={20} className={iconColor} />
                        </div>
                    </div>
                    <div className="flex items-center gap-x-1">
                        <TrendIcon size={14} className={getTrendColor()} />
                        <span className={cn('text-xs font-medium', getTrendColor())}>
                            {trend > 0 ? '+' : ''}
                            {trend.toFixed(1)}%
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">vs previous period</span>
                    </div>
                </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[250px] p-3">
                <p className="text-xs text-gray-600 dark:text-gray-400">{tooltipContent}</p>
            </TooltipContent>
        </Tooltip>
    );
};

export const EnterpriseInsightsKPICards: React.FC<EnterpriseInsightsKPICardsProps> = ({
    kpis,
    timeRange,
}) => {
    const timeRangeLabel = {
        '24h': 'last 24 hours',
        '7d': 'last 7 days',
        '30d': 'last 30 days',
        '90d': 'last 90 days',
        custom: 'selected period',
    }[timeRange];

    const kpiConfigs: KPICardProps[] = [
        {
            title: 'Workspaces',
            value: kpis.totalWorkspaces.value,
            trend: kpis.totalWorkspaces.trend,
            trendDirection: kpis.totalWorkspaces.trendDirection,
            icon: Building2,
            iconBgColor: 'bg-blue-100 dark:bg-blue-900/30',
            iconColor: 'text-blue-600 dark:text-blue-400',
            tooltipContent: `Total active workspaces on the platform during ${timeRangeLabel}.`,
        },
        {
            title: 'Workflows',
            value: kpis.totalWorkflows.value,
            trend: kpis.totalWorkflows.trend,
            trendDirection: kpis.totalWorkflows.trendDirection,
            icon: Workflow,
            iconBgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
            iconColor: 'text-indigo-600 dark:text-indigo-400',
            tooltipContent: `Total workflows deployed across all workspaces.`,
        },
        {
            title: 'Agents',
            value: kpis.totalAgents.value,
            trend: kpis.totalAgents.trend,
            trendDirection: kpis.totalAgents.trendDirection,
            icon: Bot,
            iconBgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
            iconColor: 'text-cyan-600 dark:text-cyan-400',
            tooltipContent: `Total AI agents active across all workspaces.`,
        },
        {
            title: 'Executions',
            value: kpis.totalExecutions.value,
            trend: kpis.totalExecutions.trend,
            trendDirection: kpis.totalExecutions.trendDirection,
            icon: Play,
            iconBgColor: 'bg-green-100 dark:bg-green-900/30',
            iconColor: 'text-green-600 dark:text-green-400',
            formatValue: v => formatLargeNumber(v as number),
            tooltipContent: `Total workflow and agent executions during ${timeRangeLabel}.`,
        },
        {
            title: 'Success Rate',
            value: kpis.successRate.value,
            trend: kpis.successRate.trend,
            trendDirection: kpis.successRate.trendDirection,
            icon: CheckCircle,
            iconBgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
            iconColor: 'text-emerald-600 dark:text-emerald-400',
            suffix: '%',
            tooltipContent: `Platform-wide execution success rate during ${timeRangeLabel}.`,
        },
        {
            title: 'Tokens Used',
            value: kpis.totalTokens.value,
            trend: kpis.totalTokens.trend,
            trendDirection: kpis.totalTokens.trendDirection,
            icon: Coins,
            iconBgColor: 'bg-amber-100 dark:bg-amber-900/30',
            iconColor: 'text-amber-600 dark:text-amber-400',
            isPositiveGood: false,
            formatValue: v => formatLargeNumber(v as number),
            tooltipContent: `Total LLM tokens consumed across all workspaces during ${timeRangeLabel}.`,
        },
        {
            title: 'Anomalies',
            value: kpis.anomaliesDetected.value,
            trend: kpis.anomaliesDetected.trend,
            trendDirection: kpis.anomaliesDetected.trendDirection,
            icon: AlertTriangle,
            iconBgColor: 'bg-red-100 dark:bg-red-900/30',
            iconColor: 'text-red-600 dark:text-red-400',
            isPositiveGood: false,
            isWarning: (kpis.anomaliesDetected.value as number) > 0,
            tooltipContent: `Performance anomalies detected during ${timeRangeLabel}. Click to view details.`,
        },
        {
            title: 'Health Score',
            value: kpis.platformHealthScore.value,
            trend: kpis.platformHealthScore.trend,
            trendDirection: kpis.platformHealthScore.trendDirection,
            icon: HeartPulse,
            iconBgColor: 'bg-teal-100 dark:bg-teal-900/30',
            iconColor: 'text-teal-600 dark:text-teal-400',
            suffix: '/100',
            tooltipContent: `Overall platform health score based on success rates, latency, and resource utilization.`,
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4">
            {kpiConfigs.map((config, index) => (
                <KPICard key={index} {...config} />
            ))}
        </div>
    );
};
