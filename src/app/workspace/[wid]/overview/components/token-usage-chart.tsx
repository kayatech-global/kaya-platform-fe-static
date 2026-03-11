'use client';

import React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card';
import { ChartConfig, ChartContainer } from '@/components/atoms/chart';
import { TokenUsageByWorkflow } from '../types/types';
import { cn } from '@/lib/utils';
import { useTheme } from '@/theme';
import { Coins, Lock } from 'lucide-react';

interface TokenUsageChartProps {
    data: TokenUsageByWorkflow[];
    canViewTokenUsage: boolean;
}

const formatTokenCount = (value: number): string => {
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
};

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: unknown[] }) => {
    if (active && payload && payload.length > 0) {
        const item = payload[0] as { payload: TokenUsageByWorkflow };
        const data = item.payload;
        
        return (
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {data.workflowName}
                </p>
                <div className="space-y-1">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                        Total Tokens: <span className="font-medium text-amber-600">{data.totalTokens.toLocaleString()}</span>
                    </p>
                    {data.averageTokensPerExecution > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                            Avg per execution: {formatTokenCount(data.averageTokensPerExecution)}
                        </p>
                    )}
                </div>
            </div>
        );
    }
    return null;
};

export const TokenUsageChart: React.FC<TokenUsageChartProps> = ({ data, canViewTokenUsage }) => {
    const { theme } = useTheme();

    const chartConfig: ChartConfig = {
        totalTokens: {
            label: 'Tokens',
            color: 'var(--amber-500)',
        },
    };

    // Sort by total tokens descending and take top 10
    const chartData = [...data]
        .sort((a, b) => b.totalTokens - a.totalTokens)
        .slice(0, 10)
        .map((item) => ({
            ...item,
            displayName: item.workflowName.length > 20 
                ? `${item.workflowName.slice(0, 17)}...` 
                : item.workflowName,
        }));

    const hasData = chartData.length > 0;

    // If user doesn't have permission to view token usage
    if (!canViewTokenUsage) {
        return (
            <Card
                className={cn(
                    'bg-[rgba(255,255,255,0.6)] backdrop-blur-[7px] border border-gray-200',
                    'dark:bg-[rgba(31,41,55,0.8)] dark:border-gray-700'
                )}
            >
                <CardHeader className="pb-2">
                    <div className="flex items-center gap-x-2">
                        <Coins size={18} className="text-amber-600 dark:text-amber-400" />
                        <CardTitle className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                            Token Usage by Workflow
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-[250px] flex flex-col items-center justify-center gap-y-3">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <Lock size={24} className="text-gray-400 dark:text-gray-500" />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                            You do not have permission to view token usage data
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card
            className={cn(
                'bg-[rgba(255,255,255,0.6)] backdrop-blur-[7px] border border-gray-200',
                'dark:bg-[rgba(31,41,55,0.8)] dark:border-gray-700'
            )}
        >
            <CardHeader className="pb-2">
                <div className="flex items-center gap-x-2">
                    <Coins size={18} className="text-amber-600 dark:text-amber-400" />
                    <CardTitle className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        Token Usage by Workflow
                    </CardTitle>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Top 10 workflows by token consumption (sorted by total tokens descending)
                </p>
            </CardHeader>
            <CardContent>
                {hasData ? (
                    <ChartContainer config={chartConfig} className="h-[300px] w-full">
                        <BarChart
                            data={chartData}
                            layout="horizontal"
                            margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                        >
                            <CartesianGrid
                                horizontal={false}
                                strokeDasharray="3 3"
                                stroke={theme === 'light' ? '#e5e7eb' : 'rgba(229, 231, 235, 0.05)'}
                                strokeWidth={0.8}
                            />
                            <XAxis
                                type="number"
                                tickLine={false}
                                axisLine={{
                                    stroke: theme === 'light' ? '#d1d5db' : '#384151',
                                    strokeWidth: 0.8,
                                }}
                                tick={{ fill: 'var(--gray-400)', fontSize: 10 }}
                                tickFormatter={(value: number) => formatTokenCount(value)}
                            />
                            <YAxis
                                type="category"
                                dataKey="displayName"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: 'var(--gray-500)', fontSize: 10 }}
                                width={120}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                            <Bar
                                dataKey="totalTokens"
                                fill="var(--amber-500)"
                                radius={[0, 4, 4, 0]}
                                barSize={20}
                            />
                        </BarChart>
                    </ChartContainer>
                ) : (
                    <div className="h-[300px] flex items-center justify-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            No token usage data available for this period
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
