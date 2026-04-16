'use client';

import { Input, Select, Switch, Label, Textarea, Button, Badge, VaultSelector } from '@/components';
import { cn } from '@/lib/utils';
import { IAgentForm, HostingModel } from '@/models';
import { Cloud, Server, Plus, Trash2, Shield, Key, Activity, ExternalLink, CheckCircle, Clock, AlertCircle, Pencil } from 'lucide-react';
import { Control, Controller, UseFormWatch, UseFormSetValue, FieldErrors, useFieldArray } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { BannerInfo } from '@/components/atoms/banner-info';
import { useVaultSecretsFetcher } from '@/hooks/use-vault-common';
import { useParams } from 'next/navigation';

interface DeployConfigSectionProps {
    control: Control<IAgentForm>;
    watch: UseFormWatch<IAgentForm>;
    setValue: UseFormSetValue<IAgentForm>;
    errors?: FieldErrors<IAgentForm>;
    isReadOnly?: boolean;
}

const hostingModelOptions = [
    { name: 'Managed (KAYA Internal)', value: 'managed' },
    { name: 'External (AgentCore)', value: 'agentcore' },
];

const awsRegions = [
    { name: 'US East (N. Virginia)', value: 'us-east-1' },
    { name: 'US East (Ohio)', value: 'us-east-2' },
    { name: 'US West (Oregon)', value: 'us-west-2' },
    { name: 'EU (Ireland)', value: 'eu-west-1' },
    { name: 'EU (Frankfurt)', value: 'eu-central-1' },
    { name: 'Asia Pacific (Singapore)', value: 'ap-southeast-1' },
    { name: 'Asia Pacific (Tokyo)', value: 'ap-northeast-1' },
];

const credentialTypeOptions = [
    { name: 'Key Access', value: 'key-access' },
    { name: 'Managed Access', value: 'managed-access' },
];

const sourceTypeOptions = [
    { name: 'ECR Container', value: 'ecr-container' },
];

type ValidationStatus = 'pending' | 'success' | 'error';

interface ValidationState {
    iamRole: ValidationStatus;
    vaultSecret: ValidationStatus;
    healthCheck: ValidationStatus;
}

