import { ChartConfig } from '@/components/atoms/chart';
import { OverallUsageType } from '@/enums';
import { IQuota } from '@/models';
import { IMonth, TableDataType } from '../components/workflow-execution-chart-container';
import { ChartDataItem } from '@/components';

export type Month = {
    month: string;
};

export type ChartDimensions = {
    width: number;
    height: number;
};

export type ConsumptionChartHeading = {
    title: string;
    subTitle: string;
    icon: React.ReactNode;
};

export type ConsumptionData = Month & {
    consumption: number;
};

export type ConsumptionConfig = {
    label: string;
    color: string;
};

export type Stats = {
    value: string;
    statsSubHeading: string;
};

export type ConsumptionChartData = {
    headings: ConsumptionChartHeading;
    data: ConsumptionData[];
    stats: Stats;
    config: {
        consumption: ConsumptionConfig;
    };
    styles: ChartDimensions;
    dataKey: string;
    needYAxisFormatter: boolean;
    maxYValue?: number;
    type?: OverallUsageType;
    info?: string;
};

export type CreditUsageData = Month & {
    usage: number;
};

export type MonthlyCreditUsageData = {
    data: CreditUsageData[];
    config: ChartConfig;
    xAxisKey: string;
    info?: string;
};

export type TokenUsageData = {
    month: string;
    [key: string]: string | number;
};

export type MonthlyTokenUsageData = {
    data: TokenUsageData[];
    config: ChartConfig;
    xAxisKey: string;
    info?: string;
};

export type WorkFlowExecutionData = {
    tableData: TableDataType[];
    chartConfig: ChartConfig;
    chartData: ChartDataItem[];
    hasData?: boolean;
    isLoading?: boolean;
    onMonthChange?: (month: IMonth) => void;
};

export type DashboardCardValueProps = {
    total: number;
    quota: IQuota;
    type: OverallUsageType;
    count: number;
};

export type DashboardDataCardTrendIconProps = {
    total: number;
    type: OverallUsageType;
    count: number;
    lastMonthCount: number;
    lastMonthTotal: number;
};
