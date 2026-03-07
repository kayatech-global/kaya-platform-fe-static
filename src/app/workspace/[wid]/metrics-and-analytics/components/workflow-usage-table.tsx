import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { FilterX, ListFilter } from 'lucide-react';

import { Button, Input } from '@/components';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/atoms/popover';
import DataTable from '@/components/molecules/table/data-table';
import { useForm } from 'react-hook-form';
import { IWorkflowExecutionFilters } from '@/models';
import { cn, handleNoValue } from '@/lib/utils';

interface WorkflowUsageProps {
    workflowExecutions: WorkflowUsageData[];
    onWorkflowExecutionFilter: (filter: IWorkflowExecutionFilters | null) => void;
}

export interface WorkflowUsageData {
    id: string;
    workflow: string;
    average: string;
    longest: string;
    apiCalls: number;
    llmCalls: number;
    slmCalls: number;
    executionCount: number;
    children: WorkflowUsageSubTableDataData[];
}

export interface WorkflowUsageSubTableDataData {
    sessionId: string;
    apiCalls: number;
    llmCalls?: string;
    slmCalls?: string;
    timeTaken: string;
    executionCount: number;
}

const columns: ColumnDef<WorkflowUsageData>[] = [
    {
        accessorKey: 'workflow',
        enableSorting: true,
        header() {
            return <div className="w-full text-left">Workflow</div>;
        },
        cell({ row }) {
            return <div>{handleNoValue(row.getValue('workflow'))}</div>;
        },
    },
    {
        header: 'Time Taken',
        columns: [
            {
                accessorKey: 'average',
                enableSorting: false,
                header: 'Average',
                cell({ row }) {
                    return <div className="w-full text-center">{row.getValue('average')}</div>;
                },
            },
            {
                accessorKey: 'longest',
                enableSorting: false,
                header: 'Longest',
                cell({ row }) {
                    return <div className="w-full text-center">{handleNoValue(row.getValue('longest'))}</div>;
                },
            },
        ],
    },
    {
        accessorKey: 'apiCalls',
        enableSorting: false,
        header: 'API Calls',
        cell({ row }) {
            return <div className="w-full text-center">{handleNoValue(row.getValue('apiCalls'))}</div>;
        },
    },
    {
        accessorKey: 'llmCalls',
        enableSorting: false,
        header: 'LLM Calls',
        cell({ row }) {
            return <div className="w-full text-center">{handleNoValue(row.getValue('llmCalls'))}</div>;
        },
    },
    {
        accessorKey: 'slmCalls',
        enableSorting: false,
        header: 'SLM Calls',
        cell({ row }) {
            return <div className="w-full text-center">{handleNoValue(row.getValue('slmCalls'))}</div>;
        },
    },
    {
        accessorKey: 'executionCount',
        enableSorting: false,
        header: 'Session Count',
        cell({ row }) {
            return <div className="w-full text-center">{handleNoValue(row.getValue('executionCount'))}</div>;
        },
    },
];

const subTableColumns: ColumnDef<WorkflowUsageSubTableDataData>[] = [
    {
        accessorKey: 'sessionId',
        enableSorting: false,
        header() {
            return <div className="w-full text-left">Session ID</div>;
        },
        cell({ row }) {
            return <div>{handleNoValue(row.getValue('sessionId'))}</div>;
        },
    },
    {
        accessorKey: 'timeTaken',
        header: 'Time Taken',
        enableSorting: false,
        cell({ row }) {
            return <div className="w-full text-center">{handleNoValue(row.getValue('timeTaken'))}</div>;
        },
    },
    {
        accessorKey: 'apiCalls',
        header: 'API Calls',
        enableSorting: false,
        cell({ row }) {
            return <div className="w-full text-center">{handleNoValue(row.getValue('apiCalls'))}</div>;
        },
    },
    {
        accessorKey: 'llmCalls',
        header: 'LLM Calls',
        enableSorting: false,
        cell({ row }) {
            return <div className="w-full text-center">{handleNoValue(row.getValue('llmCalls'))}</div>;
        },
    },
    {
        accessorKey: 'slmCalls',
        header: 'SLM Calls',
        enableSorting: false,
        cell({ row }) {
            return <div className="w-full text-center">{handleNoValue(row.getValue('slmCalls'))}</div>;
        },
    },
];

const WorkflowUsageFilter = ({
    onWorkflowExecutionFilter,
}: {
    onWorkflowExecutionFilter: (filter: IWorkflowExecutionFilters | null) => void;
}) => {
    const {
        register,
        handleSubmit,
        reset,
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
        onWorkflowExecutionFilter(data);
        setOpen(false);
    };

    const clearFilter = () => {
        reset();
        onWorkflowExecutionFilter(null);
    };
    const validateMaxGreaterThanMin = async (value: number | null, fieldName: string) => {
        const property = `${fieldName}.min`;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formValue = getValues(property as any) as number | null;
        if (formValue && value !== null && !isNaN(value)) {
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
        event.target.value = event.target.value.replace(/-/g, '');
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <div className="flex gap-x-2">
                <Button variant={'secondary'} leadingIcon={<FilterX />} onClick={clearFilter}></Button>
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

export const WorkflowUsageTable = ({ workflowExecutions, onWorkflowExecutionFilter }: WorkflowUsageProps) => {
    return (
        <DataTable
            columns={columns}
            data={workflowExecutions}
            searchColumnName="workflow"
            showFooter
            defaultPageSize={3}
            showTableSearch={false}
            manualSpan={true}
            tableHeader={
                <div className="flex justify-between items-center w-full">
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                        Summary Tables of Workflow usage
                    </p>
                    <WorkflowUsageFilter onWorkflowExecutionFilter={onWorkflowExecutionFilter} />
                </div>
            }
            renderExpandedRow={row => {
                return (
                    <div className="p-4">
                        <DataTable
                            columns={subTableColumns}
                            data={workflowExecutions[row.index]?.children ?? []}
                            showFooter={(workflowExecutions[row.index]?.children.length ?? 0) > 3}
                            showHeader={false}
                            defaultPageSize={3}
                        />
                    </div>
                );
            }}
        />
    );
};
