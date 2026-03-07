'use client';

import React from 'react';
import { Input, OptionModel, Select, VaultSelector } from '@/components/atoms';
import { ISwaggerParameter } from '@/hooks/use-swagger-parser';

type ParameterInputProps = {
    parameters: ISwaggerParameter[];
    onChange: (updated: ISwaggerParameter[]) => void;
    title: string;
    enableValueInput?: boolean;
    disableMetaFields?: boolean;
    valuePlaceholder?: string;
    errors: {
        [key: string]: string; // Changed from number to string for unique keys
    };
    secrets?: OptionModel[];
    loadingSecrets?: boolean;
    setErrors: React.Dispatch<
        React.SetStateAction<{
            [key: string]: string; // Changed from number to string
        }>
    >;
    onVaultRefetch?: () => void;
};

export default function ParameterInput({
    parameters,
    onChange,
    title,
    enableValueInput = true,
    disableMetaFields = false,
    errors,
    secrets,
    loadingSecrets,
    setErrors,
    onVaultRefetch,
}: Readonly<ParameterInputProps>) {
    // Validate the value
    const validateValue = (value: string | undefined, type: string, required = true): string => {
        if (required && (!value || !String(value).trim())) return 'Value is required';
        if (!value) return '';
        switch (type) {
            case 'int':
                return /^[+-]?\d+$/.test(value) ? '' : 'Value must be an integer';
            case 'float':
                return /^[+-]?(\d+(\.\d+)?|\.\d+)$/.test(value) ? '' : 'Value must be a float';
            case 'bool':
                return /^(true|false)$/i.test(value) ? '' : 'Value must be true or false';
            case 'string':
            default:
                return '';
        }
    };

    const handleParamChange = (idx: number, key: keyof ISwaggerParameter, value: string) => {
        const updated = [...parameters];
        updated[idx] = { ...updated[idx], [key]: value };
        onChange(updated);

        // Only validate when user actually changes the value field
        if (key === 'value') {
            const type = (() => {
                const dt = updated[idx].dataType;
                if (dt === 'integer') return 'int';
                if (dt === 'boolean') return 'bool';
                return dt || 'string';
            })();

            // Create unique error key using title and index to avoid conflicts between sections
            const errorKey = `${title}-${idx}`;

            // Only show error if user has entered something, not on initial load
            const errorMsg = validateValue(value, type, false); // Don't make it required initially
            setErrors(prev => ({ ...prev, [errorKey]: errorMsg }));
        }
    };

    // Remove initial validation on load - only validate on user interaction
    // React.useEffect(() => {
    //     const initialErrors: typeof errors = {};
    //     parameters.forEach((_, idx) => {
    //         if (!(idx in errors))
    //             initialErrors[idx] = validateValue(parameters[idx].value, parameters[idx].dataType || 'string');
    //     });
    //     setErrors(prev => ({ ...initialErrors, ...prev }));
    // }, [parameters]);

    return (
        <div className="space-y-2">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
            {parameters.map((field, idx) => (
                <div
                    key={title + idx}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 rounded-md border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                >
                    <Input
                        label="Parameter Name"
                        placeholder="Enter a Parameter Name"
                        value={field.name}
                        onChange={e => handleParamChange(idx, 'name', e.target.value)}
                        disabled={disableMetaFields}
                    />

                    <Select
                        label="Parameter Type"
                        placeholder="Select Parameter Type"
                        value={(() => {
                            const dt = field.dataType;
                            if (dt === 'integer') return 'int';
                            if (dt === 'boolean') return 'bool';
                            if (['string', 'int', 'float', 'bool'].includes(dt)) return dt;
                            return 'string';
                        })()}
                        options={[
                            { value: 'string', name: 'String' },
                            { value: 'int', name: 'Int' },
                            { value: 'float', name: 'Float' },
                            { value: 'bool', name: 'Bool' },
                        ]}
                        onChange={val => handleParamChange(idx, 'dataType', val.target.value)}
                        disabled={disableMetaFields}
                    />

                    {enableValueInput && (
                        <div className="sm:col-span-2">
                            {field.isSecret ? (
                                <VaultSelector
                                    label="Parameter Value"
                                    value={field.value}
                                    disabled={secrets?.length === 0}
                                    placeholder={
                                        secrets && secrets?.length > 0
                                            ? 'Select Parameter Key/Vault'
                                            : 'No Parameter Key/Vault found'
                                    }
                                    options={secrets ?? []}
                                    currentValue={secrets?.find(x => x.value === field.value)?.value ?? ''}
                                    loadingSecrets={loadingSecrets}
                                    supportiveText={errors[`${title}-${idx}`] || undefined}
                                    isDestructive={!!errors[`${title}-${idx}`]}
                                    onChange={val => handleParamChange(idx, 'value', val.target.value)}
                                    onRefetch={() => onVaultRefetch?.()}
                                />
                            ) : field.dataType === 'boolean' || field.dataType === 'bool' ? (
                                <Select
                                    label="Parameter Value"
                                    value={field.value || ''}
                                    placeholder="Select Parameter Value"
                                    options={[
                                        { value: 'true', name: 'True' },
                                        { value: 'false', name: 'False' },
                                    ]}
                                    onChange={val => handleParamChange(idx, 'value', val.target.value)}
                                    supportiveText={errors[`${title}-${idx}`] || undefined}
                                    isDestructive={!!errors[`${title}-${idx}`]}
                                />
                            ) : (
                                <Input
                                    label="Parameter Value"
                                    placeholder="Enter a Parameter Value"
                                    value={field.value || ''}
                                    onChange={e => handleParamChange(idx, 'value', e.target.value)}
                                    supportiveText={errors[`${title}-${idx}`] || undefined}
                                    isDestructive={!!errors[`${title}-${idx}`]}
                                />
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
