'use client';
import { Button, Input, Select, Tooltip, TooltipTrigger } from '@/components';
import { Dialog, DialogContent, DialogHeader } from '@/components/atoms/dialog';
import FileUploader from '@/components/atoms/file-uploader';
import AppDrawer from '@/components/molecules/drawer/app-drawer';
import DataTable from '@/components/molecules/table/data-table';
import { cn, handleNoValue } from '@/lib/utils';
import { DialogTitle } from '@radix-ui/react-dialog';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { ColumnDef } from '@tanstack/react-table';
import { Unplug } from 'lucide-react';
import React, { useState } from 'react';
import DocumentEvaluation from './animated-document-evaluation-icon';

interface DatasetTableType {
    id: string;
    datasetName: string;
    numberOfSamples: number;
    createdAt: string;
}

const datasetTableData = [
    {
        id: '01',
        datasetName: 'Customer Onboarding Flow',
        numberOfSamples: 100,
        createdAt: '2023-10-01',
    },
    {
        id: '02',
        datasetName: 'Plan Upgrade Recommendations',
        numberOfSamples: 200,
        createdAt: '2023-10-02',
    },
    {
        id: '03',
        datasetName: 'Subscription Inventory Sync',
        numberOfSamples: 300,
        createdAt: '2023-10-03',
    },
    {
        id: '04',
        datasetName: 'Service Request Classification',
        numberOfSamples: 150,
        createdAt: '2023-10-04',
    },
    {
        id: '05',
        datasetName: 'Order Fulfillment Audit Logs',
        numberOfSamples: 275,
        createdAt: '2023-10-05',
    },
    {
        id: '06',
        datasetName: 'Billing Address Verification',
        numberOfSamples: 180,
        createdAt: '2023-10-06',
    },
    {
        id: '07',
        datasetName: 'User Interaction Analytics',
        numberOfSamples: 320,
        createdAt: '2023-10-07',
    },
    {
        id: '08',
        datasetName: 'Service Error Diagnosis',
        numberOfSamples: 95,
        createdAt: '2023-10-08',
    },
    {
        id: '09',
        datasetName: 'Session Drop-Off Analysis',
        numberOfSamples: 210,
        createdAt: '2023-10-09',
    },
];

export const DatasetContainer = () => {
    const [isOpen, setOpen] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    const columns: ColumnDef<DatasetTableType>[] = [
        {
            enableSorting: true,
            header: () => <div className="w-full text-left">Dataset Name</div>,
            accessorKey: 'datasetName',
            cell: ({ row }) => {
                return <div>{handleNoValue(row.getValue('datasetName'))}</div>;
            },
        },
        {
            enableSorting: false,
            header: () => <div className="w-full text-left">Number of samples</div>,
            accessorKey: 'numberOfSamples',
            cell: ({ row }) => {
                return <div>{handleNoValue(row.getValue('numberOfSamples'))}</div>;
            },
        },
        {
            enableSorting: false,
            header: () => <div className="w-full text-left">Created at</div>,
            accessorKey: 'createdAt',
            cell: ({ row }) => {
                return <div>{handleNoValue(row.getValue('createdAt'))}</div>;
            },
        },
        {
            enableSorting: false,
            header: () => <div className="w-full text-left"></div>,
            accessorKey: 'actionCol',
            cell: () => {
                return (
                    <div className="flex items-center gap-x-4 justify-center">
                        <Button size={'sm'} variant="link" onClick={() => setDialogOpen(true)}>
                            Evaluate
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
                data={datasetTableData}
                searchColumnName="workflow"
                showFooter
                defaultPageSize={10}
                showTableSearch={false}
                manualSpan={true}
                tableHeader={
                    <div className="flex justify-between items-center w-full">
                        <p>Datasets</p>
                        <div className="flex ml-2">
                            <Button onClick={() => setOpen(true)} size={'sm'}>
                                New Dataset
                            </Button>
                        </div>
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
                        <div>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button size={'sm'}>Save</Button>
                                    </TooltipTrigger>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                }
                content={
                    <div className={cn('activity-feed-container p-4')}>
                        <div>
                            <div className="flex gap-2">
                                <Unplug />
                                <h3>Synthetic data generation</h3>
                            </div>
                            <hr className="my-4" />
                        </div>
                        <div className="flex flex-col gap-8">
                            <div>
                                <Select
                                    label="Agent workflow"
                                    options={[
                                        { name: 'Billing dispute adjustment', value: 'workflow_id' },
                                        { name: 'Xinfinity CLV prediction', value: 'workflow_id2' },
                                        { name: 'Network Management wih LLM', value: 'workflow_id3' },
                                        { name: 'Network Management with MSLMTELPHI-4B', value: 'workflow_id4' },
                                    ]}
                                    placeholder="Select agent workflow"
                                />
                            </div>
                            <div className="border border-gray-700 rounded-md p-4 hover:border-gray-600 transition-all duration-200">
                                <FileUploader />
                            </div>
                            <div className="flex gap-4">
                                <Input
                                    label="Multi-turn step count"
                                    placeholder="Please enter multi-turn step count"
                                    type="number"
                                />
                                <Input
                                    label="Number of samples to be generated"
                                    placeholder="Please enter number of samples to be generated"
                                    type="number"
                                />
                            </div>

                            <div>
                                <Input label="Dataset name" placeholder="Please enter dataset name" />
                            </div>
                        </div>
                    </div>
                }
            />
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="overflow-y-auto max-h-[80%]">
                    <DialogHeader>
                        <DialogTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Evaluating dataset. Please wait while we process the data.
                            </p>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="min-h-[300px] flex flex-col items-center justify-center text-center p-8 rounded-lg border border-border">
                        <div className="mt-6 space-y-2 max-w-md">
                            <DocumentEvaluation />
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
