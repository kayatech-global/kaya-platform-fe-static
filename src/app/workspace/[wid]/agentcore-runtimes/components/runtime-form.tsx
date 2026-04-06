'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Server } from 'lucide-react';
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
import { RuntimeFormData, ValidationStatus } from '../types';
import { awsRegions } from '../mock-data';

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
    } = useForm<RuntimeFormData>({
        mode: 'all',
        defaultValues: {
            name: initialData?.name || '',
            description: initialData?.description || '',
            region: initialData?.region || '',
            awsAccessKeyId: initialData?.awsAccessKeyId || '',
            awsSecretAccessKeyId: initialData?.awsSecretAccessKeyId || '',
            roleArn: initialData?.roleArn || '',
            idleTimeout: initialData?.idleTimeout || 300,
            maxLifetime: initialData?.maxLifetime || 3600,
            runtimeEnvOverride: initialData?.runtimeEnvOverride || '{}',
        },
    });

    // Reset form values when initialData changes (for edit mode)
    React.useEffect(() => {
        if (isOpen && initialData) {
            reset({
                name: initialData.name || '',
                description: initialData.description || '',
                region: initialData.region || '',
                awsAccessKeyId: initialData.awsAccessKeyId || '',
                awsSecretAccessKeyId: initialData.awsSecretAccessKeyId || '',
                roleArn: initialData.roleArn || '',
                idleTimeout: initialData.idleTimeout || 300,
                maxLifetime: initialData.maxLifetime || 3600,
                runtimeEnvOverride: initialData.runtimeEnvOverride || '{}',
            });
        } else if (isOpen && !initialData) {
            reset({
                name: '',
                description: '',
                region: '',
                awsAccessKeyId: '',
                awsSecretAccessKeyId: '',
                roleArn: '',
                idleTimeout: 300,
                maxLifetime: 3600,
                runtimeEnvOverride: '{}',
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
        onSubmit(data);
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
                            </div>
                        </div>

                        {/* AWS Credentials Section */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                AWS Credentials
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input
                                    {...register('awsAccessKeyId', {
                                        required: { value: true, message: 'AWS Access Key is required' },
                                    })}
                                    className="w-full"
                                    label="AWS Access Key"
                                    placeholder="AKIAIOSFODNN7EXAMPLE"
                                    readOnly={isEdit && isReadOnly}
                                    isDestructive={!!errors.awsAccessKeyId?.message}
                                    supportiveText={errors.awsAccessKeyId?.message}
                                />
                                <VaultSelector
                                    {...register('awsSecretAccessKeyId', {
                                        required: { value: true, message: 'Please select vault key' },
                                    })}
                                    label="AWS Secret Access Key"
                                    placeholder={secretOptions.length > 0 ? 'Select from Vault' : 'No vault key found'}
                                    disabled={secretOptions.length === 0 || (isEdit && isReadOnly)}
                                    options={secretOptions}
                                    currentValue={watch('awsSecretAccessKeyId')}
                                    isDestructive={!!errors.awsSecretAccessKeyId?.message}
                                    supportiveText={errors.awsSecretAccessKeyId?.message}
                                    disableCreate={isEdit && isReadOnly}
                                    loadingSecrets={loadingSecrets}
                                    onRefetch={() => refetchSecrets()}
                                />
                                <Select
                                    {...register('region', {
                                        required: { value: true, message: 'AWS Region is required' },
                                    })}
                                    label="AWS Region"
                                    placeholder="Select region"
                                    options={awsRegions}
                                    currentValue={watch('region')}
                                    disabled={isEdit && isReadOnly}
                                    isDestructive={!!errors.region?.message}
                                    supportiveText={errors.region?.message}
                                />
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

                        {/* Runtime Env Override Section */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                Environment Configuration
                            </h4>
                            <Textarea
                                {...register('runtimeEnvOverride', {
                                    validate: (value) => {
                                        try {
                                            JSON.parse(value);
                                            return true;
                                        } catch {
                                            return 'Must be valid JSON';
                                        }
                                    }
                                })}
                                rows={6}
                                className="w-full font-mono text-sm"
                                label="Runtime Env Override JSON"
                                placeholder={'{\n  "ENV_VAR": "value",\n  "DEBUG": "false"\n}'}
                                readOnly={isEdit && isReadOnly}
                                isDestructive={!!errors.runtimeEnvOverride?.message}
                                supportiveText={errors.runtimeEnvOverride?.message || 'Environment variables to override in runtime'}
                            />
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
                                    disabled={isValidating}
                                >
                                    {isValidating ? 'Validating...' : 'Validate'}
                                </Button>
                            </div>
                            <div className="space-y-2">
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
                                    label="Health Check" 
                                    status={validationStatus.healthCheck}
                                    icon={Activity}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            }
            footer={
                <div className="flex justify-between">
                    <div className="flex gap-2">
                        {/* Reserved for additional actions */}
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button
                            variant={'secondary'}
                            size={'sm'}
                            onClick={handleClose}
                        >
                            Cancel
                        </Button>
                        <div>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            size={'sm'}
                                            disabled={!canSubmit}
                                            onClick={handleSubmit(handleFormSubmit)}
                                        >
                                            {getSubmitButtonLabel(isSaving, isEdit)}
                                        </Button>
                                    </TooltipTrigger>
                                    {!canSubmit && (
                                        <TooltipContent side="left" align="center">
                                            {!allValidated 
                                                ? 'Please validate connection before saving' 
                                                : 'All details need to be filled before the form can be saved'
                                            }
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                </div>
            }
        />
    );
};
