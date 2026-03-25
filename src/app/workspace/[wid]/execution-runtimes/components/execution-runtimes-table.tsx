'use client';

import React, { useState } from 'react';
import { ColumnDef, Row } from '@tanstack/react-table';
import { Trash2, Pencil, Eye, Server, Cloud, AlertCircle, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button, Input, TruncateCell } from '@/components';
import DataTable from '@/components/molecules/table/data-table';
import { useForm } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/atoms/dialog';
import { useBreakpoint } from '@/hooks/use-breakpoints';
import { Badge } from '@/components/atoms/badge';
import { ExecutionRuntimeData } from '@/mocks/execution-runtimes-data';

interface ExecutionRuntimesTableProps {
    runtimes: ExecutionRuntimeData[];
    onNewButtonClick: () => void;
    onEditButtonClick: (id: string) => void;
    onViewDetail: (id: string) => void;
    onDelete: (id: string) => void;
    onSearch: (query: string) => void;
}

const StatusBadge = ({ status }: { status: ExecutionRuntimeData['status'] }) => {
    const config = {
        active: {
            label: 'Active',
            className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
            icon: <CheckCircle2 size={12} />,
        },
        provisioning: {
            label: 'Provisioning',
            className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
            icon: <Loader2 size={12} className="animate-spin" />,
        },
        error: {
            label: 'Error',
            className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
            icon: <XCircle size={12} />,
        },
        inactive: {
            label: 'Inactive',
            className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700',
            icon: <AlertCircle size={12} />,
        },
    };

    const { label, className, icon } = config[status];

    return (
        <Badge variant="outline" className={cn('gap-1 font-medium text-xs', className)}>
            {icon}
            {label}
        </Badge>
    );
};

const ProviderBadge = ({ provider }: { provider: ExecutionRuntimeData['provider'] }) => {
    const config: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
        'kaya-runtime': {
            label: 'Kaya Runtime',
            icon: <Server size={12} />,
            className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
        },
        'aws-agentcore': {
            label: 'AWS AgentCore',
            icon: <Cloud size={12} />,
            className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
        },
        'gcp-adk': {
            label: 'GCP ADK',
            icon: <Cloud size={12} />,
            className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
        },
        'azure-ai': {
            label: 'Azure AI',
            icon: <Cloud size={12} />,
            className: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 border-sky-200 dark:border-sky-800',
        },
    };

    const { label, icon, className } = config[provider] || config['kaya-runtime'];

    return (
        <Badge variant="outline" className={cn('gap-1 font-medium text-xs', className)}>
            {icon}
            {label}
        </Badge>
    );
};

