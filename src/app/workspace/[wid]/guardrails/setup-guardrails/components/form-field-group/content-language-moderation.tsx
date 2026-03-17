import { Controller } from 'react-hook-form';
import {
    FormFieldGroup,
    Select,
    DynamicObject,
    DynamicObjectBody,
    DynamicObjectField,
    DynamicObjectItem,
} from '@/components';
import {
    SelectContentV2,
    SelectGroupV2,
    SelectItemV2,
    SelectLabelV2,
    SelectTriggerV2,
    SelectV2,
    SelectValueV2,
} from '@/components/atoms/select-v2';
import { GuardrailsFormProps } from '../guardrails-form';
import { Switch } from '@/components/atoms/switch';
import { GuardrailsModelSelector } from '@/app/editor/[wid]/[workflow_id]/components/guardrails-model-selector';
import { GuardrailsAPISelector } from '@/app/editor/[wid]/[workflow_id]/components/guardrails-api-selector';
import { GUARDRAIL_ACTION_OPTION, GUARDRAIL_CATEGORY_OPTION, GUARDRAIL_MODERATION_MODE_OPTION } from '@/constants';
import { GuardrailSensitiveDataManagementModeType } from '@/enums';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/atoms/slider';

export const ContentLanguageModeration = (props: GuardrailsFormProps) => {
    const {
        isEdit,
        errors,
        control,
        isReadOnly,
        languageModerationFields,
        protectionModeErrorMessage,
        register,
        watch,
        trigger,
        appendLanguageModeration,
        removeLanguageModeration,
        validateProtection,
    } = props;

    return (
        <FormFieldGroup
            switchControl={
                <Controller
                    name="configurations.enableContentAndLanguageModeration"
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
            title="Content and Language Moderation"
            isDestructive={!!protectionModeErrorMessage}
        >
            {watch('configurations.enableContentAndLanguageModeration') ? (
                <>
                    <div className="col-span-1 sm:col-span-2">
                        <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                            <Select
                                {...register('configurations.contentAndLanguageModeration.mode', {
                                    required: { value: true, message: 'Please select a moderation mode' },
                                })}
                                label="Content and Language Moderation Mode"
                                placeholder="Select a Moderation Mode"
                                disabled={isEdit && isReadOnly}
                                options={GUARDRAIL_MODERATION_MODE_OPTION}
                                currentValue={watch('configurations.contentAndLanguageModeration.mode') || ''}
                                isDestructive={!!errors?.configurations?.contentAndLanguageModeration?.mode?.message}
                                supportiveText={errors?.configurations?.contentAndLanguageModeration?.mode?.message}
                            />
                            {watch('configurations.contentAndLanguageModeration.mode') ===
                                GuardrailSensitiveDataManagementModeType.USE_A_MODEL && (
                                <div className="border-2 border-solid rounded-lg p-2 sm:p-4 border-gray-300 dark:border-gray-700">
                                    <GuardrailsModelSelector
                                        agent={undefined}
                                        guardrailsModels={undefined}
                                        label="Model"
                                        description="Select Content and Language Moderation model from a list of models"
                                        labelClassName="text-sm font-medium dark:text-gray-100 text-gray-700"
                                        setGuardrailsModels={() => {}}
                                        allGuardrailsModels={[]}
                                        isReadOnly={isEdit && isReadOnly}
                                        modelLoading={false}
                                        onRefetch={() => {}}
                                        onGuardrailsModelChange={() => {}}
                                    />
                                </div>
                            )}

                            {watch('configurations.contentAndLanguageModeration.mode') ===
                                GuardrailSensitiveDataManagementModeType.USE_AN_API && (
                                <div className="border-2 border-solid rounded-lg p-2 sm:p-4 border-gray-300 dark:border-gray-700">
                                    <GuardrailsAPISelector
                                        agent={undefined}
                                        guardrailsApis={undefined}
                                        description="Select Content and Language Moderation API from a list of APIs"
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
                    <div className="col-span-1 sm:col-span-2 space-y-6">
                        <div className="col-span-1 sm:col-span-2">
                            {/* <p className="text-md mb-3">Harmful Content</p> */}
                            {/* <DynamicObjectBuilder fieldsDefinition={harmfulContentDefinition} /> */}
                            <DynamicObject length={languageModerationFields.length}>
                                <DynamicObjectBody onAdd={appendLanguageModeration} disabledAdd={isEdit && isReadOnly}>
                                    {languageModerationFields.map((item, index) => (
                                        <DynamicObjectField
                                            key={item.id}
                                            rowId={index}
                                            forceValidation={false}
                                            disabledClose={
                                                languageModerationFields?.length === 1 || (isEdit && isReadOnly)
                                            }
                                            removeRow={() => removeLanguageModeration(index)}
                                        >
                                            <div className="grid grid-cols-4 gap-x-3 w-full">
                                                <DynamicObjectItem
                                                    label="Category Name"
                                                    labelClassName="text-[8px]"
                                                    iconSize={8}
                                                >
                                                    <Controller
                                                        name={`configurations.contentAndLanguageModeration.languageModeration.${index}.categoryName`}
                                                        control={control}
                                                        rules={{
                                                            required: {
                                                                value: true,
                                                                message: 'Required',
                                                            },
                                                        }}
                                                        render={({ field, fieldState }) => (
                                                            <SelectV2
                                                                value={field.value}
                                                                disabled={isEdit && isReadOnly}
                                                                onValueChange={field.onChange}
                                                                onOpenChange={e =>
                                                                    !e &&
                                                                    trigger(
                                                                        `configurations.contentAndLanguageModeration.languageModeration.${index}.categoryName`
                                                                    )
                                                                }
                                                            >
                                                                <SelectTriggerV2
                                                                    className={cn('w-full dark:bg-gray-700', {
                                                                        'border-red-300 focus:border-red-300 focus-visible:ring-[#FEE4E2]':
                                                                            !!fieldState?.error?.message,
                                                                    })}
                                                                >
                                                                    <SelectValueV2 placeholder="Category Name" />
                                                                </SelectTriggerV2>
                                                                <SelectContentV2>
                                                                    <SelectGroupV2>
                                                                        <SelectLabelV2>Options</SelectLabelV2>
                                                                        {GUARDRAIL_CATEGORY_OPTION.map(
                                                                            (option) => (
                                                                                <SelectItemV2
                                                                                    key={option.value as string}
                                                                                    value={option.value as string}
                                                                                >
                                                                                    {option.name}
                                                                                </SelectItemV2>
                                                                            )
                                                                        )}
                                                                    </SelectGroupV2>
                                                                </SelectContentV2>
                                                            </SelectV2>
                                                        )}
                                                    />
                                                </DynamicObjectItem>
                                                <DynamicObjectItem
                                                    label="Score Threshold"
                                                    labelClassName="text-[8px]"
                                                    iconSize={8}
                                                >
                                                    <Controller
                                                        name={`configurations.contentAndLanguageModeration.languageModeration.${index}.scoreThreshold`}
                                                        control={control}
                                                        defaultValue={0}
                                                        render={({ field }) => (
                                                            <Slider
                                                                value={[field.value ?? 0]}
                                                                onValueChange={values => field.onChange(values[0])}
                                                                max={100}
                                                                step={1}
                                                                className="mt-3"
                                                            />
                                                        )}
                                                    />
                                                </DynamicObjectItem>
                                                <DynamicObjectItem
                                                    label="Prompt Action"
                                                    labelClassName="text-[8px]"
                                                    iconSize={8}
                                                >
                                                    <Controller
                                                        name={`configurations.contentAndLanguageModeration.languageModeration.${index}.promptAction`}
                                                        control={control}
                                                        rules={{
                                                            required: {
                                                                value: true,
                                                                message: 'Required',
                                                            },
                                                        }}
                                                        render={({ field, fieldState }) => (
                                                            <SelectV2
                                                                value={field.value}
                                                                disabled={isEdit && isReadOnly}
                                                                onValueChange={field.onChange}
                                                                onOpenChange={e =>
                                                                    !e &&
                                                                    trigger(
                                                                        `configurations.contentAndLanguageModeration.languageModeration.${index}.promptAction`
                                                                    )
                                                                }
                                                            >
                                                                <SelectTriggerV2
                                                                    className={cn('w-full dark:bg-gray-700', {
                                                                        'border-red-300 focus:border-red-300 focus-visible:ring-[#FEE4E2]':
                                                                            !!fieldState?.error?.message,
                                                                    })}
                                                                >
                                                                    <SelectValueV2 placeholder="Prompt Action" />
                                                                </SelectTriggerV2>
                                                                <SelectContentV2>
                                                                    <SelectGroupV2>
                                                                        <SelectLabelV2>Options</SelectLabelV2>
                                                                        {GUARDRAIL_ACTION_OPTION.map(
                                                                            (option) => (
                                                                                <SelectItemV2
                                                                                    key={option.value as string}
                                                                                    value={option.value as string}
                                                                                >
                                                                                    {option.name}
                                                                                </SelectItemV2>
                                                                            )
                                                                        )}
                                                                    </SelectGroupV2>
                                                                </SelectContentV2>
                                                            </SelectV2>
                                                        )}
                                                    />
                                                </DynamicObjectItem>
                                                <DynamicObjectItem
                                                    label="Response Action"
                                                    labelClassName="text-[8px]"
                                                    iconSize={8}
                                                >
                                                    <Controller
                                                        name={`configurations.contentAndLanguageModeration.languageModeration.${index}.responseAction`}
                                                        control={control}
                                                        rules={{
                                                            required: {
                                                                value: true,
                                                                message: 'Required',
                                                            },
                                                        }}
                                                        render={({ field, fieldState }) => (
                                                            <SelectV2
                                                                value={field.value}
                                                                disabled={isEdit && isReadOnly}
                                                                onValueChange={field.onChange}
                                                                onOpenChange={e =>
                                                                    !e &&
                                                                    trigger(
                                                                        `configurations.contentAndLanguageModeration.languageModeration.${index}.responseAction`
                                                                    )
                                                                }
                                                            >
                                                                <SelectTriggerV2
                                                                    className={cn('w-full dark:bg-gray-700', {
                                                                        'border-red-300 focus:border-red-300 focus-visible:ring-[#FEE4E2]':
                                                                            !!fieldState?.error?.message,
                                                                    })}
                                                                >
                                                                    <SelectValueV2 placeholder="Response Action" />
                                                                </SelectTriggerV2>
                                                                <SelectContentV2>
                                                                    <SelectGroupV2>
                                                                        <SelectLabelV2>Options</SelectLabelV2>
                                                                        {GUARDRAIL_ACTION_OPTION.map(
                                                                            (option) => (
                                                                                <SelectItemV2
                                                                                    key={option.value as string}
                                                                                    value={option.value as string}
                                                                                >
                                                                                    {option.name}
                                                                                </SelectItemV2>
                                                                            )
                                                                        )}
                                                                    </SelectGroupV2>
                                                                </SelectContentV2>
                                                            </SelectV2>
                                                        )}
                                                    />
                                                </DynamicObjectItem>
                                            </div>
                                        </DynamicObjectField>
                                    ))}
                                </DynamicObjectBody>
                            </DynamicObject>
                        </div>
                    </div>
                </>
            ) : (
                <div className="col-span-1 sm:col-span-2">
                    <div className="ml-[44px]">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Enable Content and Language Moderation to manage content and language
                        </p>
                    </div>
                </div>
            )}
        </FormFieldGroup>
    );
};
