'use client';

import { Label, Pie, PieChart } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '../atoms/chart';
import { useTheme } from '@/theme';

/**
 * Represents an item in the chart data with dynamic keys for browser and visitors.
 *
 * @template K1 - The key for the browser, default is 'browser'.
 * @template K2 - The key for the visitors count, default is 'visitors'.
 */
export type ChartDataItem<K1 extends string = 'workflow', K2 extends string = 'count'> = {
    /**
     * The value for the browser type.
     */
    [key in K1]: string;
} & {
    /**
     * The number of visitors for the browser.
     */
    [key in K2]: number;
} & {
    /**
     * The color associated with the chart slice.
     */
    fill: string;
};

/**
 * Props for the AppDonutChart component.
 *
 * @template K1 - The key for the browser, default is 'browser'.
 * @template K2 - The key for the visitors count, default is 'visitors'.
 */
interface AppDonutChartProps<K1 extends string = 'workflow', K2 extends string = 'count'> {
    /**
     * Title that appears middle of the Pie chart
     */
    title: string;
    /**
     * The data to be displayed in the chart.
     * Each item should have a string key for the browser and a number key for visitors.
     */
    data: ChartDataItem<K1, K2>[];

    /**
     * The configuration object for the chart.
     */
    config: ChartConfig;

    /**
     * The key in the data to be used for the value of each slice (e.g., 'visitors').
     */
    dataKey: string;

    /**
     * The key in the data to be used for the name of each slice (e.g., 'browser').
     */
    nameKey: string;
}

/**
 * A component to render a donut chart using the provided data and configuration.
 *
 * @param {AppDonutChartProps} props - The props for configuring the donut chart.
 * @returns {JSX.Element} The rendered donut chart component.
 */
export const AppDonutChart = ({ data, config, dataKey, nameKey, title }: AppDonutChartProps) => {
    const { theme } = useTheme();

    return (
        <ChartContainer config={config} className="aspect-square w-full max-h-[350px]">
            <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie data={data} dataKey={dataKey} nameKey={nameKey} innerRadius={90}>
                    <Label
                        content={({ viewBox }) => {
                            if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                                return (
                                    <text
                                        className="text-red-700"
                                        x={viewBox.cx}
                                        y={viewBox.cy}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                    >
                                        <tspan
                                            x={viewBox.cx}
                                            y={viewBox.cy}
                                            className="text-md font-bold whitespace-pre"
                                            fill={theme === 'light' ? '#384151' : '#e5e7eb'}
                                        >
                                            {title}
                                        </tspan>
                                    </text>
                                );
                            }
                        }}
                    />
                </Pie>
            </PieChart>
        </ChartContainer>
    );
};
