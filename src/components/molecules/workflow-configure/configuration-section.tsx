'use client';

import React from 'react';
import { CurrentValueField } from './current-value-field';
import { IncomingValueField } from './incoming-value-field';
import { FinalValueField } from './final-value-field';
import { Control, FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { WorkflowEnvConfigFormBase } from '@/models/workflow-pull.model';
import { OptionModel } from '@/components/atoms';
import { getFieldLabel } from '@/utils/field-label-converter';

import { IntellisenseCategory } from '@/app/workspace/[wid]/prompt-templates/components/monaco-editor';

interface IConfigurationSectionProps {
    configIndex: number;
    fieldIndex: number;
    watch: UseFormWatch<WorkflowEnvConfigFormBase>;
    errors: FieldErrors<WorkflowEnvConfigFormBase>;
    setValue: UseFormSetValue<WorkflowEnvConfigFormBase>;
    register: UseFormRegister<WorkflowEnvConfigFormBase>;
    secrets: OptionModel[];
    refetchSecrets: () => void;
    loadingSecrets: boolean;
    intellisenseOptions?: IntellisenseCategory[];
    control: Control<WorkflowEnvConfigFormBase>;
}

export const ConfigurationSection = ({
    configIndex,
    fieldIndex,
    watch,
    errors,
    setValue,
    register,
    secrets,
    refetchSecrets,
    loadingSecrets,
    intellisenseOptions,
    control,
}: IConfigurationSectionProps) => {
    return (
        <div className="border border-blue-200 dark:border-gray-600 border-dashed pb-4 flex flex-col gap-y-4 rounded-md p-2">
            <div className="bg-blue-100 dark:bg-gray-900 py-2 flex justify-center rounded-md">
                <span className="text-sm font-semibold text-blue-800 dark:text-gray-400">
                    {getFieldLabel(
                        watch(`configs.${configIndex}.fields.${fieldIndex}.name`),
                        watch(`configs.${configIndex}.type`)
                    )}
                </span>
            </div>
            {/* list */}
            <div className="flex flex-col gap-y-4 px-2">
                <CurrentValueField value={watch(`configs.${configIndex}.fields.${fieldIndex}.meta.currentValue`)} />
                <IncomingValueField value={watch(`configs.${configIndex}.fields.${fieldIndex}.meta.incomingValue`)} />
                <FinalValueField
                    value={watch(`configs.${configIndex}.fields.${fieldIndex}.meta.finalValue`)}
                    watch={watch}
                    configIndex={configIndex}
                    fieldIndex={fieldIndex}
                    errors={errors}
                    setValue={setValue}
                    register={register}
                    secrets={secrets}
                    refetchSecrets={refetchSecrets}
                    loadingSecrets={loadingSecrets}
                    intellisenseOptions={intellisenseOptions}
                    control={control}
                />
            </div>
        </div>
    );
};
