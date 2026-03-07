import React from 'react';

import DataVizCard from '@/components/molecules/data-viz-card/data-viz-card';
import { ConsumptionChartData } from '../types/types';
import { AppBarChart } from '@/components';
import { useBreakpoint } from '@/hooks/use-breakpoints';
import { cn } from '@/lib/utils';
import { Coins, HardDrive } from 'lucide-react';

interface ColumnChartContainerProps {
    consumptionData: ConsumptionChartData[];
}

export const ColumnChartContainer = ({ consumptionData }: ColumnChartContainerProps) => {
    const { isXl, isSm, isMd, isMobile } = useBreakpoint();
    return (
        <div
            className={cn('flex items-center justify-between', {
                'gap-x-1': isXl,
                'gap-x-2': isSm || isMd,
                'flex-col gap-y-3': isMobile,
            })}
        >
            {consumptionData.map((consumptionDataSet, index) => {
                return (
                    <DataVizCard
                        key={consumptionDataSet.headings?.title ?? consumptionDataSet.type ?? consumptionDataSet.dataKey ?? `chart-${index}`}
                        width={isMobile ? undefined : consumptionDataSet.styles.width}
                        title={consumptionDataSet.headings.title}
                        subTitle={consumptionDataSet.headings.subTitle}
                        icon={consumptionDataSet.type === 'storage' ? <HardDrive /> : <Coins />}
                        stats={{
                            value: consumptionDataSet.stats.value,
                            statsSubHeading: consumptionDataSet.stats.statsSubHeading,
                        }}
                        chart={
                            <AppBarChart
                                chartConfig={consumptionDataSet.config}
                                chartData={consumptionDataSet.data}
                                dataKey={consumptionDataSet.dataKey}
                                needYAxisFormatter={consumptionDataSet.needYAxisFormatter}
                                maxYValue={consumptionDataSet.maxYValue}
                                info={consumptionDataSet.info}
                            />
                        }
                    />
                );
            })}
        </div>
    );
};
