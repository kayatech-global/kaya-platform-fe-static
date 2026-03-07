'use client';

import { WorkflowSelector } from '@/app/editor/[wid]/[workflow_id]/components/workflow-selector';
import { WorkflowAuthoringData } from '@/app/workspace/[wid]/workflows/workflow-authoring/components/workflow-authoring-table-container';
import {
    Button,
    Checkbox,
    Input,
    Select,
    Textarea,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/atoms';
import config from '@/config/environment-variables';
import { useDnD } from '@/context';
import { useWorkflowAuthoring } from '@/hooks/use-workflow-authoring';
import { cn, sanitizeNumericInput } from '@/lib/utils';
import { Node, useReactFlow } from '@xyflow/react';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface SubWorkflowRetryConfig {
    retryEnabled?: boolean;
    retryAttempts?: number | null;
    retryWaitType?: string;
    retryMultiplier?: number | null;
    retryMinWait?: number | null;
    retryMaxWait?: number | null;
}

interface SubWorkFlowFormProps {
    selectedNode: Node;
    isReadOnly?: boolean;
}

interface SubWorkFlowForm {
    timeoutSeconds: number | null | undefined;
    httpPoolConnections: number | null | undefined;
    httpPoolMaxsize: number | null | undefined;
    subworkflowParallelWorkerLimit: number | null | undefined;
    ffExecutorTtlSeconds: number | null | undefined;
    retryConfig?: SubWorkflowRetryConfig;
}

export const SubWorkFlowForm = ({ selectedNode, isReadOnly }: SubWorkFlowFormProps) => {
    const maxWorkerLimit = config.NEXT_PUBLIC_MAX_WORKER_LIMIT ? Number(config.NEXT_PUBLIC_MAX_WORKER_LIMIT) : 1000;
    const [workflow, setWorkflow] = useState<WorkflowAuthoringData>();
    const [initialInput, setInitialInput] = useState<string>('');
    const [inputMessage, setInputMessage] = useState<string>('');
    const [useHttp, setUseHttp] = useState<boolean>(false);
    const [fireAndForget, setFireAndForget] = useState<boolean>(false);
    const [passCurrentState, setPassCurrentState] = useState<boolean>(false);
    const [useSemaphore, setUseSemaphore] = useState<boolean>(false);
    const { workflowAuthoringTableData, isFetching } = useWorkflowAuthoring();
    const { trigger, setSelectedNodeId, setTrigger } = useDnD();
    const { updateNodeData } = useReactFlow();
    const params = useParams();

    const {
        register,
        setValue,
        watch,
        getValues,
        formState: { errors, isValid },
    } = useForm<SubWorkFlowForm>({
        mode: 'all',
    });

    const handleSaveNodeData = async () => {
        if (workflow) {
            const formValues = getValues();

            updateNodeData(selectedNode.id, {
                name: workflow?.workflowName,
                workflow: workflow,
                initialInput: initialInput,
                inputMessage: inputMessage,
                useHttp: useHttp,
                fireAndForget: fireAndForget,
                timeoutSeconds: formValues?.timeoutSeconds ?? undefined,
                passCurrentState: passCurrentState,
                httpPoolConnections: formValues?.httpPoolConnections ?? undefined,
                httpPoolMaxsize: formValues?.httpPoolMaxsize ?? undefined,
                subworkflowParallelWorkerLimit: formValues?.subworkflowParallelWorkerLimit ?? undefined,
                useSemaphore: useSemaphore ?? undefined,
                ffExecutorTtlSeconds: formValues?.ffExecutorTtlSeconds ?? undefined,
                retryConfig: {
                    ...formValues?.retryConfig,
                    retryAttempts: formValues?.retryConfig?.retryAttempts ?? undefined,
                    retryWaitType: formValues?.retryConfig?.retryWaitType ?? undefined,
                    retryMultiplier: formValues?.retryConfig?.retryMultiplier ?? undefined,
                    retryMinWait: formValues?.retryConfig?.retryMinWait ?? undefined,
                    retryMaxWait: formValues?.retryConfig?.retryMaxWait ?? undefined,
                },
            });

            toast.success('Sub-Workflow updated');

            Promise.resolve().then(() => {
                setTrigger((trigger ?? 0) + 1);
            });
        } else {
            toast.error('Workflow selection is required');
        }
    };

    /*
     * Update the agent data when the selected node changes.
     * This effect runs when the selectedNode prop changes.
     * It sets the state variables based on the data of the selected node.
     */
    useEffect(() => {
        if (selectedNode.data && selectedNode.data.workflow) {
            setWorkflow(selectedNode.data?.workflow as WorkflowAuthoringData);
        } else {
            setWorkflow(undefined);
        }
        const initialInputData = selectedNode.data?.initialInput as string;
        setInitialInput(initialInputData ? initialInputData : '');
        const inputMessageData = selectedNode.data?.inputMessage as string;
        setInputMessage(inputMessageData ? inputMessageData : '');
        setUseHttp((selectedNode.data?.useHttp as boolean) ?? false);
        setFireAndForget((selectedNode.data?.fireAndForget as boolean) ?? false);
        setPassCurrentState((selectedNode.data?.passCurrentState as boolean) ?? false);
        setUseSemaphore((selectedNode.data?.useSemaphore as boolean) ?? false);

        setValue('timeoutSeconds', (selectedNode.data?.timeoutSeconds as never) ?? null, { shouldValidate: true });
        setValue('httpPoolConnections', (selectedNode.data?.httpPoolConnections as never) ?? null, {
            shouldValidate: true,
        });
        setValue('httpPoolMaxsize', (selectedNode.data?.httpPoolMaxsize as never) ?? null, { shouldValidate: true });
        setValue(
            'subworkflowParallelWorkerLimit',
            (selectedNode.data?.subworkflowParallelWorkerLimit as never) ?? null,
            { shouldValidate: true }
        );
        setValue('ffExecutorTtlSeconds', (selectedNode.data?.ffExecutorTtlSeconds as never) ?? null, {
            shouldValidate: true,
        });

        const retryConfigData = selectedNode.data?.retryConfig as SubWorkflowRetryConfig;
        setValue('retryConfig', retryConfigData);
        setValue('retryConfig.retryAttempts', retryConfigData?.retryAttempts ?? null, { shouldValidate: true });
        setValue('retryConfig.retryMinWait', retryConfigData?.retryMinWait ?? null, { shouldValidate: true });
        setValue('retryConfig.retryMaxWait', retryConfigData?.retryMaxWait ?? null, { shouldValidate: true });
        setValue('retryConfig.retryMultiplier', retryConfigData?.retryMultiplier ?? null, { shouldValidate: true });
    }, [selectedNode, setValue]);

    return (
        <React.Fragment>
            <div
                className={cn('h-full flex items-center justify-center mt-[20%]', {
                    hidden: !isFetching,
                })}
            >
                <div className="flex flex-col items-center gap-y-2">
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="text-sm text-gray-700 font-normal dark:text-gray-200 max-w-[250px] text-center">
                        Hang tight! We&apos;re loading the agent data for you...
                    </p>
                </div>
            </div>
            <div className="sub-workflow-form-wrapper group">
                <div
                    className={cn(
                        'agent-form pr-1 flex flex-col gap-y-6 h-[calc(100vh-300px)] overflow-y-auto [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:transparent [&::-webkit-scrollbar-thumb]:bg-transparent group-hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-transparent group-hover:dark:[&::-webkit-scrollbar-thumb]:bg-gray-700',
                        { hidden: isFetching || workflowAuthoringTableData.length === 0 }
                    )}
                >
                    <WorkflowSelector
                        workflow={workflow}
                        setWorkflow={setWorkflow}
                        workflowLoading={isFetching}
                        ignoreCurrentWorkflow={true}
                        workflowId={params?.workflow_id as string}
                        allWorkflows={workflowAuthoringTableData}
                    />
                    {workflow && (
                        <Button
                            variant="link"
                            onClick={() => {
                                if (workflow.id) {
                                    window.open(`/editor/${params.wid}/${workflow.id}`, '_blank');
                                }
                            }}
                            className="w-fit mx-2"
                            disabled={isReadOnly}
                        >
                            Click to View Sub-Workflow in Editor
                        </Button>
                    )}
                    <Textarea
                        label="Initial Input"
                        placeholder={'Enter initial input as JSON (e.g., {"current_record": {}})'}
                        rows={5}
                        value={initialInput}
                        onChange={e => setInitialInput(e.target.value)}
                        disabled={isReadOnly}
                    />
                    <Input
                        label="Input Message"
                        placeholder="Enter input message"
                        value={inputMessage}
                        onChange={e => setInputMessage(e.target.value)}
                        disabled={isReadOnly}
                    />

                    {/* Execution Options */}
                    <div className="space-y-3">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Execution Options</p>
                        <div className="flex items-center gap-x-2">
                            <Checkbox
                                id="useHttp"
                                checked={useHttp}
                                onCheckedChange={(checked: boolean) => {
                                    setUseHttp(checked);
                                    if (!checked) {
                                        setFireAndForget(false);
                                    }
                                }}
                                disabled={isReadOnly}
                            />
                            <label htmlFor="useHttp" className="text-sm text-gray-600 dark:text-gray-300">
                                Use HTTP
                            </label>
                        </div>
                        {useHttp && (
                            <div className="flex items-center gap-x-2 pl-4">
                                <Checkbox
                                    id="fireAndForget"
                                    checked={fireAndForget}
                                    onCheckedChange={(checked: boolean) => setFireAndForget(checked)}
                                    disabled={isReadOnly}
                                />
                                <label htmlFor="fireAndForget" className="text-sm text-gray-600 dark:text-gray-300">
                                    Fire and Forget
                                </label>
                            </div>
                        )}
                        <div className="flex items-center gap-x-2">
                            <Checkbox
                                id="passCurrentState"
                                checked={passCurrentState}
                                onCheckedChange={(checked: boolean) => setPassCurrentState(checked)}
                                disabled={isReadOnly}
                            />
                            <label htmlFor="passCurrentState" className="text-sm text-gray-600 dark:text-gray-300">
                                Pass Current State
                            </label>
                        </div>
                    </div>

                    {/* Performance Settings — visible when Use HTTP is checked */}
                    {useHttp && (
                        <div className="space-y-3">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Performance Settings</p>
                            <Input
                                {...register('timeoutSeconds', {
                                    min: { value: 0, message: 'Timeout seconds cannot be negative' },
                                    valueAsNumber: true,
                                })}
                                label="Timeout (seconds)"
                                placeholder="Enter timeout in seconds (leave empty for default)"
                                type="number"
                                disabled={isReadOnly}
                                isDestructive={!!errors?.timeoutSeconds?.message}
                                supportiveText={errors?.timeoutSeconds?.message}
                                onInput={sanitizeNumericInput}
                            />
                            <Input
                                {...register('httpPoolConnections', {
                                    min: { value: 0, message: 'HTTP pool connections cannot be negative' },
                                    valueAsNumber: true,
                                })}
                                label="HTTP Pool Connections"
                                placeholder="Number of connection pools (leave empty for default)"
                                type="number"
                                disabled={isReadOnly}
                                isDestructive={!!errors?.httpPoolConnections?.message}
                                supportiveText={errors?.httpPoolConnections?.message}
                                onInput={sanitizeNumericInput}
                            />
                            <Input
                                {...register('httpPoolMaxsize', {
                                    min: { value: 0, message: 'HTTP pool max size cannot be negative' },
                                    valueAsNumber: true,
                                })}
                                label="HTTP Pool Max Size"
                                placeholder="Max concurrent connections per pool (leave empty for default)"
                                type="number"
                                disabled={isReadOnly}
                                isDestructive={!!errors?.httpPoolMaxsize?.message}
                                supportiveText={errors?.httpPoolMaxsize?.message}
                                onInput={sanitizeNumericInput}
                            />
                            <Input
                                {...register('subworkflowParallelWorkerLimit', {
                                    min: { value: 0, message: 'Max parallel workers cannot be negative' },
                                    max: {
                                        value: maxWorkerLimit,
                                        message: `Max parallel workers cannot exceed ${maxWorkerLimit}`,
                                    },
                                    valueAsNumber: true,
                                })}
                                label="Max Parallel Workers"
                                placeholder="Max concurrent sub-workflow executions (leave empty for default)"
                                type="number"
                                disabled={isReadOnly}
                                isDestructive={!!errors?.subworkflowParallelWorkerLimit?.message}
                                supportiveText={errors?.subworkflowParallelWorkerLimit?.message}
                                onInput={sanitizeNumericInput}
                            />
                            {watch('subworkflowParallelWorkerLimit') ? (
                                <div className="flex items-center gap-x-2 pl-4">
                                    <Checkbox
                                        id="useSemaphore"
                                        checked={useSemaphore}
                                        onCheckedChange={(checked: boolean) => setUseSemaphore(checked)}
                                        disabled={isReadOnly}
                                    />
                                    <label htmlFor="useSemaphore" className="text-sm text-gray-600 dark:text-gray-300">
                                        Use Distributed Workers
                                    </label>
                                </div>
                            ) : (
                                <></>
                            )}
                        </div>
                    )}

                    {/* Fire & Forget Settings — visible when Fire and Forget is checked */}
                    {fireAndForget && (
                        <div className="space-y-3">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                Fire & Forget Settings
                            </p>
                            <Input
                                {...register('ffExecutorTtlSeconds', {
                                    min: { value: 0, message: 'Executor TTL cannot be negative' },
                                    valueAsNumber: true,
                                })}
                                label="Executor TTL (seconds)"
                                placeholder="Executor idle TTL in seconds (leave empty for default)"
                                type="number"
                                disabled={isReadOnly}
                                isDestructive={!!errors?.ffExecutorTtlSeconds?.message}
                                supportiveText={errors?.ffExecutorTtlSeconds?.message}
                                onInput={sanitizeNumericInput}
                            />
                        </div>
                    )}

                    {/* Retry Configuration */}
                    <div className="space-y-3">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Retry Configuration</p>
                        <div className="flex items-center gap-x-2">
                            <Checkbox
                                id="retryEnabled"
                                checked={watch('retryConfig.retryEnabled') ?? false}
                                onCheckedChange={checked => {
                                    setValue('retryConfig.retryEnabled', checked === true);
                                }}
                                disabled={isReadOnly}
                            />
                            <label htmlFor="retryEnabled" className="text-sm text-gray-600 dark:text-gray-300">
                                Enable Retry
                            </label>
                        </div>
                        {watch('retryConfig.retryEnabled') && (
                            <div className="space-y-3 pl-4 border-l-2 border-gray-200 dark:border-gray-600">
                                <Input
                                    {...register('retryConfig.retryAttempts', {
                                        min: { value: 0, message: 'Retry attempts cannot be negative' },
                                        valueAsNumber: true,
                                    })}
                                    label="Retry Attempts"
                                    placeholder="Number of retry attempts"
                                    type="number"
                                    disabled={isReadOnly}
                                    isDestructive={!!errors?.retryConfig?.retryAttempts?.message}
                                    supportiveText={errors?.retryConfig?.retryAttempts?.message}
                                    onInput={sanitizeNumericInput}
                                />
                                <Select
                                    {...register('retryConfig.retryWaitType')}
                                    label="Wait Type"
                                    options={[
                                        { name: 'Fixed', value: 'fixed' },
                                        { name: 'Exponential', value: 'exponential' },
                                    ]}
                                    currentValue={watch('retryConfig.retryWaitType') ?? ''}
                                    placeholder="Select wait type"
                                    disabled={isReadOnly}
                                />
                                <Input
                                    {...register('retryConfig.retryMinWait', {
                                        min: { value: 0, message: 'Min wait cannot be negative' },
                                        valueAsNumber: true,
                                    })}
                                    label="Min Wait (seconds)"
                                    placeholder="Minimum wait between retries"
                                    type="number"
                                    disabled={isReadOnly}
                                    isDestructive={!!errors?.retryConfig?.retryMinWait?.message}
                                    supportiveText={errors?.retryConfig?.retryMinWait?.message}
                                    onInput={sanitizeNumericInput}
                                />
                                <Input
                                    {...register('retryConfig.retryMaxWait', {
                                        min: { value: 0, message: 'Max wait cannot be negative' },
                                        valueAsNumber: true,
                                    })}
                                    label="Max Wait (seconds)"
                                    placeholder="Maximum wait between retries"
                                    type="number"
                                    disabled={isReadOnly}
                                    isDestructive={!!errors?.retryConfig?.retryMaxWait?.message}
                                    supportiveText={errors?.retryConfig?.retryMaxWait?.message}
                                    onInput={sanitizeNumericInput}
                                />
                                {watch('retryConfig.retryWaitType') === 'exponential' && (
                                    <Input
                                        {...register('retryConfig.retryMultiplier', {
                                            min: { value: 0, message: 'Backoff multiplier cannot be negative' },
                                            valueAsNumber: true,
                                        })}
                                        label="Backoff Multiplier"
                                        placeholder="Exponential backoff multiplier"
                                        type="number"
                                        disabled={isReadOnly}
                                        isDestructive={!!errors?.retryConfig?.retryMultiplier?.message}
                                        supportiveText={errors?.retryConfig?.retryMultiplier?.message}
                                        onInput={sanitizeNumericInput}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <div
                    className={cn('agent-form-footer flex gap-x-3 justify-end pb-4', {
                        hidden: isFetching || workflowAuthoringTableData.length === 0,
                    })}
                >
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
        </React.Fragment>
    );
};
