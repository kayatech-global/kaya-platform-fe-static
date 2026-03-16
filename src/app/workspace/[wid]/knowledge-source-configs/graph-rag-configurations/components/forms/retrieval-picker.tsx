/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useController, Control, UseFormTrigger } from 'react-hook-form';
import { DetailItemInput } from '@/components/molecules/detail-item-input/detail-item-input';
import { Button } from '@/components';
import { forwardRef, useEffect, useImperativeHandle } from 'react';

interface RetrievalPickerProps {
    name: string;
    description: string;
    control: Control<any>;
    rules?: any;
    disabled?: boolean;
    trigger: UseFormTrigger<any>;
    onRetrieval: () => void;
}

export interface RetrievalPickerRef {
    triggerBlur: () => void;
}

export const RetrievalPicker = forwardRef<RetrievalPickerRef, RetrievalPickerProps>(
    ({ name, description, control, rules, disabled, trigger, onRetrieval }, ref) => {
        const {
            field: { onBlur },
            fieldState: { error },
        } = useController({
            name,
            control,
            rules,
            defaultValue: [] as any[],
        });

        useImperativeHandle(ref, () => ({
            triggerBlur: () => {
                onBlur();
            },
        }));

        useEffect(() => {
            trigger(name);
        }, [rules, trigger, name]);

        const getFirstErrorMessage = (error: any) => {
            if (!error) return undefined;
            if (Array.isArray(error)) return error[0]?.message;
            return error.message;
        };

        return (
            <>
                <div
                    className={`border-2 border-solid rounded-lg p-2 sm:p-4 ${
                        getFirstErrorMessage(error) ? 'border-red-300' : 'border-gray-300 dark:border-gray-700'
                    }`}
                >
                    <DetailItemInput
                        label=""
                        values={undefined}
                        imagePath="/png/select_reusable_agent.png"
                        imageType="png"
                        description={description}
                        footer={
                            <Button variant="link" disabled={disabled} onClick={onRetrieval}>
                                Add a Retrieval Configuration
                            </Button>
                        }
                    />
                </div>
                {getFirstErrorMessage(error) && (
                    <p className="text-xs font-normal text-red-500 dark:text-red-500 mt-2">
                        {getFirstErrorMessage(error)}
                    </p>
                )}
            </>
        );
    }
);

RetrievalPicker.displayName = 'RetrievalPicker';
