'use client';

import React, { useState, useCallback } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogBody,
} from '@/components/atoms/dialog';
import { Button, Badge, Input, Select } from '@/components/atoms';
import { RadioGroup, RadioGroupItem } from '@/components/atoms/radio-group';
import { Label } from '@/components/atoms/label';
import { Checkbox } from '@/components/atoms/checkbox';
import { ScrollArea } from '@/components/atoms/scroll-area';
import { BannerInfo } from '@/components/atoms/banner-info';
import { cn } from '@/lib/utils';
import {
    CircleFadingArrowUp,
    Server,
    Cloud,
    CheckCircle,
    Clock,
    AlertCircle,
    Play,
    Package,
    Upload,
    FileCheck,
    Activity,
    Box,
    Database,
    ExternalLink,
    Loader2,
    RefreshCw,
} from 'lucide-react';
import {
    ExecutionRuntime,
    SourceType,
    RuntimeConnection,
    DeploymentStepInfo,
    PublishWizardState,
    S3SourceConfig,
    ECRSourceConfig,
} from './types';

// Mock data
const mockRuntimeConnections: RuntimeConnection[] = [
    { id: '1', name: 'DemoRT3', region: 'us-east-1', status: 'ready' },
    { id: '2', name: 'DemoRT2', region: 'us-east-1', status: 'ready' },
    { id: '3', name: 'DemoRT1', region: 'us-east-1', status: 'busy' },
];

const initialDeploymentSteps: DeploymentStepInfo[] = [
    { id: 'compile', name: 'Compile Workflow', status: 'pending' },
    { id: 'package', name: 'Package Artifact', status: 'pending' },
    { id: 'push', name: 'Push Artifact', status: 'pending' },
    { id: 'register', name: 'Register with AgentCore', status: 'pending' },
    { id: 'healthcheck', name: 'Health Check', status: 'pending' },
];

interface AgentCorePublishModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    workflowName?: string;
    workflowVersion?: string;
}

