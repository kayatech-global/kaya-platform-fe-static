'use client';

import * as React from 'react';
import { Area, CartesianGrid, XAxis, YAxis, AreaChart } from 'recharts';

import { cn } from '@/lib/utils';
import { useTheme } from '@/theme';
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from '../atoms/chart';

interface AreaChartProps extends React.HTMLAttributes<HTMLDivElement> {
    data: unknown[];
    config: ChartConfig;
    height?: number;
    width?: number;
    xAxisKey?: string;
    xAxisFormatter?: (value: string) => string;
    yAxisFormatter?: (value: string) => string;
    showXAxis?: boolean;
    showYAxis?: boolean;
    showGrid?: boolean;
    showTooltip?: boolean;
    info?: string;
    isLegendScrollable?: boolean;
}

const AppAreaChart = React.forwardRef<HTMLDivElement, AreaChartProps>(
    (
        {
            className,
            data = [],
            config,
            xAxisKey = 'name',
            xAxisFormatter,
            yAxisFormatter,
            showXAxis = true,
            showYAxis = true,
            showGrid = true,
            showTooltip = true,
            info,
            isLegendScrollable = false,
            ...props
        },
        ref
    ) => {
        const { theme } = useTheme();

        return (
            <div ref={ref} className={cn('w-full', className)} {...props}>
                <ChartContainer config={config}>
                    <AreaChart
                        accessibilityLayer
                        data={data}
                        margin={{
                            left: -16,
                            right: 12,
                        }}
                    >
                        {showGrid && (
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical
                                horizontal
                                stroke={theme === 'light' ? '#e5e7eb' : 'rgba(229, 231, 235, 0.05)'}
                                strokeOpacity={0.5}
                            />
                        )}
                        {showXAxis && (
                            <XAxis
                                dataKey={xAxisKey}
                                tickLine={false}
                                axisLine={{
                                    stroke: theme === 'light' ? '#d1d5db' : '#384151',
                                    strokeWidth: 0.8,
                                }}
                                tickFormatter={xAxisFormatter}
                                tick={{ fill: 'var(--gray-400)', fontSize: 10 }}
                                tickMargin={8}
                            />
                        )}
                        {showTooltip && (
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent info={info} indicator="line" />}
                            />
                        )}
                        {showYAxis && (
                            <YAxis
                                tickLine={false}
                                strokeDasharray="3 3"
                                axisLine={{
                                    stroke: theme === 'light' ? '#d1d5db' : 'rgba(229, 231, 235, 0.15)',
                                    strokeWidth: 0.8,
                                }}
                                tickFormatter={yAxisFormatter}
                                tick={{ fill: 'var(--gray-400)', fontSize: 10 }}
                                tickMargin={8}
                            />
                        )}
                        {Object.entries(config).map(([key, config]) => {
                            return (
                                <Area
                                    key={key}
                                    dataKey={key}
                                    type="natural"
                                    fill="var(--blue-700)"
                                    fillOpacity={theme === 'light' ? 0.2 : 0.1}
                                    stroke={config.color}
                                    stackId="a"
                                />
                            );
                        })}
                        <ChartLegend
                            className="pb-2"
                            content={<ChartLegendContent isScrollable={isLegendScrollable} />}
                        />
                    </AreaChart>
                </ChartContainer>
            </div>
        );
    }
);
AppAreaChart.displayName = 'AreaChart';

export { AppAreaChart };
