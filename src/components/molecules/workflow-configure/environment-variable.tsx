'use client';

import React from 'react';
// import { IWorkflowPullFormData } from '@/models/workflow-pull.model';
import { Input } from '@/components/atoms/input';

interface EnvironmentVariableProps {
    name: string;
    currentValue: string;
    incomingValue: string;
    // control: Control<IWorkflowPullFormData>;
    // errors: FieldErrors<IWorkflowPullFormData>;
    fieldName: string;
}

export const EnvironmentVariable = ({ name, currentValue, incomingValue }: EnvironmentVariableProps) => {
    // Get nested error using fieldName path
    // const getNestedError = () => {
    //     const keys = fieldName.split('.');
    //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //     let error: any = errors;
    //     for (const key of keys) {
    //         if (error?.[key]) {
    //             error = error[key];
    //         } else {
    //             return null;
    //         }
    //     }
    //     return error?.message;
    // };

    // const errorMessage = getNestedError();

    return (
        <div className="grid grid-cols-4 gap-4 items-center py-2">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{name}</div>
            <Input type="text" value={currentValue} disabled containerClassName="w-full" />
            <Input type="text" value={incomingValue} disabled containerClassName="w-full" />
            {/* <Controller
                control={control}
                // @ts-expect-error - Dynamic nested field path
                name={fieldName}
                rules={{
                    required: { value: true, message: 'Please enter a value' },
                }}
                render={({ field }) => (
                    <Input
                        {...field}
                        value={field.value as string}
                        type="text"
                        placeholder="Value"
                        containerClassName="w-full"
                        isDestructive={!!errorMessage}
                        supportiveText={errorMessage}
                    />
                )}
            /> */}
        </div>
    );
};
