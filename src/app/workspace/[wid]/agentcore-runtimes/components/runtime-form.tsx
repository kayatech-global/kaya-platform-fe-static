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
    TooltipTrigger 
} from '@/components';
import AppDrawer from '@/components/molecules/drawer/app-drawer';
import { BannerInfo } from '@/components/atoms/banner-info';
import { cn, getSubmitButtonLabel } from '@/lib/utils';
import { validateField } from '@/utils/validation';
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
import { awsRegions, secretOptions } from '../mock-data';

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
    const [validationStatus, setValidationStatus] = useState<ValidationStatus>({
        iamRole: 'pending',
        vaultSecret: 'pending',
        healthCheck: 'pending',
    });
    const [isValidating, setIsValidating] = useState(false);

    const nameValidate = validateField('Name', {
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
            configurations: {
                awsAccessKeyId: initialData?.configurations?.awsAccessKeyId || '',
                awsSecretAccessKeyId: initialData?.configurations?.awsSecretAccessKeyId || '',
                executionTimeout: initialData?.configurations?.executionTimeout || 300,
                maxConcurrency: initialData?.configurations?.maxConcurrency || 10,
                memorySize: initialData?.configurations?.memorySize || 512,
                enableLogging: initialData?.configurations?.enableLogging ?? true,
                enableTracing: initialData?.configurations?.enableTracing ?? false,
            },
        },
    });

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
                                <div className="flex items-center justify-between w-full">
                                    <span className="text-sm text-blue-700 dark:text-blue-300">
                                        Ensure your IAM role has the required AgentCore permissions
                                    </span>
                                    <Button 
                                        variant="link" 
                                        size="sm" 
                                        className="text-blue-600 p-0 h-auto"
                                        trailingIcon={<ExternalLink size={12} />}
                                    >
                                        View Guide
                                    </Button>
                                </div>
                            }
                        />

                        {/* Runtime Info Section */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="col-span-1 sm:col-span-2">
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
                            </div>
                            <div className="col-span-1 sm:col-span-2">
                                <Textarea
                                    {...register('description', {
                                        required: descriptionValidate.required,
                                        minLength: descriptionValidate.minLength,
                                    })}
                                    rows={3}
                                    className="w-full"
                                    label="Description"
                                    placeholder="Optional description for this runtime..."
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
                                <div className="col-span-1 sm:col-span-2">
                                    <Input
                                        {...register('configurations.awsAccessKeyId', {
                                            required: { value: true, message: 'Access Key ID is required' },
                                        })}
                                        className="w-full"
                                        label="Access Key ID"
                                        placeholder="AKIAIOSFODNN7EXAMPLE"
                                        readOnly={isEdit && isReadOnly}
                                        isDestructive={!!errors.configurations?.awsAccessKeyId?.message}
                                        supportiveText={errors.configurations?.awsAccessKeyId?.message}
                                    />
                                </div>
                                <div className="col-span-1 sm:col-span-2">
                                    <Select
                                        {...register('configurations.awsSecretAccessKeyId', {
                                            required: { value: true, message: 'Secret Access Key is required' },
                                        })}
                                        label="Secret Access Key"
                                        placeholder="Select from Vault"
                                        options={secretOptions}
                                        currentValue={watch('configurations.awsSecretAccessKeyId')}
                                        disabled={isEdit && isReadOnly}
                                        isDestructive={!!errors.configurations?.awsSecretAccessKeyId?.message}
                                        supportiveText={errors.configurations?.awsSecretAccessKeyId?.message}
                                        isVault
                                    />
                                </div>
                                <div className="col-span-1">
                                    <Select
                                        {...register('region', {
                                            required: { value: true, message: 'Region is required' },
                                        })}
                                        label="AWS Region"
                                        placeholder="Select region"
                                        options={awsRegions}
                                        currentValue={watch('region')}
                                        disabled={isEdit && isReadOnly}
                                        isDestructive={!!errors.region?.message}
                                        supportiveText={errors.region?.message}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Execution Settings Section */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                Execution Settings
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input
                                    {...register('configurations.executionTimeout', {
                                        required: { value: true, message: 'Execution timeout is required' },
                                        min: { value: 60, message: 'Minimum 60 seconds' },
                                        max: { value: 3600, message: 'Maximum 3600 seconds' },
                                    })}
                                    type="number"
                                    label="Execution Timeout (seconds)"
                                    placeholder="300"
                                    readOnly={isEdit && isReadOnly}
                                    isDestructive={!!errors.configurations?.executionTimeout?.message}
                                    supportiveText={errors.configurations?.executionTimeout?.message || 'Time before timeout'}
                                />
                                <Input
                                    {...register('configurations.maxConcurrency', {
                                        required: { value: true, message: 'Max concurrency is required' },
                                        min: { value: 1, message: 'Minimum 1' },
                                        max: { value: 100, message: 'Maximum 100' },
                                    })}
                                    type="number"
                                    label="Max Concurrency"
                                    placeholder="10"
                                    readOnly={isEdit && isReadOnly}
                                    isDestructive={!!errors.configurations?.maxConcurrency?.message}
                                    supportiveText={errors.configurations?.maxConcurrency?.message || 'Maximum concurrent executions'}
                                />
                                <Input
                                    {...register('configurations.memorySize', {
                                        required: { value: true, message: 'Memory size is required' },
                                        min: { value: 128, message: 'Minimum 128 MB' },
                                        max: { value: 10240, message: 'Maximum 10240 MB' },
                                    })}
                                    type="number"
                                    label="Memory Size (MB)"
                                    placeholder="512"
                                    readOnly={isEdit && isReadOnly}
                                    isDestructive={!!errors.configurations?.memorySize?.message}
                                    supportiveText={errors.configurations?.memorySize?.message || 'Allocated memory'}
                                />
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
