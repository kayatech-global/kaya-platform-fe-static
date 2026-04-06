'use client';

import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Server, Plus, Trash2 } from 'lucide-react';
import { 
    Button, 
    Input, 
    Select, 
    Textarea,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
    VaultSelector
} from '@/components';
import AppDrawer from '@/components/molecules/drawer/app-drawer';
import { BannerInfo } from '@/components/atoms/banner-info';
import { cn, getSubmitButtonLabel } from '@/lib/utils';
import { validateField } from '@/utils/validation';
import { useVaultSecretsFetcher } from '@/hooks/use-vault-common';
import { useParams } from 'next/navigation';
import { 
    CheckCircle, 
    Clock, 
    AlertCircle,
    ExternalLink,
    Shield,
    Key,
    Activity
} from 'lucide-react';
import { RuntimeFormData, ValidationStatus, EnvironmentVariable, CredentialType, ProviderType } from '../types';
import { awsRegions, providerOptions, credentialTypeOptions } from '../mock-data';

interface RuntimeFormProps {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onSubmit: (data: RuntimeFormData) => void;
    isEdit?: boolean;
    isReadOnly?: boolean;
    isSaving?: boolean;
    initialData?: Partial<RuntimeFormData>;
}

const ValidationCard = ({ 
    label, 
    status, 
    icon: Icon 
}: { 
    label: string; 
    status: 'pending' | 'success' | 'error'; 
    icon: React.ElementType;
}) => {
    const statusConfig = {
        pending: {
            bg: 'bg-gray-50 dark:bg-gray-800',
            border: 'border-gray-200 dark:border-gray-700',
            icon: <Clock size={16} className="text-gray-400" />,
            text: 'Pending',
        },
        success: {
            bg: 'bg-green-50 dark:bg-green-900/20',
            border: 'border-green-200 dark:border-green-800',
            icon: <CheckCircle size={16} className="text-green-600" />,
            text: 'Validated',
        },
        error: {
            bg: 'bg-red-50 dark:bg-red-900/20',
            border: 'border-red-200 dark:border-red-800',
            icon: <AlertCircle size={16} className="text-red-600" />,
            text: 'Failed',
        },
    };

    const config = statusConfig[status];

    return (
        <div className={cn(
            'flex items-center justify-between p-3 rounded-lg border',
            config.bg,
            config.border
        )}>
            <div className="flex items-center gap-x-2">
                <Icon size={18} className="text-gray-600 dark:text-gray-300" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</span>
            </div>
            <div className="flex items-center gap-x-1">
                {config.icon}
                <span className="text-xs text-gray-600 dark:text-gray-400">{config.text}</span>
            </div>
        </div>
    );
};

