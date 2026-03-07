'use client';

import * as React from 'react';
import { CartesianGrid, XAxis, YAxis, LineChart, Line } from 'recharts';

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
import { useEffect, useRef } from 'react';
import { useIsHorizontalScrollable } from '@/hooks/use-mobile';

interface LineChartProps extends React.HTMLAttributes<HTMLDivElement> {
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

const AppLineChart = React.forwardRef<HTMLDivElement, LineChartProps>(
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
        const legendContentRef = useRef<HTMLDivElement>(null);
        const isContentHorizontalScrollable = useIsHorizontalScrollable(legendContentRef);

        useEffect(() => {
            if (isLegendScrollable) {
                const element = legendContentRef.current;
                if (isContentHorizontalScrollable && element) {
                    element.classList.remove('justify-center');
                } else if (element) {
                    element.classList.add('justify-center');
                } else {
                    setTimeout(() => {
                        const element = legendContentRef.current;
                        if (isContentHorizontalScrollable && element) {
                            element.classList.remove('justify-center');
                        } else if (element) {
                            element.classList.add('justify-center');
                        }
                    }, 500);
                }
            }
        }, [isContentHorizontalScrollable, isLegendScrollable]);

        return (
            <div ref={ref} className={cn('w-full', className)} {...props}>
                <ChartContainer config={config}>
                    <LineChart
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
                                <Line
                                    key={key}
                                    dataKey={key}
                                    type="monotone"
                                    fill="var(--blue-700)"
                                    fillOpacity={theme === 'light' ? 0.2 : 0.1}
                                    stroke={config.color}
                                />
                            );
                        })}

                        <ChartLegend
                            className="pb-2 ml-4"
                            content={<ChartLegendContent ref={legendContentRef} isScrollable={isLegendScrollable} />}
                        />
                    </LineChart>
                </ChartContainer>
            </div>
        );
    }
);
AppLineChart.displayName = 'LineChart';

export { AppLineChart };
