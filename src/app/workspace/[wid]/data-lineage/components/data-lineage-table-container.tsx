'use client';
import DataTable from '@/components/molecules/table/data-table';
import { ColumnDef, Table } from '@tanstack/react-table';
import React, { useEffect, useMemo, useState } from 'react';
import moment from 'moment';
import { cn, handleNoValue } from '@/lib/utils';
import { DataLineageScreener } from './data-lineage-screener';
import {
    Button,
    Checkbox,
    Input,
    DatePicker,
    MultiSelect,
    useSidebar,
    TooltipProvider,
    Tooltip,
    TooltipTrigger,
    TooltipContent,
} from '@/components';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/atoms/popover';
import { ChevronDown, ChevronRight, ListFilter, X } from 'lucide-react';
import {
    IDataLineage,
    IDataLineageFilter,
    IDataLineageGraph,
    IDataLineageSessionExecution,
    IDataLineageSessionFilter,
    IDataLineageVisualGraph,
    IOption,
} from '@/models';
import {
    Controller,
    FieldErrors,
    useForm,
    UseFormClearErrors,
    UseFormHandleSubmit,
    UseFormRegister,
    UseFormSetValue,
    UseFormWatch,
} from 'react-hook-form';
import { SessionDateType } from '@/enums';
import { useBreakpoint } from '@/hooks/use-breakpoints';
import { DataLineageSessionTable } from './data-lineage-session-table';

interface DataLineageTableProps {
    dataLineages: IDataLineage[];
    workflowOptions: IOption[];
    sessionQueryParams: IDataLineageSessionFilter | undefined;
    loadingData: boolean;
    loadingView: boolean;
    modular: IDataLineageGraph | undefined;
    linear: IDataLineageVisualGraph | undefined;
    onDataLineageFilter: (data: IDataLineageFilter | undefined, isWorkflow?: boolean) => void;
    onViewDataLineage: (sessionId: string, executionId: string, workflowId: string) => void;
}

const generateColumns = (selectedRowId: string | null, setSelectedRowId: (id: string | null) => void) => {
    const columns: ColumnDef<IDataLineage>[] = [
        {
            id: 'expand',
            size: 100,
            meta: {
                width: 100,
            },
            header: () => null,
            cell: ({ row }) => {
                const rowId = row.original.id;
                const isChecked = selectedRowId === rowId;

                return (
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" className="p-0 h-6 w-6">
                            {row.getIsExpanded() ? (
                                <ChevronDown className="h-4 w-4" />
                            ) : (
                                <ChevronRight className="h-4 w-4" />
                            )}
                        </Button>
                        <Checkbox
                            checked={isChecked}
                            onCheckedChange={checked => {
                                setSelectedRowId(checked ? rowId : null);
                            }}
                            onClick={e => {
                                e.stopPropagation();
                            }}
                        />
                    </div>
                );
            },
        },
        {
            accessorKey: 'name',
            enableSorting: false,
            meta: {
                align: 'text-left',
            },
            header() {
                return <div className="text-left">Workflow Name</div>;
            },
            cell({ row }) {
                return <div>{handleNoValue(row.getValue('name'))}</div>;
            },
        },
    ];

    return columns;
};

