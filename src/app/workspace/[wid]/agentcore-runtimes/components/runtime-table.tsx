'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input, Badge } from '@/components/atoms';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/atoms/dialog';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@/components/atoms/dropdown-menu';
import DataTable from '@/components/molecules/table/data-table';
import { cn, convert_YYYY_MM_DD_HH_MM } from '@/lib/utils';
import { ColumnDef, Row } from '@tanstack/react-table';
import { 
    Trash2, 
    RotateCw, 
    Edit2,
    MoreHorizontal,
    CheckCircle,
    Clock,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { Runtime, RuntimeStatus } from '../types';

interface RuntimeTableProps {
    data: Runtime[];
    onNewClick: () => void;
    onEditClick: (id: string) => void;
    onDelete: (id: string) => void;
    onRedeploy: (id: string) => void;
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
        Inactive: {
            variant: 'secondary' as const,
            icon: <Clock size={12} className="mr-1" />,
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

const DeleteConfirmDialog = ({ 
    open, 
    onOpenChange, 
    runtime, 
    onConfirm 
}: { 
    open: boolean; 
    onOpenChange: (open: boolean) => void;
    runtime: Runtime; 
    onConfirm: () => void;
}) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="overflow-y-auto max-h-[80%] max-w-md">
                <DialogHeader>
                    <DialogTitle>Delete Runtime</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Are you sure you want to delete runtime <span className="font-semibold text-gray-900 dark:text-gray-100">&quot;{runtime.name}&quot;</span>?
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        This action cannot be undone. Any workflows deployed to this runtime will stop working.
                    </p>
                </div>
                <DialogFooter>
                    <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button variant="destructive" size="sm" onClick={onConfirm}>
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const RedeployConfirmDialog = ({ 
    open, 
    onOpenChange, 
    runtime, 
    onConfirm,
    isRedeploying
}: { 
    open: boolean; 
    onOpenChange: (open: boolean) => void;
    runtime: Runtime; 
    onConfirm: () => void;
    isRedeploying: boolean;
}) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="overflow-y-auto max-h-[80%] max-w-md">
                <DialogHeader>
                    <DialogTitle>Re-deploy Runtime</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Are you sure you want to re-deploy runtime <span className="font-semibold text-gray-900 dark:text-gray-100">&quot;{runtime.name}&quot;</span>?
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        This will refresh the runtime connection and re-apply all configurations.
                    </p>
                </div>
                <DialogFooter>
                    <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)} disabled={isRedeploying}>
                        Cancel
                    </Button>
                    <Button variant="primary" size="sm" onClick={onConfirm} loading={isRedeploying}>
                        {isRedeploying ? 'Re-deploying...' : 'Re-deploy'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const ActionCell = ({ 
    row, 
    onEditClick, 
    onDelete,
    onRedeploy
}: { 
    row: Row<Runtime>; 
    onEditClick: (id: string) => void;
    onDelete: (id: string) => void;
    onRedeploy: (id: string) => void;
}) => {
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [redeployOpen, setRedeployOpen] = useState(false);
    const [isRedeploying, setIsRedeploying] = useState(false);

    const handleDelete = () => {
        onDelete(row.original.id);
        setDeleteOpen(false);
    };

    const handleRedeploy = async () => {
        setIsRedeploying(true);
        // Simulate redeploy
        await new Promise(resolve => setTimeout(resolve, 2000));
        onRedeploy(row.original.id);
        setIsRedeploying(false);
        setRedeployOpen(false);
    };

    return (
        <>
            <div className="flex items-center justify-center gap-x-1">
                <Button
                    variant="secondary"
                    size="sm"
                    className="h-8"
                    leadingIcon={<RotateCw size={14} />}
                    onClick={() => setRedeployOpen(true)}
                >
                    Re-deploy
                </Button>
                
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="w-8 h-8">
                            <MoreHorizontal size={16} className="text-gray-500" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => onEditClick(row.original.id)}>
                            <Edit2 size={14} className="mr-2" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            onClick={() => setDeleteOpen(true)}
                            className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                        >
                            <Trash2 size={14} className="mr-2" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <DeleteConfirmDialog 
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                runtime={row.original}
                onConfirm={handleDelete}
            />

            <RedeployConfirmDialog
                open={redeployOpen}
                onOpenChange={setRedeployOpen}
                runtime={row.original}
                onConfirm={handleRedeploy}
                isRedeploying={isRedeploying}
            />
        </>
    );
};

const generateColumns = (
    onEditClick: (id: string) => void,
    onDelete: (id: string) => void,
    onRedeploy: (id: string) => void
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
        enableSorting: false,
        header: () => <div className="w-full text-left">Description</div>,
        accessorKey: 'description',
        cell: ({ row }) => (
            <div className="text-gray-600 dark:text-gray-400 max-w-[200px] truncate">
                {row.getValue('description') || '-'}
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
            <ActionCell 
                row={row} 
                onEditClick={onEditClick} 
                onDelete={onDelete}
                onRedeploy={onRedeploy}
            />
        ),
    },
];

export const RuntimeTable = ({
    data,
    onNewClick,
    onEditClick,
    onDelete,
    onRedeploy,
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

    const columns = generateColumns(onEditClick, onDelete, onRedeploy);

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
