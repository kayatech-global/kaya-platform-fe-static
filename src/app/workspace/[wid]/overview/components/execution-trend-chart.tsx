'use client';

import React from 'react';
import { AppAreaChart } from '@/components/charts/area-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card';
import { ChartConfig } from '@/components/atoms/chart';
import { ExecutionTrendDataPoint } from '../types/types';
import { cn } from '@/lib/utils';
import { TrendingUp } from 'lucide-react';

interface ExecutionTrendChartProps {
    data: ExecutionTrendDataPoint[];
}

export const ExecutionTrendChart: React.FC<ExecutionTrendChartProps> = ({ data }) => {
    const chartConfig: ChartConfig = {
        executions: {
            label: 'Executions',
            color: 'var(--blue-600)',
        },
    };

    const formatXAxis = (value: string): string => {
        const date = new Date(value);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const formatYAxis = (value: string): string => {
        const num = Number(value);
        if (num >= 1000) {
            return `${(num / 1000).toFixed(1)}K`;
        }
        return value;
    };

    const hasData = data && data.length > 0;

    return (
        <Card
            className={cn(
                'bg-[rgba(255,255,255,0.6)] backdrop-blur-[7px] border border-gray-200',
                'dark:bg-[rgba(31,41,55,0.8)] dark:border-gray-700'
            )}
        >
            <CardHeader className="pb-2">
                <div className="flex items-center gap-x-2">
                    <TrendingUp size={18} className="text-blue-600 dark:text-blue-400" />
                    <CardTitle className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        Workflow Executions Over Time
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                {hasData ? (
                    <AppAreaChart
                        data={data}
                        config={chartConfig}
                        xAxisKey="date"
                        xAxisFormatter={formatXAxis}
                        yAxisFormatter={formatYAxis}
                        showXAxis
                        showYAxis
                        showGrid
                        showTooltip
                        info="executions"
                        className="h-[250px]"
                    />
                ) : (
                    <div className="h-[250px] flex items-center justify-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            No execution data available for this period
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