const DeleteRecord = ({
    row,
    onDelete,
}: {
    row: Row<ExecutionRuntimeData>;
    onDelete: (id: string) => void;
}) => {
    const [open, setOpen] = useState<boolean>(false);

    const handleDelete = () => {
        onDelete(row.original.id);
        setOpen(false);
    };

    return (
        <>
            <Button
                className="w-full sm:w-max cursor-pointer"
                variant="link"
                size="icon"
                onClick={() => setOpen(true)}
            >
                <Trash2 size={16} className="text-gray-500 dark:text-gray-200" />
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="overflow-y-auto max-h-[80%]">
                    <DialogHeader>
                        <DialogTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Are you sure you want to delete the runtime configuration &quot;{row.original.name}&quot;?
                                {row.original.linkedWorkflows > 0 && (
                                    <span className="block mt-2 text-amber-600 dark:text-amber-400">
                                        Warning: This runtime is linked to {row.original.linkedWorkflows} workflow(s).
                                    </span>
                                )}
                            </p>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 p-3">
                        <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" size="sm" onClick={handleDelete}>
                            Delete
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

const generateColumns = (
    onEditButtonClick: (id: string) => void,
    onViewDetail: (id: string) => void,
    onDelete: (id: string) => void
) => {
    const columns: ColumnDef<ExecutionRuntimeData>[] = [
        {
            accessorKey: 'name',
            enableSorting: true,
            header() {
                return <div className="w-full text-left">Runtime Name</div>;
            },
            cell({ row }) {
                return (
                    <div
                        className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        onClick={() => onViewDetail(row.original.id)}
                    >
                        <TruncateCell value={row.getValue('name') as string} length={30} />
                    </div>
                );
            },
        },
        {
            accessorKey: 'provider',
            enableSorting: true,
            size: 160,
            header() {
                return <div className="w-full text-left">Provider</div>;
            },
            cell({ row }) {
                return <ProviderBadge provider={row.getValue('provider')} />;
            },
        },
        {
            accessorKey: 'status',
            enableSorting: true,
            size: 130,
            header() {
                return <div className="w-full text-left">Status</div>;
            },
            cell({ row }) {
                return <StatusBadge status={row.getValue('status')} />;
            },
        },
        {
            accessorKey: 'region',
            enableSorting: true,
            size: 140,
            header() {
                return <div className="w-full text-left">Region</div>;
            },
            cell({ row }) {
                const region = row.getValue('region') as string | undefined;
                return (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        {region || <span className="text-gray-400">-</span>}
                    </div>
                );
            },
        },
        {
            accessorKey: 'linkedWorkflows',
            enableSorting: true,
            size: 130,
            header() {
                return <div className="w-full text-left">Linked Workflows</div>;
            },
            cell({ row }) {
                const count = row.getValue('linkedWorkflows') as number;
                return (
                    <div className="text-sm">
                        <span
                            className={cn(
                                'font-medium',
                                count > 0
                                    ? 'text-blue-600 dark:text-blue-400'
                                    : 'text-gray-400 dark:text-gray-500'
                            )}
                        >
                            {count}
                        </span>
                    </div>
                );
            },
        },
        {
            accessorKey: 'action',
            enableSorting: false,
            size: 120,
            header() {
                return <div className="w-full text-left"></div>;
            },
            cell({ row }) {
                return (
                    <div className="flex items-center gap-x-2">
                        <Button
                            className="w-full sm:w-max cursor-pointer"
                            variant="link"
                            size="icon"
                            onClick={() => onViewDetail(row.original.id)}
                        >
                            <Eye size={16} className="text-gray-500 dark:text-gray-200" />
                        </Button>
                        <Pencil
                            size={16}
                            className="text-gray-500 cursor-pointer dark:text-gray-200"
                            onClick={() => onEditButtonClick(row.original.id)}
                        />
                        <DeleteRecord row={row} onDelete={onDelete} />
                    </div>
                );
            },
        },
    ];

    return columns;
};

export const ExecutionRuntimesTable = ({
    runtimes,
    onNewButtonClick,
    onEditButtonClick,
    onViewDetail,
    onDelete,
    onSearch,
}: ExecutionRuntimesTableProps) => {
    const { register, handleSubmit } = useForm<{ search: string }>({ mode: 'onChange' });
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
    const { isMobile } = useBreakpoint();

    const columns = generateColumns(onEditButtonClick, onViewDetail, onDelete);

    const onHandleSubmit = (data: { search: string }) => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
        const timer = setTimeout(() => {
            onSearch(data.search || '');
        }, 500);
        setDebounceTimer(timer);
    };

    return (
        <div className="grid gap-8">
            <DataTable
                columns={columns}
                data={runtimes}
                searchColumnName="runtime"
                showFooter
                defaultPageSize={isMobile ? 5 : 10}
                showTableSearch={false}
                manualSpan={true}
                tableHeader={
                    <div className="flex justify-between items-center w-full">
                        <Input
                            {...register('search')}
                            placeholder="Search by name, provider, or description"
                            className="max-w-sm"
                            onKeyUp={handleSubmit(onHandleSubmit)}
                        />
                        <div className="flex ml-2 justify-end items-center gap-4 w-full">
                            <Button size="sm" onClick={onNewButtonClick}>
                                New Runtime Configuration
                            </Button>
                        </div>
                    </div>
                }
            />
        </div>
    );
};
