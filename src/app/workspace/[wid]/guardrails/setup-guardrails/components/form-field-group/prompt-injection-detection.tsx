import { Controller } from 'react-hook-form';
import { FormFieldGroup, Label, Select } from '@/components';
import { GuardrailsFormProps } from '../guardrails-form';
import { Switch } from '@/components/atoms/switch';
import { GuardrailsModelSelector } from '@/app/editor/[wid]/[workflow_id]/components/guardrails-model-selector';
import { GuardrailsAPISelector } from '@/app/editor/[wid]/[workflow_id]/components/guardrails-api-selector';
import { Slider } from '@/components/atoms/slider';
import { GUARDRAIL_ACTION_OPTION, GUARDRAIL_MODERATION_MODE_OPTION } from '@/constants';
import { GuardrailSensitiveDataManagementModeType } from '@/enums';

export const PromptInjectionDetection = (props: GuardrailsFormProps) => {
    const { isEdit, errors, control, isReadOnly, protectionModeErrorMessage, register, watch, validateProtection } =
        props;

    return (
        <FormFieldGroup
            switchControl={
                <Controller
                    name="configurations.enablePromptInjectionDetection"
                    control={control}
                    rules={{ validate: validateProtection }}
                    render={({ field }) => (
                        <Switch disabled={true} checked={field.value} onCheckedChange={field.onChange} />
                    )}
                />
            }
            showSeparator={false}
            title="Prompt Injection Detection"
            isDestructive={!!protectionModeErrorMessage}
        >
            {watch('configurations.enablePromptInjectionDetection') ? (
                <>
                    <div className="col-span-1 sm:col-span-2">
                        <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                            <Select
                                {...register('configurations.promptInjectionDetection.mode', {
                                    required: { value: true, message: 'Please select a detection mode' },
                                })}
                                label="Prompt Injection Detection Mode"
                                placeholder="Select a Detection Mode"
                                disabled={isEdit && isReadOnly}
                                options={GUARDRAIL_MODERATION_MODE_OPTION}
                                currentValue={watch('configurations.promptInjectionDetection.mode') || ''}
                                isDestructive={!!errors?.configurations?.promptInjectionDetection?.mode?.message}
                                supportiveText={errors?.configurations?.promptInjectionDetection?.mode?.message}
                            />
                            {watch('configurations.promptInjectionDetection.mode') ===
                                GuardrailSensitiveDataManagementModeType.USE_A_MODEL && (
                                <div className="border-2 border-solid rounded-lg p-2 sm:p-4 border-gray-300 dark:border-gray-700">
                                    <GuardrailsModelSelector
                                        agent={undefined}
                                        guardrailsModels={undefined}
                                        label="Model"
                                        description="Select Prompt Injection Prevention model from a list of models"
                                        labelClassName="text-sm font-medium dark:text-gray-100 text-gray-700"
                                        setGuardrailsModels={() => {}}
                                        allGuardrailsModels={[]}
                                        isReadOnly={true}
                                        modelLoading={false}
                                        onRefetch={() => {}}
                                        onGuardrailsModelChange={() => {}}
                                    />
                                </div>
                            )}

                            {watch('configurations.promptInjectionDetection.mode') ===
                                GuardrailSensitiveDataManagementModeType.USE_AN_API && (
                                <div className="border-2 border-solid rounded-lg p-2 sm:p-4 border-gray-300 dark:border-gray-700">
                                    <GuardrailsAPISelector
                                        agent={undefined}
                                        guardrailsApis={undefined}
                                        description="Select Prompt Injection Prevention API from a list of APIs"
                                        labelClassName="text-sm font-medium dark:text-gray-100 text-gray-700"
                                        setGuardrailsApis={() => {}}
                                        allGuardrailsApiTools={[]}
                                        isReadonly={true}
                                        apiLoading={false}
                                        onRefetch={() => {}}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Controller
                                    name="configurations.promptInjectionDetection.threshold"
                                    control={control}
                                    defaultValue={0}
                                    render={({ field }) => (
                                        <>
                                            <Label className="text-sm font-medium dark:text-gray-100 text-gray-700">
                                                Score Threshold
                                            </Label>
                                            <Slider
                                                value={[field.value ?? 0]}
                                                onValueChange={values => field.onChange(values[0])}
                                                max={100}
                                                step={1}
                                                className="mt-4"
                                            />
                                        </>
                                    )}
                                />
                            </div>
                            <Select
                                {...register('configurations.promptInjectionDetection.action', {
                                    required: { value: true, message: 'Please select an action' },
                                })}
                                label="Action"
                                placeholder="Select an Action"
                                disabled={isEdit && isReadOnly}
                                options={GUARDRAIL_ACTION_OPTION}
                                currentValue={watch('configurations.promptInjectionDetection.action') || ''}
                                isDestructive={!!errors?.configurations?.promptInjectionDetection?.action?.message}
                                supportiveText={errors?.configurations?.promptInjectionDetection?.action?.message}
                            />
                        </div>
                    </div>
                </>
            ) : (
                <div className="col-span-1 sm:col-span-2">
                    <div className="ml-[44px]">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Enable Prompt Injection Prevention to manage prompt injection model and action to be taken
                        </p>
                    </div>
                </div>
            )}
        </FormFieldGroup>
    );
};
