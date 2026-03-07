import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { FilterX, ListFilter } from 'lucide-react';

import { Button, Input } from '@/components';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/atoms/popover';
import DataTable from '@/components/molecules/table/data-table';
import { ILLMExecutionFilters } from '@/models';
import { useForm } from 'react-hook-form';
import { handleNoValue } from '@/lib/utils';

export interface LLMTimeData {
    id: string;
    llm: string;
    timeAverage: string;
    timeLongest: string;
    llmAverage: number;
    llmMost: number;
    executionCount: number;
}

interface LLMTimeTableProps {
    llmExecutions: LLMTimeData[];
    onLLMExecutionFilter: (filter: ILLMExecutionFilters | null) => void;
}

const columns: ColumnDef<LLMTimeData>[] = [
    {
        accessorKey: 'llm',
        enableSorting: true,
        header() {
            return <div className="w-full text-left">LLM</div>;
        },
        cell({ row }) {
            return <div>{handleNoValue(row.getValue('llm'))}</div>;
        },
    },
    {
        header: 'Time Taken',
        columns: [
            {
                accessorKey: 'timeAverage',
                enableSorting: false,
                header: 'Average',
                cell({ row }) {
                    return <div className="w-full text-center">{handleNoValue(row.getValue('timeAverage'))}</div>;
                },
            },
            {
                accessorKey: 'timeLongest',
                enableSorting: false,
                header: 'Longest',
                cell({ row }) {
                    return <div className="w-full text-center">{handleNoValue(row.getValue('timeLongest'))}</div>;
                },
            },
        ],
    },
    {
        header: 'LLM Tokens',
        columns: [
            {
                accessorKey: 'llmAverage',
                enableSorting: false,
                header: 'Average',
                cell({ row }) {
                    return <div className="w-full text-center">{handleNoValue(row.getValue('llmAverage'))}</div>;
                },
            },
            {
                accessorKey: 'llmMost',
                enableSorting: false,
                header: 'Most',
                cell({ row }) {
                    return <div className="w-full text-center">{handleNoValue(row.getValue('llmMost'))}</div>;
                },
            },
        ],
    },
    {
        accessorKey: 'executionCount',
        enableSorting: false,
        header: 'Execution Count',
        cell({ row }) {
            return <div className="w-full text-center">{handleNoValue(row.getValue('executionCount'))}</div>;
        },
    },
];

const LLMTimeFilter = ({
    onLLMExecutionFilter,
}: {
    onLLMExecutionFilter: (filter: ILLMExecutionFilters | null) => void;
}) => {
    const {
        register,
        handleSubmit,
        reset,
        getValues,
        formState: { errors },
        trigger,
    } = useForm<ILLMExecutionFilters>({ mode: 'onChange' });
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

    const onHandleSubmit = (data: ILLMExecutionFilters) => {
        onLLMExecutionFilter(data);
        setOpen(false);
    };

    const clearFilter = () => {
        reset();
        onLLMExecutionFilter(null);
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
                style={{ maxHeight: `${maxDistance}px` }}
                className="w-72 max-h-[400px] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-gray-700 dark:[&::-webkit-scrollbar-thumb]:bg-gray-500"
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
                                    {...register('averageTime.min', { valueAsNumber: true })}
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
                                    onBlur={() => onMinValueChange('longestTime')}
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
                                <p className="text-sm text-gray-800 font-normal dark:text-gray-200">
                                    Average (LLM Tokens)
                                </p>
                            </div>
                            <div className="flex items-center gap-x-3">
                                <Input
                                    {...register('averageLlmTokens.min', { valueAsNumber: true })}
                                    placeholder="Min"
                                    type="number"
                                    onBlur={() => onMinValueChange('averageLlmTokens')}
                                    onInput={handleInputChange}
                                />
                                <Input
                                    {...register('averageLlmTokens.max', {
                                        valueAsNumber: true,
                                        validate: value => validateMaxGreaterThanMin(value, 'averageLlmTokens'),
                                    })}
                                    isDestructive={!!errors.averageLlmTokens?.max?.message}
                                    placeholder="Max"
                                    type="number"
                                    onInput={handleInputChange}
                                />
                            </div>
                            {errors?.averageLlmTokens?.max && (
                                <p className="text-red-500 text-xs">{errors.averageLlmTokens.max.message}</p>
                            )}
                        </div>
                        <div className="flex flex-col gap-y-2">
                            <div>
                                <p className="text-sm text-gray-800 font-normal dark:text-gray-200">
                                    Most (LLM Tokens)
                                </p>
                            </div>
                            <div className="flex items-center gap-x-3">
                                <Input
                                    {...register('mostLlmTokens.min', { valueAsNumber: true })}
                                    placeholder="Min"
                                    type="number"
                                    onBlur={() => onMinValueChange('mostLlmTokens')}
                                    onInput={handleInputChange}
                                />
                                <Input
                                    {...register('mostLlmTokens.max', {
                                        valueAsNumber: true,
                                        validate: value => validateMaxGreaterThanMin(value, 'mostLlmTokens'),
                                    })}
                                    isDestructive={!!errors.mostLlmTokens?.max?.message}
                                    placeholder="Max"
                                    type="number"
                                    onInput={handleInputChange}
                                />
                            </div>
                            {errors?.mostLlmTokens?.max && (
                                <p className="text-red-500 text-xs">{errors.mostLlmTokens.max.message}</p>
                            )}
                        </div>
                        <div className="flex flex-col gap-y-2">
                            <div>
                                <p className="text-sm text-gray-800 font-normal dark:text-gray-200">Execution count</p>
                            </div>
                            <div className="flex items-center gap-x-3">
                                <Input
                                    {...register('executionCount.min', { valueAsNumber: true })}
                                    placeholder="Min"
                                    type="number"
                                    onBlur={() => onMinValueChange('executionCount')}
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

export const LLMTimeTable = ({ llmExecutions, onLLMExecutionFilter }: LLMTimeTableProps) => {
    return (
        <DataTable
            columns={columns}
            data={llmExecutions}
            searchColumnName="workflow"
            showFooter
            defaultPageSize={3}
            showTableSearch={false}
            manualSpan={true}
            tableHeader={
                <div className="flex justify-between items-center w-full">
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-200">LLM Time</p>
                    <LLMTimeFilter onLLMExecutionFilter={onLLMExecutionFilter} />
                </div>
            }
        />
    );
};
