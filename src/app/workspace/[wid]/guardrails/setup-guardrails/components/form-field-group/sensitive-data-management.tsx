/* eslint-disable @typescript-eslint/no-explicit-any */
import { Controller } from 'react-hook-form';
import {
    FormFieldGroup,
    Select,
    Textarea,
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
import { GUARDRAIL_DETECTION_MODE_OPTION, GUARDRAIL_MASKING_OPTION } from '@/constants';
import { GuardrailMaskingRuleType, GuardrailSensitiveDataManagementModeType, IntelligenceSourceType } from '@/enums';
import { GuardrailsModelSelector } from '@/app/editor/[wid]/[workflow_id]/components/guardrails-model-selector';
import { GuardrailsAPISelector } from '@/app/editor/[wid]/[workflow_id]/components/guardrails-api-selector';
import { LanguageSelector } from '@/app/editor/[wid]/[workflow_id]/components/language-selector';
import { useEffect, useState } from 'react';
import { IntelligenceSourceModel, Model } from '@/components/organisms/workflow-editor-form/agent-form';
import { cn, isNullOrEmpty } from '@/lib/utils';

export const SensitiveDataManagement = (props: GuardrailsFormProps) => {
    const {
        isEdit,
        errors,
        control,
        allModels,
        llmModelsLoading,
        sensitiveDataRuleFields,
        customSensitiveDataRuleFields,
        microsoftPresidioFields,
        isReadOnly,
        guardrailsModels,
        guardrailsModelsLoading,
        isValidSensitiveDataRule,
        protectionModeErrorMessage,
        register,
        watch,
        getValues,
        trigger,
        setValue,
        clearErrors,
        appendSensitiveDataRule,
        appendCustomSensitiveDataRule,
        removeSensitiveDataRule,
        removeCustomSensitiveDataRule,
        validateRegex,
        validateProtection,
        refetchLLM,
        refetchGuardrailModels,
    } = props;
    const [languageModel, setLanguageModel] = useState<IntelligenceSourceModel>();
    const [guardrailsModelConfigs, setGuardrailsModelConfigs] = useState<Model[]>();

    useEffect(() => {
        if (!isEdit) {
            if (guardrailsModelConfigs && guardrailsModelConfigs.length > 0) {
                setValue('configurations.sensitiveDataManagement.guardrailModelId', guardrailsModelConfigs[0].id);
            } else {
                setValue('configurations.sensitiveDataManagement.guardrailModelId', '');
            }
        }
    }, [isEdit, guardrailsModelConfigs]);

    useEffect(() => {
        if (isEdit && watch('configurations.sensitiveDataManagement.guardrailModelId')) {
            const guardrailModel = guardrailsModels?.find(
                x => x.id === getValues()?.configurations?.sensitiveDataManagement?.guardrailModelId
            );
            if (guardrailModel) {
                setGuardrailsModelConfigs([{ ...guardrailModel } as never]);
            }
        }
    }, [isEdit, guardrailsModels]);

    const setClassification = async (index: number, value: string) => {
        const result = microsoftPresidioFields?.find(x => x.value === value)?.meta;
        setValue(
            `configurations.sensitiveDataManagement.sensitiveDataRule.${index}.classification`,
            result ? (result as string) : ''
        );
        await trigger(`configurations.sensitiveDataManagement.sensitiveDataRule.${index}.classification`);
    };

    const manageGuardrailModel = (response: Model[] | undefined) => {
        if (response && response.length > 0) {
            setValue('configurations.sensitiveDataManagement.guardrailModelId', response[0].id);
        } else {
            setValue('configurations.sensitiveDataManagement.guardrailModelId', '');
        }
    };

    const maskingRuleValidation = (index: number, isCustomRule: boolean) => {
        const propertyName = `configurations.sensitiveDataManagement.${
            isCustomRule ? 'customSensitiveDataRule' : 'sensitiveDataRule'
        }.${index}`;
        const promptRule = watch(`${propertyName}.promptMaskingRule` as any);
        const responseRule = watch(`${propertyName}.responseMaskingRule` as any);
        if (responseRule === GuardrailMaskingRuleType.NO_MASKING && promptRule === responseRule) {
            return 'Both rules cannot be No Masking';
        }

        if (!isNullOrEmpty(promptRule) && !isNullOrEmpty(responseRule)) {
            clearErrors(`${propertyName}.promptMaskingRule` as any);
            clearErrors(`${propertyName}.responseMaskingRule` as any);
        }
        return true;
    };

    const hasCustomFieldName = (index: number) => {
        const fieldName = watch(`configurations.sensitiveDataManagement.customSensitiveDataRule.${index}.fieldName`);
        return isNullOrEmpty(fieldName);
    };

    const onFieldNameBlur = (index: number) => {
        if (hasCustomFieldName(index)) {
            setValue(`configurations.sensitiveDataManagement.customSensitiveDataRule.${index}.regex`, '');
            setValue(
                `configurations.sensitiveDataManagement.customSensitiveDataRule.${index}.promptMaskingRule`,
                GuardrailMaskingRuleType.EMPTY
            );
            setValue(
                `configurations.sensitiveDataManagement.customSensitiveDataRule.${index}.responseMaskingRule`,
                GuardrailMaskingRuleType.EMPTY
            );
        }
        clearErrors(`configurations.sensitiveDataManagement.customSensitiveDataRule.${index}.regex`);
        clearErrors(`configurations.sensitiveDataManagement.customSensitiveDataRule.${index}.promptMaskingRule`);
        clearErrors(`configurations.sensitiveDataManagement.customSensitiveDataRule.${index}.responseMaskingRule`);
    };

    return (
        <FormFieldGroup
            switchControl={
                <Controller
                    name="configurations.enableSensitiveDataManagement"
                    control={control}
                    rules={{ validate: validateProtection }}
                    render={({ field }) => (
                        <Switch
                            disabled={isEdit && isReadOnly}
                            checked={field.value}
                            onCheckedChange={field.onChange}
                        />
                    )}
                />
            }
            showSeparator={false}
            title="PII & Sensitive Data Management"
            isDestructive={Boolean(protectionModeErrorMessage)}
        >
            {watch('configurations.enableSensitiveDataManagement') ? (
                <>
                    <div className="col-span-1 sm:col-span-2">
                        <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                            <Select
                                {...register('configurations.sensitiveDataManagement.mode', {
                                    required: { value: true, message: 'Please select a detection mode' },
                                })}
                                label="PII & Sensitive Data Management Detection Mode"
                                placeholder="Select a Detection Mode"
                                disabled={isEdit && isReadOnly}
                                options={GUARDRAIL_DETECTION_MODE_OPTION}
                                currentValue={watch('configurations.sensitiveDataManagement.mode') || ''}
                                isDestructive={Boolean(errors?.configurations?.sensitiveDataManagement?.mode?.message)}
                                supportiveText={errors?.configurations?.sensitiveDataManagement?.mode?.message}
                            />
                            {watch('configurations.sensitiveDataManagement.mode') ===
                                GuardrailSensitiveDataManagementModeType.USE_A_MODEL && (
                                <div>
                                    <Controller
                                        name="configurations.sensitiveDataManagement.guardrailModelId"
                                        control={control}
                                        rules={{
                                            required: { value: true, message: 'Please select a model' },
                                        }}
                                        render={() => (
                                            <div
                                                className={`mt-2 border-2 border-solid rounded-lg p-2 sm:p-4 ${
                                                    errors?.configurations?.sensitiveDataManagement?.guardrailModelId
                                                        ?.message
                                                        ? 'border-red-300'
                                                        : 'border-gray-300 dark:border-gray-700'
                                                }`}
                                            >
                                                <GuardrailsModelSelector
                                                    agent={undefined}
                                                    guardrailsModels={guardrailsModelConfigs}
                                                    label="Model"
                                                    description="Select PII & Sensitive Data Management model from a list of models"
                                                    labelClassName="text-sm font-medium dark:text-gray-100 text-gray-700"
                                                    setGuardrailsModels={setGuardrailsModelConfigs}
                                                    allGuardrailsModels={guardrailsModels}
                                                    isReadOnly={isEdit && isReadOnly}
                                                    modelLoading={guardrailsModelsLoading}
                                                    onModalChange={async open =>
                                                        !open &&
                                                        (await trigger(
                                                            'configurations.sensitiveDataManagement.guardrailModelId'
                                                        ))
                                                    }
                                                    onRefetch={refetchGuardrailModels}
                                                    onGuardrailsModelChange={manageGuardrailModel}
                                                />
                                            </div>
                                        )}
                                    />
                                    {errors?.configurations?.sensitiveDataManagement?.guardrailModelId?.message && (
                                        <p className="text-xs font-normal text-red-500 dark:text-red-500 mt-2">
                                            {errors?.configurations?.sensitiveDataManagement?.guardrailModelId?.message}
                                        </p>
                                    )}
                                </div>
                            )}

                            {watch('configurations.sensitiveDataManagement.mode') ===
                                GuardrailSensitiveDataManagementModeType.USE_AN_API && (
                                <div className="border-2 border-solid rounded-lg p-2 sm:p-4 border-gray-300 dark:border-gray-700">
                                    <GuardrailsAPISelector
                                        agent={undefined}
                                        guardrailsApis={undefined}
                                        description="Select PII & Sensitive Data Management API from a list of APIs"
                                        labelClassName="text-sm font-medium dark:text-gray-100 text-gray-700"
                                        setGuardrailsApis={() => {}}
                                        allGuardrailsApiTools={[]}
                                        isReadonly={true}
                                        apiLoading={false}
                                        onRefetch={() => {}}
                                    />
                                </div>
                            )}
                            {watch('configurations.sensitiveDataManagement.mode') ===
                                GuardrailSensitiveDataManagementModeType.USE_A_LLM && (
                                <>
                                    <div className="border-2 border-solid rounded-lg p-2 sm:p-4 border-gray-300 dark:border-gray-700">
                                        <LanguageSelector
                                            isSlm={false}
                                            agent={undefined}
                                            languageModel={languageModel}
                                            setLanguageModel={setLanguageModel}
                                            label="LLM"
                                            description="Select PII & Sensitive Data Management LLM from a list of LLMs"
                                            labelClassName="text-sm font-medium dark:text-gray-100 text-gray-700"
                                            allModels={allModels as never[]}
                                            allSLMModels={[]}
                                            allSTSModels={[]}
                                            isReadonly={true}
                                            llmModelsLoading={llmModelsLoading}
                                            slmModelsLoading={false}
                                            onRefetch={() => {
                                                refetchLLM();
                                            }}
                                            onIntelligenceSourceChange={() => {}}
                                            onLanguageModelChange={() => {}}
                                            visibleSourceTypes={[IntelligenceSourceType.LLM]}
                                        />
                                    </div>
                                    <Textarea
                                        {...register('configurations.sensitiveDataManagement.prompt', {
                                            required: {
                                                value: true,
                                                message: 'Please select a prompt',
                                            },
                                        })}
                                        label="Configure a prompt"
                                        placeholder="Configure your prompt"
                                        readOnly={isEdit && isReadOnly}
                                        isDestructive={Boolean(
                                            errors?.configurations?.sensitiveDataManagement?.prompt?.message
                                        )}
                                        supportiveText={
                                            errors?.configurations?.sensitiveDataManagement?.prompt?.message
                                        }
                                    />
                                </>
                            )}
                        </div>
                    </div>

                    <hr className="col-span-1 sm:col-span-2 my-2 border-b dark:border-gray-700" />

                    <div className="col-span-1 sm:col-span-2">
                        <p className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-[6px]">
                            Sensitive Data Rules
                        </p>
                        <DynamicObject length={sensitiveDataRuleFields.length}>
                            <DynamicObjectBody
                                onAdd={appendSensitiveDataRule}
                                disabledAdd={!isValidSensitiveDataRule || (isEdit && isReadOnly)}
                            >
                                {sensitiveDataRuleFields.map((item, index) => (
                                    <DynamicObjectField
                                        key={item.id}
                                        rowId={index}
                                        forceValidation={false}
                                        disabledClose={sensitiveDataRuleFields?.length === 1 || (isEdit && isReadOnly)}
                                        removeRow={() => removeSensitiveDataRule(index)}
                                    >
                                        <div className="grid grid-cols-4 gap-x-3 w-full">
                                            <DynamicObjectItem
                                                label="Field name"
                                                labelClassName="text-[10px]"
                                                iconSize={8}
                                                {...(!!errors?.configurations?.sensitiveDataManagement
                                                    ?.sensitiveDataRule?.[index]?.fieldName?.message && {
                                                    helperInfo:
                                                        errors?.configurations?.sensitiveDataManagement
                                                            ?.sensitiveDataRule?.[index]?.fieldName?.message,
                                                    iconClassName: 'text-red-500',
                                                    labelClassName: 'text-[8px] !text-red-500',
                                                })}
                                            >
                                                <Controller
                                                    name={`configurations.sensitiveDataManagement.sensitiveDataRule.${index}.fieldName`}
                                                    control={control}
                                                    rules={{
                                                        required: {
                                                            value: true,
                                                            message: 'Please select field name',
                                                        },
                                                    }}
                                                    render={({ field, fieldState }) => (
                                                        <SelectV2
                                                            value={field.value}
                                                            disabled={isEdit && isReadOnly}
                                                            onValueChange={e => {
                                                                field.onChange(e);
                                                                setClassification(index, e);
                                                            }}
                                                            onOpenChange={e =>
                                                                !e &&
                                                                trigger(
                                                                    `configurations.sensitiveDataManagement.sensitiveDataRule.${index}.fieldName`
                                                                )
                                                            }
                                                        >
                                                            <SelectTriggerV2
                                                                className={cn('w-full dark:bg-gray-700', {
                                                                    'border-red-300 focus:border-red-300 focus-visible:ring-[#FEE4E2]':
                                                                        !!fieldState?.error?.message,
                                                                })}
                                                            >
                                                                <SelectValueV2 placeholder="Field name" />
                                                            </SelectTriggerV2>
                                                            <SelectContentV2>
                                                                <SelectGroupV2>
                                                                    <SelectLabelV2>Options</SelectLabelV2>
                                                                    {microsoftPresidioFields.map(option => (
                                                                        <SelectItemV2
                                                                            key={option.value as string}
                                                                            value={option.value as string}
                                                                            disabled={option.disabled}
                                                                        >
                                                                            {option.name}
                                                                        </SelectItemV2>
                                                                    ))}
                                                                </SelectGroupV2>
                                                            </SelectContentV2>
                                                        </SelectV2>
                                                    )}
                                                />
                                            </DynamicObjectItem>
                                            <DynamicObjectItem
                                                label="Classification"
                                                labelClassName="text-[10px]"
                                                iconSize={8}
                                                {...(!!errors?.configurations?.sensitiveDataManagement
                                                    ?.sensitiveDataRule?.[index]?.classification?.message && {
                                                    helperInfo:
                                                        errors?.configurations?.sensitiveDataManagement
                                                            ?.sensitiveDataRule?.[index]?.classification?.message,
                                                    iconClassName: 'text-red-500',
                                                    labelClassName: 'text-[8px] !text-red-500',
                                                })}
                                            >
                                                <input
                                                    {...register(
                                                        `configurations.sensitiveDataManagement.sensitiveDataRule.${index}.classification`,
                                                        {
                                                            required: {
                                                                value: true,
                                                                message: 'Classification cannot be empty',
                                                            },
                                                        }
                                                    )}
                                                    readOnly={true}
                                                    placeholder="Classification"
                                                    className={cn(
                                                        'min-h-7 dark:bg-gray-700 border border-input px-3 py-1 rounded text-xs font-normal dark:text-gray-50 text-gray-900 placeholder:text-gray-400 outline-0',
                                                        {
                                                            '!border-red-300 !focus:border-red-300 !focus-visible:ring-[#FEE4E2]':
                                                                !!errors?.configurations?.sensitiveDataManagement
                                                                    ?.sensitiveDataRule?.[index]?.classification
                                                                    ?.message,
                                                        }
                                                    )}
                                                />
                                            </DynamicObjectItem>
                                            <DynamicObjectItem
                                                label="Masking Rule (Prompt)"
                                                labelClassName="text-[10px]"
                                                iconSize={8}
                                                {...(!!errors?.configurations?.sensitiveDataManagement
                                                    ?.sensitiveDataRule?.[index]?.promptMaskingRule?.message && {
                                                    helperInfo:
                                                        errors?.configurations?.sensitiveDataManagement
                                                            ?.sensitiveDataRule?.[index]?.promptMaskingRule?.message,
                                                    iconClassName: 'text-red-500',
                                                    labelClassName: 'text-[8px] !text-red-500',
                                                })}
                                            >
                                                <Controller
                                                    name={`configurations.sensitiveDataManagement.sensitiveDataRule.${index}.promptMaskingRule`}
                                                    control={control}
                                                    rules={{
                                                        required: {
                                                            value: true,
                                                            message: 'Please select masking rule (Prompt)',
                                                        },
                                                        validate: () => maskingRuleValidation(index, false),
                                                    }}
                                                    render={({ field, fieldState }) => (
                                                        <SelectV2
                                                            value={field.value}
                                                            disabled={isEdit && isReadOnly}
                                                            onValueChange={field.onChange}
                                                            onOpenChange={e =>
                                                                !e &&
                                                                trigger(
                                                                    `configurations.sensitiveDataManagement.sensitiveDataRule.${index}.promptMaskingRule`
                                                                )
                                                            }
                                                        >
                                                            <SelectTriggerV2
                                                                className={cn('w-full dark:bg-gray-700', {
                                                                    'border-red-300 focus:border-red-300 focus-visible:ring-[#FEE4E2]':
                                                                        !!fieldState?.error?.message,
                                                                })}
                                                            >
                                                                <SelectValueV2 placeholder="Masking Rule (Prompt)" />
                                                            </SelectTriggerV2>
                                                            <SelectContentV2>
                                                                <SelectGroupV2>
                                                                    <SelectLabelV2>Options</SelectLabelV2>
                                                                    {GUARDRAIL_MASKING_OPTION.map(option => (
                                                                        <SelectItemV2
                                                                            key={option.value as string}
                                                                            value={option.value as string}
                                                                        >
                                                                            {option.name}
                                                                        </SelectItemV2>
                                                                    ))}
                                                                </SelectGroupV2>
                                                            </SelectContentV2>
                                                        </SelectV2>
                                                    )}
                                                />
                                            </DynamicObjectItem>
                                            <DynamicObjectItem
                                                label="Masking Rule (Response)"
                                                labelClassName="text-[10px]"
                                                iconSize={8}
                                                {...(!!errors?.configurations?.sensitiveDataManagement
                                                    ?.sensitiveDataRule?.[index]?.responseMaskingRule?.message && {
                                                    helperInfo:
                                                        errors?.configurations?.sensitiveDataManagement
                                                            ?.sensitiveDataRule?.[index]?.responseMaskingRule?.message,
                                                    iconClassName: 'text-red-500',
                                                    labelClassName: 'text-[8px] !text-red-500',
                                                })}
                                            >
                                                <Controller
                                                    name={`configurations.sensitiveDataManagement.sensitiveDataRule.${index}.responseMaskingRule`}
                                                    control={control}
                                                    rules={{
                                                        required: {
                                                            value: true,
                                                            message: 'Please select masking rule (Response)',
                                                        },
                                                        validate: () => maskingRuleValidation(index, false),
                                                    }}
                                                    render={({ field, fieldState }) => (
                                                        <SelectV2
                                                            value={field.value}
                                                            disabled={isEdit && isReadOnly}
                                                            onValueChange={field.onChange}
                                                            onOpenChange={e =>
                                                                !e &&
                                                                trigger(
                                                                    `configurations.sensitiveDataManagement.sensitiveDataRule.${index}.responseMaskingRule`
                                                                )
                                                            }
                                                        >
                                                            <SelectTriggerV2
                                                                className={cn('w-full dark:bg-gray-700', {
                                                                    'border-red-300 focus:border-red-300 focus-visible:ring-[#FEE4E2]':
                                                                        !!fieldState?.error?.message,
                                                                })}
                                                            >
                                                                <SelectValueV2 placeholder="Masking Rule (Response)" />
                                                            </SelectTriggerV2>
                                                            <SelectContentV2>
                                                                <SelectGroupV2>
                                                                    <SelectLabelV2>Options</SelectLabelV2>
                                                                    {GUARDRAIL_MASKING_OPTION.map(option => (
                                                                        <SelectItemV2
                                                                            key={option.value as string}
                                                                            value={option.value as string}
                                                                        >
                                                                            {option.name}
                                                                        </SelectItemV2>
                                                                    ))}
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
                        {errors?.configurations?.sensitiveDataManagement?.validateSensitiveDataRule?.message && (
                            <p className="text-xs font-normal text-red-500 dark:text-red-500 mt-2">
                                {errors?.configurations?.sensitiveDataManagement?.validateSensitiveDataRule?.message}
                            </p>
                        )}
                    </div>

                    <hr className="col-span-1 sm:col-span-2 my-2 border-b dark:border-gray-700" />

                    <div className="col-span-1 sm:col-span-2">
                        <p className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-[6px]">
                            Custom Sensitive Data Rules
                        </p>
                        <DynamicObject length={customSensitiveDataRuleFields.length}>
                            <DynamicObjectBody onAdd={appendCustomSensitiveDataRule} disabledAdd={true}>
                                {customSensitiveDataRuleFields.map((item, index) => (
                                    <DynamicObjectField
                                        key={item.id}
                                        rowId={index}
                                        forceValidation={false}
                                        disabledClose={true}
                                        removeRow={() => removeCustomSensitiveDataRule(index)}
                                    >
                                        <div className="grid grid-cols-4 gap-x-3 w-full">
                                            <DynamicObjectItem
                                                label="Field name"
                                                labelClassName="text-[10px]"
                                                iconSize={8}
                                                {...(!!errors?.configurations?.sensitiveDataManagement
                                                    ?.customSensitiveDataRule?.[index]?.fieldName?.message && {
                                                    helperInfo:
                                                        errors?.configurations?.sensitiveDataManagement
                                                            ?.customSensitiveDataRule?.[index]?.fieldName?.message,
                                                    iconClassName: 'text-red-500',
                                                    labelClassName: 'text-[8px] !text-red-500',
                                                })}
                                            >
                                                <input
                                                    {...register(
                                                        `configurations.sensitiveDataManagement.customSensitiveDataRule.${index}.fieldName`
                                                    )}
                                                    disabled={true}
                                                    placeholder="Field name"
                                                    className={cn(
                                                        'min-h-7 dark:bg-gray-700 border border-input px-3 py-1 rounded text-xs font-normal dark:text-gray-50 text-gray-900 placeholder:text-gray-400 outline-0',
                                                        {
                                                            '!border-red-300 !focus:border-red-300 !focus-visible:ring-[#FEE4E2]':
                                                                !!errors?.configurations?.sensitiveDataManagement
                                                                    ?.customSensitiveDataRule?.[index]?.fieldName
                                                                    ?.message,
                                                        }
                                                    )}
                                                    onBlur={() => onFieldNameBlur(index)}
                                                />
                                            </DynamicObjectItem>
                                            <DynamicObjectItem
                                                label="Regex"
                                                labelClassName="text-[10px]"
                                                iconSize={8}
                                                {...(!!errors?.configurations?.sensitiveDataManagement
                                                    ?.customSensitiveDataRule?.[index]?.regex?.message && {
                                                    helperInfo:
                                                        errors?.configurations?.sensitiveDataManagement
                                                            ?.customSensitiveDataRule?.[index]?.regex?.message,
                                                    iconClassName: 'text-red-500',
                                                    labelClassName: 'text-[8px] !text-red-500',
                                                })}
                                            >
                                                <input
                                                    {...register(
                                                        `configurations.sensitiveDataManagement.customSensitiveDataRule.${index}.regex`,
                                                        {
                                                            required: {
                                                                value: !!watch(
                                                                    `configurations.sensitiveDataManagement.customSensitiveDataRule.${index}.fieldName`
                                                                ),
                                                                message: 'Please enter a regex',
                                                            },
                                                            validate: value => validateRegex(value ?? ''),
                                                        }
                                                    )}
                                                    disabled={true}
                                                    placeholder="Regex"
                                                    className={cn(
                                                        'min-h-7 dark:bg-gray-700 border border-input px-3 py-1 rounded text-xs font-normal dark:text-gray-50 text-gray-900 placeholder:text-gray-400 outline-0',
                                                        {
                                                            '!border-red-300 !focus:border-red-300 !focus-visible:ring-[#FEE4E2]':
                                                                !!errors?.configurations?.sensitiveDataManagement
                                                                    ?.customSensitiveDataRule?.[index]?.regex?.message,
                                                        }
                                                    )}
                                                />
                                            </DynamicObjectItem>
                                            <DynamicObjectItem
                                                label="Masking Rule (Prompt)"
                                                labelClassName="text-[10px]"
                                                iconSize={8}
                                                {...(!!errors?.configurations?.sensitiveDataManagement
                                                    ?.customSensitiveDataRule?.[index]?.promptMaskingRule?.message && {
                                                    helperInfo:
                                                        errors?.configurations?.sensitiveDataManagement
                                                            ?.customSensitiveDataRule?.[index]?.promptMaskingRule
                                                            ?.message,
                                                    iconClassName: 'text-red-500',
                                                    labelClassName: 'text-[8px] !text-red-500',
                                                })}
                                            >
                                                <Controller
                                                    name={`configurations.sensitiveDataManagement.customSensitiveDataRule.${index}.promptMaskingRule`}
                                                    control={control}
                                                    rules={{
                                                        required: {
                                                            value: !!watch(
                                                                `configurations.sensitiveDataManagement.customSensitiveDataRule.${index}.fieldName`
                                                            ),
                                                            message: 'Please select masking rule (Prompt)',
                                                        },
                                                        validate: () => maskingRuleValidation(index, true),
                                                    }}
                                                    render={({ field, fieldState }) => (
                                                        <SelectV2
                                                            value={field.value}
                                                            disabled={true}
                                                            onValueChange={field.onChange}
                                                            onOpenChange={e =>
                                                                !e &&
                                                                trigger(
                                                                    `configurations.sensitiveDataManagement.customSensitiveDataRule.${index}.promptMaskingRule`
                                                                )
                                                            }
                                                        >
                                                            <SelectTriggerV2
                                                                className={cn('w-full dark:bg-gray-700', {
                                                                    'border-red-300 focus:border-red-300 focus-visible:ring-[#FEE4E2]':
                                                                        !!fieldState?.error?.message,
                                                                })}
                                                            >
                                                                <SelectValueV2 placeholder="Masking Rule (Prompt)" />
                                                            </SelectTriggerV2>
                                                            <SelectContentV2>
                                                                <SelectGroupV2>
                                                                    <SelectLabelV2>Options</SelectLabelV2>
                                                                    {GUARDRAIL_MASKING_OPTION.map(option => (
                                                                        <SelectItemV2
                                                                            key={option.value as string}
                                                                            value={option.value as string}
                                                                        >
                                                                            {option.name}
                                                                        </SelectItemV2>
                                                                    ))}
                                                                </SelectGroupV2>
                                                            </SelectContentV2>
                                                        </SelectV2>
                                                    )}
                                                />
                                            </DynamicObjectItem>
                                            <DynamicObjectItem
                                                label="Masking Rule (Response)"
                                                labelClassName="text-[10px]"
                                                iconSize={8}
                                                {...(!!errors?.configurations?.sensitiveDataManagement
                                                    ?.customSensitiveDataRule?.[index]?.responseMaskingRule
                                                    ?.message && {
                                                    helperInfo:
                                                        errors?.configurations?.sensitiveDataManagement
                                                            ?.customSensitiveDataRule?.[index]?.responseMaskingRule
                                                            ?.message,
                                                    iconClassName: 'text-red-500',
                                                    labelClassName: 'text-[8px] !text-red-500',
                                                })}
                                            >
                                                <Controller
                                                    name={`configurations.sensitiveDataManagement.customSensitiveDataRule.${index}.responseMaskingRule`}
                                                    control={control}
                                                    rules={{
                                                        required: {
                                                            value: !!watch(
                                                                `configurations.sensitiveDataManagement.customSensitiveDataRule.${index}.fieldName`
                                                            ),
                                                            message: 'Please select masking rule (Response)',
                                                        },
                                                        validate: () => maskingRuleValidation(index, true),
                                                    }}
                                                    render={({ field, fieldState }) => (
                                                        <SelectV2
                                                            value={field.value}
                                                            disabled={true}
                                                            onValueChange={field.onChange}
                                                            onOpenChange={e =>
                                                                !e &&
                                                                trigger(
                                                                    `configurations.sensitiveDataManagement.customSensitiveDataRule.${index}.responseMaskingRule`
                                                                )
                                                            }
                                                        >
                                                            <SelectTriggerV2
                                                                className={cn('w-full dark:bg-gray-700', {
                                                                    'border-red-300 focus:border-red-300 focus-visible:ring-[#FEE4E2]':
                                                                        !!fieldState?.error?.message,
                                                                })}
                                                            >
                                                                <SelectValueV2 placeholder="Masking Rule (Response)" />
                                                            </SelectTriggerV2>
                                                            <SelectContentV2>
                                                                <SelectGroupV2>
                                                                    <SelectLabelV2>Options</SelectLabelV2>
                                                                    {GUARDRAIL_MASKING_OPTION.map(option => (
                                                                        <SelectItemV2
                                                                            key={option.value as string}
                                                                            value={option.value as string}
                                                                        >
                                                                            {option.name}
                                                                        </SelectItemV2>
                                                                    ))}
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
                        {errors?.configurations?.sensitiveDataManagement?.validateCustomSensitiveDataRule?.message && (
                            <p className="text-xs font-normal text-red-500 dark:text-red-500 mt-2">
                                {
                                    errors?.configurations?.sensitiveDataManagement?.validateCustomSensitiveDataRule
                                        ?.message
                                }
                            </p>
                        )}
                    </div>
                </>
            ) : (
                <div className="col-span-1 sm:col-span-2">
                    <div className="ml-[44px]">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Enable PII & Sensitive Data Management to manage and add data management rules
                        </p>
                    </div>
                </div>
            )}
        </FormFieldGroup>
    );
};
