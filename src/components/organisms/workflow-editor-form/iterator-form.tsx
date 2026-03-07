'use client';

import { Button, Input, Checkbox, TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/atoms';
import { WorkflowConditionEditor } from '@/components/molecules/custom-edge-base/workflow-condition-editor';
import config from '@/config/environment-variables';
import { useAuth, useDnD } from '@/context';
import { Category } from '@/hooks/use-condition-completion';
import useToolParser from '@/hooks/use-transformed-payloads';
import { cn, isNumeric, sanitizeNumericInput } from '@/lib/utils';
import { IIntellisense } from '@/models';
import { $fetch } from '@/utils';
import { Node, useNodes, useReactFlow } from '@xyflow/react';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from 'react-query';
import { toast } from 'sonner';

interface IteratorFormProps {
    selectedNode: Node;
    isReadOnly?: boolean;
}

interface IteratorForm {
    maxWorkers: number | null | undefined;
    iterationTimeoutSeconds: number | null | undefined;
    iteratorExecutorTtlSeconds: number | null | undefined;
}

const fetchIntellisense = async (workspaceId: string, workflowId: string, promptIds?: string[], apiIds?: string[]) => {
    const response = await $fetch<IIntellisense>(`/workspaces/${workspaceId}/prompt-template/intellisense`, {
        method: 'POST',
        headers: {
            'x-workspace-id': workspaceId,
        },
        body: JSON.stringify({ workflowId, promptIds, apiIds }),
    });

    return response.data;
};

export const IteratorForm = ({ selectedNode, isReadOnly }: IteratorFormProps) => {
    const maxWorkerLimit = config.NEXT_PUBLIC_MAX_WORKER_LIMIT ? Number(config.NEXT_PUBLIC_MAX_WORKER_LIMIT) : 1000;
    // Node's data object related state
    const [logic, setLogic] = useState<string>();
    const [iteratorName, setIteratorName] = useState<string>();
    const [itemVariableName, setItemVariableName] = useState<string>();
    const [indexVariableName, setIndexVariableName] = useState<string>();
    const [parallelExecution, setParallelExecution] = useState<boolean>(false);

    const [completion, setCompletion] = useState<Category[]>([]);
    const [mounted, setMounted] = useState<boolean>(false);

    const nodes = useNodes();
    const params = useParams();
    const { token } = useAuth();
    const { setWorkflowVariables, setSelectedNodeId, setTrigger, trigger } = useDnD();
    const { transformToCategoryStructure } = useToolParser();
    const { updateNodeData } = useReactFlow();

    const {
        register,
        setValue,
        getValues,
        formState: { errors, isValid },
    } = useForm<IteratorForm>({
        mode: 'all',
    });

    const promptIds = mounted
        ? Array.from(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              new Set(nodes?.filter(x => (x.data?.prompt as any)?.id)?.map(x => (x.data?.prompt as any)?.id as string))
          )
        : undefined;
    const apiIds = mounted
        ? Array.from(
              new Set(
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  nodes?.filter(x => x.data?.apis as any)?.flatMap(x => (x.data?.apis as any)?.map((y: any) => y.id))
              )
          )
        : undefined;

    useQuery(
        'intellisense',
        () => fetchIntellisense(params.wid as string, params.workflow_id as string, promptIds, apiIds),
        {
            enabled: !!token,
            refetchOnWindowFocus: false,
            onSuccess: data => {
                const workflowVars = data?.variables?.workflow?.[params.workflow_id as string]?.variables || [];
                const workspaceVars = data?.variables?.shared || [];
                const allVariables = [...workflowVars];
                const allWorkspaceVariables = [...workspaceVars];
                setWorkflowVariables(allVariables ?? []);
                setMounted(true);
                const tools = data?.tools?.api?.shared;
                const category = transformToCategoryStructure(tools, allWorkspaceVariables);
                setCompletion(category);
            },
            onError: () => {
                console.log('Failed to fetch intellisense');
            },
        }
    );

    const onSave = (condition: string) => {
        setLogic(condition);
    };

    const handleSaveNodeData = async () => {
        const formValues = getValues();

        updateNodeData(selectedNode.id, {
            logic: logic,
            name: iteratorName,
            itemVariableName: itemVariableName,
            indexVariableName: indexVariableName,
            parallelExecution: parallelExecution,
            maxWorkers: formValues?.maxWorkers ?? undefined,
            iterationTimeoutSeconds: formValues?.iterationTimeoutSeconds ?? undefined,
            iteratorExecutorTtlSeconds: formValues?.iteratorExecutorTtlSeconds ?? undefined,
        });

        toast.success('Iterator updated Successfully');

        Promise.resolve().then(() => {
            setTrigger((trigger ?? 0) + 1);
        });
    };

    /*
     * Update the agent data when the selected node changes.
     * This effect runs when the selectedNode prop changes.
     * It sets the state variables based on the data of the selected node.
     */
    useEffect(() => {
        const nodeLogic = selectedNode.data?.logic as string | undefined;

        if (nodeLogic !== undefined) {
            setLogic(nodeLogic);
        } else {
            setLogic(undefined);
        }
        setIteratorName(selectedNode.data?.name as string);
        setItemVariableName(selectedNode.data?.itemVariableName as string);
        setIndexVariableName(selectedNode.data?.indexVariableName as string);
        setParallelExecution(
            selectedNode.data?.parallelExecution !== undefined
                ? (selectedNode.data?.parallelExecution as boolean)
                : false
        );
        setValue(
            'maxWorkers',
            isNumeric(selectedNode.data?.maxWorkers) ? (selectedNode.data?.maxWorkers as number) : null,
            { shouldValidate: true }
        );
        setValue(
            'iterationTimeoutSeconds',
            isNumeric(selectedNode.data?.iterationTimeoutSeconds)
                ? (selectedNode.data?.iterationTimeoutSeconds as number)
                : null,
            { shouldValidate: true }
        );
        setValue(
            'iteratorExecutorTtlSeconds',
            isNumeric(selectedNode.data?.iteratorExecutorTtlSeconds)
                ? (selectedNode.data?.iteratorExecutorTtlSeconds as number)
                : null,
            { shouldValidate: true }
        );
    }, [selectedNode, setValue]);

    return (
        <>
            <style>{`
                .dark .cm-gutters {
                    background-color: var(--gray-700) !important;
                    border-right: var(--gray-500) !important;
                }
                .dark .cm-content {
                    background-color: var(--gray-800) !important;
                }
            `}</style>
            <div>
                <div className="flex flex-col gap-y-6 h-[calc(100vh-300px)] overflow-y-auto pr-2">
                    <div className="flex flex-col gap-y-2">
                        <Input
                            value={iteratorName}
                            onChange={e => setIteratorName(e.target.value)}
                            label="Name"
                            placeholder="Enter iterator name"
                        />
                    </div>
                    <div className="flex flex-col gap-y-2">
                        <label className="text-sm font-medium text-gray-900 dark:text-gray-100">Array to Iterate</label>
                        <WorkflowConditionEditor
                            data={completion}
                            onClose={() => {}}
                            onChange={(condition: string) => {
                                onSave(condition);
                            }}
                            initialValue={selectedNode.data?.logic as string}
                            disabLeValidation={true}
                            showFooterButtons={false}
                            showConsole={false}
                            asInput
                        />
                    </div>
                    <div className="flex flex-col gap-y-2">
                        <Input
                            value={itemVariableName}
                            onChange={e => setItemVariableName(e.target.value)}
                            label="Current Item Variable"
                            placeholder="Enter variable name for current item"
                        />
                    </div>
                    <div className="flex flex-col gap-y-2">
                        <Input
                            value={indexVariableName}
                            onChange={e => setIndexVariableName(e.target.value)}
                            label="Index Variable Name"
                            placeholder="Enter index variable name"
                        />
                    </div>
                    <div className="flex flex-col gap-y-2">
                        <Input
                            {...register('maxWorkers', {
                                min: { value: 0, message: 'Max iteration workers cannot be negative' },
                                max: {
                                    value: maxWorkerLimit,
                                    message: `Max iteration workers cannot exceed ${maxWorkerLimit}`,
                                },
                                valueAsNumber: true,
                            })}
                            label="Max Iteration Workers"
                            placeholder="Enter max iteration workers"
                            type="number"
                            disabled={isReadOnly}
                            isDestructive={!!errors?.maxWorkers?.message}
                            supportiveText={errors?.maxWorkers?.message}
                            onInput={sanitizeNumericInput}
                        />
                    </div>
                    <div className="flex flex-col gap-y-2">
                        <Input
                            {...register('iterationTimeoutSeconds', {
                                min: { value: 0, message: 'Iteration timeout cannot be negative' },
                                valueAsNumber: true,
                            })}
                            label="Iteration Timeout (seconds)"
                            placeholder="Enter iteration timeout in seconds"
                            type="number"
                            disabled={isReadOnly}
                            isDestructive={!!errors?.iterationTimeoutSeconds?.message}
                            supportiveText={errors?.iterationTimeoutSeconds?.message}
                            onInput={sanitizeNumericInput}
                        />
                    </div>
                    <div className="flex flex-col gap-y-2">
                        <Input
                            {...register('iteratorExecutorTtlSeconds', {
                                min: { value: 0, message: 'Executor TTL cannot be negative' },
                                valueAsNumber: true,
                            })}
                            label="Executor TTL (seconds)"
                            placeholder="Enter executor TTL in seconds"
                            type="number"
                            disabled={isReadOnly}
                            isDestructive={!!errors?.iteratorExecutorTtlSeconds?.message}
                            supportiveText={errors?.iteratorExecutorTtlSeconds?.message}
                            onInput={sanitizeNumericInput}
                        />
                    </div>
                    <div className="flex gap-x-3 items-start">
                        <Checkbox
                            disabled={isReadOnly}
                            checked={parallelExecution}
                            onCheckedChange={e => setParallelExecution(!!e)}
                        />
                        <div className="flex flex-col -mt-1 gap-y-1">
                            <p className="text-md font-medium text-gray-700 dark:text-gray-100">Parallel Execution</p>
                            <p className="text-xs font-normal text-gray-500 dark:text-gray-300">
                                Run child nodes in parallel instead of sequentially
                            </p>
                        </div>
                    </div>
                </div>
                <div className={cn('agent-form-footer flex gap-x-3 justify-end pb-4', {})}>
                    <Button variant="secondary" onClick={() => setSelectedNodeId(undefined)} disabled={isReadOnly}>
                        Cancel
                    </Button>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="primary"
                                    onClick={handleSaveNodeData}
                                    disabled={isReadOnly || !isValid}
                                >
                                    Save
                                </Button>
                            </TooltipTrigger>
                            {!isValid && (
                                <TooltipContent side="left" align="center">
                                    All details need to be filled before the form can be saved
                                </TooltipContent>
                            )}
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
        </>
    );
};
