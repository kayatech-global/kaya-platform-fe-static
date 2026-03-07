import React from 'react';

import {
    ConsumptionChartData,
    MonthlyCreditUsageData,
    MonthlyTokenUsageData,
    WorkFlowExecutionData,
} from '../types/types';
import { ColumnChartContainer } from './column-chart-container';
import { MonthlyUsageAreaChartContainer } from './montly-usage-area-chart-container';
import { IMonth, WorkflowExecutionChartContainer } from './workflow-execution-chart-container';

interface ChartContainerProps {
    consumptionData: ConsumptionChartData[];
    monthlyCreditUsageData: MonthlyCreditUsageData;
    monthlyTokenUsageData: MonthlyTokenUsageData;
    workflowExecutionData: WorkFlowExecutionData;
    isWorkflowFetching?: boolean;
    onMonthChange: (month: IMonth) => void;
}

export const ChartContainer = ({
    consumptionData,
    monthlyCreditUsageData,
    monthlyTokenUsageData,
    workflowExecutionData,
    isWorkflowFetching,
    onMonthChange,
}: ChartContainerProps) => {
    return (
        <div className="flex flex-col gap-y-6">
            <ColumnChartContainer consumptionData={consumptionData} />
            <MonthlyUsageAreaChartContainer
                monthlyCreditUsageData={monthlyCreditUsageData}
                monthlyTokenUsageData={monthlyTokenUsageData}
            />
            <WorkflowExecutionChartContainer
                tableData={workflowExecutionData.tableData}
                chartData={workflowExecutionData.chartData}
                chartConfig={workflowExecutionData.chartConfig}
                hasData={workflowExecutionData.hasData}
                isLoading={isWorkflowFetching}
                onMonthChange={month => onMonthChange(month)}
            />
        </div>
    );
};
