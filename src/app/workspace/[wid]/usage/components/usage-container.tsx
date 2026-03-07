'use client';

import DashboardDataCardList from '@/components/molecules/dashboard-card-list/dashboard-data-card-list';
import { ChartContainer } from '@/app/workspace/[wid]/usage/components/chart-container';
import { useUsage } from '@/hooks/use-usage';
import { UsagePageSkelton } from './usage-page-skelton';

export const UsageContainer = () => {
    const {
        overallUsages,
        chartConsumptionData,
        monthlyCreditUsageData,
        monthlyTokenUsageData,
        isFetching,
        workflowExecutionData,
        isWorkflowFetching,
        onWorkflowExecutionMonthChange,
    } = useUsage();

    if (isFetching) return <UsagePageSkelton />;

    return (
        <>
            <DashboardDataCardList data={overallUsages} />
            <ChartContainer
                consumptionData={chartConsumptionData}
                monthlyCreditUsageData={monthlyCreditUsageData}
                monthlyTokenUsageData={monthlyTokenUsageData}
                workflowExecutionData={workflowExecutionData}
                onMonthChange={month => onWorkflowExecutionMonthChange(month)}
                isWorkflowFetching={isWorkflowFetching}
            />
        </>
    );
};

export default UsageContainer;
