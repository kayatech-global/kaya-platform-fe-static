/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import DataTable from '@/components/molecules/table/data-table';
import {ColumnDef} from '@tanstack/react-table';
import React, {useState, useMemo, useEffect} from 'react';
import {handleNoValue} from '@/lib/utils';
import {Button, MultiSelect} from '@/components';
import {ChevronDown, ChevronRight} from 'lucide-react';
import {IFeedbackLearningMetadata, ILearningWorkflow, IOption} from '@/models';
import {Controller, useForm} from 'react-hook-form';
import {useBreakpoint} from '@/hooks/use-breakpoints';
import {LearningAgentTable} from './learning-agent-table';
import {useRouter, usePathname, useSearchParams} from 'next/navigation';

interface LearningTableContainerProps {
    learningWorkflows: ILearningWorkflow[];
    workflowOptions: IOption[];
    loadingLearnings: boolean;
    approveAsync: (params: {
        feedbackId: string;
        workflowVariables?: Record<string, any>;
        comment?: string;
    }) => Promise<any>;
    approvingFeedback: boolean;
    rejectAsync: (params: { feedbackId: string; comment?: string }) => Promise<any>;
    rejectingFeedback: boolean;
    deleteAsync: (feedbackId: string) => Promise<any>;
    deletingFeedback: boolean;
    updateAsync: (params: {
        feedbackId: string;
        data: {
            feedback: string;
            rationale?: string;
            metadata: IFeedbackLearningMetadata;
            mustLearn: boolean,
            approvalStatus: string,
            comment: string
        };
    }) => Promise<any>;
    updatingFeedback: boolean;
    unlinkAsync: (feedbackId: string) => Promise<any>;
    unlinkingFeedback: boolean;
    initialWorkflowId?: string;
    initialAgentId?: string;
}

interface ILearningFilter {
    workflowOption?: IOption | null;
}

const generateWorkflowColumns = (): ColumnDef<ILearningWorkflow>[] => {
    const columns: ColumnDef<ILearningWorkflow>[] = [
        {
            id: 'expand',
            size: 100,
            meta: {
                width: 100,
            },
            header: () => null,
            cell: ({row}) => {
                return (
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" className="p-0 h-6 w-6">
                            {row.getIsExpanded() ? (
                                <ChevronDown className="h-4 w-4"/>
                            ) : (
                                <ChevronRight className="h-4 w-4"/>
                            )}
                        </Button>
                    </div>
                );
            },
        },
        {
            accessorKey: 'workflow_name',
            enableSorting: false,
            meta: {
                align: 'text-left',
            },
            header() {
                return <div className="text-left">Workflow Name</div>;
            },
            cell({row}) {
                return <div>{handleNoValue(row.getValue('workflow_name'))}</div>;
            },
        },
    ];

    return columns;
};

export const LearningTableContainer = ({
                                           learningWorkflows,
                                           workflowOptions,
                                           loadingLearnings,
                                           approveAsync,
                                           approvingFeedback,
                                           rejectAsync,
                                           rejectingFeedback,
                                           deleteAsync,
                                           deletingFeedback,
                                           updateAsync,
                                           updatingFeedback,
                                           unlinkAsync,
                                           unlinkingFeedback,
                                           initialWorkflowId,
                                           initialAgentId,
                                       }: LearningTableContainerProps) => {
    const {isMobile} = useBreakpoint();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const {control, watch, handleSubmit, setValue} = useForm<ILearningFilter>({
        mode: 'all',
    });

    const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(initialWorkflowId ?? null);

    // Set initial workflow filter from URL params
    useEffect(() => {
        if (workflowOptions.length > 0) {
            const workflowOption = workflowOptions.find(opt => opt.value === initialWorkflowId);
            if (workflowOption || !initialAgentId) {
                setValue('workflowOption', workflowOption);
                setSelectedWorkflowId(initialWorkflowId ?? null);
            }
        }
    }, [initialWorkflowId, workflowOptions, setValue]);

    const workflowColumns = generateWorkflowColumns();

    const onHandleSubmit = (data: ILearningFilter) => {
        const workflowId = data.workflowOption?.value ?? null;

        // Update URL with new filter
        const params = new URLSearchParams(searchParams.toString());

        //Delete URL Params if filter close or change to avoid showing empty workflows with mismatching agents
        params.delete('agentId');
        if (workflowId) {
            params.set('workflowId', workflowId);
            const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
            router.push(newUrl, {scroll: false});
            setSelectedWorkflowId(workflowId);
        }else {
            router.push(pathname, {scroll: false});
            initialWorkflowId = undefined;
            setSelectedWorkflowId(null);
        }
        router.refresh()
    };

    // Filter workflows based on selected workflow
    const filteredWorkflows = useMemo(() => {
        if (!selectedWorkflowId) {
            return learningWorkflows;
        }
        return learningWorkflows.filter(workflow => workflow.workflow_id === selectedWorkflowId);
    }, [learningWorkflows, selectedWorkflowId]);

    // Calculate initial expanded state for workflows
    const initialExpandedState = useMemo(() => {
        if (!initialWorkflowId) {
            return {};
        }

        const expandedState: Record<string, boolean> = {};
        const workflowIndex = filteredWorkflows.findIndex(workflow => workflow.workflow_id === initialWorkflowId);

        if (workflowIndex !== -1) {
            expandedState[workflowIndex.toString()] = true;
        }

        return expandedState;
    }, [filteredWorkflows, initialWorkflowId]);

    return (
        <div className="w-full overflow-x-auto">
            <DataTable
                columns={workflowColumns}
                data={filteredWorkflows}
                searchColumnName="workflow_name"
                showFooter
                defaultPageSize={isMobile ? 5 : 10}
                showTableSearch={false}
                loadingData={loadingLearnings}
                manualSpan={true}
                hideExpandedColumn={true}
                initialExpandedState={initialExpandedState}
                renderExpandedRow={row => {
                    return (
                        <LearningAgentTable
                            row={row}
                            approveAsync={approveAsync}
                            approvingFeedback={approvingFeedback}
                            rejectAsync={rejectAsync}
                            rejectingFeedback={rejectingFeedback}
                            deleteAsync={deleteAsync}
                            deletingFeedback={deletingFeedback}
                            updateAsync={updateAsync}
                            updatingFeedback={updatingFeedback}
                            unlinkAsync={unlinkAsync}
                            unlinkingFeedback={unlinkingFeedback}
                            initialAgentId={initialAgentId}
                        />
                    );
                }}
                tableHeader={
                    <div className="flex justify-between items-center w-full">
                        <div className="space-y-2 flex gap-x-3 items-end">
                            <div className="w-[240px]">
                                <Controller
                                    name="workflowOption"
                                    control={control}
                                    render={({field}) => (
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
                        </div>
                    </div>
                }
            />
        </div>
    );
};
