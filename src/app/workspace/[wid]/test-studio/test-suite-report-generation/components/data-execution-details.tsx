'use client';
import {
    ITestExecutionHistory,
    TestStatus,
    ITestExecutionInputReport,
} from '../../data-generation';
import { handleNoValue } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import DataTable from '@/components/molecules/table/data-table';
import { ChartPie, FileInput, Info, Check, X } from 'lucide-react';
import { Label, Pie, PieChart } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/atoms/chart';
import { Badge, TruncateCell } from '@/components';
import { ReactNode } from 'react';
import { ExecutionReport } from './execution-report';

type DataExecutionDetailsProps = {
    execution: ITestExecutionHistory;
};

const generateColumns = (getStatusBadge: (status: TestStatus) => ReactNode, execution: ITestExecutionHistory) => {
    const columns: ColumnDef<ITestExecutionInputReport>[] = [
        {
            accessorKey: 'input',
            enableSorting: true,
            header() {
                return <div className={`w-full text-left font-semibold whitespace-nowrap`}>Test Cases</div>;
            },
            cell({ row }) {
                const original = row?.original ?? {};
                const { input } = original;
                return <div className={`font-medium whitespace-preline`}>{handleNoValue(input)}</div>;
            },
        },
        {
            accessorKey: 'status',
            enableSorting: true,
            header() {
                return <div className={`w-full text-left font-semibold whitespace-nowrap`}>Status</div>;
            },
            cell({ row }) {
                const original = row?.original ?? {};
                const { status } = original;
                return <div className={`font-medium `}>{status ? getStatusBadge(status) : '-'}</div>;
            },
        },
        // {
        //     accessorKey: 'score',
        //     enableSorting: true,
        //     header() {
        //         return <div className={`w-full text-left font-semibold whitespace-nowrap`}>Score</div>;
        //     },
        //     cell({ row }) {
        //         const { score } = row?.original;
        //         return <div className={`font-medium `}>{score ? `${score}` : '-'}</div>;
        //     },
        // },
        {
            accessorKey: 'id',
            enableSorting: false,
            header() {
                return <></>;
            },
            cell({ row }) {
                const original = row?.original ?? {};
                return <ExecutionReport report={original} execution={execution} />;
            },
        },
    ];
    return columns;
};

const renderPieChartLabel = (viewBox: unknown, total: number) => {
    const isValidViewBox = (vb: unknown): vb is { cx: number; cy: number } => {
        return (
            typeof vb === 'object' &&
            vb !== null &&
            'cx' in vb &&
            'cy' in vb &&
            typeof (vb as { cx: unknown }).cx === 'number' &&
            typeof (vb as { cy: unknown }).cy === 'number'
        );
    };

    if (isValidViewBox(viewBox)) {
        return (
            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                <tspan x={viewBox.cx} y={viewBox.cy} className="fill-gray-800 dark:fill-gray-200 text-[3rem] font-bold">
                    {total}
                </tspan>
            </text>
        );
    }
};

