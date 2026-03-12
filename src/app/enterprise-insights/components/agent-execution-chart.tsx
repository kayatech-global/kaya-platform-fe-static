'use client';

import React, { useState } from 'react';
import { AgentExecutionData, TopPerformer } from '../types/types';
import { cn } from '@/lib/utils';
import { useTheme } from '@/theme';
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from '@/components/atoms/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Bot, TrendingUp, TrendingDown, AlertCircle, RefreshCw } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/atoms/tabs';

interface AgentExecutionChartProps {
    data: AgentExecutionData[];
    topPerformers: TopPerformer[];
    worstPerformers: TopPerformer[];
    isError?: boolean;
    onRetry?: () => void;
}

const chartConfig: ChartConfig = {
    success: {
        label: 'Success',
        color: 'var(--green-500)',
    },
    failure: {
        label: 'Failure',
        color: 'var(--red-500)',
    },
};

const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
};

export const AgentExecutionChart: React.FC<AgentExecutionChartProps> = ({
    data,
    topPerformers,
    worstPerformers,
    isError,
    onRetry,
}) => {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState<'chart' | 'top' | 'worst'>('chart');

    if (isError) {
        return (
            <div className="flex flex-col gap-y-4 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-x-2">
                    <Bot size={20} className="text-cyan-600" />
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                        Agent Executions
                    </h3>
                </div>
                <div className="flex flex-col items-center justify-center py-12 gap-y-4">
                    <AlertCircle size={48} className="text-red-500" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Failed to load agent data</p>
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
                    <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                        <Bot size={16} className="text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                            Agent Executions
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Success vs failure over time
                        </p>
                    </div>
                </div>
                <Tabs value={activeTab} onValueChange={v => setActiveTab(v as typeof activeTab)}>
                    <TabsList className="h-8">
                        <TabsTrigger value="chart" className="text-xs px-2 py-1">
                            Chart
                        </TabsTrigger>
                        <TabsTrigger value="top" className="text-xs px-2 py-1">
                            Top 5
                        </TabsTrigger>
                        <TabsTrigger value="worst" className="text-xs px-2 py-1">
                            Worst 5
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Content */}
            {activeTab === 'chart' && (
                <div className="h-[280px]">
                    <ChartContainer config={chartConfig}>
                        <AreaChart
                            data={data}
                            margin={{ left: -16, right: 12, top: 12, bottom: 0 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                stroke={theme === 'light' ? '#e5e7eb' : 'rgba(229, 231, 235, 0.05)'}
                            />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={{
                                    stroke: theme === 'light' ? '#d1d5db' : '#384151',
                                    strokeWidth: 0.8,
                                }}
                                tick={{ fill: 'var(--gray-400)', fontSize: 10 }}
                                tickMargin={8}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={{
                                    stroke: theme === 'light' ? '#d1d5db' : 'rgba(229, 231, 235, 0.15)',
                                    strokeWidth: 0.8,
                                }}
                                tick={{ fill: 'var(--gray-400)', fontSize: 10 }}
                                tickMargin={8}
                                tickFormatter={v => formatNumber(v)}
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Area
                                type="monotone"
                                dataKey="success"
                                stackId="1"
                                stroke="var(--green-500)"
                                fill="var(--green-500)"
                                fillOpacity={theme === 'light' ? 0.3 : 0.2}
                            />
                            <Area
                                type="monotone"
                                dataKey="failure"
                                stackId="1"
                                stroke="var(--red-500)"
                                fill="var(--red-500)"
                                fillOpacity={theme === 'light' ? 0.3 : 0.2}
                            />
                            <ChartLegend content={<ChartLegendContent />} />
                        </AreaChart>
                    </ChartContainer>
                </div>
            )}

            {activeTab === 'top' && (
                <div className="space-y-3">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Top Agents by Volume
                    </p>
                    {topPerformers.map((performer, index) => (
                        <div
                            key={performer.id}
                            className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                        >
                            <div className="flex items-center gap-x-3">
                                <span className="w-5 h-5 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 text-xs font-medium flex items-center justify-center">
                                    {index + 1}
                                </span>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {performer.name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {performer.workspaceName}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-x-4">
                                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                    {formatNumber(performer.count)}
                                </span>
                                <span className="flex items-center gap-x-1 text-xs text-green-600 dark:text-green-500">
                                    <TrendingUp size={12} />
                                    {performer.successRate}%
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'worst' && (
                <div className="space-y-3">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Worst Agents by Failure Rate
                    </p>
                    {worstPerformers.map((performer, index) => (
                        <div
                            key={performer.id}
                            className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                        >
                            <div className="flex items-center gap-x-3">
                                <span className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium flex items-center justify-center">
                                    {index + 1}
                                </span>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {performer.name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {performer.workspaceName}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-x-4">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {formatNumber(performer.count)} runs
                                </span>
                                <span className="flex items-center gap-x-1 text-xs text-red-600 dark:text-red-500">
                                    <TrendingDown size={12} />
                                    {performer.failureRate}% fail
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
