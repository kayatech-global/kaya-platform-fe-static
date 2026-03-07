import React from 'react';
import EditorButton from '@/components/atoms/editor-button';
import { Info, RotateCcw } from 'lucide-react';
import { Control, FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { WorkflowEnvConfigFormBase } from '@/models/workflow-pull.model';
import { FieldMapper } from './field-mapper';
import { OptionModel } from '@/components/atoms';

interface IFinalValueFieldProps {
    value: string;
    configIndex: number;
    fieldIndex: number;
    watch: UseFormWatch<WorkflowEnvConfigFormBase>;
    control: Control<WorkflowEnvConfigFormBase>;
    errors: FieldErrors<WorkflowEnvConfigFormBase>;
    setValue: UseFormSetValue<WorkflowEnvConfigFormBase>;
    register: UseFormRegister<WorkflowEnvConfigFormBase>;
    secrets: OptionModel[];
    refetchSecrets: () => void;
    loadingSecrets: boolean;
}

export const FinalValueField = ({
    value,
    configIndex,
    fieldIndex,
    watch,
    setValue,
    register,
    errors,
    secrets,
    refetchSecrets,
    loadingSecrets,
}: IFinalValueFieldProps) => {
    const finalValue = watch(`configs.${configIndex}.fields.${fieldIndex}.meta.finalValue`);
    const initFinalValue = watch(`configs.${configIndex}.fields.${fieldIndex}.meta.initFinalValue`);

    const isOverridden = finalValue && finalValue !== initFinalValue;

    const fieldError = errors?.configs?.[configIndex]?.fields?.[fieldIndex]?.meta?.finalValue;

    return (
        <div className="flex flex-col gap-y-1">
            <p className="text-[12px] font-medium text-gray-700 dark:text-gray-300">Final Value</p>
            <div className="relative">
                <FieldMapper
                    watch={watch}
                    register={register}
                    fieldIndex={fieldIndex}
                    configIndex={configIndex}
                    value={value}
                    errors={errors}
                    secrets={secrets}
                    refetchSecrets={refetchSecrets}
                    loadingSecrets={loadingSecrets}
                />
                <div className="flex items-center ml-1 gap-x-1">
                    {isOverridden && !fieldError && (
                        <>
                            <Info size={10} className="mt-[3px]" color="#316FED" />
                            <p className="text-xs text-blue-600 mt-1">You’ve overridden this value.</p>
                        </>
                    )}
                </div>
                {watch(`configs.${configIndex}.fields.${fieldIndex}.readOnly`) && (
                    <div className="w-full">
                        <div className="absolute top-1 right-1">
                            <EditorButton
                                onClick={() => setValue(`configs.${configIndex}.fields.${fieldIndex}.readOnly`, false)}
                                icon={<RotateCcw />}
                                textClassName="text-white"
                                variant="primary"
                            >
                                Override
                            </EditorButton>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
