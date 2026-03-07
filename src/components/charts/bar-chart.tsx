'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '../atoms/chart';
import { useTheme } from '@/theme';
import { formatToShortenedUnit, roundedDecimalPlaces } from '@/lib/utils';
import { UnitType, UsageUnitType } from '@/enums';

// Define a generic type for chart data entries
interface ChartDataEntry<T extends string | number> {
    [key: string]: T;
}

// Define props interface for the component
interface AppBarChartProps<T extends string | number> {
    chartData: ChartDataEntry<T>[];
    chartConfig: ChartConfig;
    dataKey: string;
    showXAxis?: boolean;
    showYAxis?: boolean;
    showLegend?: boolean;
    maxYValue?: number;
    needYAxisFormatter?: boolean;
    info?: string;
}

export const AppBarChart = <T extends string | number>({
    chartData,
    chartConfig,
    dataKey,
    showXAxis = true,
    showYAxis = true,
    showLegend = true,
    maxYValue,
    needYAxisFormatter = false,
    info,
}: AppBarChartProps<T>) => {
    const { theme } = useTheme();

    return (
        <div className="app-bar-chart flex flex-col gap-y-2 relative">
            <ChartContainer config={chartConfig}>
                <BarChart accessibilityLayer data={chartData} margin={{ top: 0, right: 24, left: -32, bottom: 0 }}>
                    <CartesianGrid
                        vertical={false}
                        strokeDasharray="3 3"
                        stroke={theme === 'light' ? '#e5e7eb' : 'rgba(229, 231, 235, 0.05)'}
                        strokeWidth={0.8}
                    />
                    {showXAxis && (
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={{
                                stroke: theme === 'light' ? '#d1d5db' : '#384151',
                                strokeWidth: 0.8,
                            }}
                            tickFormatter={(value: string) => value.slice(0, 3)}
                        />
                    )}
                    {showYAxis && (
                        <YAxis
                            tickLine={false}
                            width={70}
                            strokeDasharray="3 3"
                            axisLine={{
                                stroke: theme === 'light' ? '#d1d5db' : 'rgba(229, 231, 235, 0.15)',
                                strokeWidth: 0.8,
                            }}
                            tick={{ fill: 'var(--tick-color)', fontSize: 8 }}
                            tickFormatter={(value: number) =>
                                needYAxisFormatter
                                    ? roundedDecimalPlaces(
                                          parseFloat(
                                              formatToShortenedUnit(
                                                  value,
                                                  UnitType.DEFAULT,
                                                  UnitType.DEFAULT,
                                                  UsageUnitType.COUNT
                                              )
                                          )
                                      )
                                    : roundedDecimalPlaces(value)
                            }
                            domain={[0, maxYValue ?? 'auto']}
                        />
                    )}
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel info={info} />} />
                    <Bar
                        dataKey={dataKey}
                        fill={chartConfig[dataKey]?.color ?? 'var(--color-default)'}
                        radius={[12, 12, 0, 0]}
                        barSize={84}
                    />
                </BarChart>
            </ChartContainer>
            {showLegend && (
                <div className="absolute bottom-[-5px] left-[50%] transform translate-x-[-50%] flex justify-center gap-12">
                    {Object.entries(chartConfig).map(([key, config]) => (
                        <div key={key} className="flex items-center gap-[6px]">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: config.color }}></div>
                            <span className="text-xs font-normal text-gray-600 dark:text-gray-400">{config.label}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