const ValidationCard = ({ 
    label, 
    status, 
    icon: Icon 
}: { 
    label: string; 
    status: ValidationStatus; 
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

export const DeployConfigSection = ({ control, watch, setValue, errors, isReadOnly }: DeployConfigSectionProps) => {
    const params = useParams();
    const workspaceId = params?.wid as string;
    
    const horizonConfig = watch('horizonConfig');
    const autoScale = horizonConfig?.deploy?.scalingPolicy?.autoScale ?? true;
    const hostingModel = horizonConfig?.deploy?.hostingModel || 'managed';
    const isAgentCore = hostingModel === 'agentcore';
    const credentialType = watch('horizonConfig.deploy.agentCoreConfig.credentialType') || 'key-access';

    // Fetch vault secrets for the VaultSelector
    const { data: vaultSecrets = [], isLoading: loadingSecrets, refetch: refetchSecrets } = useVaultSecretsFetcher(workspaceId);
    
    // Transform vault secrets to options format
    const secretOptions = vaultSecrets?.map((secret) => ({
        name: secret.keyName || '',
        value: secret.keyName || '',
    })) || [];

    // Validation state for AgentCore connection
    const [validationStatus, setValidationStatus] = useState<ValidationState>({
        iamRole: 'pending',
        vaultSecret: 'pending',
        healthCheck: 'pending',
    });
    const [isValidating, setIsValidating] = useState(false);
    const [isEditingEcrUri, setIsEditingEcrUri] = useState(false);
    const [isEditingImageTag, setIsEditingImageTag] = useState(false);

    // Environment variables field array
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'horizonConfig.deploy.agentCoreConfig.environmentVariables',
    });

    // Initialize default values for AgentCore config when switching to AgentCore
    useEffect(() => {
        if (isAgentCore) {
            const currentConfig = horizonConfig?.deploy?.agentCoreConfig;
            if (!currentConfig) {
                setValue('horizonConfig.deploy.agentCoreConfig', {
                    region: '',
                    credentialType: 'key-access',
                    accessKey: '',
                    secretKey: '',
                    roleArn: '',
                    sourceType: 'ecr-container',
                    ecrRepositoryUri: '123456789012.dkr.ecr.us-east-1.amazonaws.com/my-agent',
                    imageTag: 'latest',
                    idleTimeout: 300,
                    maxLifetime: 3600,
                    environmentVariables: [{ key: '', value: '' }],
                });
            }
        }
    }, [isAgentCore, horizonConfig?.deploy?.agentCoreConfig, setValue]);

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

    const allValidated = 
        validationStatus.iamRole === 'success' && 
        validationStatus.vaultSecret === 'success' && 
        validationStatus.healthCheck === 'success';

    return (
        <div className="col-span-1 sm:col-span-2 border-2 border-solid border-gray-300 dark:border-gray-700 rounded-lg p-2 sm:p-4">
            <div className="flex flex-col gap-y-4">
                <div className="flex flex-col gap-y-1">
                    <div className="flex items-center gap-x-[10px]">
                        <Cloud size={20} absoluteStrokeWidth={false} className="stroke-[1px]" />
                        <p className="text-sm font-medium">Deploy Configuration</p>
                    </div>
                    <p className="text-xs font-normal text-gray-400">
                        Configure how and where this Long Horizon Agent will be deployed.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Hosting Model */}
                    <Controller
                        name="horizonConfig.deploy.hostingModel"
                        control={control}
                        render={({ field }) => (
                            <Select
                                label="Hosting Model"
                                placeholder="Select hosting model"
                                options={hostingModelOptions}
                                currentValue={field.value || 'managed'}
                                disabled={isReadOnly}
                                onChange={(e) => field.onChange(e.target.value as HostingModel)}
                            />
                        )}
                    />
                </div>

                {/* AWS AgentCore Configuration - shown when AgentCore (External) is selected */}
                {isAgentCore && (
                    <div className="space-y-4 border-2 border-dashed border-teal-300 dark:border-teal-700 rounded-lg p-4 bg-teal-50/30 dark:bg-teal-900/10">
                        <div className="flex items-center gap-x-2">
                            <Server size={16} className="text-teal-600 dark:text-teal-400" />
                            <p className="text-sm font-semibold text-teal-700 dark:text-teal-300">AWS AgentCore Configuration</p>
                        </div>

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
                                                type="button"
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
                                        The IAM role must have permissions for AgentCore, STS, and ECR
                                    </span>
                                </div>
                            }
                        />

                        {/* Region Selection */}
                        <div className="grid grid-cols-1 gap-4">
                            <Controller
                                name="horizonConfig.deploy.agentCoreConfig.region"
                                control={control}
                                rules={{ required: isAgentCore ? 'Region is required' : false }}
                                render={({ field }) => (
                                    <Select
                                        label="Region"
                                        placeholder="Select region"
                                        options={awsRegions}
                                        currentValue={field.value || ''}
                                        disabled={isReadOnly}
                                        onChange={(e) => field.onChange(e.target.value)}
                                        isDestructive={!!errors?.horizonConfig?.deploy?.agentCoreConfig?.region}
                                        supportiveText={errors?.horizonConfig?.deploy?.agentCoreConfig?.region?.message as string}
                                    />
                                )}
                            />
                        </div>

                        {/* Authentication Details Section */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                Authentication Details
                            </h4>
                            <div className="grid grid-cols-1 gap-4">
                                <Controller
                                    name="horizonConfig.deploy.agentCoreConfig.credentialType"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            label="Credential Type"
                                            placeholder="Select credential type"
                                            options={credentialTypeOptions}
                                            currentValue={field.value || 'key-access'}
                                            disabled={isReadOnly}
                                            onChange={(e) => field.onChange(e.target.value)}
                                        />
                                    )}
                                />
                                
                                {/* Key Access fields - only visible when Key Access is selected */}
                                {credentialType === 'key-access' && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Controller
                                            name="horizonConfig.deploy.agentCoreConfig.accessKey"
                                            control={control}
                                            rules={{ required: credentialType === 'key-access' ? 'Access Key is required' : false }}
                                            render={({ field }) => (
                                                <Input
                                                    label="Access Key"
                                                    placeholder="AKIAIOSFODNN7EXAMPLE"
                                                    value={field.value || ''}
                                                    disabled={isReadOnly}
                                                    onChange={field.onChange}
                                                    isDestructive={!!errors?.horizonConfig?.deploy?.agentCoreConfig?.accessKey}
                                                    supportiveText={errors?.horizonConfig?.deploy?.agentCoreConfig?.accessKey?.message as string}
                                                />
                                            )}
                                        />
                                        <Controller
                                            name="horizonConfig.deploy.agentCoreConfig.secretKey"
                                            control={control}
                                            rules={{ required: credentialType === 'key-access' ? 'Please select vault key' : false }}
                                            render={({ field }) => (
                                                <VaultSelector
                                                    label="Secret Key"
                                                    placeholder={secretOptions.length > 0 ? 'Select from Vault' : 'No vault key found'}
                                                    disabled={secretOptions.length === 0 || isReadOnly}
                                                    options={secretOptions}
                                                    currentValue={field.value || ''}
                                                    onChange={(e) => field.onChange(e.target.value)}
                                                    isDestructive={!!errors?.horizonConfig?.deploy?.agentCoreConfig?.secretKey}
                                                    supportiveText={errors?.horizonConfig?.deploy?.agentCoreConfig?.secretKey?.message as string}
                                                    disableCreate={isReadOnly}
                                                    loadingSecrets={loadingSecrets}
                                                    onRefetch={() => refetchSecrets()}
                                                />
                                            )}
                                        />
                                    </div>
                                )}

                                <Controller
                                    name="horizonConfig.deploy.agentCoreConfig.roleArn"
                                    control={control}
                                    rules={{ 
                                        required: isAgentCore ? 'Role ARN is required' : false,
                                        pattern: isAgentCore ? {
                                            value: /^arn:aws:iam::\d+:role\/.+$/,
                                            message: 'Invalid ARN format'
                                        } : undefined,
                                    }}
                                    render={({ field }) => (
                                        <Input
                                            label="Role ARN"
                                            placeholder="arn:aws:iam::123456789:role/agentcore-role"
                                            value={field.value || ''}
                                            disabled={isReadOnly}
                                            onChange={field.onChange}
                                            isDestructive={!!errors?.horizonConfig?.deploy?.agentCoreConfig?.roleArn}
                                            supportiveText={errors?.horizonConfig?.deploy?.agentCoreConfig?.roleArn?.message as string}
                                        />
                                    )}
                                />
                            </div>
                        </div>

                        {/* Source Configurations Section */}
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                    Source Configurations
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Configure the container image source for the runtime execution environment
                                </p>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <Controller
                                    name="horizonConfig.deploy.agentCoreConfig.sourceType"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            label="Source Type"
                                            placeholder="Select source type"
                                            options={sourceTypeOptions}
                                            currentValue={field.value || 'ecr-container'}
                                            disabled={isReadOnly}
                                            onChange={(e) => field.onChange(e.target.value)}
                                        />
                                    )}
                                />
                                <div className="relative">
                                    <Controller
                                        name="horizonConfig.deploy.agentCoreConfig.ecrRepositoryUri"
                                        control={control}
                                        rules={{ required: isAgentCore ? 'ECR Repository URI is required' : false }}
                                        render={({ field }) => (
                                            <Input
                                                label="ECR Repository URI"
                                                placeholder="123456789012.dkr.ecr.us-east-1.amazonaws.com/my-agent"
                                                value={field.value || ''}
                                                disabled={!isEditingEcrUri || isReadOnly}
                                                onChange={field.onChange}
                                                className={cn(!isEditingEcrUri && "text-gray-400 dark:text-gray-500")}
                                                isDestructive={!!errors?.horizonConfig?.deploy?.agentCoreConfig?.ecrRepositoryUri}
                                                supportiveText={errors?.horizonConfig?.deploy?.agentCoreConfig?.ecrRepositoryUri?.message as string || (!isEditingEcrUri ? 'Default value - click edit to modify' : undefined)}
                                            />
                                        )}
                                    />
                                    {!isReadOnly && (
                                        <button
                                            type="button"
                                            onClick={() => setIsEditingEcrUri(!isEditingEcrUri)}
                                            className="absolute right-3 top-8 p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                            title={isEditingEcrUri ? "Lock value" : "Edit value"}
                                        >
                                            <Pencil size={14} className={isEditingEcrUri ? "text-blue-600" : ""} />
                                        </button>
                                    )}
                                </div>
                                <div className="relative">
                                    <Controller
                                        name="horizonConfig.deploy.agentCoreConfig.imageTag"
                                        control={control}
                                        rules={{ required: isAgentCore ? 'Image Tag is required' : false }}
                                        render={({ field }) => (
                                            <Input
                                                label="Image Tag"
                                                placeholder="latest"
                                                value={field.value || ''}
                                                disabled={!isEditingImageTag || isReadOnly}
                                                onChange={field.onChange}
                                                className={cn(!isEditingImageTag && "text-gray-400 dark:text-gray-500")}
                                                isDestructive={!!errors?.horizonConfig?.deploy?.agentCoreConfig?.imageTag}
                                                supportiveText={errors?.horizonConfig?.deploy?.agentCoreConfig?.imageTag?.message as string || (!isEditingImageTag ? 'Default value - click edit to modify' : undefined)}
                                            />
                                        )}
                                    />
                                    {!isReadOnly && (
                                        <button
                                            type="button"
                                            onClick={() => setIsEditingImageTag(!isEditingImageTag)}
                                            className="absolute right-3 top-8 p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                            title={isEditingImageTag ? "Lock value" : "Edit value"}
                                        >
                                            <Pencil size={14} className={isEditingImageTag ? "text-blue-600" : ""} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Runtime Settings Section */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                Runtime Settings
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Controller
                                    name="horizonConfig.deploy.agentCoreConfig.idleTimeout"
                                    control={control}
                                    rules={{
                                        required: isAgentCore ? 'Idle Timeout is required' : false,
                                        min: isAgentCore ? { value: 60, message: 'Minimum 60 seconds' } : undefined,
                                        max: isAgentCore ? { value: 3600, message: 'Maximum 3600 seconds' } : undefined,
                                    }}
                                    render={({ field }) => (
                                        <Input
                                            type="number"
                                            label="Idle Timeout (seconds)"
                                            placeholder="300"
                                            value={field.value ?? 300}
                                            disabled={isReadOnly}
                                            onChange={(e) => field.onChange(parseInt(e.target.value) || 300)}
                                            isDestructive={!!errors?.horizonConfig?.deploy?.agentCoreConfig?.idleTimeout}
                                            supportiveText={errors?.horizonConfig?.deploy?.agentCoreConfig?.idleTimeout?.message as string || 'Time before idle shutdown'}
                                        />
                                    )}
                                />
                                <Controller
                                    name="horizonConfig.deploy.agentCoreConfig.maxLifetime"
                                    control={control}
                                    rules={{
                                        required: isAgentCore ? 'Max Lifetime is required' : false,
                                        min: isAgentCore ? { value: 300, message: 'Minimum 300 seconds' } : undefined,
                                        max: isAgentCore ? { value: 86400, message: 'Maximum 86400 seconds (24 hours)' } : undefined,
                                    }}
                                    render={({ field }) => (
                                        <Input
                                            type="number"
                                            label="Max Lifetime (seconds)"
                                            placeholder="3600"
                                            value={field.value ?? 3600}
                                            disabled={isReadOnly}
                                            onChange={(e) => field.onChange(parseInt(e.target.value) || 3600)}
                                            isDestructive={!!errors?.horizonConfig?.deploy?.agentCoreConfig?.maxLifetime}
                                            supportiveText={errors?.horizonConfig?.deploy?.agentCoreConfig?.maxLifetime?.message as string || 'Maximum runtime lifetime'}
                                        />
                                    )}
                                />
                            </div>
                        </div>

                        {/* Runtime Environment Override Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                    Runtime Environment Override
                                </h4>
                                {!isReadOnly && (
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => append({ key: '', value: '' })}
                                        leadingIcon={<Plus size={14} />}
                                    >
                                        Add Variable
                                    </Button>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Configure environment variables as key-value pairs for your runtime
                            </p>
                            <div className="space-y-3">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex items-start gap-3">
                                        <div className="flex-1">
                                            <Controller
                                                name={`horizonConfig.deploy.agentCoreConfig.environmentVariables.${index}.key`}
                                                control={control}
                                                render={({ field: inputField }) => (
                                                    <Input
                                                        placeholder="e.g., LOG_LEVEL"
                                                        value={inputField.value || ''}
                                                        disabled={isReadOnly}
                                                        onChange={inputField.onChange}
                                                    />
                                                )}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <Controller
                                                name={`horizonConfig.deploy.agentCoreConfig.environmentVariables.${index}.value`}
                                                control={control}
                                                render={({ field: inputField }) => (
                                                    <Input
                                                        placeholder="e.g., INFO"
                                                        value={inputField.value || ''}
                                                        disabled={isReadOnly}
                                                        onChange={inputField.onChange}
                                                    />
                                                )}
                                            />
                                        </div>
                                        {!isReadOnly && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="w-9 h-9 text-gray-400 hover:text-red-500"
                                                onClick={() => remove(index)}
                                                disabled={fields.length === 1}
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Connection Validation */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                    Connection Validation
                                </h4>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={handleValidate}
                                    loading={isValidating}
                                    disabled={isReadOnly}
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
                            {allValidated && (
                                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                    <p className="text-sm text-green-700 dark:text-green-300 flex items-center gap-x-2">
                                        <CheckCircle size={16} />
                                        All validations passed. AgentCore connection is ready.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Scaling Policy Section */}
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-x-2 mb-4">
                        <Server size={16} className="text-gray-500" />
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Scaling Policy</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Min Instances */}
                        <Controller
                            name="horizonConfig.deploy.scalingPolicy.minInstances"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    label="Min Instances"
                                    type="number"
                                    min={1}
                                    max={100}
                                    placeholder="1"
                                    value={field.value ?? 1}
                                    disabled={isReadOnly}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                />
                            )}
                        />

                        {/* Max Instances */}
                        <Controller
                            name="horizonConfig.deploy.scalingPolicy.maxInstances"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    label="Max Instances"
                                    type="number"
                                    min={1}
                                    max={100}
                                    placeholder="3"
                                    value={field.value ?? 3}
                                    disabled={isReadOnly}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 3)}
                                />
                            )}
                        />

                        {/* Auto Scale Toggle */}
                        <div className="col-span-1 sm:col-span-2 flex items-center justify-between">
                            <div className="flex flex-col">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Auto Scale
                                </Label>
                                <p className="text-xs text-gray-400">
                                    Automatically scale instances based on load
                                </p>
                            </div>
                            <Controller
                                name="horizonConfig.deploy.scalingPolicy.autoScale"
                                control={control}
                                render={({ field }) => (
                                    <Switch
                                        checked={field.value ?? true}
                                        disabled={isReadOnly}
                                        onCheckedChange={field.onChange}
                                    />
                                )}
                            />
                        </div>

                        {/* Conditional Threshold Fields */}
                        {autoScale && (
                            <>
                                <Controller
                                    name="horizonConfig.deploy.scalingPolicy.scaleUpThreshold"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            label="Scale Up Threshold (%)"
                                            type="number"
                                            min={1}
                                            max={100}
                                            placeholder="80"
                                            value={field.value ?? 80}
                                            disabled={isReadOnly}
                                            onChange={(e) => field.onChange(parseInt(e.target.value) || 80)}
                                        />
                                    )}
                                />

                                <Controller
                                    name="horizonConfig.deploy.scalingPolicy.scaleDownThreshold"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            label="Scale Down Threshold (%)"
                                            type="number"
                                            min={1}
                                            max={100}
                                            placeholder="20"
                                            value={field.value ?? 20}
                                            disabled={isReadOnly}
                                            onChange={(e) => field.onChange(parseInt(e.target.value) || 20)}
                                        />
                                    )}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeployConfigSection;
