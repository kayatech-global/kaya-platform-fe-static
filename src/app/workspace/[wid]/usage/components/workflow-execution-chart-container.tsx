import {
    AppDonutChart,
    Button,
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    Spinner,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components';

import DataVizCard from '@/components/molecules/data-viz-card/data-viz-card';
import DataTable from '@/components/molecules/table/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { ChevronDown, GitPullRequestArrow, InfoIcon } from 'lucide-react';
import React, { useState } from 'react';
import { WorkFlowExecutionData } from '../types/types';
import { useBreakpoint } from '@/hooks/use-breakpoints';
import { cn } from '@/lib/utils';
import moment from 'moment';

export type IMonth = { month: string; name: string; shortName: string };

export type TableDataType = {
    workflow: string;
    execution_count: number;
    bgColor?: string;
};

const columns: ColumnDef<TableDataType>[] = [
    {
        header: () => <div className="">Workflows</div>,
        accessorKey: 'workflow',
        meta: {
            align: 'text-left',
        },
        enableSorting: true,
        cell: ({ row }) => {
            const workflowName = row.getValue('workflow') as string;
            return (
                <div className="flex gap-x-3 items-center">
                    {/* This need to be the color */}
                    <div
                        className="w-4 h-4 bg-blue-500 rounded-sm"
                        {...(row?.original?.bgColor && {
                            style: { backgroundColor: row?.original?.bgColor },
                        })}
                    />
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 max-w-[450px] truncate">
                                    {workflowName}
                                </p>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[300px]">
                                <p className="break-words whitespace-normal">{workflowName}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            );
        },
    },
    {
        header: 'Execution Count',
        accessorKey: 'execution_count',
        meta: {
            align: 'text-left',
        },
        enableSorting: false,
        cell: ({ row }) => {
            return (
                <div className="flex gap-x-3 items-center">
                    <p className="text-sm text-gray-700 dark:text-gray-200">{row.getValue('execution_count')}</p>
                </div>
            );
        },
    },
];

const WorkflowChart = ({ chartConfig, chartData, tableData, hasData, isLoading }: WorkFlowExecutionData) => {
    const { isXxLg, isXl, isMd, isMobile } = useBreakpoint();

    if (isLoading) {
        return (
            <div className="mt-20">
                <div className="flex justify-center w-full h-fit pr-12 pt-12">
                    <div className="z-50 flex items-center flex-col gap-y-2">
                        <Spinner />
                        <p>Analyzing Your Data</p>
                        <p className="text-xs text-center text-gray-700 dark:text-gray-300 z-50 w-[400px]">
                            Please wait... Workflow Executions on progress...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className={cn('flex items-center gap-x-16 w-full pr-12 pt-12 justify-evenly', {
                'flex-col justify-center p-0': isMobile,
            })}
        >
            {hasData ? (
                <>
                    <AppDonutChart
                        title="Workflow Executions"
                        data={chartData}
                        config={chartConfig}
                        dataKey="count"
                        nameKey="workflow"
                    />
                    <div className="workflow-execution-table">
                        <DataTable
                            width={(() => {
                                if (isXxLg) return 700;
                                if (isXl) return 600;
                                if (isMd) return 400;
                                if (isMobile) return 'container-width';
                                return 400;
                            })()}
                            data={tableData}
                            columns={columns}
                            showHeader={false}
                            showFooter
                            defaultPageSize={4}
                            tableClassNames=" border-gray-700 rounded-sm"
                            headerClassNames="dark:bg-[#283342] rounded-sm border-gray-600"
                            dataRowClassNames="dark:bg-[#1B2431]"
                        />
                    </div>
                </>
            ) : (
                <div
                    className="flex w-full items-center justify-center p-4 text-sm text-gray-800 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
                    role="alert"
                >
                    <InfoIcon className="shrink-0 inline w-4 h-4 me-3" />
                    <div className="text-center">There is no available data for the workflow execution.</div>
                </div>
            )}
        </div>
    );
};

export const WorkflowExecutionChartContainer = ({
    chartConfig,
    chartData,
    tableData,
    hasData = true,
    isLoading = false,
    onMonthChange,
}: WorkFlowExecutionData) => {
    const getLast12Months = () => {
        const months: IMonth[] = [];
        const currentDate = new Date();

        for (let i = 0; i < 12; i++) {
            const date = new Date();
            date.setMonth(currentDate.getMonth() - i);

            const month = date.toISOString().slice(0, 7); // "YYYY-MM"
            const name = date.toLocaleString('en-US', { month: 'long' }); // Full month name
            const shortName = date.toLocaleString('en-US', { month: 'short' }); // Short month name

            months.push({ month, name, shortName });
        }

        return months;
    };

    const [selectedMonth, setSelectedMonth] = useState<IMonth>(getLast12Months()[0]);

    const onMonthClick = (month: IMonth) => {
        setSelectedMonth(month);
        if (onMonthChange) {
            onMonthChange(month);
        }
    };

    const selectedMonthYear = () => {
        const year = moment(selectedMonth.month, 'YYYY-MM').year();
        return `${selectedMonth.name} ${year}`;
    };

    return (
        <DataVizCard
            title={
                <div className="flex items-start justify-between w-full">
                    <div>
                        <p className='className="text-sm font-bold text-gray-700 dark:text-gray-200'>
                            Workflow Executions
                        </p>
                        <p className="text-xs font-normal text-gray-600 dark:text-gray-400">
                            Workflow executions for {selectedMonthYear()}
                        </p>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size={'sm'} variant="secondary" trailingIcon={<ChevronDown />}>
                                {selectedMonth.shortName}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="bottom" align="end">
                            <DropdownMenuLabel>Months</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <div className="dropdown-content">
                                {getLast12Months().map((month) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={month.month}
                                            checked={selectedMonth.month === month.month}
                                            onCheckedChange={() => onMonthClick(month)}
                                        >
                                            {month.shortName}
                                        </DropdownMenuCheckboxItem>
                                    );
                                })}
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            }
            icon={<GitPullRequestArrow />}
            chart={
                <WorkflowChart
                    chartConfig={chartConfig}
                    chartData={chartData}
                    tableData={tableData}
                    hasData={hasData}
                    isLoading={isLoading}
                    onMonthChange={onMonthChange}
                />
            }
        />
    );
};