// Step Indicator Component
const StepIndicator = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => {
    return (
        <div className="flex items-center gap-x-2 mb-6">
            {Array.from({ length: totalSteps }, (_, i) => (
                <React.Fragment key={i}>
                    <div
                        className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                            i + 1 === currentStep
                                ? 'bg-blue-600 text-white'
                                : i + 1 < currentStep
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 text-gray-500 dark:bg-gray-700'
                        )}
                    >
                        {i + 1 < currentStep ? <CheckCircle size={16} /> : i + 1}
                    </div>
                    {i < totalSteps - 1 && (
                        <div
                            className={cn(
                                'flex-1 h-0.5',
                                i + 1 < currentStep ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                            )}
                        />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

// Step 1: Workflow Info & Runtime Selection
const Step1RuntimeSelection = ({
    workflowName,
    workflowVersion,
    executionRuntime,
    onRuntimeChange,
}: {
    workflowName: string;
    workflowVersion: string;
    executionRuntime: ExecutionRuntime;
    onRuntimeChange: (runtime: ExecutionRuntime) => void;
}) => {
    return (
        <div className="space-y-6">
            {/* Workflow Summary */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
                    Workflow Summary
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-gray-500 dark:text-gray-400">Name:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                            {workflowName}
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-500 dark:text-gray-400">Version:</span>
                        <Badge variant="default" className="ml-2">
                            v{workflowVersion}
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Execution Runtime Selection */}
            <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    Select Execution Runtime
                </h4>
                <RadioGroup
                    value={executionRuntime}
                    onValueChange={(v) => onRuntimeChange(v as ExecutionRuntime)}
                    className="grid grid-cols-2 gap-4"
                >
                    <Label
                        htmlFor="kaya-default"
                        className={cn(
                            'flex items-start gap-x-3 p-4 border rounded-[16px] cursor-pointer transition-all',
                            executionRuntime === 'kaya-default'
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        )}
                    >
                        <RadioGroupItem value="kaya-default" id="kaya-default" className="mt-1" />
                        <div>
                            <div className="flex items-center gap-x-2">
                                <Server size={18} className="text-blue-600" />
                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                    KAYA Default Engine
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Run on KAYA&apos;s managed infrastructure
                            </p>
                        </div>
                    </Label>

                    <Label
                        htmlFor="aws-agentcore"
                        className={cn(
                            'flex items-start gap-x-3 p-4 border rounded-[16px] cursor-pointer transition-all',
                            executionRuntime === 'aws-agentcore'
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        )}
                    >
                        <RadioGroupItem value="aws-agentcore" id="aws-agentcore" className="mt-1" />
                        <div>
                            <div className="flex items-center gap-x-2">
                                <Cloud size={18} className="text-amber-600" />
                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                    AWS AgentCore Runtime
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Deploy to your AWS AgentCore cluster
                            </p>
                        </div>
                    </Label>
                </RadioGroup>
            </div>
        </div>
    );
};

// Step 2: Runtime Connection Selection
const Step2RuntimeConnection = ({
    selectedRuntime,
    onRuntimeSelect,
}: {
    selectedRuntime: string;
    onRuntimeSelect: (id: string) => void;
}) => {
    const selectedConnection = mockRuntimeConnections.find((r) => r.id === selectedRuntime);

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    Select Runtime Connection
                </h4>
                <Select
                    label="AgentCore Runtime"
                    placeholder="Choose a runtime connection"
                    options={mockRuntimeConnections.map((r) => ({
                        name: `${r.name} (${r.region})`,
                        value: r.id,
                        disabled: r.status !== 'ready',
                    }))}
                    value={selectedRuntime}
                    onChange={(e) => onRuntimeSelect(e.target.value)}
                />
            </div>

            {selectedConnection && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-x-2">
                        <CheckCircle size={18} className="text-green-600" />
                        <span className="font-medium text-green-800 dark:text-green-200">
                            AgentCore Ready
                        </span>
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        {selectedConnection.name} ({selectedConnection.region})
                    </p>
                </div>
            )}
        </div>
    );
};

// Step 3: Source Type Selection
const Step3SourceType = ({
    sourceType,
    onSourceTypeChange,
    s3Config,
    onS3ConfigChange,
    ecrConfig,
    onEcrConfigChange,
}: {
    sourceType: SourceType;
    onSourceTypeChange: (type: SourceType) => void;
    s3Config: S3SourceConfig;
    onS3ConfigChange: (config: Partial<S3SourceConfig>) => void;
    ecrConfig: ECRSourceConfig;
    onEcrConfigChange: (config: Partial<ECRSourceConfig>) => void;
}) => {
    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    Select Source Type
                </h4>
                <RadioGroup
                    value={sourceType}
                    onValueChange={(v) => onSourceTypeChange(v as SourceType)}
                    className="grid grid-cols-2 gap-4"
                >
                    <Label
                        htmlFor="s3"
                        className={cn(
                            'flex items-start gap-x-3 p-4 border rounded-[16px] cursor-pointer transition-all',
                            sourceType === 's3'
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        )}
                    >
                        <RadioGroupItem value="s3" id="s3" className="mt-1" />
                        <div>
                            <div className="flex items-center gap-x-2">
                                <Database size={18} className="text-amber-600" />
                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                    S3 Bucket
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Upload workflow package to S3
                            </p>
                        </div>
                    </Label>

                    <Label
                        htmlFor="ecr"
                        className={cn(
                            'flex items-start gap-x-3 p-4 border rounded-[16px] cursor-pointer transition-all',
                            sourceType === 'ecr'
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        )}
                    >
                        <RadioGroupItem value="ecr" id="ecr" className="mt-1" />
                        <div>
                            <div className="flex items-center gap-x-2">
                                <Box size={18} className="text-sky-600" />
                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                    ECR Container
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Deploy as container image
                            </p>
                        </div>
                    </Label>
                </RadioGroup>
            </div>

            {/* Source Configuration */}
            {sourceType === 's3' ? (
                <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <Input
                        label="Bucket Name"
                        placeholder="my-agentcore-bucket"
                        value={s3Config.bucketName}
                        onChange={(e) => onS3ConfigChange({ bucketName: e.target.value })}
                    />
                    <Input
                        label="Object Prefix"
                        placeholder="workflows/v13/"
                        value={s3Config.objectPrefix}
                        onChange={(e) => onS3ConfigChange({ objectPrefix: e.target.value })}
                    />
                    <div className="flex items-center gap-x-2">
                        <Checkbox
                            id="versioning"
                            checked={s3Config.enableVersioning}
                            onCheckedChange={(checked) =>
                                onS3ConfigChange({ enableVersioning: !!checked })
                            }
                        />
                        <Label htmlFor="versioning" className="text-sm text-gray-700 dark:text-gray-300">
                            Enable S3 versioning
                        </Label>
                    </div>
                    <BannerInfo
                        icon="ri-alert-line"
                        label={
                            <span className="text-xs text-amber-700 dark:text-amber-300">
                                Ensure your S3 bucket has the correct IAM policies for AgentCore access
                            </span>
                        }
                    />
                </div>
            ) : (
                <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <Input
                        label="Registry URI"
                        placeholder="123456789.dkr.ecr.us-east-1.amazonaws.com/my-repo"
                        value={ecrConfig.registryUri}
                        onChange={(e) => onEcrConfigChange({ registryUri: e.target.value })}
                    />
                    <Input
                        label="Image Tag"
                        placeholder="v13.0"
                        value={ecrConfig.imageTag}
                        onChange={(e) => onEcrConfigChange({ imageTag: e.target.value })}
                    />
                    <Input
                        label="IAM Role ARN"
                        placeholder="arn:aws:iam::123456789:role/ecr-pull-role"
                        value={ecrConfig.iamRoleArn}
                        onChange={(e) => onEcrConfigChange({ iamRoleArn: e.target.value })}
                    />
                </div>
            )}
        </div>
    );
};

// Step 4: Deployment Progress
const Step4Deployment = ({
    steps,
    isDeploying,
    onStartDeploy,
    onRerun,
}: {
    steps: DeploymentStepInfo[];
    isDeploying: boolean;
    onStartDeploy: () => void;
    onRerun: () => void;
}) => {
    const allSuccess = steps.every((s) => s.status === 'success');
    const hasError = steps.some((s) => s.status === 'error');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    Deployment Progress
                </h4>
                {!isDeploying && !allSuccess && (
                    <Button size="sm" onClick={onStartDeploy} leadingIcon={<Play size={14} />}>
                        Start Deployment
                    </Button>
                )}
                {hasError && (
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={onRerun}
                        leadingIcon={<RefreshCw size={14} />}
                    >
                        Re-run
                    </Button>
                )}
            </div>

            {/* Deployment Steps */}
            <div className="space-y-2">
                {steps.map((step, index) => (
                    <div
                        key={step.id}
                        className={cn(
                            'flex items-center justify-between p-3 rounded-lg border transition-all',
                            step.status === 'success'
                                ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                                : step.status === 'running'
                                ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                                : step.status === 'error'
                                ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                                : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                        )}
                    >
                        <div className="flex items-center gap-x-3">
                            <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium">
                                {index + 1}
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                {step.name}
                            </span>
                        </div>
                        <div className="flex items-center gap-x-2">
                            {step.timestamp && (
                                <span className="text-xs text-gray-500">{step.timestamp}</span>
                            )}
                            {step.status === 'pending' && (
                                <Clock size={16} className="text-gray-400" />
                            )}
                            {step.status === 'running' && (
                                <Loader2 size={16} className="text-blue-600 animate-spin" />
                            )}
                            {step.status === 'success' && (
                                <CheckCircle size={16} className="text-green-600" />
                            )}
                            {step.status === 'error' && (
                                <AlertCircle size={16} className="text-red-600" />
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Console Output */}
            <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs text-green-400 max-h-[150px] overflow-y-auto">
                {steps
                    .filter((s) => s.status !== 'pending')
                    .map((step) => (
                        <div key={step.id} className="mb-1">
                            <span className="text-gray-500">[{step.timestamp}]</span>{' '}
                            <span
                                className={
                                    step.status === 'error' ? 'text-red-400' : 'text-green-400'
                                }
                            >
                                {step.name}: {step.message || (step.status === 'success' ? 'Complete' : 'In progress...')}
                            </span>
                        </div>
                    ))}
            </div>
        </div>
    );
};

// Success Panel
const SuccessPanel = ({
    workflowVersion,
    selectedRuntime,
    sourceType,
    deploymentId,
    onGoToPlayground,
}: {
    workflowVersion: string;
    selectedRuntime: string;
    sourceType: SourceType;
    deploymentId: string;
    onGoToPlayground: () => void;
}) => {
    const runtime = mockRuntimeConnections.find((r) => r.id === selectedRuntime);

    return (
        <div className="text-center py-8 space-y-6">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
                <CheckCircle size={32} className="text-green-600" />
            </div>
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Deployment Successful
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Your workflow has been deployed to AgentCore
                </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-left space-y-3">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Version:</span>
                    <Badge variant="default">v{workflowVersion}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Runtime:</span>
                    <span className="font-medium">{runtime?.name} ({runtime?.region})</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Artifact Type:</span>
                    <span className="font-medium">{sourceType.toUpperCase()}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Deployment ID:</span>
                    <span className="font-mono text-xs">{deploymentId}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Status:</span>
                    <Badge variant="success">Active</Badge>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Deployed:</span>
                    <span className="font-medium">{new Date().toLocaleString()}</span>
                </div>
            </div>

            <Button onClick={onGoToPlayground} trailingIcon={<ExternalLink size={14} />}>
                Go to Playground
            </Button>
        </div>
    );
};

// Main Modal Component
export const AgentCorePublishModal = ({
    open,
    onOpenChange,
    workflowName = 'Customer Support Agent',
    workflowVersion = '13.0',
}: AgentCorePublishModalProps) => {
    const [state, setState] = useState<PublishWizardState>({
        step: 1,
        workflowName,
        workflowVersion,
        executionRuntime: 'aws-agentcore',
        selectedRuntime: '',
        sourceType: 's3',
        s3Config: { bucketName: '', objectPrefix: '', enableVersioning: false },
        ecrConfig: { registryUri: '', imageTag: '', iamRoleArn: '' },
        deploymentSteps: initialDeploymentSteps,
        isDeploying: false,
        deploymentComplete: false,
        deploymentId: '',
    });

    const totalSteps = state.executionRuntime === 'aws-agentcore' ? 4 : 2;

    const handleNext = () => {
        if (state.step < totalSteps) {
            setState((prev) => ({ ...prev, step: prev.step + 1 }));
        }
    };

    const handleBack = () => {
        if (state.step > 1) {
            setState((prev) => ({ ...prev, step: prev.step - 1 }));
        }
    };

    const handleStartDeploy = useCallback(async () => {
        setState((prev) => ({ ...prev, isDeploying: true }));

        const runStep = async (index: number) => {
            setState((prev) => ({
                ...prev,
                deploymentSteps: prev.deploymentSteps.map((s, i) =>
                    i === index ? { ...s, status: 'running' as const } : s
                ),
            }));

            await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 400));

            setState((prev) => ({
                ...prev,
                deploymentSteps: prev.deploymentSteps.map((s, i) =>
                    i === index
                        ? {
                              ...s,
                              status: 'success' as const,
                              timestamp: new Date().toLocaleTimeString(),
                              message: 'Completed successfully',
                          }
                        : s
                ),
            }));
        };

        for (let i = 0; i < initialDeploymentSteps.length; i++) {
            await runStep(i);
        }

        setState((prev) => ({
            ...prev,
            isDeploying: false,
            deploymentComplete: true,
            deploymentId: `dep-${Date.now().toString(36)}`,
        }));
    }, []);

    const handleRerun = () => {
        setState((prev) => ({
            ...prev,
            deploymentSteps: initialDeploymentSteps,
            deploymentComplete: false,
        }));
    };

    const handleGoToPlayground = () => {
        onOpenChange(false);
        // Navigate to playground
    };

    const canProceed = () => {
        switch (state.step) {
            case 1:
                return true;
            case 2:
                return state.executionRuntime === 'kaya-default' || !!state.selectedRuntime;
            case 3:
                return state.sourceType === 's3'
                    ? !!state.s3Config.bucketName
                    : !!state.ecrConfig.registryUri;
            case 4:
                return state.deploymentComplete;
            default:
                return false;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden">
                <DialogHeader className="px-6 py-4 flex flex-row gap-x-3 items-center">
                    <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-blue-500 to-sky-400 rounded-lg">
                        <CircleFadingArrowUp size={20} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Publish Workflow
                        </h2>
                        <div className="flex items-center gap-x-2 mt-0.5">
                            <Badge variant="secondary">Published v{workflowVersion}</Badge>
                            <span className="text-xs text-gray-500">AgentCore</span>
                        </div>
                    </div>
                </DialogHeader>

                <DialogBody className="px-6 py-4">
                    {state.executionRuntime === 'aws-agentcore' && !state.deploymentComplete && (
                        <StepIndicator currentStep={state.step} totalSteps={totalSteps} />
                    )}

                    <ScrollArea className="max-h-[400px] pr-2">
                        {state.deploymentComplete ? (
                            <SuccessPanel
                                workflowVersion={state.workflowVersion}
                                selectedRuntime={state.selectedRuntime}
                                sourceType={state.sourceType}
                                deploymentId={state.deploymentId}
                                onGoToPlayground={handleGoToPlayground}
                            />
                        ) : (
                            <>
                                {state.step === 1 && (
                                    <Step1RuntimeSelection
                                        workflowName={state.workflowName}
                                        workflowVersion={state.workflowVersion}
                                        executionRuntime={state.executionRuntime}
                                        onRuntimeChange={(runtime) =>
                                            setState((prev) => ({ ...prev, executionRuntime: runtime }))
                                        }
                                    />
                                )}
                                {state.step === 2 && state.executionRuntime === 'aws-agentcore' && (
                                    <Step2RuntimeConnection
                                        selectedRuntime={state.selectedRuntime}
                                        onRuntimeSelect={(id) =>
                                            setState((prev) => ({ ...prev, selectedRuntime: id }))
                                        }
                                    />
                                )}
                                {state.step === 3 && (
                                    <Step3SourceType
                                        sourceType={state.sourceType}
                                        onSourceTypeChange={(type) =>
                                            setState((prev) => ({ ...prev, sourceType: type }))
                                        }
                                        s3Config={state.s3Config}
                                        onS3ConfigChange={(config) =>
                                            setState((prev) => ({
                                                ...prev,
                                                s3Config: { ...prev.s3Config, ...config },
                                            }))
                                        }
                                        ecrConfig={state.ecrConfig}
                                        onEcrConfigChange={(config) =>
                                            setState((prev) => ({
                                                ...prev,
                                                ecrConfig: { ...prev.ecrConfig, ...config },
                                            }))
                                        }
                                    />
                                )}
                                {state.step === 4 && (
                                    <Step4Deployment
                                        steps={state.deploymentSteps}
                                        isDeploying={state.isDeploying}
                                        onStartDeploy={handleStartDeploy}
                                        onRerun={handleRerun}
                                    />
                                )}
                            </>
                        )}
                    </ScrollArea>
                </DialogBody>

                {!state.deploymentComplete && (
                    <DialogFooter className="px-6 py-4">
                        <Button variant="secondary" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <div className="flex gap-x-2">
                            {state.step > 1 && (
                                <Button variant="secondary" onClick={handleBack}>
                                    Back
                                </Button>
                            )}
                            {state.step < totalSteps ? (
                                <Button onClick={handleNext} disabled={!canProceed()}>
                                    Next
                                </Button>
                            ) : (
                                !state.deploymentComplete &&
                                state.deploymentSteps.every((s) => s.status === 'success') && (
                                    <Button onClick={handleGoToPlayground}>
                                        Go to Playground
                                    </Button>
                                )
                            )}
                        </div>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
};
