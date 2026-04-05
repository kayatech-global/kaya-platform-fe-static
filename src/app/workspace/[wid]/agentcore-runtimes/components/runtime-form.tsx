'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
    Sheet, 
    SheetContent, 
    SheetHeader, 
    SheetTitle,
    SheetDescription 
} from '@/components/atoms/sheet';
import { Button, Input, Select } from '@/components/atoms';
import { Textarea } from '@/components/atoms/textarea';
import { BannerInfo } from '@/components/atoms/banner-info';
import { Badge } from '@/components/atoms/badge';
import { ScrollArea } from '@/components/atoms/scroll-area';
import { 
    CheckCircle, 
    Clock, 
    AlertCircle,
    ExternalLink,
    Shield,
    Key,
    Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { RuntimeFormData, ValidationStatus } from '../types';
import { awsRegions, secretOptions } from '../mock-data';

const formSchema = z.object({
    name: z.string().min(1, 'Runtime name is required').max(50, 'Name must be less than 50 characters'),
    description: z.string().max(200, 'Description must be less than 200 characters').optional(),
    accessKey: z.string().min(1, 'Access key is required'),
    secretAccessKey: z.string().min(1, 'Secret access key is required'),
    region: z.string().min(1, 'Region is required'),
    roleArn: z.string().min(1, 'Role ARN is required'),
    idleTimeout: z.coerce.number().min(60, 'Minimum 60 seconds').max(3600, 'Maximum 3600 seconds'),
    maxLifetime: z.coerce.number().min(300, 'Minimum 300 seconds').max(86400, 'Maximum 86400 seconds'),
});

interface RuntimeFormProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: RuntimeFormData) => void;
    isEdit?: boolean;
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
    onOpenChange,
    onSubmit,
    isEdit = false,
    initialData,
}: RuntimeFormProps) => {
    const [validationStatus, setValidationStatus] = useState<ValidationStatus>({
        iamRole: 'pending',
        vaultSecret: 'pending',
        healthCheck: 'pending',
    });
    const [isValidating, setIsValidating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        reset,
    } = useForm<RuntimeFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData?.name || '',
            description: initialData?.description || '',
            accessKey: initialData?.accessKey || '',
            secretAccessKey: initialData?.secretAccessKey || '',
            region: initialData?.region || '',
            roleArn: initialData?.roleArn || '',
            idleTimeout: initialData?.idleTimeout || 300,
            maxLifetime: initialData?.maxLifetime || 3600,
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

    const handleFormSubmit = async (data: RuntimeFormData) => {
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        onSubmit(data);
        setIsSaving(false);
        onOpenChange(false);
        reset();
    };

    const handleClose = () => {
        onOpenChange(false);
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

    return (
        <Sheet open={isOpen} onOpenChange={handleClose}>
            <SheetContent 
                side="right" 
                className="w-[600px] sm:max-w-[600px] p-0 overflow-hidden"
                hideClose
            >
                <SheetHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-sky-500">
                    <SheetTitle className="text-white text-lg">
                        {isEdit ? 'Edit Runtime' : 'New Runtime'}
                    </SheetTitle>
                    <SheetDescription className="text-blue-100">
                        Configure your AWS AgentCore runtime connection
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="h-[calc(100vh-180px)]">
                    <div className="p-6 space-y-6">
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
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-x-2">
                                <div className="w-6 h-6 rounded bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                    <span className="text-xs font-bold text-blue-600">1</span>
                                </div>
                                Runtime Information
                            </h3>
                            <div className="grid gap-4 pl-8">
                                <Input
                                    {...register('name')}
                                    label="Runtime Name"
                                    placeholder="e.g., prod-agentcore-runtime"
                                    isDestructive={!!errors.name}
                                    supportiveText={errors.name?.message}
                                />
                                <Textarea
                                    {...register('description')}
                                    label="Description"
                                    placeholder="Optional description for this runtime..."
                                    rows={3}
                                    className="resize-none"
                                />
                            </div>
                        </div>

                        {/* AWS Credentials Section */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-x-2">
                                <div className="w-6 h-6 rounded bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                    <span className="text-xs font-bold text-blue-600">2</span>
                                </div>
                                AWS Credentials
                            </h3>
                            <div className="grid gap-4 pl-8">
                                <Input
                                    {...register('accessKey')}
                                    label="Access Key ID"
                                    placeholder="AKIAIOSFODNN7EXAMPLE"
                                    isDestructive={!!errors.accessKey}
                                    supportiveText={errors.accessKey?.message}
                                />
                                <Select
                                    {...register('secretAccessKey')}
                                    label="Secret Access Key"
                                    placeholder="Select from Vault"
                                    options={secretOptions}
                                    isDestructive={!!errors.secretAccessKey}
                                    supportiveText={errors.secretAccessKey?.message}
                                    isVault
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <Select
                                        {...register('region')}
                                        label="AWS Region"
                                        placeholder="Select region"
                                        options={awsRegions}
                                        isDestructive={!!errors.region}
                                        supportiveText={errors.region?.message}
                                    />
                                    <Input
                                        {...register('roleArn')}
                                        label="Role ARN"
                                        placeholder="arn:aws:iam::123456789:role/..."
                                        isDestructive={!!errors.roleArn}
                                        supportiveText={errors.roleArn?.message}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Execution Settings Section */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-x-2">
                                <div className="w-6 h-6 rounded bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                    <span className="text-xs font-bold text-blue-600">3</span>
                                </div>
                                Execution Settings
                            </h3>
                            <div className="grid grid-cols-2 gap-4 pl-8">
                                <Input
                                    {...register('idleTimeout')}
                                    type="number"
                                    label="Idle Timeout (seconds)"
                                    placeholder="300"
                                    isDestructive={!!errors.idleTimeout}
                                    supportiveText={errors.idleTimeout?.message || 'Time before idle shutdown'}
                                />
                                <Input
                                    {...register('maxLifetime')}
                                    type="number"
                                    label="Max Lifetime (seconds)"
                                    placeholder="3600"
                                    isDestructive={!!errors.maxLifetime}
                                    supportiveText={errors.maxLifetime?.message || 'Maximum runtime duration'}
                                />
                            </div>
                        </div>

                        {/* Validation Cards */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-x-2">
                                <div className="w-6 h-6 rounded bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                    <span className="text-xs font-bold text-blue-600">4</span>
                                </div>
                                Connection Validation
                            </h3>
                            <div className="space-y-2 pl-8">
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
                </ScrollArea>

                {/* Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                    <Button
                        variant="secondary"
                        onClick={handleValidate}
                        loading={isValidating}
                        disabled={isValidating || isSaving}
                    >
                        {isValidating ? 'Validating...' : 'Validate Connection'}
                    </Button>
                    <div className="flex gap-x-2">
                        <Button variant="secondary" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit(handleFormSubmit)}
                            loading={isSaving}
                            disabled={!allValidated || isSaving}
                        >
                            {isSaving ? 'Saving...' : 'Save Runtime'}
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};
