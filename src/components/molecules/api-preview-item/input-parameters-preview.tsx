'use client';

import React, { useEffect } from 'react';
import { Input, Select } from '@/components/atoms';
import { cn, validateParameterName, validateParameterDescription, validateParameterValue } from '@/lib/utils';
import { ISwaggerParameter } from '@/hooks/use-swagger-parser';
import {
    Control,
    FieldErrors,
    useFieldArray,
    UseFormRegister,
    UseFormTrigger,
    UseFormWatch,
    useWatch,
} from 'react-hook-form';
import type { TBulkConfigForm } from '@/models';

type InputParametersPreviewProps = {
    payloads?: ISwaggerParameter[];
    enableValueInput?: boolean;
    valuePlaceholder?: string;
    listClassName?: string;
    disableMetaFields?: boolean;
    title?: string;
    index: number;
    isValidOption: boolean;
    selected: boolean;
    register: UseFormRegister<TBulkConfigForm>;
    watch: UseFormWatch<TBulkConfigForm>;
    errors: FieldErrors<TBulkConfigForm>;
    trigger: UseFormTrigger<TBulkConfigForm>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control: Control<TBulkConfigForm, any>;
    shouldTriggerValidation?: boolean;
};

export function InputParametersPreview({
    payloads,
    enableValueInput = false,
    valuePlaceholder = 'Enter test value',
    listClassName,
    disableMetaFields = false,
    title = 'Input Parameters',
    index,
    isValidOption,
    selected,
    register,
    watch,
    errors,
    control,
    trigger,
    shouldTriggerValidation = false,
}: Readonly<InputParametersPreviewProps>) {
    const watchedRow = useWatch({
        control,
        name: `previewApis.${index}.bodyParams`,
    });

    const { fields, replace } = useFieldArray({
        control,
        name: `previewApis.${index}.bodyParams`,
    });

    // Sync with external payloads if provided (e.g., from Swagger parsing)
    const prevPayloadsRef = React.useRef<ISwaggerParameter[] | undefined>(undefined);

    useEffect(() => {
        if (!payloads) return;

        // Compare previous payloads with current
        const prev = prevPayloadsRef.current;
        const areSame =
            prev?.length === payloads.length &&
            prev?.every(
                (p, idx) =>
                    p.name === payloads[idx].name &&
                    p.dataType === payloads[idx].dataType &&
                    p.description === payloads[idx].description
            );

        if (!areSame) {
            replace(payloads); // Only replace if different
            prevPayloadsRef.current = payloads;
        }
    }, [payloads, replace]);

    // Trigger validation when accordion opens
    useEffect(() => {
        if (shouldTriggerValidation && trigger && fields.length > 0) {
            Promise.resolve(trigger(`previewApis.${index}.bodyParams`)).catch(() => {});
        }
    }, [shouldTriggerValidation, trigger, index, fields]);

    // Re-trigger validation when fields change and accordion is open
    useEffect(() => {
        if (shouldTriggerValidation && trigger && fields.length > 0) {
            const timeoutId = setTimeout(() => {
                Promise.resolve(trigger(`previewApis.${index}.bodyParams`)).catch(() => {});
            }, 150); // Debounce validation calls
            return () => clearTimeout(timeoutId);
        }
    }, [shouldTriggerValidation, trigger, index, fields]);

    useEffect(() => {
        (async () => {
            await trigger(`previewApis.${index}.bodyParams`, { shouldFocus: false });
        })();
    }, [watchedRow, index, isValidOption, selected, trigger]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onParameterValue = (value: string, formValues: any, idx: number) => {
        const paramType = formValues?.[`previewApis`]?.[index]?.bodyParams?.[idx]?.dataType;
        return validateParameterValue(value, paramType);
    };

    return (
        <div className="mt-5">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-100 mb-3">{title}</p>
            {payloads && payloads?.length > 0 ? (
                <div className={cn('mt-2 grid grid-cols-1 gap-5', listClassName)}>
                    {fields.map((field, idx) => (
                        <div
                            key={field.id}
                            className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 rounded-md border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                        >
                            {/* Parameter Name */}
                            <Input
                                {...register(`previewApis.${index}.bodyParams.${idx}.name`, {
                                    required: {
                                        value: isValidOption && selected,
                                        message: 'Please enter parameter name',
                                    },
                                    validate: value =>
                                        isValidOption && selected ? validateParameterName(value) : undefined,
                                    onChange: () => {
                                        // Trigger validation immediately when accordion is open
                                        if (shouldTriggerValidation && trigger) {
                                            setTimeout(
                                                () => trigger(`previewApis.${index}.bodyParams.${idx}.name`),
                                                100
                                            );
                                        }
                                    },
                                })}
                                label="Parameter Name"
                                isDestructive={!!errors?.previewApis?.[index]?.bodyParams?.[idx]?.name}
                                supportiveText={
                                    errors?.previewApis?.[index]?.bodyParams?.[idx]?.name?.message as string
                                }
                                disabled={disableMetaFields}
                            />

                            {/* Parameter Type */}
                            <Select
                                {...register(`previewApis.${index}.bodyParams.${idx}.dataType`, {
                                    required: {
                                        value: isValidOption && selected,
                                        message: 'Please enter parameter name',
                                    },
                                })}
                                label="Parameter Type"
                                options={[
                                    { value: 'string', name: 'String' },
                                    { value: 'int', name: 'Int' },
                                    { value: 'float', name: 'Float' },
                                    { value: 'bool', name: 'Bool' },
                                ]}
                                value={(() => {
                                    const value = watch(`previewApis.${index}.bodyParams.${idx}.dataType`);
                                    if (value === 'integer') return 'int';
                                    if (value === 'boolean') return 'bool';
                                    if (['string', 'int', 'float', 'bool'].includes(value)) return value;
                                    return 'string'; // fallback to a valid option
                                })()}
                                disabled={disableMetaFields}
                                isDestructive={!!errors?.previewApis?.[index]?.bodyParams?.[idx]?.dataType}
                                supportiveText={
                                    errors?.previewApis?.[index]?.bodyParams?.[idx]?.dataType?.message as string
                                }
                            />
                            <div className="sm:col-span-2">
                                <Input
                                    {...register(`previewApis.${index}.bodyParams.${idx}.description`, {
                                        required: {
                                            value: isValidOption && selected,
                                            message: 'Please enter description',
                                        },
                                        validate: value =>
                                            isValidOption && selected ? validateParameterDescription(value) : undefined,
                                        onChange: () => {
                                            // Trigger validation immediately when accordion is open
                                            if (shouldTriggerValidation && trigger) {
                                                setTimeout(
                                                    () => trigger(`previewApis.${index}.bodyParams.${idx}.description`),
                                                    100
                                                );
                                            }
                                        },
                                    })}
                                    label="Description *"
                                    isDestructive={!!errors?.previewApis?.[index]?.bodyParams?.[idx]?.description}
                                    supportiveText={
                                        errors?.previewApis?.[index]?.bodyParams?.[idx]?.description?.message as string
                                    }
                                    disabled={disableMetaFields}
                                />
                            </div>

                            {/* Parameter Value (shown only during API testing) */}
                            {enableValueInput && (
                                <div className="sm:col-span-2">
                                    <Input
                                        {...register(`previewApis.${index}.bodyParams.${idx}.value`, {
                                            required: {
                                                value: isValidOption && selected,
                                                message: 'Please enter parameter value',
                                            },
                                            validate: (value, formValues) =>
                                                isValidOption && selected
                                                    ? onParameterValue(value, formValues, idx)
                                                    : undefined,
                                            onChange: () => {
                                                // Trigger validation immediately when accordion is open
                                                if (shouldTriggerValidation && trigger) {
                                                    setTimeout(
                                                        () => trigger(`previewApis.${index}.bodyParams.${idx}.value`),
                                                        100
                                                    );
                                                }
                                            },
                                        })}
                                        label="Parameter Value"
                                        placeholder={valuePlaceholder}
                                        isDestructive={!!errors?.previewApis?.[index]?.bodyParams?.[idx]?.value}
                                        supportiveText={
                                            errors?.previewApis?.[index]?.bodyParams?.[idx]?.value?.message as string
                                        }
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div>
                    <p className="text-[13px] text-gray-600">There are no {title} found for this operation</p>
                </div>
            )}
        </div>
    );
}

export default InputParametersPreview;
