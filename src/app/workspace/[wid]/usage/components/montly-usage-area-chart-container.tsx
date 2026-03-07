'use client';
import React from 'react';
import { FileChartPie } from 'lucide-react';

import { AppAreaChart } from '@/components/charts/area-chart';
import DataVizCard from '@/components/molecules/data-viz-card/data-viz-card';
import { MonthlyCreditUsageData, MonthlyTokenUsageData } from '../types/types';
import { cn, convertToShortMonth } from '@/lib/utils';
import { AppLineChart } from '@/components/charts/line-chart';
import { useBreakpoint } from '@/hooks/use-breakpoints';

interface MonthlyUsageAreaChartContainerProps {
    monthlyCreditUsageData: MonthlyCreditUsageData;
    monthlyTokenUsageData: MonthlyTokenUsageData;
}

export const MonthlyUsageAreaChartContainer = ({
    monthlyCreditUsageData,
    monthlyTokenUsageData,
}: MonthlyUsageAreaChartContainerProps) => {
    const { isMobile } = useBreakpoint();

    return (
        <DataVizCard
            title={'Month by Month Usage'}
            subTitle={"Last 12 months' usage"}
            icon={<FileChartPie />}
            chart={
                <div
                    className={cn('monthly-usage-container flex gap-3 items-center justify-between', {
                        'flex-col': isMobile,
                    })}
                >
                    <div className="px-3 pt-3 border rounded flex flex-col gap-y-2 w-full dark:border-gray-700">
                        <p className="text-xs font-bold dark:text-gray-200">Credits</p>
                        <AppAreaChart
                            data={monthlyCreditUsageData.data}
                            config={monthlyCreditUsageData.config}
                            xAxisKey={monthlyCreditUsageData.xAxisKey}
                            xAxisFormatter={convertToShortMonth}
                            yAxisFormatter={value => {
                                if (+value === 0) return String(value);
                                return `${value}K`;
                            }}
                            info={monthlyCreditUsageData.info}
                        />
                    </div>
                    <div className="px-3 pt-3 border rounded flex flex-col gap-y-2 w-full dark:border-gray-700">
                        <p className="text-xs font-bold dark:text-gray-200">Intelligence Source Tokens</p>
                        <AppLineChart
                            data={monthlyTokenUsageData.data}
                            config={monthlyTokenUsageData.config}
                            xAxisKey={monthlyTokenUsageData.xAxisKey}
                            xAxisFormatter={convertToShortMonth}
                            yAxisFormatter={value => {
                                if (+value === 0) return String(value);
                                return `${value}K`;
                            }}
                            info={monthlyTokenUsageData.info}
                            isLegendScrollable={true}
                        />
                    </div>
                </div>
            }
        />
    );
};
