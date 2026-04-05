'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input, Badge } from '@/components/atoms';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/atoms/dialog';
import DataTable from '@/components/molecules/table/data-table';
import { cn, convert_YYYY_MM_DD_HH_MM } from '@/lib/utils';
import { ColumnDef, Row } from '@tanstack/react-table';
import { 
    Trash2, 
    RotateCw, 
    BarChart3, 
    Copy,
    CheckCircle,
    Clock,
    AlertCircle
} from 'lucide-react';
import { Runtime, RuntimeStatus } from '../types';

interface RuntimeTableProps {
    data: Runtime[];
    onNewClick: () => void;
    onEditClick: (id: string) => void;
    onDelete: (id: string) => void;
    onFilter: (search: string) => void;
}

const StatusBadge = ({ status }: { status: RuntimeStatus }) => {
    const config = {
        Deployed: {
            variant: 'success' as const,
            icon: <CheckCircle size={12} className="mr-1" />,
        },
        Queued: {
            variant: 'warning' as const,
            icon: <Clock size={12} className="mr-1" />,
        },
        Error: {
            variant: 'destructive' as const,
            icon: <AlertCircle size={12} className="mr-1" />,
        },
    };

    const { variant, icon } = config[status];

    return (
        <Badge variant={variant} className="flex items-center w-fit">
            {icon}
            {status}
        </Badge>
    );
};

const DeleteRecord = ({ row, onDelete }: { row: Row<Runtime>; onDelete: (id: string) => void }) => {
    const [open, setOpen] = useState<boolean>(false);

    const handleDelete = () => {
        onDelete(row.original.id);
        setOpen(false);
    };

    return (
        <>
            <Button
                className="w-max cursor-pointer"
                variant="link"
                size="icon"
                onClick={() => setOpen(true)}
            >
                <Trash2 size={16} className="text-gray-500 dark:text-gray-300" />
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="overflow-y-auto max-h-[80%]">
                    <DialogHeader>
                        <DialogTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Are you sure you want to delete runtime &quot;{row.original.name}&quot;?
                            </p>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 p-3">
                        <Button variant={'secondary'} size="sm" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant={'destructive'} size="sm" onClick={handleDelete}>
                            Delete
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

const generateColumns = (
    onEditClick: (id: string) => void,
    onDelete: (id: string) => void
): ColumnDef<Runtime>[] => [
    {
        enableSorting: true,
        header: () => <div className="w-full text-left">Runtime Name</div>,
        accessorKey: 'name',
        cell: ({ row }) => (
            <div 
                className="text-blue-600 cursor-pointer hover:underline font-medium"
                onClick={() => onEditClick(row.original.id)}
            >
                {row.getValue('name')}
            </div>
        ),
    },
    {
        enableSorting: true,
        header: () => <div className="w-full text-left">Region</div>,
        accessorKey: 'region',
        cell: ({ row }) => (
            <div className="text-gray-700 dark:text-gray-300">{row.getValue('region')}</div>
        ),
    },
    {
        enableSorting: true,
        header: () => <div className="w-full text-left">Status</div>,
        accessorKey: 'status',
        cell: ({ row }) => <StatusBadge status={row.getValue('status')} />,
    },
    {
        enableSorting: true,
        header: () => <div className="w-full text-left">Created</div>,
        accessorKey: 'createdAt',
        cell: ({ row }) => (
            <div className="text-gray-600 dark:text-gray-400">
                {convert_YYYY_MM_DD_HH_MM(row.getValue('createdAt'))}
            </div>
        ),
    },
    {
        enableSorting: false,
        header: () => <div className="w-full text-center">Actions</div>,
        accessorKey: 'actions',
        cell: ({ row }) => (
            <div className="flex items-center justify-center gap-x-1">
                <Button
                    variant="secondary"
                    size="sm"
                    className="h-8"
                    leadingIcon={<RotateCw size={14} />}
                >
                    Re-deploy
                </Button>
                <Button variant="link" size="icon" className="w-8 h-8">
                    <BarChart3 size={16} className="text-gray-500" />
                </Button>
                <Button variant="link" size="icon" className="w-8 h-8">
                    <Copy size={16} className="text-gray-500" />
                </Button>
                <DeleteRecord row={row} onDelete={onDelete} />
            </div>
        ),
    },
];

export const RuntimeTable = ({
    data,
    onNewClick,
    onEditClick,
    onDelete,
    onFilter,
}: RuntimeTableProps) => {
    const { register, handleSubmit } = useForm<{ search: string }>({ mode: 'onChange' });
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

    const onHandleSearch = (formData: { search: string }) => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        const timer = setTimeout(() => {
            onFilter(formData.search);
        }, 500);
        setDebounceTimer(timer);
    };

    const columns = generateColumns(onEditClick, onDelete);

    return (
        <div className="grid gap-8">
            <DataTable
                columns={columns}
                data={data}
                searchColumnName="name"
                showFooter
                defaultPageSize={10}
                showTableSearch={false}
                tableHeader={
                    <div className="flex justify-between items-center w-full">
                        <div className="flex items-center gap-x-3">
                            <Input
                                {...register('search')}
                                placeholder="Search runtimes..."
                                className="w-[280px]"
                                onKeyUp={handleSubmit(onHandleSearch)}
                            />
                            <Button variant="secondary" size="sm">
                                Filter
                            </Button>
                        </div>
                        <Button size="sm" onClick={onNewClick}>
                            New Runtime
                        </Button>
                    </div>
                }
            />
        </div>
    );
};