const DataLineageFilter = ({
    errors,
    tableInstance,
    selectedRowId,
    showFilterLabel,
    register,
    watch,
    setValue,
    setSelectedRowId,
    clearErrors,
    handleSubmit,
    onDataLineageFilter,
}: {
    errors: FieldErrors<IDataLineageFilter>;
    tableInstance: Table<IDataLineage> | null;
    selectedRowId: string | null;
    showFilterLabel: boolean;
    register: UseFormRegister<IDataLineageFilter>;
    watch: UseFormWatch<IDataLineageFilter>;
    setValue: UseFormSetValue<IDataLineageFilter>;
    setSelectedRowId: React.Dispatch<React.SetStateAction<string | null>>;
    clearErrors: UseFormClearErrors<IDataLineageFilter>;
    handleSubmit: UseFormHandleSubmit<IDataLineageFilter, undefined>;
    onDataLineageFilter: (data: IDataLineageFilter | undefined, isWorkflow?: boolean) => void;
}) => {
    const [open, setOpen] = useState<boolean>(false);
    const [maxDistance, setMaxDistance] = useState(0);

    const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        const buttonRect = event.currentTarget.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        const distanceToTop = buttonRect.top;
        const distanceToBottom = viewportHeight - buttonRect.bottom;

        const maxDist = Math.max(distanceToTop, distanceToBottom);
        setMaxDistance(maxDist - 20);
    };

    const onHandleSubmit = (data: IDataLineageFilter) => {
        onDataLineageFilter(data);
        setOpen(false);
        if (tableInstance && selectedRowId) {
            const row = tableInstance?.getRowModel().rows.find(r => r.original.id === selectedRowId);
            if (row) {
                const internalRowId = row.id;
                tableInstance.setExpanded({ [internalRowId]: true });
            }
        }
    };

    const clearFilter = () => {
        setValue('textSearch', '');
        setValue('startTime', '');
        setValue('endTime', '');
        clearErrors(['startTime', 'endTime']);
        setOpen(false);
        setSelectedRowId(null);
        onDataLineageFilter({ id: watch('id'), startDate: watch('startDate'), endDate: watch('endDate') }, false);
        if (tableInstance) {
            tableInstance.setExpanded({});
        }
    };

    const validateStartTime = (value: string | undefined) => {
        const startDate = watch('startDate');
        const endDate = watch('endDate');
        const endTime = watch('endTime');

        if (value && !startDate) {
            return 'Start date is required if start time is selected';
        }

        if (value && startDate && endDate && endTime) {
            const startDateTime = new Date(`${startDate}T${value}`);
            const endDateTime = new Date(`${endDate}T${endTime}`);
            if (startDateTime >= endDateTime) {
                return 'The start time must be earlier than the end time';
            }
        }

        return true;
    };

    const validateEndTime = (value: string | undefined) => {
        const endDate = watch('endDate');
        const startDate = watch('startDate');
        const startTime = watch('startTime');

        if (value && !endDate) {
            return 'End date is required if end time is selected';
        }

        if (value && startDate && endDate && startTime) {
            const startDateTime = new Date(`${startDate}T${startTime}`);
            const endDateTime = new Date(`${endDate}T${value}`);
            if (startDateTime >= endDateTime) {
                return 'The end time must be later than the start time';
            }
        }

        return true;
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <div>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    className="whitespace-nowrap"
                                    variant="secondary"
                                    leadingIcon={<ListFilter />}
                                    onClick={handleButtonClick}
                                >
                                    {showFilterLabel && <span className="hidden sm:inline">Advance Filter</span>}
                                </Button>
                            </TooltipTrigger>
                            {!showFilterLabel && (
                                <TooltipContent side="left" align="center">
                                    Advance Filter
                                </TooltipContent>
                            )}
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </PopoverTrigger>
            <PopoverContent
                className={cn(
                    'w-92 max-h-[400px] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-gray-700 dark:[&::-webkit-scrollbar-thumb]:bg-gray-500'
                )}
                style={{ maxHeight: `${maxDistance}px` }}
                side="bottom"
                align="end"
            >
                <div className="space-y-2 flex flex-col gap-y-3">
                    <Input {...register('textSearch')} placeholder="Text search" label="Text Search" />
                    <Input
                        {...register('startTime', { validate: validateStartTime })}
                        placeholder="Start Time"
                        label="Start Time"
                        type="time"
                        isDestructive={!!errors?.startTime?.message}
                        supportiveText={errors?.startTime?.message}
                        onKeyDown={e => e.preventDefault()}
                        trailingIcon={<X onClick={() => setValue('startTime', '')} />}
                    />
                    <Input
                        {...register('endTime', { validate: validateEndTime })}
                        placeholder="End Time"
                        label="End Time"
                        type="time"
                        isDestructive={!!errors?.endTime?.message}
                        supportiveText={errors?.endTime?.message}
                        onKeyDown={e => e.preventDefault()}
                        trailingIcon={<X onClick={() => setValue('endTime', '')} />}
                    />
                    <div className="flex items-center justify-end mt-3 gap-x-2">
                        <Button variant={'secondary'} onClick={() => clearFilter()}>
                            Clear
                        </Button>
                        <Button onClick={handleSubmit(onHandleSubmit)}>Apply Filter</Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export const DataLineageTableContainer = ({
    dataLineages,
    workflowOptions,
    sessionQueryParams,
    loadingData,
    loadingView,
    modular,
    linear,
    onDataLineageFilter,
    onViewDataLineage,
}: DataLineageTableProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const { state } = useSidebar();
    const { isMobile, isWidthReached } = useBreakpoint({ maxWidth: 1334 });
    const [selectedExecution, setSelectedExecution] = useState<IDataLineageSessionExecution>();
    const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
    const [tableInstance, setTableInstance] = useState<Table<IDataLineage> | null>(null);
    const [expandedIds, setExpandedIds] = useState<string[]>([]);
    const [workflowId, setWorkflowId] = useState<string>();
    const {
        register,
        setValue,
        getValues,
        watch,
        handleSubmit,
        clearErrors,
        formState: { errors },
        control,
    } = useForm<IDataLineageFilter>({
        mode: 'all',
    });

    useEffect(() => {
        if (!selectedRowId) {
            setValue('textSearch', '');
            setValue('startTime', '');
            setValue('endTime', '');
            if (tableInstance) {
                tableInstance.setExpanded({});
            }
            onDataLineageFilter({ ...getValues(), textSearch: '', startTime: '', endTime: '' }, false);
        }
    }, [selectedRowId, tableInstance]);

    useEffect(() => {
        if (expandedIds?.length > 0 && !loadingData) {
            if (tableInstance) {
                const rows = tableInstance?.getRowModel().rows.filter(r => expandedIds.includes(r.original.id));
                if (rows?.length > 0) {
                    const expandedState = Object.fromEntries(rows.map(r => [r.id, true]));
                    tableInstance.setExpanded(expandedState);
                } else {
                    tableInstance.setExpanded({});
                }
            }
        }
    }, [loadingData, expandedIds, tableInstance]);

    useEffect(() => {
        if (selectedRowId && !loadingData && tableInstance && tableInstance?.getRowModel()?.rows?.length > 0) {
            const rows = tableInstance?.getRowModel().rows.find(r => r.original.id === selectedRowId);
            if (!rows) {
                setSelectedRowId(null);
                setValue('textSearch', '');
                setValue('startTime', '');
                setValue('endTime', '');
                clearErrors(['startTime', 'endTime']);
            }
        } else if (!loadingData && tableInstance) {
            setSelectedRowId(null);
            setValue('textSearch', '');
            setValue('startTime', '');
            setValue('endTime', '');
            clearErrors(['startTime', 'endTime']);
        }
    }, [loadingData, selectedRowId, tableInstance]);

    const startDate = useMemo(() => {
        if (moment(watch('startDate'), 'YYYY-MM-DD', true).isValid()) {
            return new Date(watch('startDate') as string);
        }
        return undefined;
    }, [watch('startDate')]);

    const endDate = useMemo(() => {
        if (moment(watch('endDate'), 'YYYY-MM-DD', true).isValid()) {
            return new Date(watch('endDate') as string);
        }
        return undefined;
    }, [watch('endDate')]);

    const showFilterLabel = useMemo(() => {
        if (state === 'collapsed') {
            return true;
        }
        return !isWidthReached;
    }, [state, isWidthReached]);

    const column = generateColumns(selectedRowId, setSelectedRowId);

    const onHandleSubmit = (data: IDataLineageFilter) => {
        setValue('id', data.workflowOption?.value);
        onDataLineageFilter({ ...data, id: data.workflowOption?.value, workflowOption: undefined }, true);
    };

    const onDateChange = (date: Date | undefined, type: SessionDateType) => {
        const value = date ? moment(date).format('YYYY-MM-DD') : '';
        if (type === SessionDateType.StartAt) {
            setValue('startDate', value);
            onDataLineageFilter({ ...getValues(), startDate: value }, true);
        } else {
            setValue('endDate', value);
            onDataLineageFilter({ ...getValues(), endDate: value }, true);
        }
    };

    const handleTableInit = (ref: Table<IDataLineage>) => {
        setTableInstance(ref);
    };

    return (
        <>
            <div className="grid gap-8">
                <DataTable
                    columns={column}
                    data={dataLineages}
                    searchColumnName="workflow"
                    showFooter
                    defaultPageSize={isMobile ? 5 : 10}
                    showTableSearch={false}
                    manualSpan={true}
                    hideExpandedColumn={true}
                    loadingData={loadingData}
                    onTableInit={handleTableInit}
                    onRowExpandCollapse={(_, expanded, row) => {
                        const id = row.original.id;
                        setExpandedIds(prev =>
                            expanded ? [...prev.filter(r => r !== id), id] : prev.filter(r => r !== id)
                        );
                    }}
                    tableHeader={
                        <div className="flex justify-between items-center w-full">
                            <div className="space-y-2 flex gap-x-3 items-end">
                                <div className="w-[240px]">
                                    <Controller
                                        name="workflowOption"
                                        control={control}
                                        render={({ field }) => (
                                            <MultiSelect
                                                {...field}
                                                options={workflowOptions}
                                                value={watch('workflowOption') || null}
                                                className="!w-[240px]"
                                                menuPortalTarget={document.body}
                                                isClearable
                                                isSearchable
                                                placeholder="Search workflows"
                                                onChange={selectedOptions => {
                                                    field.onChange(selectedOptions);
                                                    handleSubmit(onHandleSubmit)();
                                                }}
                                                menuClass="!z-50"
                                                menuPortalClass="!z-50 pointer-events-auto"
                                            />
                                        )}
                                    />
                                </div>
                                <DatePicker
                                    mode="single"
                                    value={startDate}
                                    placeholder="Start date"
                                    triggerInputClassName="!w-[240px]"
                                    {...(endDate && {
                                        disabled: { after: new Date(endDate) },
                                    })}
                                    onSelect={e => onDateChange(e, SessionDateType.StartAt)}
                                />
                                <DatePicker
                                    mode="single"
                                    value={endDate}
                                    placeholder="End date"
                                    triggerInputClassName="!w-[240px]"
                                    {...(startDate && {
                                        disabled: { before: new Date(startDate) },
                                    })}
                                    onSelect={e => onDateChange(e, SessionDateType.EndAt)}
                                />
                            </div>
                            {selectedRowId && (
                                <DataLineageFilter
                                    errors={errors}
                                    tableInstance={tableInstance}
                                    selectedRowId={selectedRowId}
                                    showFilterLabel={showFilterLabel}
                                    register={register}
                                    watch={watch}
                                    setValue={setValue}
                                    setSelectedRowId={setSelectedRowId}
                                    clearErrors={clearErrors}
                                    handleSubmit={handleSubmit}
                                    onDataLineageFilter={onDataLineageFilter}
                                />
                            )}
                        </div>
                    }
                    renderExpandedRow={row => {
                        return (
                            <DataLineageSessionTable
                                key={row.original.id}
                                row={row}
                                sessionQueryParams={sessionQueryParams}
                                selectedRowId={selectedRowId}
                                setIsOpen={setIsOpen}
                                setSelectedExecution={setSelectedExecution}
                                onViewDataLineage={onViewDataLineage}
                                setWorkflowId={setWorkflowId}
                            />
                        );
                    }}
                />
            </div>
            <DataLineageScreener
                workflowId={workflowId}
                key={selectedExecution?.id ?? 'execution-key'}
                isOpen={isOpen}
                loadingView={loadingView}
                modular={modular}
                linear={linear}
                selectedExecution={selectedExecution}
                setIsOpen={setIsOpen}
            />
        </>
    );
};
