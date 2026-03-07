/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import { ColumnDef, Row } from '@tanstack/react-table';
import {
    Button,
    Input,
    MultiSelect,
    TruncateCell,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components';
import { ListFilter, Trash2, Pencil, Braces } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/atoms/popover';
import DataTable from '@/components/molecules/table/data-table';
import { Control, Controller, useForm, UseFormHandleSubmit, UseFormReset, UseFormWatch } from 'react-hook-form';
import { IGroupOption, IOption, ISharedItem } from '@/models';
import { cn, handleNoValue } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/atoms/dialog';
import { WorkflowConfigurationModel } from './workflow-config-model';
import { useParams, useRouter } from 'next/navigation';
import { useBreakpoint } from '@/hooks/use-breakpoints';

export interface WorkflowAuthoringData {
    id?: string;
    workflowName: string;
    description: string;
    workflowTags: string;
    workflowUrl: string;
    search?: string;
    options?: IOption[];
    isReadOnly?: boolean;
}

interface WorkflowAuthoringTableContainerProps {
    workflowAuthoring: WorkflowAuthoringData[];
    tagNames: IGroupOption[];
    workflowQuota: string | undefined;
    hasQuota: boolean;
    loadingVariables?: boolean;
    variables?: ISharedItem[];
    onWorkflowAuthoringFilter: (filter: WorkflowAuthoringData | null) => void;
    onNewButtonClick: () => void;
    onEditButtonClick: (id: string) => void;
    onDelete: (id: string) => void;
    onWorkFlowConfigModel?: (id: string) => void;
}

const DeleteRecord = ({ row, onDelete }: { row: Row<WorkflowAuthoringData>; onDelete: (id: string) => void }) => {
    const [open, setOpen] = useState<boolean>(false);

    const handleDelete = () => {
        onDelete(row.original.id as string);
        setOpen(false);
    };

    return (
        <>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            className={`w-full sm:w-max ${
                                row.original.isReadOnly ? 'cursor-not-allowed' : 'cursor-pointer'
                            }`}
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
                    </TooltipTrigger>
                    <TooltipContent side="bottom" align="center">
                        Delete Workflow
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
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

const generateColumns = (
    onEditButtonClick: (id: string) => void,
    onDelete: (id: string) => void,
    setOpenWorkFlowConfigModel: (status: boolean) => void,
    setWokFlowId: (id: string) => void,
    workspaceId: string,
    handleNavigationToWorkflowEditor: (workflowId: string) => void
) => {
    const navigateToWorkflowEditor = (workspaceId: string, workflowId: string) => {
        const workflowEditorUrl = `/editor/${workspaceId}/${workflowId}`;
        handleNavigationToWorkflowEditor(workflowEditorUrl);
    };

    const columns: ColumnDef<WorkflowAuthoringData>[] = [
        {
            accessorKey: 'workflowName',
            enableSorting: true,
            header() {
                return <div className="w-full text-left">Workflow Name</div>;
            },
            cell({ row }) {
                return <div>{handleNoValue(row.getValue('workflowName'))}</div>;
            },
        },
        {
            accessorKey: 'description',
            enableSorting: false,
            header() {
                return <div className="w-full text-left">Workflow Description</div>;
            },
            cell({ row }) {
                return (
                    <div>
                        <TruncateCell value={handleNoValue(row.getValue('description')) as string} length={40} />
                    </div>
                );
            },
        },
        {
            accessorKey: 'workflowTags',
            enableSorting: false,
            header() {
                return <div className="w-full text-left">Workflow Tags</div>;
            },
            cell({ row }) {
                return (
                    <div>
                        <TruncateCell value={handleNoValue(row.getValue('workflowTags')) as string} length={40} />
                    </div>
                );
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
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        type="button"
                                        className="text-[20px] stroke-[1px] cursor-pointer text-gray-500 dark:text-gray-200 bg-transparent border-none p-0"
                                        onClick={() => navigateToWorkflowEditor(workspaceId, row.getValue('id'))}
                                        aria-label="Workflow Builder"
                                    >
                                        <i className="ri-swap-3-line" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" align="center">
                                    Workflow Builder
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <DeleteRecord row={row} onDelete={onDelete} />
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        type="button"
                                        className="text-gray-500 cursor-pointer dark:text-gray-200 bg-transparent border-none p-0 inline-flex"
                                        onClick={() => onEditButtonClick(row.getValue('id'))}
                                        aria-label="Edit Workflow"
                                    >
                                        <Pencil size={18} />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" align="center">
                                    Edit Workflow
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        type="button"
                                        className="text-gray-500 cursor-pointer dark:text-gray-200 bg-transparent border-none p-0 inline-flex"
                                        onClick={() => {
                                            setOpenWorkFlowConfigModel(true);
                                            setWokFlowId(row.getValue('id'));
                                        }}
                                        aria-label="Workflow Execution Chatbot"
                                    >
                                        <Braces size={18} />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" align="center">
                                    Workflow Execution Chatbot
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                );
            },
        },
    ];
    return columns;
};
const WorkflowUsageFilter = ({
    tagNames,
    reset,
    handleSubmit,
    control,
    watch,
    onWorkflowAuthoringFilter,
}: {
    tagNames: IGroupOption[];
    reset: UseFormReset<WorkflowAuthoringData>;
    handleSubmit: UseFormHandleSubmit<WorkflowAuthoringData>;
    control: Control<WorkflowAuthoringData, any>;
    watch: UseFormWatch<WorkflowAuthoringData>;
    onWorkflowAuthoringFilter: (filter: WorkflowAuthoringData | null) => void;
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

    const onHandleSubmit = (data: WorkflowAuthoringData) => {
        onWorkflowAuthoringFilter(data);
        setOpen(false);
    };

    const clearFilter = () => {
        reset({ workflowName: '', workflowTags: '', workflowUrl: '', search: watch('search'), options: [] });
        onWorkflowAuthoringFilter({ search: watch('search') } as WorkflowAuthoringData);
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
                    'w-72 max-h-[400px] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-gray-700 dark:[&::-webkit-scrollbar-thumb]:bg-gray-500'
                )}
                style={{ maxHeight: `${maxDistance}px` }}
                side="bottom"
                align="end"
            >
                <div className="flex flex-col gap-y-6">
                    <div className="form-container flex flex-col gap-y-4">
                        <div className="flex flex-col gap-y-2">
                            <div className="flex items-center gap-x-3">
                                <Controller
                                    name="options"
                                    control={control}
                                    defaultValue={[]}
                                    render={({ field }) => (
                                        <MultiSelect
                                            {...field}
                                            options={tagNames as never}
                                            placeholder="Select Workflow Tags"
                                            isMulti
                                            onChange={selectedOptions => field.onChange(selectedOptions)}
                                        />
                                    )}
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

export const WorkflowAuthoringTableContainer = ({
    loadingVariables,
    tagNames,
    workflowAuthoring,
    hasQuota,
    workflowQuota,
    variables,
    onWorkflowAuthoringFilter,
    onNewButtonClick,
    onEditButtonClick,
    onDelete,
    onWorkFlowConfigModel,
}: WorkflowAuthoringTableContainerProps) => {
    const [openWorkFlowConfigModel, setOpenWorkFlowConfigModel] = useState(false);

    const { register, handleSubmit, reset, watch, control } = useForm<WorkflowAuthoringData>({ mode: 'onChange' });
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
    const [workFlowId, setWokFlowId] = useState<string>('');
    const params = useParams();
    const router = useRouter();
    const { isMobile } = useBreakpoint();

    useEffect(() => {
        if (workFlowId && workFlowId !== '' && onWorkFlowConfigModel) {
            onWorkFlowConfigModel(workFlowId);
        }
    }, [workFlowId]);

    const onHandleSubmit = (data: WorkflowAuthoringData) => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        const timer = setTimeout(() => {
            onWorkflowAuthoringFilter(data);
        }, 1000);
        setDebounceTimer(timer);
    };

    const handleNavigationToWorkflowEditor = (editorUrl: string) => {
        router.push(editorUrl);
    };

    const columns = generateColumns(
        onEditButtonClick,
        onDelete,
        setOpenWorkFlowConfigModel,
        setWokFlowId,
        params.wid as string,
        handleNavigationToWorkflowEditor
    );

    return (
        <div className="grid gap-8">
            <div className="w-100 custom-overflow-x-auto">
                <DataTable
                    columns={columns}
                    data={workflowAuthoring}
                    searchColumnName="workflow"
                    showFooter
                    defaultPageSize={isMobile ? 5 : 10}
                    showTableSearch={false}
                    manualSpan={true}
                    tableHeader={
                        <div className="w-full">
                            <div className="flex justify-between items-center w-full">
                                <Input
                                    {...register('search')}
                                    placeholder="Search by Workflow Name"
                                    className="max-w-sm"
                                    onKeyUp={handleSubmit(onHandleSubmit)}
                                />
                                <WorkflowUsageFilter
                                    tagNames={tagNames}
                                    reset={reset}
                                    watch={watch}
                                    handleSubmit={handleSubmit}
                                    control={control}
                                    onWorkflowAuthoringFilter={onWorkflowAuthoringFilter}
                                />
                                <div className="flex ml-2">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button disabled={!hasQuota} size={'sm'} onClick={onNewButtonClick}>
                                                    New Workflow
                                                </Button>
                                            </TooltipTrigger>
                                            {!hasQuota && (
                                                <TooltipContent side="left" align="center">
                                                    Workflow limit reached
                                                </TooltipContent>
                                            )}
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </div>
                            {workflowQuota && (
                                <div className="flex justify-end w-full mt-2">
                                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                        {workflowQuota}
                                    </p>
                                </div>
                            )}
                        </div>
                    }
                />
            </div>
            <WorkflowConfigurationModel
                loadingVariables={loadingVariables}
                workFlowId={workFlowId}
                openWorkFlowConfigModel={openWorkFlowConfigModel}
                variables={variables}
                setOpenWorkFlowConfigModel={setOpenWorkFlowConfigModel}
                isDraft={false}
            />
        </div>
    );
};
