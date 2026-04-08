'use client';

import { Input, Textarea, Select, Button, Label, Badge } from '@/components';
import { cn } from '@/lib/utils';
import { IAgentForm, AuthType, IAuthScheme } from '@/models';
import { User, Plus, X, Key } from 'lucide-react';
import { Control, Controller, UseFormWatch, UseFormSetValue, FieldErrors } from 'react-hook-form';
import { useState } from 'react';

interface IdentitySectionProps {
    control: Control<IAgentForm>;
    watch: UseFormWatch<IAgentForm>;
    setValue: UseFormSetValue<IAgentForm>;
    errors?: FieldErrors<IAgentForm>;
    isReadOnly?: boolean;
}

const authTypeOptions = [
    { name: 'None', value: 'none' },
    { name: 'API Key', value: 'api_key' },
    { name: 'OAuth 2.0', value: 'oauth2' },
    { name: 'Bearer Token', value: 'bearer' },
    { name: 'Basic Auth', value: 'basic' },
];

export const IdentitySection = ({ control, watch, setValue, errors, isReadOnly }: IdentitySectionProps) => {
    const [newAuthType, setNewAuthType] = useState<AuthType>('api_key');
    const authSchemes = watch('horizonConfig.identity.authSchemes') || [];

    const addAuthScheme = () => {
        const existing = authSchemes.find((s) => s.type === newAuthType);
        if (!existing) {
            setValue('horizonConfig.identity.authSchemes', [...authSchemes, { type: newAuthType, config: {} }]);
        }
    };

    const removeAuthScheme = (type: AuthType) => {
        setValue(
            'horizonConfig.identity.authSchemes',
            authSchemes.filter((s) => s.type !== type)
        );
    };

    const getAuthLabel = (type: AuthType): string => {
        const option = authTypeOptions.find((o) => o.value === type);
        return option?.name || type;
    };

    return (
        <div className="col-span-1 sm:col-span-2 border-2 border-solid border-gray-300 dark:border-gray-700 rounded-lg p-2 sm:p-4">
            <div className="flex flex-col gap-y-4">
                <div className="flex flex-col gap-y-1">
                    <div className="flex items-center gap-x-[10px]">
                        <User size={20} absoluteStrokeWidth={false} className="stroke-[1px]" />
                        <p className="text-sm font-medium">Identity Configuration</p>
                    </div>
                    <p className="text-xs font-normal text-gray-400">
                        Define the agent&apos;s identity, versioning, and authentication mechanisms.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Display Name */}
                    <Controller
                        name="horizonConfig.identity.displayName"
                        control={control}
                        rules={{ required: 'Display name is required' }}
                        render={({ field }) => (
                            <Input
                                label="Display Name"
                                placeholder="Enter display name"
                                value={field.value || ''}
                                disabled={isReadOnly}
                                onChange={field.onChange}
                                isDestructive={!!errors?.horizonConfig?.identity?.displayName}
                                supportiveText={errors?.horizonConfig?.identity?.displayName?.message}
                            />
                        )}
                    />

                    {/* Version */}
                    <Controller
                        name="horizonConfig.identity.version"
                        control={control}
                        rules={{
                            required: 'Version is required',
                            pattern: {
                                value: /^\d+\.\d+\.\d+$/,
                                message: 'Use semantic versioning (e.g., 1.0.0)',
                            },
                        }}
                        render={({ field }) => (
                            <Input
                                label="Version"
                                placeholder="1.0.0"
                                value={field.value || ''}
                                disabled={isReadOnly}
                                onChange={field.onChange}
                                helperInfo="Semantic versioning (e.g., 1.0.0)"
                                isDestructive={!!errors?.horizonConfig?.identity?.version}
                                supportiveText={errors?.horizonConfig?.identity?.version?.message}
                            />
                        )}
                    />

                    {/* Description */}
                    <div className="col-span-1 sm:col-span-2">
                        <Controller
                            name="horizonConfig.identity.description"
                            control={control}
                            render={({ field }) => (
                                <Textarea
                                    label="Description"
                                    placeholder="Describe the agent's purpose and capabilities"
                                    value={field.value || ''}
                                    disabled={isReadOnly}
                                    onChange={field.onChange}
                                    rows={3}
                                    className="w-full resize-none"
                                />
                            )}
                        />
                    </div>

                    {/* Endpoint URL */}
                    <Controller
                        name="horizonConfig.identity.endpointUrl"
                        control={control}
                        render={({ field }) => (
                            <Input
                                label="Endpoint URL"
                                placeholder="https://api.example.com/agent"
                                value={field.value || ''}
                                disabled={isReadOnly}
                                onChange={field.onChange}
                                helperInfo="Optional: Override default endpoint"
                            />
                        )}
                    />

                    {/* Discovery Location */}
                    <Controller
                        name="horizonConfig.identity.discoveryLocation"
                        control={control}
                        render={({ field }) => (
                            <Input
                                label="Discovery Location"
                                placeholder="/.well-known/agent.json"
                                value={field.value || ''}
                                disabled={isReadOnly}
                                onChange={field.onChange}
                                helperInfo="Agent discovery endpoint path"
                            />
                        )}
                    />
                </div>

                {/* Authentication Schemes */}
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-x-2">
                            <Key size={16} className="text-gray-500" />
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Authentication Schemes
                            </p>
                        </div>
                    </div>

                    {/* Current Auth Schemes */}
                    {authSchemes.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {authSchemes.map((scheme) => (
                                <Badge
                                    key={scheme.type}
                                    variant="secondary"
                                    className="flex items-center gap-x-1.5 px-3 py-1"
                                >
                                    {getAuthLabel(scheme.type)}
                                    {!isReadOnly && (
                                        <button
                                            type="button"
                                            onClick={() => removeAuthScheme(scheme.type)}
                                            className="ml-1 hover:text-red-500 transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </Badge>
                            ))}
                        </div>
                    )}

                    {/* Add Auth Scheme */}
                    {!isReadOnly && (
                        <div className="flex items-end gap-x-2">
                            <div className="flex-1">
                                <Select
                                    label="Add Authentication"
                                    placeholder="Select auth type"
                                    options={authTypeOptions.filter(
                                        (opt) => !authSchemes.find((s) => s.type === opt.value)
                                    )}
                                    currentValue={newAuthType}
                                    onChange={(e) => setNewAuthType(e.target.value as AuthType)}
                                />
                            </div>
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={addAuthScheme}
                                disabled={authSchemes.some((s) => s.type === newAuthType)}
                            >
                                <Plus size={16} className="mr-1" />
                                Add
                            </Button>
                        </div>
                    )}

                    {authSchemes.length === 0 && (
                        <p className="text-xs text-gray-400 mt-2">
                            No authentication schemes configured. The agent will be accessible without authentication.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IdentitySection;
