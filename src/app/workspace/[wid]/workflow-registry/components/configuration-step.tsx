'use client';

import React from 'react';
import { Control, FieldErrors, UseFormRegister, UseFormSetValue, UseFormTrigger, UseFormWatch } from 'react-hook-form';
import { WorkflowEnvConfigFormBase } from '@/models/workflow-pull.model';
import { WorkflowConfigureAccordion } from '@/components/molecules/workflow-configure/workflow-configure-accordion';
import { Alert } from '@/components/atoms/alert';
import { OptionModel } from '@/components';
import {AlertVariant} from "@/enums";

interface ConfigurationStepProps {
    control: Control<WorkflowEnvConfigFormBase>;
    errors: FieldErrors<WorkflowEnvConfigFormBase>;
    watch: UseFormWatch<WorkflowEnvConfigFormBase>;
    setValue: UseFormSetValue<WorkflowEnvConfigFormBase>;
    register: UseFormRegister<WorkflowEnvConfigFormBase>;
    secrets: OptionModel[];
    refetchSecrets: () => void;
    loadingSecrets: boolean;
    trigger: UseFormTrigger<WorkflowEnvConfigFormBase>;
}

export const ConfigurationStep = ({
    control,
    errors,
    watch,
    setValue,
    register,
    secrets,
    refetchSecrets,
    loadingSecrets,
    trigger,
}: ConfigurationStepProps) => {
    return (
        <div className="flex flex-col gap-y-4">
            <div className="space-y-2">
                <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                        Environment Configuration
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Review and configure environment-specific variables that must be updated manually after pulling
                        this version.
                    </p>
                </div>

                {/* Warning Alert */}
                {watch('configs').length > 0 && (
                    <Alert
                        variant={AlertVariant.Warning}
                        message="The following environment-specific values must be verified or reconfigured manually before completing the pull"
                        className="py-2"
                    />
                )}
            </div>
            {watch('configs').length > 0 ? (
                <WorkflowConfigureAccordion
                    register={register}
                    setValue={setValue}
                    watch={watch}
                    control={control}
                    errors={errors}
                    secrets={secrets}
                    refetchSecrets={refetchSecrets}
                    loadingSecrets={loadingSecrets}
                    trigger={trigger}
                />
            ) : (
                <div className="py-8">
                    <Alert
                        variant={AlertVariant.Success}
                        title="No Configuration Required"
                        message="There are no environment-specific values that need to be manually configured for this workflow. You can pull the workflow now."
                        className="py-2"
                    />
                </div>
            )}
        </div>
    );
};
