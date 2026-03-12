'use client';

import React from 'react';
import { ROIMetrics } from '../types/types';
import { cn } from '@/lib/utils';
import {
    TrendingUp,
    AlertCircle,
    RefreshCw,
    Zap,
    DollarSign,
    Users,
    Target,
    Clock,
    PiggyBank,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/atoms/tooltip';

interface ROIMetricsPanelProps {
    metrics: ROIMetrics;
    isError?: boolean;
    onRetry?: () => void;
}

interface MetricItemProps {
    icon: React.ElementType;
    iconBgColor: string;
    iconColor: string;
    label: string;
    value: string | number;
    suffix?: string;
    description: string;
    trend?: number;
}

const formatCurrency = (num: number): string => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
    return `$${num.toFixed(2)}`;
};

const formatHours = (hours: number): string => {
    if (hours >= 1000) return `${(hours / 1000).toFixed(1)}K hrs`;
    return `${hours} hrs`;
};

const MetricItem: React.FC<MetricItemProps> = ({
    icon: Icon,
    iconBgColor,
    iconColor,
    label,
    value,
    suffix = '',
    description,
    trend,
}) => {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div className="flex items-center gap-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-default">
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', iconBgColor)}>
                        <Icon size={20} className={iconColor} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            {label}
                        </p>
                        <div className="flex items-baseline gap-x-1">
                            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                {value}
                            </p>
                            {suffix && (
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {suffix}
                                </span>
                            )}
                        </div>
                    </div>
                    {trend !== undefined && (
                        <div className={cn(
                            'flex items-center gap-x-0.5 text-xs font-medium',
                            trend > 0 ? 'text-green-600 dark:text-green-500' : 'text-red-500'
                        )}>
                            <TrendingUp size={12} className={trend < 0 ? 'rotate-180' : ''} />
                            {trend > 0 ? '+' : ''}{trend}%
                        </div>
                    )}
                </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[250px] p-3">
                <p className="text-xs text-gray-600 dark:text-gray-400">{description}</p>
            </TooltipContent>
        </Tooltip>
    );
};

export const ROIMetricsPanel: React.FC<ROIMetricsPanelProps> = ({
    metrics,
    isError,
    onRetry,
}) => {
    if (isError) {
        return (
            <div className="flex flex-col gap-y-4 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-x-2">
                    <TrendingUp size={20} className="text-emerald-600" />
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                        ROI & Business Value
                    </h3>
                </div>
                <div className="flex flex-col items-center justify-center py-12 gap-y-4">
                    <AlertCircle size={48} className="text-red-500" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Failed to load ROI data</p>
                    <button
                        onClick={onRetry}
                        className="flex items-center gap-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                        <RefreshCw size={14} />
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-y-4 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-x-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <TrendingUp size={16} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                            ROI & Business Value
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Platform impact metrics
                        </p>
                    </div>
                </div>
                {/* ROI Score badge */}
                <div className="flex items-center gap-x-2 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                    <Target size={14} className="text-emerald-600 dark:text-emerald-400" />
                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                        {metrics.roiScore}x ROI
                    </span>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <MetricItem
                    icon={Zap}
                    iconBgColor="bg-blue-100 dark:bg-blue-900/30"
                    iconColor="text-blue-600 dark:text-blue-400"
                    label="Automation Efficiency"
                    value={metrics.automationEfficiency.toFixed(1)}
                    suffix="%"
                    description="Percentage of tasks successfully automated without manual intervention."
                    trend={5.2}
                />
                <MetricItem
                    icon={DollarSign}
                    iconBgColor="bg-green-100 dark:bg-green-900/30"
                    iconColor="text-green-600 dark:text-green-400"
                    label="Cost per Execution"
                    value={`$${metrics.costPerExecution.toFixed(4)}`}
                    description="Average cost per workflow/agent execution including compute and token costs."
                    trend={-8.3}
                />
                <MetricItem
                    icon={Users}
                    iconBgColor="bg-indigo-100 dark:bg-indigo-900/30"
                    iconColor="text-indigo-600 dark:text-indigo-400"
                    label="Adoption Growth"
                    value={metrics.platformAdoptionGrowth.toFixed(1)}
                    suffix="%"
                    description="Month-over-month growth in active users and workspaces on the platform."
                    trend={12.4}
                />
                <MetricItem
                    icon={Clock}
                    iconBgColor="bg-cyan-100 dark:bg-cyan-900/30"
                    iconColor="text-cyan-600 dark:text-cyan-400"
                    label="Time Saved"
                    value={formatHours(metrics.timesSaved)}
                    description="Estimated hours saved through automation in the selected period."
                    trend={18.7}
                />
            </div>

            {/* Bottom Summary */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-100 dark:border-emerald-800/30">
                <div className="flex items-center gap-x-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center">
                        <PiggyBank size={20} className="text-white" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            Estimated Cost Savings
                        </p>
                        <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                            {formatCurrency(metrics.costSavings)}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">vs. manual operations</p>
                    <p className="text-sm font-medium text-emerald-600 dark:text-emerald-500">
                        This period
                    </p>
                </div>
            </div>
        </div>
    );
};
