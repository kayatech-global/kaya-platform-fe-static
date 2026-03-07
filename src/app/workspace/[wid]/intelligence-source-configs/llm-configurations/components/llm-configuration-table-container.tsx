'use client';

import React, { useState } from 'react';
import { ColumnDef, Row } from '@tanstack/react-table';
import { ListFilter, Trash2, Pencil } from 'lucide-react';
import { Button, Input, Select } from '@/components';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/atoms/popover';
import DataTable from '@/components/molecules/table/data-table';
import { useForm, UseFormHandleSubmit, UseFormRegister, UseFormReset, UseFormWatch } from 'react-hook-form';
import { cn, handleNoValue } from '@/lib/utils';
import { IHeaderValues, IProvider } from '@/models';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/atoms/dialog';
import { useBreakpoint } from '@/hooks/use-breakpoints';

export interface LlmConfigurationData {
    id?: string;
    connectionName: string;
    provider: string;
    modelName: string;
    configurations?: {
        description: string;
        apiAuthorization: string;
        maxTokens: number | null;
        temperature: number | null;
        baseUrl: string;
        customerHeaders: IHeaderValues[];
        accessKey?: string;
        secretKey?: string;
        region?: string;
    };
    search?: string;
    isReadOnly?: boolean;
}

interface LlmConfigurationTableContainerProps {
    llmConfigurations: LlmConfigurationData[];
    providers: IProvider[];
    onLlmConfigurationFilter: (filter: LlmConfigurationData | null) => void;
    onNewButtonClick: () => void;
    onEditButtonClick: (id: string) => void;
    onDelete: (id: string) => void;
    onRecentActivity: () => void;
}

const DeleteRecord = ({ row, onDelete }: { row: Row<LlmConfigurationData>; onDelete: (id: string) => void }) => {
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
    const columns: ColumnDef<LlmConfigurationData>[] = [
        {
            accessorKey: 'connectionName',
            enableSorting: true,
            header() {
                return <div className="w-full text-left">Connection Name</div>;
            },
            cell({ row }) {
                return <div>{handleNoValue(row.getValue('connectionName'))}</div>;
            },
        },
        {
            accessorKey: 'provider',
            enableSorting: false,
            header() {
                return <div className="w-full text-left">LLM Provider</div>;
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

const LlmConfigurationFilter = ({
    providers,
    watch,
    register,
    reset,
    handleSubmit,
    onLlmConfigurationFilter,
}: {
    providers: IProvider[];
    watch: UseFormWatch<LlmConfigurationData>;
    register: UseFormRegister<LlmConfigurationData>;
    reset: UseFormReset<LlmConfigurationData>;
    handleSubmit: UseFormHandleSubmit<LlmConfigurationData>;
    onLlmConfigurationFilter: (filter: LlmConfigurationData | null) => void;
}) => {
    const [open, setOpen] = useState(false);
    const [maxDistance, setMaxDistance] = useState(0);

    // const selectedModels = useMemo(() => {
    //     if (watch('llmProvider') && watch('llmProvider').trim() !== '') {
    //         const provider = providers?.find(x => x.value === watch('llmProvider').trim());
    //         if (provider) {
    //             return provider.models?.map(x => ({ name: x.value, value: x.value }));
    //         }
    //     }
    //     return [];
    // }, [watch('llmProvider')]);

    const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        const buttonRect = event.currentTarget.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        const distanceToTop = buttonRect.top;
        const distanceToBottom = viewportHeight - buttonRect.bottom;

        const maxDist = Math.max(distanceToTop, distanceToBottom);
        setMaxDistance(maxDist - 20);
    };

    const onHandleSubmit = (data: LlmConfigurationData) => {
        onLlmConfigurationFilter(data);
        setOpen(false);
    };

    const clearFilter = () => {
        reset({ connectionName: '', provider: '', modelName: '', search: watch('search') });
        onLlmConfigurationFilter({ search: watch('search') } as LlmConfigurationData);
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
                        <div className="flex flex-col gap-y-2">
                            <div className="flex items-center gap-x-3">
                                <Select
                                    {...register('provider')}
                                    placeholder={providers.length > 0 ? 'Select LLM Provider' : 'No LLM Provider found'}
                                    disabled={providers.length === 0}
                                    options={providers?.map(x => ({ name: x.value, value: x.value }))}
                                    currentValue={watch('provider')}
                                />
                            </div>
                        </div>
                        {/* <div className="flex flex-col gap-y-2">
                            <div className="flex items-center gap-x-3">
                                <Select
                                    {...register('modelName')}
                                    placeholder="Select Model"
                                    options={selectedModels}
                                    disabled={selectedModels?.length === 0}
                                    currentValue={watch('modelName')}
                                />
                            </div>
                        </div> */}
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

export const LlmConfigurationTableContainer = ({
    providers,
    llmConfigurations,
    onLlmConfigurationFilter,
    onNewButtonClick,
    onEditButtonClick,
    onDelete,
    onRecentActivity,
}: LlmConfigurationTableContainerProps) => {
    const { register, handleSubmit, reset, watch } = useForm<LlmConfigurationData>({ mode: 'onChange' });
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
    const { isMobile } = useBreakpoint();

    const onHandleSubmit = (data: LlmConfigurationData) => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        const timer = setTimeout(() => {
            onLlmConfigurationFilter(data);
        }, 1000);
        setDebounceTimer(timer);
    };

    const columns = generateColumns(onEditButtonClick, onDelete);

    return (
        <div className="grid gap-8">
            <DataTable
                columns={columns}
                data={llmConfigurations}
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
                            <LlmConfigurationFilter
                                providers={providers}
                                watch={watch}
                                register={register}
                                reset={reset}
                                handleSubmit={handleSubmit}
                                onLlmConfigurationFilter={onLlmConfigurationFilter}
                            />
                            <Button size={'sm'} onClick={onNewButtonClick}>
                                New LLM
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
