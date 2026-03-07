/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Dispatch, SetStateAction } from 'react';
import { OptionModel, Select } from './select';
import { UseFormSetValue, UseFormTrigger, UseFormWatch } from 'react-hook-form';
import { DataType } from '@/enums';
import { ISharedItem } from '@/models';

function normalizeValueForType(
    type: DataType,
    inputValue: string | number | undefined
): string | number | undefined {
    if (type === DataType.string) {
        const isValid = typeof inputValue === 'string' || typeof inputValue === 'number';
        return isValid ? String(inputValue) : '';
    }
    if (type === DataType.int || type === DataType.float) {
        if (inputValue === '') return undefined;
        const isValid = typeof inputValue === 'number' || !Number.isNaN(Number(inputValue));
        if (!isValid) return undefined;
        const num = Number(inputValue);
        if (type === DataType.int && !Number.isInteger(num)) {
            return Number.parseInt(String(inputValue), 10) || 0;
        }
        return Number(inputValue);
    }
    if (type === DataType.bool) {
        const isValid = ['true', 'false'].includes(String(inputValue));
        return isValid ? inputValue : undefined;
    }
    return undefined;
}

interface VariablePickerProps extends React.ComponentProps<'select'> {
    isDestructive?: boolean;
    label?: string;
    supportiveText?: string;
    leadingIcon?: React.ReactNode;
    trailingIcon?: React.ReactNode;
    placeholder?: string;
    options: OptionModel[];
    currentValue?: string | number;
    hasClear?: boolean;
    isVault?: boolean;
    containerClassName?: string;
    helperInfo?: string;
    forceRender: number;
    variables: ISharedItem[] | undefined;
    idField?: string;
    labelField: string;
    valueField: string;
    typeField: string;
    index: number;
    setForceRender: Dispatch<SetStateAction<number>>;
    setValue: UseFormSetValue<any>;
    trigger: UseFormTrigger<any>;
    watch: UseFormWatch<any>;
    onClear?: () => void;
}

export const VariablePicker = (props: VariablePickerProps) => {
    const {
        variables,
        forceRender,
        idField,
        labelField,
        valueField,
        typeField,
        setForceRender,
        setValue,
        trigger,
        watch,
        ...selectProps
    } = props;

    const valueOnChange = async (value: string) => {
        setValue(labelField, value);
        const result = variables?.find(x => x.name === value);
        const inputValue = watch(valueField);
        if (result) {
            const type = result.type ?? DataType.string;
            setValue(typeField, type);
            setValue(valueField, normalizeValueForType(type, inputValue));
        }
        if (idField && result) {
            setValue(idField, result.id);
        }
        await trigger(valueField);
        await trigger(labelField);
        setForceRender(forceRender + 1);
    };

    return (
        <Select
            {...selectProps}
            onChange={e => valueOnChange(e?.target?.value)}
            onBlur={async () => {
                setForceRender(forceRender + 1);
                await trigger(labelField);
            }}
        />
    );
};
