'use client';

import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { ListFilter, Trash2, Pencil } from 'lucide-react';
import { Button, Input } from '@/components';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/atoms/popover';
import DataTable from '@/components/molecules/table/data-table';
import { useForm } from 'react-hook-form';
import { IWorkflowExecutionFilters } from '@/models';
import { cn, handleNoValue } from '@/lib/utils';

export interface DatabaseConnectionData {
    id: string;
    connectionName: string;
    connectorSource: string;
    lastSync: string;
}

interface DatabaseConnectionTableContainerProps {
    databaseConnections: DatabaseConnectionData[];
    onDatabaseConnectionFilter: (filter: IWorkflowExecutionFilters | null) => void;
}

const columns: ColumnDef<DatabaseConnectionData>[] = [
    {
        enableSorting: true,
        header: () => <div className="w-full text-left">Connection name</div>,
        accessorKey: 'connectionName',
        cell: ({ row }) => {
            return <div>{handleNoValue(row.getValue('connectionName'))}</div>;
        },
    },
    {
        enableSorting: false,
        header: () => <div className="w-full text-left">Connector Source</div>,
        accessorKey: 'connectorSource',
        cell: ({ row }) => {
            return <div>{handleNoValue(row.getValue('connectorSource'))}</div>;
        },
    },
    {
        enableSorting: false,
        header: () => <div className="w-full text-left">Last sync</div>,
        accessorKey: 'lastSync',
        cell: ({ row }) => {
            return <div>{handleNoValue(row.getValue('lastSync'))}</div>;
        },
    },
    {
        enableSorting: false,
        header: () => <div className="w-full text-left"></div>,
        accessorKey: 'actionCol',
        cell: () => {
            return (
                <div className="flex items-center gap-x-4">
                    <Trash2 size={18} className="text-gray-500 cursor-pointer dark:text-gray-200" />
                    <Pencil size={18} className="text-gray-500 cursor-pointer dark:text-gray-200" />
                </div>
            );
        },
    },
];

