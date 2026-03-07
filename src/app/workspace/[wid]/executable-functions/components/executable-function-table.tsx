'use client';

import { IExecutableFunctionCredentialMeta } from '@/models';

import React, { useState } from 'react';
import { ColumnDef, Row } from '@tanstack/react-table';
import { Trash2, Pencil } from 'lucide-react';
import { Button, Input, TruncateCell } from '@/components';
import DataTable from '@/components/molecules/table/data-table';
import { useForm } from 'react-hook-form';
import { cn, handleNoValue } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/atoms/dialog';
import { useBreakpoint } from '@/hooks/use-breakpoints';

export interface ExecutableFunctionData {
    id: string;
    name: string;
    description: string;
    provider: string;
    startupOption: string;
    language: string;
    code: string;
    payload: string;
    region: string;
    deployedUrl?: string;
    credentials: {
        authType: string;
        meta?: IExecutableFunctionCredentialMeta;
    };
    dependencies?: Array<{ name: string; value: string; dataType: string }>;
    environmentVariables?: Array<{ name: string; value: string; dataType: string }>;
    search?: string;
    isReadOnly?: boolean;
}

interface ExecutableFunctionTableContainerProps {
    executableFunctions: ExecutableFunctionData[];
    onFunctionFilter: (filter: ExecutableFunctionData | null) => void;
    onNewButtonClick: () => void;
    onEditButtonClick: (id: string) => void;
    onDelete: (id: string) => void;
}

const DeleteRecord = ({ row, onDelete }: { row: Row<ExecutableFunctionData>; onDelete: (id: string) => void }) => {
    const [open, setOpen] = useState<boolean>(false);

    const handleDelete = () => {
        onDelete(row.original.id);
        setOpen(false);
    };

    return (
        <>
            <Button
                className={`w-full sm:w-max ${row.original.isReadOnly ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                variant="link"
                size="icon"
                onClick={() => setOpen(true)}
                disabled={row.original.isReadOnly}
            >
                <Trash2
                    size={18}
                    className={cn('', {
                        'text-gray-300 dark:text-gray-600': row.original.isReadOnly,
                        'text-gray-500 dark:text-gray-200': !row.original.isReadOnly,
                    })}
                />
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="overflow-y-auto max-h-[80%]">
                    <DialogHeader>
                        <DialogTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Are you sure, do you want to delete this?
                            </p>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 p-3">
                        <Button variant={'secondary'} size="sm" onClick={() => setOpen(false)}>
                            No
                        </Button>
                        <Button variant={'primary'} size="sm" onClick={handleDelete}>
                            Yes
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

const generateColumns = (onEditButtonClick: (id: string) => void, onDelete: (id: string) => void) => {
    const columns: ColumnDef<ExecutableFunctionData>[] = [
        {
            accessorKey: 'name',
            enableSorting: true,
            header() {
                return <div className="w-full text-left">Function Name</div>;
            },
            cell({ row }) {
                return (
                    <div>
                        <TruncateCell value={handleNoValue(row.getValue('name')) as string} length={35} />
                    </div>
                );
            },
        },
        {
            accessorKey: 'provider',
            enableSorting: true,
            size: 110,
            header() {
                return <div className="w-full text-left">Cloud Provider</div>;
            },
            cell({ row }) {
                return <div>{handleNoValue(row.getValue('provider'))}</div>;
            },
        },
        {
            accessorKey: 'language',
            enableSorting: true,
            size: 110,
            header() {
                return <div className="w-full text-left">Language</div>;
            },
            cell({ row }) {
                return <div>{handleNoValue(row.getValue('language'))}</div>;
            },
        },
        {
            accessorKey: 'deployedUrl',
            enableSorting: false,
            size: 320,
            header() {
                return <div className="w-full text-left">Deployed URL</div>;
            },
            cell({ row }) {
                const url = row.getValue('deployedUrl') as string | undefined;
                return (
                    <div className="max-w-[320px] break-all whitespace-normal">
                        {url ? (
                            <a href={url} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                                {url}
                            </a>
                        ) : (
                            <span className="text-gray-500">-</span>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'action',
            enableSorting: false,
            header() {
                return <div className="w-full text-left"></div>;
            },
            cell({ row }) {
                return (
                    <div className="flex items-center gap-x-4">
                        <DeleteRecord row={row} onDelete={onDelete} />
                        <Pencil
                            size={18}
                            className="text-gray-500 cursor-pointer dark:text-gray-200"
                            onClick={() => onEditButtonClick(row.original.id)}
                        />
                    </div>
                );
            },
        },
    ];

    return columns;
};

export const ExecutableFunctionTableContainer = ({
    executableFunctions,
    onFunctionFilter,
    onNewButtonClick,
    onEditButtonClick,
    onDelete,
}: ExecutableFunctionTableContainerProps) => {
    const { register, handleSubmit } = useForm<ExecutableFunctionData>({ mode: 'onChange' });
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
    const { isMobile } = useBreakpoint();

    const columns = generateColumns(onEditButtonClick, onDelete);

    const onHandleSubmit = (data: ExecutableFunctionData) => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        const timer = setTimeout(() => {
            onFunctionFilter(data);
        }, 1000);
        setDebounceTimer(timer);
    };

    return (
        <div className="grid gap-8">
            <DataTable
                columns={columns}
                data={executableFunctions}
                searchColumnName="workflow"
                showFooter
                defaultPageSize={isMobile ? 5 : 10}
                showTableSearch={false}
                manualSpan={true}
                tableHeader={
                    <div className="flex justify-between items-center w-full">
                        <Input
                            {...register('search')}
                            placeholder="Search by Function Name"
                            className="max-w-sm"
                            onKeyUp={handleSubmit(onHandleSubmit)}
                        />
                        <div className="flex ml-2 justify-end items-center gap-4 w-full">
                            <Button size={'sm'} onClick={onNewButtonClick}>
                                New Executable Function
                            </Button>
                        </div>
                    </div>
                }
            />
        </div>
    );
};