export const DataExecutionDetails = (props: DataExecutionDetailsProps) => {
    const { execution } = props;
    const { report } = execution;

    const chartConfig = {
        result: {
            label: 'Result',
        },
    } satisfies ChartConfig;

    const chartData = [
        { name: 'Passed', value: report?.resultCount.passed ?? 0, fill: '#16a34a' },
        { name: 'Failed', value: (report?.resultCount.failed ?? 0) + (report?.resultCount.skipped ?? 0), fill: '#dc2626' },
    ];

    const getStatusBadge = (status: TestStatus): ReactNode => {
        switch (status) {
            case TestStatus.Passed:
                return <Badge variant={'success'} testStudio={true}>{status}</Badge>;
            case TestStatus.Failed:
                return <Badge variant={'error'} testStudio={true}>{status}</Badge>;
            default:
                return <Badge variant={'secondary'} testStudio={true}>{status}</Badge>;
        }
    };

    const columns = generateColumns(getStatusBadge, execution);

    return (
        <div>
            <div className="flex gap-4">
                <div className="flex flex-col gap-3 bg-blue-50 dark:bg-gray-900 rounded-md border border-blue-100 dark:border-gray-700 p-6 w-[80%] justify-between">
                    <div>
                        <div className="flex items-center gap-[6px] text-blue-600 dark:text-blue-400 pb-2">
                        <Info size={18} />
                        <p className="text-md font-medium text-blue-600 dark:text-blue-400">Summary</p>
                    </div>
                    <TruncateCell
                        length={600}
                        value={report?.summary ?? ''}
                        className="text-xs text-gray-700 dark:text-gray-300"
                    />
                    </div>
                    
                    <div className='flex gap-3'>
                        <div className="flex items-center gap-3 mt-2 border bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 rounded-md p-4 w-full justify-between">
                            <div className="flex flex-col gap-3">
                                <div className="text-md font-medium text-blue-700 dark:text-blue-400 mb-1">Total Inputs</div>
                                <div className="text-[2rem] font-bold text-blue-700 dark:text-blue-400">{report?.resultCount?.total}</div>
                            </div>
                             <FileInput size={50} className="text-blue-600 dark:text-blue-400" />
                        </div>
                         <div className="flex items-center gap-3 mt-2 border bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 rounded-md p-4 w-full justify-between">
                           
                            <div className="flex flex-col gap-3">
                                <div className="text-md font-medium text-green-700 dark:text-green-400 mb-1">Total Passed</div>
                                <div className="text-[2rem] font-bold text-green-700 dark:text-green-400">{report?.resultCount?.passed}</div>
                            </div>
                             <Check size={50} className="text-green-600 dark:text-green-400" />
                        </div>
                         <div className="flex items-center gap-3 mt-2 border bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 rounded-md p-4 w-full justify-between">

                            <div className="flex flex-col gap-3">
                                <div className="text-md font-medium text-red-500 dark:text-red-400 mb-1">Total Failed</div>
                                <div className="text-[2rem] font-bold text-red-500 dark:text-red-400">{(report?.resultCount?.failed ?? 0) + (report?.resultCount?.skipped ?? 0)}</div>
                            </div>
                             <X size={50} className="text-red-600 dark:text-red-400" />
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-center gap-3 bg-gray-100 dark:bg-gray-900 rounded-md border dark:border-gray-700 p-4 w-[20%]">
                    <div className="w-auto flex items-center">
                        <div className="flex items-center gap-2 ">
                            <ChartPie size={16} className="dark:text-gray-400" />
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pass vs Fail Distribution</p>
                        </div>
                        {/* <div className="flex items-center gap-2">
                            <FileInput size={14} />
                            <p className="text-xs text-gray-500">
                                Total Inputs - <span className="font-bold">{report?.resultCount?.total}</span>
                            </p>
                        </div> */}
                    </div>
                    <div className="flex gap-1 justify-between flex-col items-center w-full">
                        <ChartContainer
                            config={chartConfig}
                            className="m-0 aspect-square min-h-[200px] max-h-[200px]"
                        >
                            <PieChart>
                                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                <Pie data={chartData} dataKey="value" nameKey="name" innerRadius="50%" paddingAngle={3} cornerRadius={4} strokeWidth={0}>
                                    <Label
                                        content={({ viewBox }) => renderPieChartLabel(viewBox, report?.resultCount?.total ?? 0)}
                                    />
                                </Pie>
                            </PieChart>
                        </ChartContainer>
                        {/* <div className="flex gap-4 h-full items-start justify-center">
                            <div className="flex items-center gap-3">
                                <div className="size-3 rounded-sm bg-[#16a34a]"></div>
                                Passed - {report?.resultCount.passed ?? 0}
                            </div>
                            <div className="flex items-center gap-3 border-l-2 border-gray-300 pl-3">
                                <div className="size-3 rounded-sm bg-[#dc2626]"></div>
                                Failed - {report?.resultCount.failed ?? 0}
                            </div>
                        </div> */}
                    </div>
                </div>
            </div>
            <div className="mt-4 space-y-3">
                <DataTable
                    columns={columns}
                    data={execution?.report.inputReport}
                    searchColumnName="Test"
                    defaultPageSize={5}
                    showTableSearch={false}
                    manualSpan={true}
                    showHeader={false}
                    showFooter
                />
            </div>
        </div>
    );
};
