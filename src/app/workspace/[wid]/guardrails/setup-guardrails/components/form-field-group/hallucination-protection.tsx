import { Controller } from 'react-hook-form';
import { FormFieldGroup, Label, Select } from '@/components';
import { GuardrailsFormProps } from '../guardrails-form';
import { Switch } from '@/components/atoms/switch';
import { GuardrailsModelSelector } from '@/app/editor/[wid]/[workflow_id]/components/guardrails-model-selector';
import { GuardrailsAPISelector } from '@/app/editor/[wid]/[workflow_id]/components/guardrails-api-selector';
import { GUARDRAIL_ACTION_OPTION, GUARDRAIL_MODERATION_MODE_OPTION } from '@/constants';
import { GuardrailSensitiveDataManagementModeType } from '@/enums';
import { Slider } from '@/components/atoms/slider';

export const HallucinationProtection = (props: GuardrailsFormProps) => {
    const {
        isEdit,
        errors,
        control,
        isReadOnly,
        protectionModeErrorMessage,
        register,
        watch,
        trigger,
        validateProtection,
    } = props;

    return (
        <FormFieldGroup
            switchControl={
                <Controller
                    name="configurations.enableHallucinationProtection"
                    control={control}
                    rules={{ validate: validateProtection }}
                    render={({ field }) => (
                        <Switch
                            disabled={isEdit && isReadOnly}
                            checked={field.value}
                            onCheckedChange={val => {
                                field.onChange(val);
                                trigger([
                                    'configurations.enableSensitiveDataManagement',
                                    'configurations.enableContentAndLanguageModeration',
                                    'configurations.enablePromptInjectionDetection',
                                    'configurations.enableHallucinationProtection',
                                ]);
                            }}
                        />
                    )}
                />
            }
            showSeparator={false}
            title="Hallucination Protection"
            isDestructive={!!protectionModeErrorMessage}
        >
            {watch('configurations.enableHallucinationProtection') ? (
                <>
                    <div className="col-span-1 sm:col-span-2">
                        <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                            <Select
                                {...register('configurations.hallucinationProtection.mode', {
                                    required: { value: true, message: 'Please select a protection mode' },
                                })}
                                label="Hallucination Protection Mode"
                                placeholder="Select a protection mode"
                                disabled={isEdit && isReadOnly}
                                options={GUARDRAIL_MODERATION_MODE_OPTION}
                                currentValue={watch('configurations.hallucinationProtection.mode') || ''}
                                isDestructive={!!errors?.configurations?.hallucinationProtection?.mode?.message}
                                supportiveText={errors?.configurations?.hallucinationProtection?.mode?.message}
                            />
                            {watch('configurations.hallucinationProtection.mode') ===
                                GuardrailSensitiveDataManagementModeType.USE_A_MODEL && (
                                <div className="border-2 border-solid rounded-lg p-2 sm:p-4 border-gray-300 dark:border-gray-700">
                                    <GuardrailsModelSelector
                                        agent={undefined}
                                        guardrailsModels={undefined}
                                        label="Model"
                                        description="Select Hallucination Protection model from a list of models"
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

                            {watch('configurations.hallucinationProtection.mode') ===
                                GuardrailSensitiveDataManagementModeType.USE_AN_API && (
                                <div className="border-2 border-solid rounded-lg p-2 sm:p-4 border-gray-300 dark:border-gray-700">
                                    <GuardrailsAPISelector
                                        agent={undefined}
                                        guardrailsApis={undefined}
                                        description="Select Hallucination Protection API from a list of APIs"
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
                                    name="configurations.hallucinationProtection.threshold"
                                    control={control}
                                    defaultValue={0}
                                    render={({ field }) => (
                                        <>
                                            <Label className="text-sm font-medium dark:text-gray-100 text-gray-700">
                                                Grounding Threshold
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
                                {...register('configurations.hallucinationProtection.action', {
                                    required: { value: true, message: 'Please select an action' },
                                })}
                                label="Action"
                                placeholder="Select an Action"
                                disabled={isEdit && isReadOnly}
                                options={GUARDRAIL_ACTION_OPTION}
                                currentValue={watch('configurations.hallucinationProtection.action') || ''}
                                isDestructive={!!errors?.configurations?.hallucinationProtection?.action?.message}
                                supportiveText={errors?.configurations?.hallucinationProtection?.action?.message}
                            />
                        </div>
                    </div>
                </>
            ) : (
                <div className="col-span-1 sm:col-span-2">
                    <div className="ml-[44px]">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Enable Hallucination Protection to manage hallucination model and action to be taken
                        </p>
                    </div>
                </div>
            )}
        </FormFieldGroup>
    );
};
