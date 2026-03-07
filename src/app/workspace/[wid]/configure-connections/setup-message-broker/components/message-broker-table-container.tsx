'use client';

import React, { useState } from 'react';
import { ColumnDef, Row } from '@tanstack/react-table';
import { Trash2, Pencil, Search } from 'lucide-react';
import { Button, Input, OptionModel } from '@/components';
import DataTable from '@/components/molecules/table/data-table';
import { useForm } from 'react-hook-form';
import { cn, handleNoValue } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/atoms/dialog';
import { useBreakpoint } from '@/hooks/use-breakpoints';
import { IMessageBroker } from '@/models';

interface MessageBrokerTableContainerProps {
    messageBrokers: IMessageBroker[];
    messageBrokerProviders: OptionModel[];
    onMessageBrokerFilter: (filter: IMessageBroker | null) => void;
    onNewButtonClick: () => void;
    onEditButtonClick: (id: string) => void;
    onDelete: (id: string) => void;
}

const DeleteRecord = ({ row, onDelete }: { row: Row<IMessageBroker>; onDelete: (id: string) => void }) => {
    const [open, setOpen] = useState<boolean>(false);

    const handleDelete = () => {
        if (row.original.id) {
            onDelete(row.original.id);
        }
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
                                Are you sure, do you want to delete this message broker?
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

const generateColumns = (
    messageBrokerProviders: OptionModel[],
    onEditButtonClick: (id: string) => void,
    onDelete: (id: string) => void
) => {
    const columns: ColumnDef<IMessageBroker>[] = [
        {
            accessorKey: 'name',
            enableSorting: true,
            header() {
                return <div className="w-full text-left">Message Broker Name</div>;
            },
            cell({ row }) {
                let name = handleNoValue(row.getValue('name'));
                if (typeof name !== 'string') {
                    name = String(name ?? '');
                }
                const truncated = name.length > 70 ? name.slice(0, 70) + '...' : name;
                return <div title={name}>{truncated}</div>;
            },
        },
        {
            accessorKey: 'provider',
            enableSorting: false,
            header() {
                return <div className="w-full text-left">Provider</div>;
            },
            cell({ row }) {
                const provider = messageBrokerProviders?.find(x => x.value === row.getValue('provider'));
                return <div>{handleNoValue(provider?.name)}</div>;
            },
        },
        {
            accessorKey: 'configurations.clusterUrl',
            enableSorting: false,
            meta: {
                width: '40%',
            },
            header() {
                return <div className="w-full text-left">Cluster URL</div>;
            },
            cell({ row }) {
                return <div>{handleNoValue(row.original.configurations?.clusterUrl)}</div>;
            },
        },
        {
            accessorKey: 'id',
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
                            onClick={() => onEditButtonClick(row.getValue('id'))}
                        />
                    </div>
                );
            },
        },
    ];

    return columns;
};

export const MessageBrokerTableContainer = ({
    messageBrokers,
    messageBrokerProviders,
    onMessageBrokerFilter,
    onNewButtonClick,
    onEditButtonClick,
    onDelete,
}: MessageBrokerTableContainerProps) => {
    const { register, handleSubmit } = useForm<IMessageBroker>({ mode: 'onChange' });
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
    const { isMobile } = useBreakpoint();

    const onHandleSubmit = (data: IMessageBroker) => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        const timer = setTimeout(() => {
            onMessageBrokerFilter(data);
        }, 1000);
        setDebounceTimer(timer);
    };

    const columns = generateColumns(messageBrokerProviders, onEditButtonClick, onDelete);

    return (
        <div className="grid gap-8">
            <DataTable
                columns={columns}
                data={messageBrokers}
                searchColumnName="messageBroker"
                showFooter
                defaultPageSize={isMobile ? 5 : 10}
                showTableSearch={false}
                manualSpan={true}
                tableHeader={
                    <div className="flex justify-between items-center w-full">
                        <div className="relative w-full max-w-sm">
                            <Input
                                {...register('search')}
                                placeholder="Search message broker name"
                                className="pr-10 w-full"
                                onKeyUp={handleSubmit(onHandleSubmit)}
                            />
                            <Search
                                size={16}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                            />
                        </div>
                        <div className="flex ml-2 justify-end items-center gap-4 w-full">
                            <Button size={'sm'} onClick={onNewButtonClick}>
                                New Message Broker
                            </Button>
                        </div>
                    </div>
                }
            />
        </div>
    );
};
