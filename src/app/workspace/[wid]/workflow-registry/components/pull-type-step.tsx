'use client';

import { Input, Spinner } from '@/components';
import { Alert } from '@/components/atoms/alert';
import { RadioGroup } from '@/components/atoms/radio-group';
import RadioCard from '@/components/molecules/radio-card/radio-card';
import {AlertVariant, ArtifactApproachType } from '@/enums';
import { cn } from '@/lib/utils';
import { IWorkflowPullType, WorkflowEnvConfigFormBase } from '@/models';
import { validateField } from '@/utils/validation';
import { AlertTriangle, Info } from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import { Control, Controller, FieldErrors, UseFormRegister } from 'react-hook-form';

interface PullTypeStepProps {
    migrationStrategy: ArtifactApproachType | undefined;
    isLoading: boolean;
    pullTypeReceivedFailedMessage: string | undefined;
    pullTypes: IWorkflowPullType[];
    control: Control<WorkflowEnvConfigFormBase, unknown>;
    errors: FieldErrors<WorkflowEnvConfigFormBase>;
    register: UseFormRegister<WorkflowEnvConfigFormBase>;
    validateWorkflowName: (value: string) => Promise<string | true>;
}

export const PullTypeStep = ({
    migrationStrategy,
    isLoading,
    pullTypeReceivedFailedMessage,
    pullTypes,
    control,
    errors,
    register,
    validateWorkflowName,
}: PullTypeStepProps) => {
    if (pullTypeReceivedFailedMessage) {
        return (
            <div className="flex flex-col h-full">
                <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">Pull Type</h3>
                </div>
                <div className="flex-1 flex flex-col justify-center items-center gap-4 min-h-[300px]">
                    <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <div className="text-center max-w-md space-y-2">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">Unable to Proceed</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            {pullTypeReceivedFailedMessage}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {isLoading ? (
                <div className="flex-1 flex flex-col justify-center items-center gap-3 min-h-[350px]">
                    <Spinner />
                    <p className="text-sm text-gray-500 animate-pulse">Analyzing workflow compatibility...</p>
                </div>
            ) : (
                <>
                    <div className="mb-4">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
                            {pullTypes?.length > 1 ? 'Pull Types' : 'Pull Type'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            We&apos;ve validated the pull method for this workflow. Please review the details below.
                        </p>
                    </div>
                    <div className="space-y-4">
                        {/* Selection Card */}
                        <div className="w-full">
                            {pullTypes?.length === 0 && (
                                <div className="w-full p-3 bg-gray-50 rounded-md border-[1px] border-gray-200 text-xs text-gray-500 flex items-center justify-center text-center gap-x-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400">
                                    <Info size={14} className="min-w-[14px]" />
                                    Pull options could not be loaded. Please refresh and try again.
                                </div>
                            )}

                            <Controller
                                control={control}
                                name="migrationStrategy"
                                rules={{
                                    required: { value: true, message: 'Please select a pull type' },
                                }}
                                render={({ field, fieldState }) => (
                                    <>
                                        <RadioGroup
                                            className="flex gap-x-6 w-full relative px-1"
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            {pullTypes?.map((item, index) => (
                                                <div className="w-full" key={item.type ?? `pull-${index}`}>
                                                    <RadioCard
                                                        value={item?.type}
                                                        label={item?.label}
                                                        description={item?.description}
                                                        checked={field.value === item?.type}
                                                        isInline={true}
                                                        isSmallWidget={pullTypes?.length > 1}
                                                        labelClassName="!text-md font-medium"
                                                        descriptionClass="text-xs"
                                                        hideCheckCircle={false}
                                                        disabled={!!item.error}
                                                        alert={
                                                            item.error && (
                                                                <div className="grid gap-y-2">
                                                                    <Alert
                                                                        variant={AlertVariant.Error}
                                                                        message={
                                                                            <p className="whitespace-normal break-words text-xs">
                                                                                {item.error.message}
                                                                            </p>
                                                                        }
                                                                        className={cn('pointer-events-auto', {
                                                                            '!p-0': pullTypes?.length > 1,
                                                                            'py-2 pl-0 pb-0': pullTypes?.length <= 1,
                                                                        })}
                                                                        noBorder={true}
                                                                        noBackground={true}
                                                                        small={true}
                                                                    />
                                                                </div>
                                                            )
                                                        }
                                                        image={
                                                            <Image
                                                                src={
                                                                    item?.type === ArtifactApproachType.CREATE_AS_NEW ||
                                                                    item?.type === ArtifactApproachType.CLONE
                                                                        ? '/png/organization.png'
                                                                        : '/png/workflow.png'
                                                                }
                                                                alt={item?.label}
                                                                width={pullTypes?.length > 1 ? 40 : 140}
                                                                height={100}
                                                                className="object-contain opacity-40 group-hover:opacity-60 transition-opacity"
                                                            />
                                                        }
                                                    />
                                                </div>
                                            ))}
                                        </RadioGroup>
                                        {!!fieldState?.error?.message && (
                                            <p className="text-xs font-normal text-red-500 dark:text-red-500 mt-2 pl-1">
                                                {fieldState?.error?.message}
                                            </p>
                                        )}
                                    </>
                                )}
                            />
                        </div>

                        {migrationStrategy === ArtifactApproachType.CLONE && (
                            <Input
                                {...register('workflowName', {
                                    required: validateField('Workflow Name', { required: { value: true } }).required,
                                    validate: validateWorkflowName,
                                })}
                                placeholder="Enter Workflow Name"
                                label="Workflow Name"
                                isDestructive={!!errors?.workflowName?.message}
                                supportiveText={errors?.workflowName?.message}
                            />
                        )}

                        {/* Compact Notices Section */}
                        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-5">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-200 pb-2 mb-4 flex items-center gap-2">
                                <Info className="w-3 h-3" />
                                Important Considerations
                            </h4>
                            <div className="grid gap-4">
                                <div className="flex gap-3 items-start">
                                    <div className="mt-0.5 p-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 shrink-0">
                                        <AlertTriangle className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-200">
                                            Sub-entity Handling
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                            Some workflow sub-entities (LLMs, Prompts, APIs and etc) may be new to this
                                            environment and will be created successfully, while others may already exist
                                            in the same workspace and will be overwritten. However, if any sub-entities
                                            exist in a different workspace, their creation will be skipped to prevent
                                            conflicts. After creation, the workflow may not behave exactly as it does in
                                            the source environment due to these skipped items.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
