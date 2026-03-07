'use client';

import React from 'react';
import { CurrentValueField } from './current-value-field';
import { IncomingValueField } from './incoming-value-field';
import { FinalValueField } from './final-value-field';
import { Control, FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { WorkflowEnvConfigFormBase } from '@/models/workflow-pull.model';
import { FormFieldGroup, OptionModel } from '@/components/atoms';
import { Info } from 'lucide-react';

interface IHeaderConfigurationSectionProps {
    configIndex: number;
    fieldIndexes: number[];
    watch: UseFormWatch<WorkflowEnvConfigFormBase>;
    control: Control<WorkflowEnvConfigFormBase>;
    errors: FieldErrors<WorkflowEnvConfigFormBase>;
    setValue: UseFormSetValue<WorkflowEnvConfigFormBase>;
    register: UseFormRegister<WorkflowEnvConfigFormBase>;
    secrets: OptionModel[];
    refetchSecrets: () => void;
    loadingSecrets: boolean;
}

export const HeaderConfigurationSection = ({
    configIndex,
    fieldIndexes,
    watch,
    control,
    errors,
    setValue,
    register,
    secrets,
    refetchSecrets,
    loadingSecrets,
}: IHeaderConfigurationSectionProps) => {
    const generateLabel = (value: string) => {
        const result = value.replace(/^header--/, '');
        return `Key: ${result ?? 'N/A'}`;
    };

    return (
        <div className="border border-blue-200 dark:border-gray-600 border-dashed pb-4 flex flex-col gap-y-4 rounded-md p-2">
            <div className="bg-blue-100 dark:bg-gray-900 py-2 flex justify-center rounded-md">
                <span className="text-sm font-semibold text-blue-800 dark:text-gray-400">Headers</span>
            </div>
            <div className="w-full p-3 bg-gray-50 rounded-md border-[1px] border-gray-200 text-xs text-gray-500 flex items-start gap-x-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 mb-2">
                <Info size={14} className="min-w-[14px] mt-[2px]" />
                Secret headers detected. Please provide values for each header listed below to ensure proper
                configuration
            </div>
            {/* list */}
            {fieldIndexes?.map((fieldIndex, index) => (
                <FormFieldGroup
                    showSeparator={false}
                    title={generateLabel(watch(`configs.${configIndex}.fields.${fieldIndex}.name`))}
                    key={index}
                >
                    <div className="col-span-1 sm:col-span-2 flex flex-col gap-y-4">
                        <CurrentValueField
                            value={watch(`configs.${configIndex}.fields.${fieldIndex}.meta.currentValue`)}
                        />
                        <IncomingValueField
                            value={watch(`configs.${configIndex}.fields.${fieldIndex}.meta.incomingValue`)}
                        />
                        <FinalValueField
                            value={watch(`configs.${configIndex}.fields.${fieldIndex}.meta.finalValue`)}
                            control={control}
                            watch={watch}
                            configIndex={configIndex}
                            fieldIndex={fieldIndex}
                            errors={errors}
                            setValue={setValue}
                            register={register}
                            secrets={secrets}
                            refetchSecrets={refetchSecrets}
                            loadingSecrets={loadingSecrets}
                        />
                    </div>
                </FormFieldGroup>
            ))}
        </div>
    );
};
//
