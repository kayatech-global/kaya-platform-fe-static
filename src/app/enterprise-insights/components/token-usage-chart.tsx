'use client';

import React, { useState } from 'react';
import { TokenUsageData, TopPerformer } from '../types/types';
import { cn } from '@/lib/utils';
import { useTheme } from '@/theme';
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/atoms/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Bar, BarChart } from 'recharts';
import { Coins, AlertCircle, RefreshCw } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/atoms/tabs';

interface TokenUsageChartProps {
    data: TokenUsageData[];
    topConsumers: TopPerformer[];
    isError?: boolean;
    onRetry?: () => void;
}

const chartConfig: ChartConfig = {
    tokens: {
        label: 'Tokens',
        color: 'var(--amber-500)',
    },
};

const formatTokens = (num: number): string => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
};

export const TokenUsageChart: React.FC<TokenUsageChartProps> = ({
    data,
    topConsumers,
    isError,
    onRetry,
}) => {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState<'trend' | 'consumers'>('trend');

    const totalTokens = data.reduce((sum, d) => sum + d.tokens, 0);
    const avgTokens = Math.floor(totalTokens / data.length);

    // Prepare bar chart data for top consumers
    const consumerData = topConsumers.map(c => ({
        name: c.name.length > 15 ? c.name.substring(0, 15) + '...' : c.name,
        fullName: c.name,
        tokens: c.count,
        fill: 'var(--amber-500)',
    }));

    if (isError) {
        return (
            <div className="flex flex-col gap-y-4 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-x-2">
                    <Coins size={20} className="text-amber-600" />
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                        Token Usage
                    </h3>
                </div>
                <div className="flex flex-col items-center justify-center py-12 gap-y-4">
                    <AlertCircle size={48} className="text-red-500" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Failed to load token data</p>
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
                <div className="flex items-center gap-x-4">
                    <div className="flex items-center gap-x-2">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                            <Coins size={16} className="text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                Token Usage
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                LLM token consumption across the platform
                            </p>
                        </div>
                    </div>
                    {/* Summary stats */}
                    <div className="hidden md:flex items-center gap-x-6 ml-6 pl-6 border-l border-gray-200 dark:border-gray-700">
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {formatTokens(totalTokens)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Daily Avg</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {formatTokens(avgTokens)}
                            </p>
                        </div>
                    </div>
                </div>
                <Tabs value={activeTab} onValueChange={v => setActiveTab(v as typeof activeTab)}>
                    <TabsList className="h-8">
                        <TabsTrigger value="trend" className="text-xs px-2 py-1">
                            Trend
                        </TabsTrigger>
                        <TabsTrigger value="consumers" className="text-xs px-2 py-1">
                            Top Consumers
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Content */}
            {activeTab === 'trend' && (
                <div className="h-[220px]">
                    <ChartContainer config={chartConfig} className="h-full w-full [&>div]:h-full">
                        <AreaChart
                            data={data}
                            margin={{ left: -8, right: 12, top: 12, bottom: 0 }}
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
                                tickFormatter={v => formatTokens(v)}
                            />
                            <ChartTooltip
                                content={<ChartTooltipContent info=" tokens" />}
                            />
                            <Area
                                type="monotone"
                                dataKey="tokens"
                                stroke="var(--amber-500)"
                                fill="var(--amber-500)"
                                fillOpacity={theme === 'light' ? 0.3 : 0.2}
                            />
                        </AreaChart>
                    </ChartContainer>
                </div>
            )}

            {activeTab === 'consumers' && (
                <div className="h-[220px]">
                    <ChartContainer config={{ tokens: { label: 'Tokens', color: 'var(--amber-500)' } }} className="h-full w-full [&>div]:h-full">
                        <BarChart
                            data={consumerData}
                            layout="vertical"
                            margin={{ left: 100, right: 24, top: 12, bottom: 0 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                horizontal={false}
                                stroke={theme === 'light' ? '#e5e7eb' : 'rgba(229, 231, 235, 0.05)'}
                            />
                            <XAxis
                                type="number"
                                tickLine={false}
                                axisLine={{
                                    stroke: theme === 'light' ? '#d1d5db' : '#384151',
                                    strokeWidth: 0.8,
                                }}
                                tick={{ fill: 'var(--gray-400)', fontSize: 10 }}
                                tickFormatter={v => formatTokens(v)}
                            />
                            <YAxis
                                type="category"
                                dataKey="name"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: 'var(--gray-500)', fontSize: 11 }}
                                width={100}
                            />
                            <ChartTooltip
                                content={<ChartTooltipContent info=" tokens" nameKey="fullName" />}
                            />
                            <Bar
                                dataKey="tokens"
                                fill="var(--amber-500)"
                                radius={[0, 4, 4, 0]}
                                barSize={20}
                            />
                        </BarChart>
                    </ChartContainer>
                </div>
            )}
        </div>
    );
};
