'use client';

import React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/atoms/chart';
import { TopWorkflowByExecution } from '../types/types';
import { cn } from '@/lib/utils';
import { useTheme } from '@/theme';
import { BarChart3 } from 'lucide-react';

interface TopWorkflowsChartProps {
    data: TopWorkflowByExecution[];
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: unknown[] }) => {
    if (active && payload && payload.length > 0) {
        const item = payload[0] as { payload: TopWorkflowByExecution };
        const data = item.payload;
        const lastExecuted = new Date(data.lastExecutedAt);
        
        return (
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {data.workflowName}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                    Executions: <span className="font-medium text-blue-600">{data.executionCount.toLocaleString()}</span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Last executed: {lastExecuted.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </p>
            </div>
        );
    }
    return null;
};

export const TopWorkflowsChart: React.FC<TopWorkflowsChartProps> = ({ data }) => {
    const { theme } = useTheme();

    const chartConfig: ChartConfig = {
        executionCount: {
            label: 'Executions',
            color: 'var(--blue-500)',
        },
    };

    // Truncate workflow names for display
    const chartData = data.slice(0, 10).map((item) => ({
        ...item,
        displayName: item.workflowName.length > 15 
            ? `${item.workflowName.slice(0, 12)}...` 
            : item.workflowName,
    }));

    const hasData = chartData.length > 0;

    return (
        <Card
            className={cn(
                'bg-[rgba(255,255,255,0.6)] backdrop-blur-[7px] border border-gray-200',
                'dark:bg-[rgba(31,41,55,0.8)] dark:border-gray-700'
            )}
        >
            <CardHeader className="pb-2">
                <div className="flex items-center gap-x-2">
                    <BarChart3 size={18} className="text-blue-600 dark:text-blue-400" />
                    <CardTitle className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        Top Workflows by Executions
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                {hasData ? (
                    <ChartContainer config={chartConfig} className="h-[250px] w-full">
                        <BarChart
                            data={chartData}
                            layout="vertical"
                            margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
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
                                tickFormatter={(value: number) => {
                                    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                                    return value.toString();
                                }}
                            />
                            <YAxis
                                type="category"
                                dataKey="displayName"
                                tickLine={false}
                                axisLine={false}
                                tick={{ 
                                    fill: theme === 'light' ? '#374151' : '#d1d5db', 
                                    fontSize: 12,
                                    fontWeight: 500
                                }}
                                width={120}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                            <Bar
                                dataKey="executionCount"
                                fill="var(--blue-500)"
                                radius={[0, 4, 4, 0]}
                                barSize={20}
                            />
                        </BarChart>
                    </ChartContainer>
                ) : (
                    <div className="h-[250px] flex items-center justify-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            No workflow execution data available
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
