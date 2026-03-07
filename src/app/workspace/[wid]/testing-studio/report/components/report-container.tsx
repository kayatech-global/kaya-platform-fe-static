'use client';
import { Button } from '@/components';
import { Progress } from '@/components/atoms/progress';
import AppDrawer from '@/components/molecules/drawer/app-drawer';
import DataTable from '@/components/molecules/table/data-table';
import { cn, handleNoValue } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import { Unplug } from 'lucide-react';
import React, { useState } from 'react';

interface ReportTableType {
    id: string;
    executionStart: string;
    sampleCount: number;
    dataset: string;
    executionCount: number;
    contextPrecision: number;
    contextRecall: number;
    faithfulness: number;
    answerRelevancy: number;
}

const reportTableData: ReportTableType[] = [
    {
        id: '01',
        executionStart: 'October 1, 2023 10:00 AM',
        sampleCount: 100,
        dataset: 'AI-Driven Onboarding Suite',
        executionCount: 5,
        contextPrecision: 0.95,
        contextRecall: 0.9,
        faithfulness: 0.85,
        answerRelevancy: 0.8,
    },
    {
        id: '02',
        executionStart: 'October 5, 2023 2:30 PM',
        sampleCount: 120,
        dataset: 'Onboarding Flow - Telecom',
        executionCount: 4,
        contextPrecision: 0.92,
        contextRecall: 0.88,
        faithfulness: 0.87,
        answerRelevancy: 0.83,
    },
    {
        id: '03',
        executionStart: 'October 10, 2023 9:45 AM',
        sampleCount: 150,
        dataset: 'Plan Upgrade Advisor',
        executionCount: 6,
        contextPrecision: 0.94,
        contextRecall: 0.91,
        faithfulness: 0.89,
        answerRelevancy: 0.85,
    },
    {
        id: '04',
        executionStart: 'October 15, 2023 1:20 PM',
        sampleCount: 130,
        dataset: 'Service Triage Engine',
        executionCount: 5,
        contextPrecision: 0.93,
        contextRecall: 0.89,
        faithfulness: 0.86,
        answerRelevancy: 0.84,
    },
    {
        id: '05',
        executionStart: 'October 20, 2023 4:00 PM',
        sampleCount: 110,
        dataset: 'Billing Validator Core',
        executionCount: 3,
        contextPrecision: 0.91,
        contextRecall: 0.87,
        faithfulness: 0.84,
        answerRelevancy: 0.82,
    },
    {
        id: '06',
        executionStart: 'October 25, 2023 11:15 AM',
        sampleCount: 140,
        dataset: 'Telecom Interaction Hub',
        executionCount: 7,
        contextPrecision: 0.96,
        contextRecall: 0.92,
        faithfulness: 0.9,
        answerRelevancy: 0.88,
    },
    {
        id: '07',
        executionStart: 'October 30, 2023 3:10 PM',
        sampleCount: 160,
        dataset: 'Customer Lifecycle AI',
        executionCount: 4,
        contextPrecision: 0.93,
        contextRecall: 0.89,
        faithfulness: 0.88,
        answerRelevancy: 0.86,
    },
];

export const ReportContainer = () => {
    const [isOpen, setOpen] = useState(false);

    const columns: ColumnDef<ReportTableType>[] = [
        {
            enableSorting: true,
            header: () => <div className="w-full text-left">Execution start</div>,
            accessorKey: 'executionStart',
            cell: ({ row }) => {
                return <div>{handleNoValue(row.getValue('executionStart'))}</div>;
            },
        },
        {
            enableSorting: false,
            header: () => <div className="w-full text-left">Sample count</div>,
            accessorKey: 'sampleCount',
            cell: ({ row }) => {
                return <div>{handleNoValue(row.getValue('sampleCount'))}</div>;
            },
        },
        {
            enableSorting: false,
            header: () => <div className="w-full text-left">Dataset</div>,
            accessorKey: 'dataset',
            cell: ({ row }) => {
                return <div>{handleNoValue(row.getValue('dataset'))}</div>;
            },
        },
        {
            enableSorting: false,
            header: () => <div className="w-full text-left">Execution count</div>,
            accessorKey: 'executionCount',
            cell: ({ row }) => {
                return <div>{handleNoValue(row.getValue('executionCount'))}</div>;
            },
        },
        {
            enableSorting: false,
            header: () => <div className="w-full text-left">Context precision</div>,
            accessorKey: 'contextPrecision',
            cell: ({ row }) => {
                const value = row.getValue<number>('contextPrecision');
                return (
                    <div className="flex items-center gap-2">
                        <Progress value={value * 100} className="w-full h-2" />
                        <span className="text-xs text-muted-foreground w-12 text-right">
                            {(value * 100).toFixed(0)}%
                        </span>
                    </div>
                );
            },
        },
        {
            enableSorting: false,
            header: () => <div className="w-full text-left">Context recall</div>,
            accessorKey: 'contextRecall',
            cell: ({ row }) => {
                const value = row.getValue<number>('contextRecall');
                return (
                    <div className="flex items-center gap-2">
                        <Progress value={value * 100} className="w-full h-2" />
                        <span className="text-xs text-muted-foreground w-12 text-right">
                            {(value * 100).toFixed(0)}%
                        </span>
                    </div>
                );
            },
        },
        {
            enableSorting: false,
            header: () => <div className="w-full text-left">Faithfulness</div>,
            accessorKey: 'faithfulness',
            cell: ({ row }) => {
                const value = row.getValue<number>('faithfulness');
                return (
                    <div className="flex items-center gap-2">
                        <Progress value={value * 100} className="w-full h-2" />
                        <span className="text-xs text-muted-foreground w-12 text-right">
                            {(value * 100).toFixed(0)}%
                        </span>
                    </div>
                );
            },
        },
        {
            enableSorting: false,
            header: () => <div className="w-full text-left">Answer relevancy</div>,
            accessorKey: 'answerRelevancy',
            cell: ({ row }) => {
                const value = row.getValue<number>('answerRelevancy');
                return (
                    <div className="flex items-center gap-2">
                        <Progress value={value * 100} className="w-full h-2" />
                        <span className="text-xs text-muted-foreground w-12 text-right">
                            {(value * 100).toFixed(0)}%
                        </span>
                    </div>
                );
            },
        },
        {
            enableSorting: false,
            header: () => <div className="w-full text-left"></div>,
            accessorKey: 'actionCol',
            cell: () => {
                return (
                    <div className="flex items-center gap-x-4 justify-center">
                        <Button size={'sm'} variant="link" onClick={() => setOpen(true)}>
                            View Report
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <div>
            <DataTable
                columns={columns}
                data={reportTableData}
                searchColumnName="workflow"
                showFooter
                defaultPageSize={10}
                showTableSearch={false}
                manualSpan={true}
                tableHeader={
                    <div className="flex justify-between items-center w-full">
                        <p>Reports</p>
                    </div>
                }
            />
            <AppDrawer
                open={isOpen}
                direction="right"
                isPlainContentSheet
                setOpen={setOpen}
                className="custom-drawer-content"
                dismissible={false}
                footer={
                    <div className="flex justify-end gap-2">
                        <Button variant={'secondary'} size={'sm'} onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                    </div>
                }
                content={
                    <div className={cn('activity-feed-container p-4')}>
                        <div>
                            <div className="flex gap-2">
                                <Unplug />
                                <h3>Detailed Report</h3>
                            </div>
                            <hr className="my-4" />
                        </div>
                        <div className="flex flex-col gap-8">report should come header</div>
                    </div>
                }
            />
        </div>
    );
};
