'use client';

import React, { useState } from 'react';
import { ColumnDef, Row } from '@tanstack/react-table';
import { ListFilter, Trash2, Pencil } from 'lucide-react';
import { Button, Input, Select } from '@/components';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/atoms/popover';
import DataTable from '@/components/molecules/table/data-table';
import { useForm, UseFormHandleSubmit, UseFormRegister, UseFormReset, UseFormWatch } from 'react-hook-form';
import { IProvider, IProviderConfig } from '@/models';
import { cn, handleNoValue } from '@/lib/utils';
import { useBreakpoint } from '@/hooks/use-breakpoints';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/atoms/dialog';

export interface SlmConfigurationData {
    id?: string;
    name: string;
    provider: string;
    modelName: string;
    configurations?: {
        description: string;
        temperature: number | null;
        apiAuthorization: string;
        providerConfig?: IProviderConfig;
        customRuntime: boolean;
        baseUrl: string;
        accessKey?: string;
        secretKey?: string;
        region?: string;
        tokenLimit: number | null;
    };
    search?: string;
    isReadOnly?: boolean;
}

interface SlmConfigurationTableContainerProps {
    slmConfigurations: SlmConfigurationData[];
    providers: IProvider[];
    onSlmConfigurationFilter: (filter: SlmConfigurationData | null) => void;
    onNewButtonClick: () => void;
    onEditButtonClick: (id: string) => void;
    onDelete: (id: string) => void;
    onRecentActivity: () => void;
}

const DeleteRecord = ({ row, onDelete }: { row: Row<SlmConfigurationData>; onDelete: (id: string) => void }) => {
    const [open, setOpen] = useState<boolean>(false);

    const handleDelete = () => {
        onDelete(row.original.id as string);
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
    const columns: ColumnDef<SlmConfigurationData>[] = [
        {
            accessorKey: 'name',
            enableSorting: true,
            header() {
                return <div className="w-full text-left">Connection Name</div>;
            },
            cell({ row }) {
                return <div>{handleNoValue(row.getValue('name'))}</div>;
            },
        },
        {
            accessorKey: 'provider',
            enableSorting: false,
            header() {
                return <div className="w-full text-left">SLM Provider</div>;
            },
            cell({ row }) {
                return <div>{handleNoValue(row.getValue('provider'))}</div>;
            },
        },
        {
            accessorKey: 'modelName',
            enableSorting: false,
            header() {
                return <div className="w-full text-left">Model Name</div>;
            },
            cell({ row }) {
                return <div>{handleNoValue(row.getValue('modelName'))}</div>;
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

const SlmConfigurationFilter = ({
    providers,
    onSlmConfigurationFilter,
    watch,
    register,
    reset,
    handleSubmit,
}: {
    providers: IProvider[];
    onSlmConfigurationFilter: (filter: SlmConfigurationData | null) => void;
    watch: UseFormWatch<SlmConfigurationData>;
    register: UseFormRegister<SlmConfigurationData>;
    reset: UseFormReset<SlmConfigurationData>;
    handleSubmit: UseFormHandleSubmit<SlmConfigurationData>;
}) => {
    const [open, setOpen] = useState(false);
    const [maxDistance, setMaxDistance] = useState(0);

    const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        const buttonRect = event.currentTarget.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        const distanceToTop = buttonRect.top;
        const distanceToBottom = viewportHeight - buttonRect.bottom;

        const maxDist = Math.max(distanceToTop, distanceToBottom);
        setMaxDistance(maxDist - 20);
    };

    const onHandleSubmit = (data: SlmConfigurationData) => {
        onSlmConfigurationFilter(data);
        setOpen(false);
    };

    const clearFilter = () => {
        reset({
            name: '',
            configurations: {
                baseUrl: '',
            },
            search: watch('search'),
            provider: '',
        });
        onSlmConfigurationFilter({ search: watch('search') } as SlmConfigurationData);
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <div className="flex gap-x-2">
                <PopoverTrigger asChild>
                    <Button variant="secondary" leadingIcon={<ListFilter />} onClick={handleButtonClick}>
                        Filter
                    </Button>
                </PopoverTrigger>
            </div>
            <PopoverContent
                className={cn(
                    'w-72 max-h-[400px] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-gray-700 dark:[&::-webkit-scrollbar-thumb]:bg-gray-500'
                )}
                style={{ maxHeight: `${maxDistance}px` }}
                side="bottom"
                align="end"
            >
                <div className="flex flex-col gap-y-6">
                    <div className="form-container flex flex-col gap-y-4">
                        {/* <div className="flex flex-col gap-y-2">
                            <div className="flex items-center gap-x-3">
                                <Input {...register('connectionName')} placeholder="Connection Name" />
                            </div>
                        </div> */}
                        <div className="flex flex-col gap-y-2">
                            <div className="flex items-center gap-x-3">
                                <Select
                                    {...register('provider')}
                                    placeholder={providers.length > 0 ? 'Select Provider' : 'No Provider found'}
                                    disabled={providers.length === 0}
                                    options={providers?.map(x => ({ name: x.value, value: x.value }))}
                                    currentValue={watch('provider')}
                                />
                            </div>
                        </div>
                        <div className="flex self-end mt-3 gap-2">
                            <Button variant={'secondary'} onClick={() => clearFilter()}>
                                Clear
                            </Button>
                            <Button variant={'primary'} onClick={handleSubmit(onHandleSubmit)}>
                                Apply Filter
                            </Button>
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export const SlmConfigurationTableContainer = ({
    providers,
    slmConfigurations,
    onSlmConfigurationFilter,
    onNewButtonClick,
    onEditButtonClick,
    onDelete,
    onRecentActivity,
}: SlmConfigurationTableContainerProps) => {
    const { register, handleSubmit, reset, watch } = useForm<SlmConfigurationData>({ mode: 'onChange' });
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
    const { isMobile } = useBreakpoint();

    const onHandleSubmit = (data: SlmConfigurationData) => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        const timer = setTimeout(() => {
            onSlmConfigurationFilter(data);
        }, 1000);
        setDebounceTimer(timer);
    };

    const columns = generateColumns(onEditButtonClick, onDelete);
    return (
        <div className="grid gap-8">
            <DataTable
                columns={columns}
                data={slmConfigurations}
                searchColumnName="workflow"
                showFooter
                defaultPageSize={isMobile ? 5 : 10}
                showTableSearch={false}
                manualSpan={true}
                tableHeader={
                    <div className="flex justify-between items-center w-full">
                        <Input
                            {...register('search')}
                            placeholder="Search by Connection Name"
                            className="max-w-sm"
                            onKeyUp={handleSubmit(onHandleSubmit)}
                        />
                        <div className="flex ml-2 justify-end items-center gap-2 w-full">
                            <SlmConfigurationFilter
                                providers={providers}
                                watch={watch}
                                register={register}
                                reset={reset}
                                handleSubmit={handleSubmit}
                                onSlmConfigurationFilter={onSlmConfigurationFilter}
                            />
                            <Button size={'sm'} onClick={onNewButtonClick}>
                                New SLM
                            </Button>
                            <Button className="ml-2 hidden" variant={'link'} size={'sm'} onClick={onRecentActivity}>
                                Recent Activities
                            </Button>
                        </div>
                    </div>
                }
            />
        </div>
    );
};
