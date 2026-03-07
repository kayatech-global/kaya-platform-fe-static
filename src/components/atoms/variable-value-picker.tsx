/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { DataType } from '@/enums';
import { Control, Controller, UseFormRegister, UseFormSetValue, UseFormTrigger, UseFormWatch } from 'react-hook-form';
import { RadioChips } from '../molecules';
import { Input } from './input';
import { FormEvent } from 'react';
import { Label } from './label';

interface VariableValuePickerProps {
    fieldType: any;
    fieldName: string;
    required?: string;
    errorMessage?: any;
    label?: string;
    placeholder?: string;
    data: {
        type: string | undefined;
        value: any;
    };
    control: Control<any, any>;
    disabled?: boolean;
    register: UseFormRegister<any>;
    setValue: UseFormSetValue<any>;
    watch: UseFormWatch<any>;
    trigger: UseFormTrigger<any>;
}

export const VariableValuePicker = ({
    fieldType,
    fieldName,
    required,
    errorMessage,
    label,
    placeholder,
    data,
    control,
    disabled,
    register,
    setValue,
    watch,
    trigger,
}: VariableValuePickerProps) => {
    const validateValue = () => {
        if (data?.value) {
            if (data?.type !== DataType.int && data?.type !== DataType.float) {
                if (data?.value.startsWith(' ')) {
                    return 'No leading spaces in Value';
                }
                if (data?.value.endsWith(' ')) {
                    return 'No trailing spaces in Value';
                }
            } else if (data?.type === DataType.int) {
                const num = Number(data?.value);
                if (!(!isNaN(num) && Number.isInteger(num))) {
                    return 'Please enter a valid integer';
                }
            } else if (data?.type === DataType.float) {
                const num = Number(data?.value);
                if (isNaN(num)) {
                    return 'Please enter a valid number';
                }
            }
        } else if (isNaN(data?.value) && (data?.type === DataType.int || data?.type === DataType.float)) {
            return 'Please enter a valid number';
        }
        return true;
    };

    const isNumeric = () => {
        return watch(fieldType) === DataType.int || watch(fieldType) === DataType.float;
    };

    const onValueInput = (e: FormEvent<HTMLInputElement>) => {
        let val = e.currentTarget.value;
        const type = watch(fieldType);
        if (type === DataType.float) {
            val = val
                .replace(/[^\d.-]/g, '')
                .replace(/(?!^)-/g, '')
                .replace(/^(-?\d*)\.(.*)\./, '$1.$2');
        } else if (type === DataType.int) {
            val = val.replace(/[^\d-]/g, '').replace(/(?!^)-/g, '');
        }

        e.currentTarget.value = val;
    };

    const generateErrorMessage = (message: any) => {
        if (!message) return undefined;
        if (typeof message === 'string') return message;
        return JSON.stringify(message);
    };

    return (
        <>
            {watch(fieldType) === DataType.bool ? (
                <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-100">{label}</Label>
                    <Controller
                        control={control}
                        name={fieldName}
                        rules={{ required: required ? { value: true, message: 'Please select a value' } : undefined }}
                        render={({ field, fieldState }) => (
                            <>
                                <RadioChips
                                    {...field}
                                    className="mt-1"
                                    itemClassName="h-8"
                                    onValueChange={val => field.onChange(val)}
                                    options={[
                                        {
                                            value: 'true',
                                            label: 'True',
                                        },
                                        {
                                            value: 'false',
                                            label: 'False',
                                        },
                                    ]}
                                    disabled={disabled}
                                />
                                {!!fieldState?.error?.message && (
                                    <p className="text-xs font-normal text-red-500 dark:text-red-500 mt-2">
                                        Please select a value
                                    </p>
                                )}
                            </>
                        )}
                    />
                </div>
            ) : (
                <Input
                    {...register(fieldName, {
                        required: !required ? true : { value: true, message: required },
                        setValueAs: v => {
                            if (watch(fieldType) === DataType.int) {
                                const parsed = parseInt(v, 10);
                                return isNaN(parsed) ? v : parsed;
                            }
                            if (watch(fieldType) === DataType.float) {
                                const parsed = parseFloat(v);
                                return isNaN(parsed) ? v : parsed;
                            }
                            return v;
                        },
                        validate: validateValue,
                    })}
                    label={label}
                    placeholder={placeholder ?? 'Value'}
                    type="text"
                    autoComplete="off"
                    {...(isNumeric() && {
                        onInput: onValueInput,
                        onBlur: async () => {
                            setValue(fieldName, watch(fieldName));
                            await trigger(fieldName);
                        },
                    })}
                    disabled={disabled}
                    isDestructive={!!generateErrorMessage(errorMessage)}
                    supportiveText={generateErrorMessage(errorMessage)}
                />
            )}
        </>
    );
};
