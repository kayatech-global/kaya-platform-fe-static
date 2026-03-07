/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useImperativeHandle } from 'react';
import { VariableValuePicker } from '@/components';
import { DataType } from '@/enums';
import { cn } from '@/lib/utils';
import { IConnectorTestQueryParams, ISharedItem } from '@/models';
import { get } from 'lodash';
import {
    Control,
    FieldArrayWithId,
    FieldErrors,
    UseFormRegister,
    UseFormSetValue,
    UseFormTrigger,
    UseFormWatch,
} from 'react-hook-form';

export interface ConnectorQueryVariableRef {
    onGenerateVariable: (query: string | undefined) => void;
    onRegenerateVariable: (query: string | undefined, data: IConnectorTestQueryParams[]) => void;
}

const VARIABLE_PATTERN = /\{\{Variable:(\w+)\}\}/g;

function getDefaultValueForType(type: DataType): string | null {
    if (type === DataType.bool) return 'true';
    if (type === DataType.string) return '';
    return null;
}

function buildVariableResult(
    query: string,
    variables: ISharedItem[],
    getValue: (item: ISharedItem) => string | null
): IConnectorTestQueryParams[] {
    const matches = [...query.matchAll(VARIABLE_PATTERN)];
    const extractedNames = new Set(matches.map(m => m[1]));
    return (
        variables
            ?.filter(x => extractedNames.has(x.name))
            ?.map(
                x =>
                    ({
                        key: x.name,
                        type: x.type,
                        value: getValue(x),
                    } as IConnectorTestQueryParams)
            ) ?? []
    );
}

interface ConnectorQueryVariablesProps {
    fields: FieldArrayWithId<any, string, 'id'>[];
    namePrefix: string;
    control: Control<any, any>;
    errors: FieldErrors<any>;
    variables: ISharedItem[];
    disabled?: boolean;
    register: UseFormRegister<any>;
    watch: UseFormWatch<any>;
    trigger: UseFormTrigger<any>;
    setValue: UseFormSetValue<any>;
}

export const ConnectorQueryVariables = React.forwardRef<ConnectorQueryVariableRef, ConnectorQueryVariablesProps>(
    (
        {
            fields,
            namePrefix,
            control,
            errors,
            variables,
            disabled,
            register,
            watch,
            trigger,
            setValue,
        }: ConnectorQueryVariablesProps,
        ref
    ) => {
        useImperativeHandle(ref, () => ({
            onGenerateVariable: query => {
                const result = query
                    ? buildVariableResult(query, variables ?? [], item => getDefaultValueForType(item.type))
                    : [];
                setValue(namePrefix, result);
            },
            onRegenerateVariable: (query, data) => {
                const getValue = (item: ISharedItem) => {
                    const found = data?.find(x => x.key === item?.name);
                    return found ? found.value : getDefaultValueForType(item?.type);
                };
                const result = query ? buildVariableResult(query, variables ?? [], getValue) : [];
                setValue(namePrefix, result);
            },
        }));

        if (fields?.length > 0) {
            return (
                <div className="col-span-1 sm:col-span-2 p-2 border-2 border-solid rounded-lg border-gray-300 dark:border-gray-700">
                    <p className="text-xs font-medium font-normal">Connector Query Variables</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mt-2">
                        {fields.map((variable: any, index) => {
                            const isOddLastItem = fields.length % 2 === 1 && index === fields.length - 1;

                            return (
                                <div
                                    key={variable.id}
                                    className={cn({
                                        'sm:col-span-2': isOddLastItem,
                                    })}
                                >
                                    <VariableValuePicker
                                        fieldType={`${namePrefix}.${index}.type`}
                                        fieldName={`${namePrefix}.${index}.value`}
                                        data={{
                                            type: watch(`${namePrefix}.${index}.type`),
                                            value: watch(`${namePrefix}.${index}.value`),
                                        }}
                                        placeholder={`Enter ${
                                            variable.type === 'int' ? 'an integer' : `a ${variable.type}`
                                        } value`}
                                        required="Please enter a value"
                                        disabled={disabled}
                                        errorMessage={get(errors, `${namePrefix}.${index}.value.message`)}
                                        label={variable.key}
                                        control={control}
                                        register={register}
                                        setValue={setValue}
                                        watch={watch}
                                        trigger={trigger}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        }

        return <></>;
    }
);

ConnectorQueryVariables.displayName = 'ConnectorQueryVariables';