export const RuntimeForm = ({
    isOpen,
    setIsOpen,
    onSubmit,
    isEdit = false,
    isReadOnly = false,
    isSaving = false,
    initialData,
}: RuntimeFormProps) => {
    const params = useParams();
    const workspaceId = params?.wid as string;
    
    // Fetch vault secrets for the VaultSelector
    const { data: vaultSecrets = [], isLoading: loadingSecrets, refetch: refetchSecrets } = useVaultSecretsFetcher(workspaceId);
    
    // Transform vault secrets to options format
    const secretOptions = vaultSecrets?.map((secret) => ({
        name: secret.keyName || '',
        value: secret.keyName || '',
    })) || [];

    const [validationStatus, setValidationStatus] = useState<ValidationStatus>({
        iamRole: 'pending',
        vaultSecret: 'pending',
        healthCheck: 'pending',
    });
    const [isValidating, setIsValidating] = useState(false);

    const nameValidate = validateField('Runtime Name', {
        required: { value: true },
        minLength: { value: 3 },
    });

    const descriptionValidate = validateField('Description', {
        required: { value: true },
        minLength: { value: 5 },
    });

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
        watch,
        reset,
        control,
    } = useForm<RuntimeFormData>({
        mode: 'all',
        defaultValues: {
            name: initialData?.name || '',
            description: initialData?.description || '',
            provider: initialData?.provider || 'aws-agentcore',
            region: initialData?.region || '',
            credentialType: initialData?.credentialType || 'key-access',
            accessKey: initialData?.accessKey || '',
            secretKey: initialData?.secretKey || '',
            roleArn: initialData?.roleArn || '',
            idleTimeout: initialData?.idleTimeout || 300,
            maxLifetime: initialData?.maxLifetime || 3600,
            environmentVariables: initialData?.environmentVariables || [{ key: '', value: '' }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'environmentVariables',
    });

    const credentialType = watch('credentialType');

    // Reset form values when initialData changes (for edit mode)
    React.useEffect(() => {
        if (isOpen && initialData) {
            reset({
                name: initialData.name || '',
                description: initialData.description || '',
                provider: initialData.provider || 'aws-agentcore',
                region: initialData.region || '',
                credentialType: initialData.credentialType || 'key-access',
                accessKey: initialData.accessKey || '',
                secretKey: initialData.secretKey || '',
                roleArn: initialData.roleArn || '',
                idleTimeout: initialData.idleTimeout || 300,
                maxLifetime: initialData.maxLifetime || 3600,
                environmentVariables: initialData.environmentVariables || [{ key: '', value: '' }],
            });
        } else if (isOpen && !initialData) {
            reset({
                name: '',
                description: '',
                provider: 'aws-agentcore',
                region: '',
                credentialType: 'key-access',
                accessKey: '',
                secretKey: '',
                roleArn: '',
                idleTimeout: 300,
                maxLifetime: 3600,
                environmentVariables: [{ key: '', value: '' }],
            });
        }
    }, [isOpen, initialData, reset]);

    const handleValidate = async () => {
        setIsValidating(true);
        
        // Simulate validation steps
        await new Promise(resolve => setTimeout(resolve, 800));
        setValidationStatus(prev => ({ ...prev, iamRole: 'success' }));
        
        await new Promise(resolve => setTimeout(resolve, 600));
        setValidationStatus(prev => ({ ...prev, vaultSecret: 'success' }));
        
        await new Promise(resolve => setTimeout(resolve, 500));
        setValidationStatus(prev => ({ ...prev, healthCheck: 'success' }));
        
        setIsValidating(false);
    };

    const handleFormSubmit = (data: RuntimeFormData) => {
        // Filter out empty environment variables
        const filteredData = {
            ...data,
            environmentVariables: data.environmentVariables.filter(
                (env) => env.key.trim() !== '' && env.value.trim() !== ''
            ),
        };
        onSubmit(filteredData);
        reset();
    };

    const handleClose = () => {
        setIsOpen(false);
        reset();
        setValidationStatus({
            iamRole: 'pending',
            vaultSecret: 'pending',
            healthCheck: 'pending',
        });
    };

    const allValidated = 
        validationStatus.iamRole === 'success' && 
        validationStatus.vaultSecret === 'success' && 
        validationStatus.healthCheck === 'success';

    const canSubmit = isValid && allValidated && !isSaving && !(isEdit && isReadOnly);

    return (
        <AppDrawer
            open={isOpen}
            direction="right"
            isPlainContentSheet={false}
            setOpen={setIsOpen}
            className="custom-drawer-content !w-[633px]"
            dismissible={false}
            headerIcon={<Server />}
            header={<h3>{isEdit ? 'Edit Runtime' : 'New Runtime'}</h3>}
            content={
                <div className={cn('activity-feed-container p-4')}>
                    <div className="space-y-6">
                        {/* IAM Permissions Banner */}
                        <BannerInfo
                            icon="ri-shield-keyhole-fill"
                            label={
                                <div className="flex flex-col gap-2 w-full">
                                    <div className="flex items-center justify-between w-full">
                                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                            Required AWS IAM Permissions
                                        </span>
                                        <a 
                                            href="https://docs.aws.amazon.com/bedrock/latest/userguide/agents-permissions.html"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Button 
                                                variant="link" 
                                                size="sm" 
                                                className="text-blue-600 p-0 h-auto"
                                                trailingIcon={<ExternalLink size={12} />}
                                            >
                                                View Guide
                                            </Button>
                                        </a>
                                    </div>
                                    <span className="text-sm text-blue-600 dark:text-blue-400">
                                        The IAM role must have permissions for AgentCore, STS, and the artifact storage service you plan to use (S3 or ECR)
                                    </span>
                                </div>
                            }
                        />

                        {/* Runtime Info Section */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                Runtime Information
                            </h4>
                            <div className="grid grid-cols-1 gap-4">
                                <Input
                                    {...register('name', {
                                        required: nameValidate.required,
                                        minLength: nameValidate.minLength,
                                    })}
                                    className="w-full"
                                    label="Runtime Name"
                                    placeholder="e.g., prod-agentcore-runtime"
                                    readOnly={isEdit && isReadOnly}
                                    isDestructive={!!errors.name?.message}
                                    supportiveText={errors.name?.message}
                                />
                                <Textarea
                                    {...register('description', {
                                        required: descriptionValidate.required,
                                        minLength: descriptionValidate.minLength,
                                    })}
                                    rows={3}
                                    className="w-full"
                                    label="Description"
                                    placeholder="Brief description of this runtime environment..."
                                    readOnly={isEdit && isReadOnly}
                                    isDestructive={!!errors.description?.message}
                                    supportiveText={errors.description?.message}
                                />
                                <Select
                                    {...register('provider', {
                                        required: { value: true, message: 'Provider is required' },
                                    })}
                                    label="Provider"
                                    placeholder="Select provider"
                                    options={providerOptions}
                                    currentValue={watch('provider')}
                                    disabled={isEdit && isReadOnly}
                                    isDestructive={!!errors.provider?.message}
                                    supportiveText={errors.provider?.message}
                                />
                                <Select
                                    {...register('region', {
                                        required: { value: true, message: 'Region is required' },
                                    })}
                                    label="Region"
                                    placeholder="Select region"
                                    options={awsRegions}
                                    currentValue={watch('region')}
                                    disabled={isEdit && isReadOnly}
                                    isDestructive={!!errors.region?.message}
                                    supportiveText={errors.region?.message}
                                />
                            </div>
                        </div>

                        {/* Authentication Details Section */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                Authentication Details
                            </h4>
                            <div className="grid grid-cols-1 gap-4">
                                <Select
                                    {...register('credentialType', {
                                        required: { value: true, message: 'Credential Type is required' },
                                    })}
                                    label="Credential Type"
                                    placeholder="Select credential type"
                                    options={credentialTypeOptions}
                                    currentValue={watch('credentialType')}
                                    disabled={isEdit && isReadOnly}
                                    isDestructive={!!errors.credentialType?.message}
                                    supportiveText={errors.credentialType?.message}
                                />
                                
                                {/* Key Access fields - only visible when Key Access is selected */}
                                {credentialType === 'key-access' && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Input
                                            {...register('accessKey', {
                                                required: credentialType === 'key-access' 
                                                    ? { value: true, message: 'Access Key is required' }
                                                    : false,
                                            })}
                                            className="w-full"
                                            label="Access Key"
                                            placeholder="AKIAIOSFODNN7EXAMPLE"
                                            readOnly={isEdit && isReadOnly}
                                            isDestructive={!!errors.accessKey?.message}
                                            supportiveText={errors.accessKey?.message}
                                        />
                                        <VaultSelector
                                            {...register('secretKey', {
                                                required: credentialType === 'key-access'
                                                    ? { value: true, message: 'Please select vault key' }
                                                    : false,
                                            })}
                                            label="Secret Key"
                                            placeholder={secretOptions.length > 0 ? 'Select from Vault' : 'No vault key found'}
                                            disabled={secretOptions.length === 0 || (isEdit && isReadOnly)}
                                            options={secretOptions}
                                            currentValue={watch('secretKey')}
                                            isDestructive={!!errors.secretKey?.message}
                                            supportiveText={errors.secretKey?.message}
                                            disableCreate={isEdit && isReadOnly}
                                            loadingSecrets={loadingSecrets}
                                            onRefetch={() => refetchSecrets()}
                                        />
                                    </div>
                                )}

                                <Input
                                    {...register('roleArn', {
                                        required: { value: true, message: 'Role ARN is required' },
                                        pattern: {
                                            value: /^arn:aws:iam::\d+:role\/.+$/,
                                            message: 'Invalid ARN format'
                                        }
                                    })}
                                    className="w-full"
                                    label="Role ARN"
                                    placeholder="arn:aws:iam::123456789:role/agentcore-role"
                                    readOnly={isEdit && isReadOnly}
                                    isDestructive={!!errors.roleArn?.message}
                                    supportiveText={errors.roleArn?.message}
                                />
                            </div>
                        </div>

                        {/* Execution Settings Section */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                Runtime Settings
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input
                                    {...register('idleTimeout', {
                                        required: { value: true, message: 'Idle Timeout is required' },
                                        min: { value: 60, message: 'Minimum 60 seconds' },
                                        max: { value: 3600, message: 'Maximum 3600 seconds' },
                                        valueAsNumber: true,
                                    })}
                                    type="number"
                                    label="Idle Timeout (seconds)"
                                    placeholder="300"
                                    readOnly={isEdit && isReadOnly}
                                    isDestructive={!!errors.idleTimeout?.message}
                                    supportiveText={errors.idleTimeout?.message || 'Time before idle shutdown'}
                                />
                                <Input
                                    {...register('maxLifetime', {
                                        required: { value: true, message: 'Max Lifetime is required' },
                                        min: { value: 300, message: 'Minimum 300 seconds' },
                                        max: { value: 86400, message: 'Maximum 86400 seconds (24 hours)' },
                                        valueAsNumber: true,
                                    })}
                                    type="number"
                                    label="Max Lifetime (seconds)"
                                    placeholder="3600"
                                    readOnly={isEdit && isReadOnly}
                                    isDestructive={!!errors.maxLifetime?.message}
                                    supportiveText={errors.maxLifetime?.message || 'Maximum runtime lifetime'}
                                />
                            </div>
                        </div>

                        {/* Runtime Environment Override Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                    Runtime Environment Override
                                </h4>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => append({ key: '', value: '' })}
                                    disabled={isEdit && isReadOnly}
                                    leadingIcon={<Plus size={14} />}
                                >
                                    Add Variable
                                </Button>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Configure environment variables as key-value pairs for your runtime
                            </p>
                            <div className="space-y-3">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex items-start gap-3">
                                        <div className="flex-1">
                                            <Input
                                                {...register(`environmentVariables.${index}.key`)}
                                                className="w-full"
                                                placeholder="e.g., LOG_LEVEL"
                                                readOnly={isEdit && isReadOnly}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <Input
                                                {...register(`environmentVariables.${index}.value`)}
                                                className="w-full"
                                                placeholder="e.g., INFO"
                                                readOnly={isEdit && isReadOnly}
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="w-9 h-9 text-gray-400 hover:text-red-500"
                                            onClick={() => remove(index)}
                                            disabled={(isEdit && isReadOnly) || fields.length === 1}
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Validation Cards */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                    Connection Validation
                                </h4>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={handleValidate}
                                    loading={isValidating}
                                    disabled={!isValid || (isEdit && isReadOnly)}
                                >
                                    {isValidating ? 'Validating...' : 'Validate Connection'}
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                <ValidationCard 
                                    label="IAM Role Permissions" 
                                    status={validationStatus.iamRole}
                                    icon={Shield}
                                />
                                <ValidationCard 
                                    label="Vault Secret Access" 
                                    status={validationStatus.vaultSecret}
                                    icon={Key}
                                />
                                <ValidationCard 
                                    label="Runtime Health Check" 
                                    status={validationStatus.healthCheck}
                                    icon={Activity}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            }
            footer={
                <div className="flex gap-x-2">
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span>
                                    <Button
                                        variant="primary"
                                        onClick={handleSubmit(handleFormSubmit)}
                                        disabled={!canSubmit}
                                        loading={isSaving}
                                    >
                                        {getSubmitButtonLabel(isEdit, isSaving)}
                                    </Button>
                                </span>
                            </TooltipTrigger>
                            {!allValidated && (
                                <TooltipContent>
                                    Please validate the connection before saving
                                </TooltipContent>
                            )}
                        </Tooltip>
                    </TooltipProvider>
                </div>
            }
        />
    );
};
