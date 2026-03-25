'use client';

import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import {
    Button,
    Input,
    Select,
    Textarea,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components';
import AppDrawer from '@/components/molecules/drawer/app-drawer';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/atoms/collapsible';
import { cn } from '@/lib/utils';
import { Server, Info, ChevronDown, X, Cloud, AlertTriangle } from 'lucide-react';
import {
    ExecutionRuntimeData,
    RUNTIME_PROVIDERS,
    AWS_REGIONS,
    MEMORY_OPTIONS,
    TIMEOUT_OPTIONS,
} from '@/mocks/execution-runtimes-data';

interface RuntimeFormData {
    name: string;
    description: string;
    provider: string;
    region: string;
    iamRole: string;
    memory: string;
    timeout: string;
    environmentVariables: Array<{ name: string; value: string }>;
    tags: Array<{ key: string; value: string }>;
}

interface ExecutionRuntimeFormProps {
    isOpen: boolean;
    isEdit: boolean;
    editingRuntime: ExecutionRuntimeData | null;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onSubmit: (data: Partial<ExecutionRuntimeData>) => void;
}

const ProviderInfoCard = ({ provider }: { provider: string }) => {
    if (provider === 'kaya-runtime') {
        return (
            <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                <Server size={16} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                    <p className="text-xs font-medium text-blue-800 dark:text-blue-200">Kaya Runtime (Default)</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                        Uses the built-in LangGraph orchestration engine. No additional configuration required.
                        All existing platform features (self-learning, deterministic execution, guardrails, HITL) work natively.
                    </p>
                </div>
            </div>
        );
    }

    if (provider === 'aws-agentcore') {
        return (
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
                <Cloud size={16} className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                    <p className="text-xs font-medium text-amber-800 dark:text-amber-200">AWS Bedrock AgentCore</p>
                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                        Deploys workflows to Amazon Bedrock AgentCore. Requires AWS credentials, IAM role, and region configuration.
                        Kaya platform features remain available through the AgentCore integration layer.
                    </p>
                </div>
            </div>
        );
    }

    return null;
};

const FormBody = ({
    isEdit,
    register,
    watch,
    errors,
    control,
    envFields,
    appendEnv,
    removeEnv,
    tagFields,
    appendTag,
    removeTag,
}: {
    isEdit: boolean;
    register: ReturnType<typeof useForm<RuntimeFormData>>['register'];
    watch: ReturnType<typeof useForm<RuntimeFormData>>['watch'];
    errors: ReturnType<typeof useForm<RuntimeFormData>>['formState']['errors'];
    control: ReturnType<typeof useForm<RuntimeFormData>>['control'];
    envFields: Array<{ id: string; name: string; value: string }>;
    appendEnv: () => void;
    removeEnv: (index: number) => void;
    tagFields: Array<{ id: string; key: string; value: string }>;
    appendTag: () => void;
    removeTag: (index: number) => void;
}) => {
    const provider = watch('provider');

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 sm:gap-4">
            {/* Runtime Name */}
            <div className={cn('col-span-1 sm:col-span-2', isEdit && 'opacity-60')}>
                <Input
                    {...register('name', {
                        required: { value: true, message: 'Please enter a runtime name' },
                        pattern: {
                            value: /^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
                            message: 'Name must be lowercase, alphanumeric with hyphens only',
                        },
                    })}
                    placeholder="Enter runtime name (e.g., agentcore-production)"
                    readOnly={isEdit}
                    disabled={isEdit}
                    label="Runtime Name"
                    autoComplete="off"
                    isDestructive={!!errors?.name?.message}
                    supportiveText={errors?.name?.message}
                />
            </div>

            {/* Description */}
            <div className="col-span-1 sm:col-span-2">
                <Textarea
                    {...register('description', {
                        required: { value: true, message: 'Please enter a description' },
                    })}
                    placeholder="Describe the purpose of this runtime configuration"
                    label="Description"
                    autoComplete="off"
                    isDestructive={!!errors?.description?.message}
                    supportiveText={errors?.description?.message}
                />
            </div>

            {/* Provider Selection */}
            <div className={cn('col-span-1 sm:col-span-2', isEdit && 'opacity-60')}>
                <Select
                    {...register('provider', {
                        required: { value: true, message: 'Please select a runtime provider' },
                    })}
                    placeholder="Select Runtime Provider"
                    disabled={isEdit}
                    label="Runtime Provider"
                    options={RUNTIME_PROVIDERS.map((p) => ({
                        value: p.value,
                        name: p.name,
                        disabled: p.disabled,
                    }))}
                    currentValue={watch('provider')}
                    isDestructive={!!errors?.provider?.message}
                    supportiveText={errors?.provider?.message}
                />
            </div>

            {/* Provider Info Card */}
            {provider && (
                <div className="col-span-1 sm:col-span-2">
                    <ProviderInfoCard provider={provider} />
                </div>
            )}

            {/* AWS AgentCore specific fields */}
            {provider === 'aws-agentcore' && (
                <>
                    {/* Region */}
                    <div className="col-span-1">
                        <Select
                            {...register('region', {
                                required: { value: true, message: 'Please select a region' },
                            })}
                            placeholder="Select AWS Region"
                            label="AWS Region"
                            options={AWS_REGIONS}
                            currentValue={watch('region')}
                            isDestructive={!!errors?.region?.message}
                            supportiveText={errors?.region?.message}
                        />
                    </div>

                    {/* IAM Role */}
                    <div className="col-span-1">
                        <Input
                            {...register('iamRole', {
                                required: { value: true, message: 'Please enter an IAM Role ARN' },
                                pattern: {
                                    value: /^arn:aws:iam::\d{12}:role\/.+$/,
                                    message: 'Must be a valid IAM Role ARN (arn:aws:iam::ACCOUNT:role/NAME)',
                                },
                            })}
                            placeholder="arn:aws:iam::123456789012:role/kaya-agentcore-exec"
                            label="IAM Execution Role ARN"
                            autoComplete="off"
                            isDestructive={!!errors?.iamRole?.message}
                            supportiveText={errors?.iamRole?.message}
                        />
                    </div>

                    {/* Memory */}
                    <div className="col-span-1">
                        <Select
                            {...register('memory', {
                                required: { value: true, message: 'Please select memory allocation' },
                            })}
                            placeholder="Select Memory"
                            label="Memory Allocation"
                            options={MEMORY_OPTIONS}
                            currentValue={watch('memory')}
                            isDestructive={!!errors?.memory?.message}
                            supportiveText={errors?.memory?.message}
                        />
                    </div>

                    {/* Timeout */}
                    <div className="col-span-1">
                        <Select
                            {...register('timeout', {
                                required: { value: true, message: 'Please select a timeout' },
                            })}
                            placeholder="Select Timeout"
                            label="Execution Timeout"
                            options={TIMEOUT_OPTIONS}
                            currentValue={watch('timeout')}
                            isDestructive={!!errors?.timeout?.message}
                            supportiveText={errors?.timeout?.message}
                        />
                    </div>

                    {/* Environment Variables */}
                    <div className="col-span-1 sm:col-span-2">
                        <Collapsible className="border border-gray-300 rounded-md dark:border-gray-700">
                            <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-100">
                                    Environment Variables ({envFields.length})
                                </span>
                                <ChevronDown className="h-4 w-4 text-gray-500 transition-transform duration-200 data-[state=open]:rotate-180" />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="px-4 pb-4 pt-2 space-y-4">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Define environment variables available to the runtime at execution time.
                                </p>
                                {envFields.map((item, index) => (
                                    <div key={item.id} className="flex gap-2 items-start">
                                        <div className="flex-1 grid grid-cols-2 gap-2">
                                            <Input
                                                {...register(`environmentVariables.${index}.name`, {
                                                    required: { value: true, message: 'Name required' },
                                                })}
                                                placeholder="Variable name"
                                                isDestructive={!!errors?.environmentVariables?.[index]?.name?.message}
                                                supportiveText={errors?.environmentVariables?.[index]?.name?.message}
                                            />
                                            <Input
                                                {...register(`environmentVariables.${index}.value`, {
                                                    required: { value: true, message: 'Value required' },
                                                })}
                                                placeholder="Value"
                                                isDestructive={!!errors?.environmentVariables?.[index]?.value?.message}
                                                supportiveText={errors?.environmentVariables?.[index]?.value?.message}
                                            />
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => removeEnv(index)} className="mt-0">
                                            <X className="size-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={appendEnv}
                                    className="text-blue-600 hover:text-blue-700"
                                >
                                    + Add Variable
                                </Button>
                            </CollapsibleContent>
                        </Collapsible>
                    </div>

                    {/* Tags */}
                    <div className="col-span-1 sm:col-span-2">
                        <Collapsible className="border border-gray-300 rounded-md dark:border-gray-700">
                            <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-100">
                                    Tags ({tagFields.length})
                                </span>
                                <ChevronDown className="h-4 w-4 text-gray-500 transition-transform duration-200 data-[state=open]:rotate-180" />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="px-4 pb-4 pt-2 space-y-4">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Add tags for organization and filtering of runtime configurations.
                                </p>
                                {tagFields.map((item, index) => (
                                    <div key={item.id} className="flex gap-2 items-start">
                                        <div className="flex-1 grid grid-cols-2 gap-2">
                                            <Input
                                                {...register(`tags.${index}.key`, {
                                                    required: { value: true, message: 'Key required' },
                                                })}
                                                placeholder="Tag key"
                                                isDestructive={!!errors?.tags?.[index]?.key?.message}
                                                supportiveText={errors?.tags?.[index]?.key?.message}
                                            />
                                            <Input
                                                {...register(`tags.${index}.value`, {
                                                    required: { value: true, message: 'Value required' },
                                                })}
                                                placeholder="Tag value"
                                                isDestructive={!!errors?.tags?.[index]?.value?.message}
                                                supportiveText={errors?.tags?.[index]?.value?.message}
                                            />
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => removeTag(index)} className="mt-0">
                                            <X className="size-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={appendTag}
                                    className="text-blue-600 hover:text-blue-700"
                                >
                                    + Add Tag
                                </Button>
                            </CollapsibleContent>
                        </Collapsible>
                    </div>

                    {/* Provisioning Notice */}
                    <div className="col-span-1 sm:col-span-2">
                        <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
                            <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-amber-800 dark:text-amber-200">
                                <strong>Provisioning:</strong> Saving this configuration will initiate AWS AgentCore provisioning.
                                The runtime will be in &quot;Provisioning&quot; status until the AWS resources are fully created.
                                This typically takes 2-5 minutes.
                            </p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export const ExecutionRuntimeForm = ({
    isOpen,
    isEdit,
    editingRuntime,
    setOpen,
    onSubmit,
}: ExecutionRuntimeFormProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        watch,
        handleSubmit,
        reset,
        control,
        formState: { errors, isValid },
    } = useForm<RuntimeFormData>({
        mode: 'onChange',
        defaultValues: {
            name: '',
            description: '',
            provider: '',
            region: '',
            iamRole: '',
            memory: '1024',
            timeout: '300',
            environmentVariables: [],
            tags: [],
        },
    });

    const {
        fields: envFields,
        append: appendEnvRaw,
        remove: removeEnv,
    } = useFieldArray({ control, name: 'environmentVariables' });

    const {
        fields: tagFields,
        append: appendTagRaw,
        remove: removeTag,
    } = useFieldArray({ control, name: 'tags' });

    const appendEnv = () => appendEnvRaw({ name: '', value: '' });
    const appendTag = () => appendTagRaw({ key: '', value: '' });

    useEffect(() => {
        if (isOpen && isEdit && editingRuntime) {
            reset({
                name: editingRuntime.name,
                description: editingRuntime.description,
                provider: editingRuntime.provider,
                region: editingRuntime.region || '',
                iamRole: editingRuntime.iamRole || '',
                memory: editingRuntime.memory?.toString() || '1024',
                timeout: editingRuntime.timeout?.toString() || '300',
                environmentVariables: editingRuntime.environmentVariables || [],
                tags: editingRuntime.tags || [],
            });
        } else if (isOpen && !isEdit) {
            reset({
                name: '',
                description: '',
                provider: '',
                region: '',
                iamRole: '',
                memory: '1024',
                timeout: '300',
                environmentVariables: [],
                tags: [],
            });
        }
    }, [isOpen, isEdit, editingRuntime, reset]);

    const handleFormSubmit = (data: RuntimeFormData) => {
        setIsSubmitting(true);
        setTimeout(() => {
            onSubmit({
                name: data.name,
                description: data.description,
                provider: data.provider as ExecutionRuntimeData['provider'],
                region: data.region || undefined,
                iamRole: data.iamRole || undefined,
                memory: data.memory ? parseInt(data.memory) : undefined,
                timeout: data.timeout ? parseInt(data.timeout) : undefined,
                environmentVariables: data.environmentVariables,
                tags: data.tags,
            });
            setIsSubmitting(false);
        }, 1500);
    };

    return (
        <AppDrawer
            open={isOpen}
            direction="right"
            setOpen={setOpen}
            className="custom-drawer-content !w-[633px]"
            dismissible={false}
            headerIcon={<Server />}
            header={isEdit ? 'Edit Runtime Configuration' : 'New Runtime Configuration'}
            bodyClassName="overflow-y-auto"
            footer={
                <div className="flex justify-end gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <div>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        size="sm"
                                        disabled={!isValid || isSubmitting}
                                        loading={isSubmitting}
                                        onClick={handleSubmit(handleFormSubmit)}
                                    >
                                        {isSubmitting
                                            ? isEdit
                                                ? 'Updating...'
                                                : 'Provisioning...'
                                            : isEdit
                                              ? 'Update Configuration'
                                              : watch('provider') === 'kaya-runtime'
                                                ? 'Save Configuration'
                                                : 'Save & Provision'}
                                    </Button>
                                </TooltipTrigger>
                                {!isValid && (
                                    <TooltipContent side="left" align="center">
                                        All required fields must be filled before saving
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            }
            content={
                <div className={cn('activity-feed-container p-4')}>
                    <FormBody
                        isEdit={isEdit}
                        register={register}
                        watch={watch}
                        errors={errors}
                        control={control}
                        envFields={envFields as Array<{ id: string; name: string; value: string }>}
                        appendEnv={appendEnv}
                        removeEnv={removeEnv}
                        tagFields={tagFields as Array<{ id: string; key: string; value: string }>}
                        appendTag={appendTag}
                        removeTag={removeTag}
                    />
                </div>
            }
        />
    );
};
