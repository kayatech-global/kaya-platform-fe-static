'use client';
import { OptionModel } from '@/components/atoms';
import {
    SelectContentV2,
    SelectGroupV2,
    SelectItemV2,
    SelectLabelV2,
    SelectTriggerV2,
    SelectV2,
    SelectValueV2,
} from '@/components/atoms/select-v2';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Slider } from '@/components/atoms/slider';

export enum FieldType {
    INPUT = 'input',
    SELECT = 'select',
    SLIDER = 'slider',
}

export type FieldsDefinition = {
    id: string;
    type: FieldType;
    label: string;
    value?: string | number;
    options?: OptionModel[];
};

export type FieldRow = {
    rowID: string;
    fields: Record<string, string | number>; // field id -> value
};

interface IDynamicObjectBuilderProps {
    fieldsDefinition: FieldsDefinition[];
    value?: FieldRow[];
    onChange?: (value: FieldRow[]) => void;
}

export const DynamicObjectBuilder = ({ fieldsDefinition, value = [], onChange }: IDynamicObjectBuilderProps) => {
    const [fieldConfigArray, setFieldConfigsArray] = useState<FieldRow[]>(value ?? []);

    useEffect(() => {
        if (onChange) {
            onChange(fieldConfigArray);
        }
    }, [fieldConfigArray, onChange]);

    const initializeRow = (): FieldRow => {
        const initialFields: Record<string, string | number> = {};
        fieldsDefinition.forEach(field => {
            const fieldId = crypto.randomUUID();
            initialFields[fieldId] = field.value ?? (field.type === FieldType.SLIDER ? 33 : '');
        });

        return {
            rowID: crypto.randomUUID(),
            fields: initialFields,
        };
    };

    const addNewRow = () => {
        setFieldConfigsArray(prev => [...prev, initializeRow()]);
    };

    const removeRow = (rowId: string) => {
        setFieldConfigsArray(prev => prev.filter(row => row.rowID !== rowId));
    };

    const setFieldValue = (rowId: string, fieldId: string, newValue: string | number) => {
        setFieldConfigsArray(prev =>
            prev.map(row =>
                row.rowID === rowId
                    ? {
                          ...row,
                          fields: {
                              ...row.fields,
                              [fieldId]: newValue,
                          },
                      }
                    : row
            )
        );
    };

    const getInputType = (row: FieldRow, fieldDef: FieldsDefinition, fieldId: string) => {
        const currentValue = row.fields[fieldId] || '';

        switch (fieldDef.type) {
            case FieldType.INPUT:
                return (
                    <input
                        value={currentValue as string}
                        placeholder={fieldDef.label}
                        onChange={e => setFieldValue(row.rowID, fieldId, e.target.value)}
                        className="min-h-7 dark:bg-gray-700 border border-input px-3 py-1 rounded text-xs font-normal dark:text-gray-50 text-gray-900 placeholder:text-gray-400 outline-0"
                    />
                );
            case FieldType.SELECT:
                return (
                    <SelectV2
                        value={currentValue as string}
                        onValueChange={value => setFieldValue(row.rowID, fieldId, value)}
                    >
                        <SelectTriggerV2 className="w-full dark:bg-gray-700">
                            <SelectValueV2 placeholder={fieldDef.label} />
                        </SelectTriggerV2>
                        <SelectContentV2>
                            <SelectGroupV2>
                                <SelectLabelV2>{fieldDef.label}</SelectLabelV2>
                                {fieldDef.options?.map((option) => (
                                    <SelectItemV2 key={String(option.value)} value={option.value as string}>
                                        {option.value}
                                    </SelectItemV2>
                                ))}
                            </SelectGroupV2>
                        </SelectContentV2>
                    </SelectV2>
                );
            case FieldType.SLIDER:
                return (
                    <Slider
                        value={[currentValue as number]}
                        onValueChange={values => setFieldValue(row.rowID, fieldId, values[0])}
                        max={100}
                        step={1}
                        className="mt-3"
                    />
                );
            default:
                return null;
        }
    };

    useEffect(() => {
        if (value && value.length > 0) {
            setFieldConfigsArray(value);
        }
    }, [value]);

    // Generate field IDs on first render if not provided
    useEffect(() => {
        if (fieldConfigArray.length === 0) {
            setFieldConfigsArray([initializeRow()]);
        }
    }, []);

    return (
        <div className="relative">
            {/* Vertical line */}
            {fieldConfigArray.length > 0 && (
                <div
                    className="absolute left-[0px] w-[1px] bg-gray-400 z-0"
                    style={{
                        top: '27px',
                        height: `calc(100% - 40px)`,
                    }}
                />
            )}
            <div className="flex flex-col w-full gap-y-[22px] relative z-10">
                {fieldConfigArray.map(row => {
                    // Create field IDs mapping for this row
                    const fieldIds = Object.keys(row.fields);

                    return (
                        <div key={row.rowID} className="w-full flex items-center relative">
                            <div className="start-line w-[10px] bg-gray-400 h-[1px] z-10" />
                            <div className="flex items-center gap-x-3 px-3 pt-1 pb-2 dark:bg-gray-900 border-gray-400 border dark:border-0 rounded w-full">
                                <div className="grid grid-cols-4 gap-x-3 w-full">
                                    {fieldsDefinition.map((fieldDef, fieldIndex) => {
                                        const fieldId = fieldIds[fieldIndex];
                                        return (
                                            <div key={fieldId} className="flex flex-col flex-1 gap-y-[2px]">
                                                <p className="dark:text-white text-gray-700 text-[8px] font-normal">
                                                    {fieldDef.label}
                                                </p>
                                                {getInputType(row, fieldDef, fieldId)}
                                            </div>
                                        );
                                    })}
                                </div>
                                <X
                                    onClick={() => removeRow(row.rowID)}
                                    size={14}
                                    className={cn('mt-3 cursor-pointer dark:text-gray-200 text-gray-500', {
                                        hidden: fieldConfigArray.length === 1,
                                    })}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="mt-[22px] flex items-center relative z-10">
                <div className="end-line w-[10px] bg-gray-400 h-[1px]" />
                <button
                    onClick={addNewRow}
                    className="min-h-7 dark:bg-gray-700 border dark:border-gray-600 bg-blue-600 border-blue-600 text-white py-1 px-2 rounded text-xs active:scale-95 transition-transform duration-100"
                >
                    + Add a set
                </button>
            </div>
        </div>
    );
};
