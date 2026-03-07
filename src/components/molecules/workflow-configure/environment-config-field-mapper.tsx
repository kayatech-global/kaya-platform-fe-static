/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Button,
    Input,
    MultiSelect,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/atoms';
import {
    FIELD_TYPE_AUTHENTICATION_TYPE_GUARDRAILS,
    FIELD_TYPE_AUTHENTICATION_TYPE_MESSAGE_BROKER,
    FIELD_TYPE_HOST,
    FIELD_TYPE_PORT,
    FIELD_TYPE_REGION,
    FIELD_TYPE_SECRETS,
    FIELD_TYPES_TEXT,
    FIELD_TYPES_URL,
    REGION_LIST,
} from '@/constants';
import { AuthenticationType, WorkflowPullReferenceType } from '@/enums';
import { cn, isNullOrEmpty, sanitizeNumericInput, validateSpaces, validateUrlRegEx } from '@/lib/utils';
import { WorkflowEnvConfigFormBase } from '@/models/workflow-pull.model';
import { RotateCcw } from 'lucide-react';
import React, { useCallback, useMemo } from 'react';
import { Control, Controller, FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { toast } from 'sonner';

interface IFieldMapper {
    configIndex: number;
    fieldIndex: number;
    value: string;
    control: Control<WorkflowEnvConfigFormBase, any>;
    watch: UseFormWatch<WorkflowEnvConfigFormBase>;
    register: UseFormRegister<WorkflowEnvConfigFormBase>;
    setValue: UseFormSetValue<WorkflowEnvConfigFormBase>;
    errors: FieldErrors<WorkflowEnvConfigFormBase>;
    defaultPlaceholder?: string;
    defaultPropertyName?: string;
}

export const EnvironmentConfigFieldMapper = ({
    value,
    watch,
    register,
    setValue,
    control,
    fieldIndex,
    configIndex,
    errors,
    defaultPlaceholder,
    defaultPropertyName,
}: IFieldMapper) => {
    const fieldName = watch(`configs.${configIndex}.fields.${fieldIndex}.name`);
    const fieldType = watch(`configs.${configIndex}.type`);
    const fieldReference = watch(`configs.${configIndex}.reference`);
    const originalValue = watch(`configs.${configIndex}.fields.${fieldIndex}.meta.originalValue`);

    // This is to handle the case when the field is a knowledge graph related
    const paths = watch(`configs.${configIndex}.fields.${fieldIndex}.meta.paths`);
    const isKnowledgeGraph = paths?.some((path: string) => path.includes('knowledgeGraphs'));

    const fieldError = errors?.configs?.[configIndex]?.fields?.[fieldIndex]?.meta?.finalValue?.message;
    const propertyName = defaultPropertyName || 'final value';

    const isRequired = useMemo(() => {
        if (FIELD_TYPES_URL.includes(fieldName)) {
            return !(
                fieldType === 'intelligenceSource' ||
                (fieldType === 'languageModal' && fieldReference === WorkflowPullReferenceType.LLM) ||
                fieldType === 'reRankingModel' ||
                fieldType === 'embeddingModel' ||
                fieldType === 'intelligentSource'
            );
        }

        if (FIELD_TYPE_SECRETS.includes(fieldName)) {
            if (fieldType === 'database' && fieldName === 'accessKey') {
                return true;
            } else if (
                fieldType === 'languageModal' &&
                ['accessKey', 'accessKeyId', 'secretKey'].includes(fieldName) &&
                (fieldReference === WorkflowPullReferenceType.SLM || fieldReference === WorkflowPullReferenceType.LLM)
            ) {
                return true;
            } else {
                return !(
                    (fieldType === 'languageModal' && fieldReference === WorkflowPullReferenceType.SLM) ||
                    (fieldType === 'executableFunctions' && fieldName === 'lambdaExecutionRoleArn')
                );
            }
        }

        if (FIELD_TYPES_TEXT.includes(fieldName)) {
            if (fieldType === 'database' && fieldName === 'userName') {
                return true;
            } else {
                return fieldType !== 'executableFunctions';
            }
        }

        if (FIELD_TYPE_REGION.includes(fieldName)) {
            return true;
        }

        if (FIELD_TYPE_HOST.includes(fieldName)) {
            return true;
        }

        if (FIELD_TYPE_PORT.includes(fieldName)) {
            return true;
        }

        if (FIELD_TYPE_AUTHENTICATION_TYPE_MESSAGE_BROKER.includes(fieldName) && fieldType === 'broker') {
            return true;
        }

        if (FIELD_TYPE_AUTHENTICATION_TYPE_GUARDRAILS.includes(fieldName) && fieldType === 'guardrails') {
            return true;
        }

        if (fieldName?.startsWith('header--')) {
            return !(
                (fieldType === 'languageModal' && fieldReference === WorkflowPullReferenceType.SLM) ||
                (fieldType === 'executableFunctions' && fieldName === 'lambdaExecutionRoleArn')
            );
        }

        return false;
    }, [fieldType, fieldReference, fieldName]);

    const validate = (value: any) => {
        const result = validateSpaces(value, propertyName);

        if (result !== true) {
            return result;
        }

        const variablePattern = /^\$\{[A-Z0-9]+(?:_[A-Z0-9]+)*\}$/;

        if (value?.startsWith('${') && value?.endsWith('}')) {
            if (!variablePattern.test(value)) {
                return 'Invalid variable format';
            }
            return true;
        }

        if (FIELD_TYPES_URL.includes(fieldName) && !isKnowledgeGraph) {
            return validateUrlRegEx(value, propertyName);
        }

        if (FIELD_TYPE_HOST.includes(fieldName)) {
            const hostPattern = /^(?:(?:(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})|(?:\d{1,3}(?:\.\d{1,3}){3})|localhost)$/;

            if (!hostPattern.test(value)) {
                return 'Invalid host or IP address';
            }
        }

        if (FIELD_TYPE_PORT.includes(fieldName)) {
            const port = Number(value);
            if (Number.isNaN(port)) {
                return 'Invalid port number';
            }
            if (port < 1) {
                return 'Port must be at least 1';
            }
            if (port > 65535) {
                return 'Port cannot exceed 65535';
            }
        }

        if (
            (FIELD_TYPE_REGION.includes(fieldName) ||
                (FIELD_TYPE_AUTHENTICATION_TYPE_MESSAGE_BROKER.includes(fieldName) && fieldType === 'broker') ||
                (FIELD_TYPE_AUTHENTICATION_TYPE_GUARDRAILS.includes(fieldName) && fieldType === 'guardrails')) &&
            !variablePattern.test(value)
        ) {
            return 'Invalid variable format';
        }

        return true;
    };

    const isSelect = useMemo(() => {
        if (
            FIELD_TYPE_REGION.includes(fieldName) ||
            (FIELD_TYPE_AUTHENTICATION_TYPE_MESSAGE_BROKER.includes(fieldName) && fieldType === 'broker') ||
            (FIELD_TYPE_AUTHENTICATION_TYPE_GUARDRAILS.includes(fieldName) && fieldType === 'guardrails')
        ) {
            return true;
        }
        return false;
    }, [fieldName, fieldType]);

    const options = useMemo(() => {
        const value = originalValue;

        if (FIELD_TYPE_REGION.includes(fieldName)) {
            return [value as string, ...REGION_LIST]?.map(region => ({
                label: region,
                value: region,
            }));
        } else if (FIELD_TYPE_AUTHENTICATION_TYPE_MESSAGE_BROKER.includes(fieldName) && fieldType === 'broker') {
            return [
                { label: value as string, value: value as string },
                {
                    label: 'No Authentication',
                    value: AuthenticationType.NoAuthentication,
                    disabled: true,
                },
                { label: 'Basic Auth', value: AuthenticationType.BasicAuth, disabled: true },
                { label: 'SASL/SCRAM', value: AuthenticationType.SASLORSCRAM, disabled: true },
                { label: 'Bearer Token', value: AuthenticationType.BearerToken, disabled: true },
                { label: 'TLS', value: AuthenticationType.TLS },
            ];
        } else if (FIELD_TYPE_AUTHENTICATION_TYPE_GUARDRAILS.includes(fieldName) && fieldType === 'guardrails') {
            return [
                { label: value as string, value: value as string },
                { label: 'Bearer Token', value: AuthenticationType.BearerToken },
            ];
        }

        return [];
    }, [fieldName, fieldType, originalValue]);

    const onCreate = useCallback(
        (value: string) => {
            if (isNullOrEmpty(value)) {
                toast.error('Cannot create a empty value. Please enter a valid variable name to continue');
            } else {
                const result = options?.find(x => x.value?.toLowerCase() === value?.toLowerCase()?.trim());
                const finalValue = result?.value ?? value?.trim();
                setValue(
                    `configs.${configIndex}.fields.${fieldIndex}.meta.finalValueOption`,
                    { label: result?.label ?? finalValue, value: finalValue },
                    { shouldValidate: true }
                );
                setValue(`configs.${configIndex}.fields.${fieldIndex}.meta.finalValue`, finalValue ?? '');
            }
        },
        [configIndex, fieldIndex, options, setValue]
    );

    const reset = useCallback(
        (isSelectedValue?: boolean) => {
            if (isSelectedValue) {
                setValue(
                    `configs.${configIndex}.fields.${fieldIndex}.meta.finalValueOption`,
                    { label: originalValue as string, value: originalValue as string },
                    { shouldValidate: true }
                );
                setValue(`configs.${configIndex}.fields.${fieldIndex}.meta.finalValue`, originalValue ?? '', {
                    shouldValidate: true,
                });
            } else {
                setValue(`configs.${configIndex}.fields.${fieldIndex}.meta.finalValue`, originalValue ?? '', {
                    shouldValidate: true,
                });
            }
        },
        [configIndex, fieldIndex, originalValue, setValue]
    );

    return (
        <div className="w-full flex flex-row">
            {isSelect ? (
                <Controller
                    name={`configs.${configIndex}.fields.${fieldIndex}.meta.finalValueOption`}
                    control={control}
                    rules={{
                        required: { value: true, message: `Please select or enter ${propertyName}` },
                        validate: option => validate(option?.value ?? ''),
                    }}
                    render={({ field, fieldState }) => {
                        return (
                            <>
                                <div className="w-full">
                                    <MultiSelect
                                        {...field}
                                        options={options}
                                        value={
                                            watch(
                                                `configs.${configIndex}.fields.${fieldIndex}.meta.finalValueOption`
                                            ) || null
                                        }
                                        menuPortalTarget={document.body}
                                        isClearable
                                        placeholder={`Select or Enter ${propertyName}`}
                                        onChange={(selectedOptions: any) => {
                                            field.onChange(selectedOptions);
                                            setValue(
                                                `configs.${configIndex}.fields.${fieldIndex}.meta.finalValue`,
                                                selectedOptions?.value ?? ''
                                            );
                                        }}
                                        mainClass="!rounded-tr-none !rounded-br-none"
                                        menuClass="!z-50"
                                        menuPortalClass="!z-50 pointer-events-auto"
                                        isDisabled={watch(`configs.${configIndex}.fields.${fieldIndex}.readOnly`)}
                                        defaultInputValue={watch(
                                            `configs.${configIndex}.fields.${fieldIndex}.meta.finalValue`
                                        )}
                                        isCreatable={true}
                                        onCreateOption={onCreate}
                                        isDestructive={!!fieldState?.error?.message}
                                    />
                                    {!!fieldState?.error?.message && (
                                        <p className="text-xs font-normal text-red-500 dark:text-red-500 mt-1">
                                            {fieldState?.error?.message}
                                        </p>
                                    )}
                                </div>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                className="p-2 rounded-tl-none rounded-bl-none"
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => reset(true)}
                                            >
                                                <RotateCcw size={14} />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="right" align="center">
                                            Revert to default value
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </>
                        );
                    }}
                />
            ) : (
                <>
                    <Input
                        {...register(`configs.${configIndex}.fields.${fieldIndex}.meta.finalValue`, {
                            required: {
                                value: isRequired,
                                message: `Please enter ${propertyName}`,
                            },
                            validate,
                        })}
                        disabled={watch(`configs.${configIndex}.fields.${fieldIndex}.readOnly`)}
                        value={value}
                        placeholder={defaultPlaceholder}
                        isDestructive={!!fieldError}
                        supportiveText={fieldError}
                        autoComplete="off"
                        className={cn('rounded-tr-none rounded-br-none', {
                            'truncate pr-24': watch(`configs.${configIndex}.fields.${fieldIndex}.readOnly`),
                        })}
                        onInput={FIELD_TYPE_PORT.includes(fieldName) ? sanitizeNumericInput : undefined}
                    />
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    className="p-2 rounded-tl-none rounded-bl-none"
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => reset()}
                                >
                                    <RotateCcw size={14} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right" align="center">
                                Revert to default value
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </>
            )}
        </div>
    );
};