const DatabaseConnectionFilter = ({
    onDatabaseConnectionFilter,
}: {
    onDatabaseConnectionFilter: (filter: IWorkflowExecutionFilters | null) => void;
}) => {
    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors },
        trigger,
    } = useForm<IWorkflowExecutionFilters>({ mode: 'onChange' });
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

    const onHandleSubmit = (data: IWorkflowExecutionFilters) => {
        onDatabaseConnectionFilter(data);
        setOpen(false);
    };

    const validateMaxGreaterThanMin = async (value: number | null, fieldName: string) => {
        const property = `${fieldName}.min`;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formValue = getValues(property as any) as number | null;
        if (formValue && value !== null && !Number.isNaN(value)) {
            return value >= formValue || `Max must be greater than or equal to Min`;
        }
        return true;
    };

    const onMinValueChange = async (fieldName: string) => {
        const property = `${fieldName}.max`;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await trigger(property as any);
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.target.value = event.target.value.replaceAll('-', '');
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
                            <div>
                                <p className="text-sm text-gray-800 font-normal dark:text-gray-200">
                                    Average (Time Taken)
                                </p>
                            </div>
                            <div className="flex items-center gap-x-3">
                                <Input
                                    {...register('averageTime.min', {
                                        valueAsNumber: true,
                                    })}
                                    placeholder="Min"
                                    type="number"
                                    onBlur={() => onMinValueChange('averageTime')}
                                    onInput={handleInputChange}
                                />
                                <Input
                                    {...register('averageTime.max', {
                                        valueAsNumber: true,
                                        validate: value => validateMaxGreaterThanMin(value, 'averageTime'),
                                    })}
                                    isDestructive={!!errors.averageTime?.max?.message}
                                    placeholder="Max"
                                    type="number"
                                    onInput={handleInputChange}
                                />
                            </div>
                            {errors?.averageTime?.max && (
                                <p className="text-red-500 text-xs">{errors.averageTime.max.message}</p>
                            )}
                        </div>
                        <div className="flex flex-col gap-y-2">
                            <div>
                                <p className="text-sm text-gray-800 font-normal dark:text-gray-200">
                                    Longest (Time Taken)
                                </p>
                            </div>
                            <div className="flex items-center gap-x-3">
                                <Input
                                    {...register('longestTime.min', { valueAsNumber: true })}
                                    placeholder="Min"
                                    type="number"
                                    onInput={handleInputChange}
                                />
                                <Input
                                    {...register('longestTime.max', {
                                        valueAsNumber: true,
                                        validate: value => validateMaxGreaterThanMin(value, 'longestTime'),
                                    })}
                                    isDestructive={!!errors.longestTime?.max?.message}
                                    placeholder="Max"
                                    type="number"
                                    onInput={handleInputChange}
                                />
                            </div>
                            {errors?.longestTime?.max && (
                                <p className="text-red-500 text-xs">{errors.longestTime.max.message}</p>
                            )}
                        </div>
                        <div className="flex flex-col gap-y-2">
                            <div>
                                <p className="text-sm text-gray-800 font-normal dark:text-gray-200">API calls</p>
                            </div>
                            <div className="flex items-center gap-x-3">
                                <Input
                                    {...register('apiCalls.min', { valueAsNumber: true })}
                                    placeholder="Min"
                                    type="number"
                                    onInput={handleInputChange}
                                />
                                <Input
                                    {...register('apiCalls.max', {
                                        valueAsNumber: true,
                                        validate: value => validateMaxGreaterThanMin(value, 'apiCalls'),
                                    })}
                                    isDestructive={!!errors.apiCalls?.max?.message}
                                    placeholder="Max"
                                    type="number"
                                    onInput={handleInputChange}
                                />
                            </div>
                            {errors?.apiCalls?.max && (
                                <p className="text-red-500 text-xs">{errors.apiCalls.max.message}</p>
                            )}
                        </div>
                        <div className="flex flex-col gap-y-2">
                            <div>
                                <p className="text-sm text-gray-800 font-normal dark:text-gray-200">LLM Calls</p>
                            </div>
                            <div className="flex items-center gap-x-3">
                                <Input
                                    {...register('llmTokens.min', { valueAsNumber: true })}
                                    placeholder="Min"
                                    type="number"
                                    onInput={handleInputChange}
                                />
                                <Input
                                    {...register('llmTokens.max', {
                                        valueAsNumber: true,
                                        validate: value => validateMaxGreaterThanMin(value, 'llmTokens'),
                                    })}
                                    isDestructive={!!errors.llmTokens?.max?.message}
                                    placeholder="Max"
                                    type="number"
                                    onInput={handleInputChange}
                                />
                            </div>
                            {errors?.llmTokens?.max && (
                                <p className="text-red-500 text-xs">{errors.llmTokens.max.message}</p>
                            )}
                        </div>
                        <div className="flex flex-col gap-y-2">
                            <div>
                                <p className="text-sm text-gray-800 font-normal dark:text-gray-200">SLM Calls</p>
                            </div>
                            <div className="flex items-center gap-x-3">
                                <Input
                                    {...register('slmTokens.min', { valueAsNumber: true })}
                                    placeholder="Min"
                                    type="number"
                                    onInput={handleInputChange}
                                />
                                <Input
                                    {...register('slmTokens.max', {
                                        valueAsNumber: true,
                                        validate: value => validateMaxGreaterThanMin(value, 'slmTokens'),
                                    })}
                                    isDestructive={!!errors.slmTokens?.max?.message}
                                    placeholder="Max"
                                    type="number"
                                    onInput={handleInputChange}
                                />
                            </div>
                            {errors?.slmTokens?.max && (
                                <p className="text-red-500 text-xs">{errors.slmTokens.max.message}</p>
                            )}
                        </div>
                        <div className="flex flex-col gap-y-2">
                            <div>
                                <p className="text-sm text-gray-800 font-normal dark:text-gray-200">Session count</p>
                            </div>
                            <div className="flex items-center gap-x-3">
                                <Input
                                    {...register('executionCount.min', { valueAsNumber: true })}
                                    placeholder="Min"
                                    type="number"
                                    onInput={handleInputChange}
                                />
                                <Input
                                    {...register('executionCount.max', {
                                        valueAsNumber: true,
                                        validate: value => validateMaxGreaterThanMin(value, 'executionCount'),
                                    })}
                                    isDestructive={!!errors.executionCount?.max?.message}
                                    placeholder="Max"
                                    type="number"
                                    onInput={handleInputChange}
                                />
                            </div>
                            {errors?.executionCount?.max && (
                                <p className="text-red-500 text-xs">{errors.executionCount.max.message}</p>
                            )}
                        </div>
                        <div className="flex self-end mt-3">
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

export const DatabaseConnectionTableContainer = ({
    databaseConnections,
    onDatabaseConnectionFilter,
}: DatabaseConnectionTableContainerProps) => {
    return (
        <div className="grid gap-8">
            <DataTable
                columns={columns}
                data={databaseConnections}
                searchColumnName="workflow"
                showFooter
                defaultPageSize={3}
                showTableSearch={false}
                manualSpan={true}
                tableHeader={
                    <div className="flex justify-between items-center w-full">
                        <Input placeholder="Search Database Connection" className="max-w-sm" />
                        <DatabaseConnectionFilter onDatabaseConnectionFilter={onDatabaseConnectionFilter} />
                        <div className="flex ml-2">
                            <Button size={'sm'}>New Database Connection</Button>
                        </div>
                    </div>
                }
            />
        </div>
    );
};
