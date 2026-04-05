'use client';

import { Button, Textarea, Badge, Input, Progress } from '@/components/atoms';
import { BannerInfo } from '@/components/atoms/banner-info';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogBody } from '@/components/atoms/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/atoms/radio-group';
import { Select } from '@/components/atoms/select';
import { Label } from '@/components/atoms/label';
import { useWorkflowPublish } from '@/hooks/useWorkflowPublish';
import { validateSpaces, cn } from '@/lib/utils';
import { IWorkflowTypes } from '@/models';
import { CircleFadingArrowUp, SaveOff, Server, Cloud, CheckCircle2, XCircle, Loader2, Play, ArrowLeft, ArrowRight, Upload, Box, Database } from 'lucide-react';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';

interface PublishWorkflowModalContainerProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    version?: string;
    refetchGraph: () => void;
    isDraft?: boolean;
    availableVersions?: IWorkflowTypes[];
    openSaveConfirmationModal: boolean;
    setOpenSaveConfirmationModal: React.Dispatch<React.SetStateAction<boolean>>;
}

// Mock data for AgentCore runtimes
const MOCK_RUNTIMES = [
    { id: 'rt-001', name: 'Production Runtime', region: 'us-east-1', status: 'deployed' },
    { id: 'rt-002', name: 'Staging Runtime', region: 'us-west-2', status: 'deployed' },
    { id: 'rt-003', name: 'Dev Runtime', region: 'eu-west-1', status: 'queued' },
];

type ExecutionRuntime = 'kaya-default' | 'aws-agentcore';
type SourceType = 's3' | 'ecr';
type DeploymentStep = 'pending' | 'running' | 'completed' | 'error';

interface DeploymentLogEntry {
    timestamp: string;
    message: string;
    type: 'info' | 'success' | 'error';
}

export const PublishWorkflowModalContainer = ({
    open,
    setOpen,
    refetchGraph,
    availableVersions,
    openSaveConfirmationModal,
    setOpenSaveConfirmationModal,
}: PublishWorkflowModalContainerProps) => {
    const { register, watch, errors, onSubmit, handleModalCancel, isSuccessfullyPublished, isPublishing } =
        useWorkflowPublish(open, refetchGraph, setOpen, availableVersions);

    // AgentCore specific state
    const [executionRuntime, setExecutionRuntime] = useState<ExecutionRuntime>('kaya-default');
    const [agentCoreStep, setAgentCoreStep] = useState(1);
    const [selectedRuntime, setSelectedRuntime] = useState('');
    const [sourceType, setSourceType] = useState<SourceType>('s3');
    const [s3BucketPath, setS3BucketPath] = useState('');
    const [ecrImageUri, setEcrImageUri] = useState('');
    const [isDeploying, setIsDeploying] = useState(false);
    const [deploymentComplete, setDeploymentComplete] = useState(false);
    const [deploymentSteps, setDeploymentSteps] = useState<{ name: string; status: DeploymentStep }[]>([
        { name: 'Validating configuration', status: 'pending' },
        { name: 'Packaging workflow', status: 'pending' },
        { name: 'Uploading to runtime', status: 'pending' },
        { name: 'Starting deployment', status: 'pending' },
        { name: 'Health check', status: 'pending' },
    ]);
    const [deploymentLogs, setDeploymentLogs] = useState<DeploymentLogEntry[]>([]);
    const [deploymentProgress, setDeploymentProgress] = useState(0);

    // Reset AgentCore state when modal closes
    useEffect(() => {
        if (!open) {
            setExecutionRuntime('kaya-default');
            setAgentCoreStep(1);
            setSelectedRuntime('');
            setSourceType('s3');
            setS3BucketPath('');
            setEcrImageUri('');
            setIsDeploying(false);
            setDeploymentComplete(false);
            setDeploymentSteps([
                { name: 'Validating configuration', status: 'pending' },
                { name: 'Packaging workflow', status: 'pending' },
                { name: 'Uploading to runtime', status: 'pending' },
                { name: 'Starting deployment', status: 'pending' },
                { name: 'Health check', status: 'pending' },
            ]);
            setDeploymentLogs([]);
            setDeploymentProgress(0);
        }
    }, [open]);

    // Simulate deployment process
    const startDeployment = async () => {
        setIsDeploying(true);
        setDeploymentLogs([]);
        setDeploymentProgress(0);

        const logMessages = [
            { message: 'Initializing deployment pipeline...', type: 'info' as const },
            { message: 'Validating workflow configuration', type: 'info' as const },
            { message: 'Configuration validated successfully', type: 'success' as const },
            { message: 'Packaging workflow artifacts...', type: 'info' as const },
            { message: 'Workflow packaged (2.4 MB)', type: 'success' as const },
            { message: 'Connecting to AgentCore runtime...', type: 'info' as const },
            { message: 'Connection established', type: 'success' as const },
            { message: 'Uploading to runtime cluster...', type: 'info' as const },
            { message: 'Upload complete', type: 'success' as const },
            { message: 'Starting deployment process...', type: 'info' as const },
            { message: 'Deployment initiated', type: 'success' as const },
            { message: 'Running health checks...', type: 'info' as const },
            { message: 'All health checks passed', type: 'success' as const },
            { message: 'Deployment completed successfully!', type: 'success' as const },
        ];

        for (let i = 0; i < deploymentSteps.length; i++) {
            // Update step to running
            setDeploymentSteps(prev => prev.map((step, idx) => 
                idx === i ? { ...step, status: 'running' } : step
            ));

            // Add corresponding logs
            const logsForStep = logMessages.slice(i * 2, i * 2 + 2);
            for (const log of logsForStep) {
                await new Promise(resolve => setTimeout(resolve, 500));
                setDeploymentLogs(prev => [...prev, { 
                    timestamp: new Date().toISOString(), 
                    message: log.message, 
                    type: log.type 
                }]);
            }

            await new Promise(resolve => setTimeout(resolve, 800));
            setDeploymentProgress((i + 1) * 20);

            // Update step to completed
            setDeploymentSteps(prev => prev.map((step, idx) => 
                idx === i ? { ...step, status: 'completed' } : step
            ));
        }

        setIsDeploying(false);
        setDeploymentComplete(true);
    };

    const handleAgentCoreNext = () => {
        if (agentCoreStep < 4) {
            if (agentCoreStep === 3) {
                // Start deployment when moving to step 4
                setAgentCoreStep(4);
                startDeployment();
            } else {
                setAgentCoreStep(agentCoreStep + 1);
            }
        }
    };

    const handleAgentCoreBack = () => {
        if (agentCoreStep > 1) {
            setAgentCoreStep(agentCoreStep - 1);
        }
    };

    const canProceedToNextStep = () => {
        switch (agentCoreStep) {
            case 1:
                return true;
            case 2:
                return selectedRuntime !== '';
            case 3:
                return sourceType === 's3' ? s3BucketPath !== '' : ecrImageUri !== '';
            default:
                return false;
        }
    };

    const getStepTitle = () => {
        switch (agentCoreStep) {
            case 1:
                return 'Select Runtime Connection';
            case 2:
                return 'Configure Runtime';
            case 3:
                return 'Configure Source';
            case 4:
                return deploymentComplete ? 'Deployment Complete' : 'Deploying...';
            default:
                return '';
        }
    };

    // Render AgentCore wizard content
    const renderAgentCoreContent = () => {
        if (deploymentComplete) {
            return (
                <div className="flex flex-col items-center justify-center py-8 gap-y-6">
                    <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            Deployment Successful
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Your workflow has been deployed to the AgentCore runtime.
                        </p>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-left">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Runtime:</span>
                                <span className="text-gray-900 dark:text-gray-100 font-medium">
                                    {MOCK_RUNTIMES.find(r => r.id === selectedRuntime)?.name}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400">Region:</span>
                                <span className="text-gray-900 dark:text-gray-100 font-medium">
                                    {MOCK_RUNTIMES.find(r => r.id === selectedRuntime)?.region}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400">Version:</span>
                                <span className="text-gray-900 dark:text-gray-100 font-medium">
                                    {watch('publishedVersion')}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400">Status:</span>
                                <Badge variant="success">Deployed</Badge>
                            </div>
                        </div>
                    </div>
                    <Button 
                        variant="primary" 
                        onClick={() => window.location.href = `/workspace/${window.location.pathname.split('/')[2]}/agentcore-playground`}
                        className="mt-2"
                    >
                        <Play className="w-4 h-4 mr-2" />
                        Go to Playground
                    </Button>
                </div>
            );
        }

        switch (agentCoreStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Workflow Summary</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Draft Version:</span>
                                <span className="text-gray-900 dark:text-gray-100 font-medium">{watch('draftVersion')}</span>
                                <span className="text-gray-500 dark:text-gray-400">Publish Version:</span>
                                <span className="text-gray-900 dark:text-gray-100 font-medium">{watch('publishedVersion')}</span>
                            </div>
                        </div>

                        <div>
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                                Select Runtime Connection
                            </Label>
                            <Select
                                value={selectedRuntime}
                                onChange={(e) => setSelectedRuntime(e.target.value)}
                                options={[
                                    { value: '', name: 'Select a runtime...' },
                                    ...MOCK_RUNTIMES.map(rt => ({
                                        value: rt.id,
                                        name: `${rt.name} (${rt.region})`,
                                    }))
                                ]}
                                className="w-full"
                            />
                        </div>

                        {selectedRuntime && (
                            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                                <span className="text-sm text-green-700 dark:text-green-300">
                                    Runtime connection ready
                                </span>
                            </div>
                        )}
                    </div>
                );

            case 2:
                const runtime = MOCK_RUNTIMES.find(r => r.id === selectedRuntime);
                return (
                    <div className="space-y-6">
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Selected Runtime</h4>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                    <Server className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">{runtime?.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{runtime?.region}</p>
                                </div>
                                <Badge variant={runtime?.status === 'deployed' ? 'success' : 'warning'} className="ml-auto">
                                    {runtime?.status === 'deployed' ? 'Ready' : 'Queued'}
                                </Badge>
                            </div>
                        </div>

                        <BannerInfo
                            label={
                                <p className="text-sm text-blue-600 dark:text-blue-400">
                                    The workflow will be deployed to the selected runtime. Make sure the runtime has the required resources and permissions.
                                </p>
                            }
                            icon="ri-information-2-fill"
                        />
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <div>
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                                Source Type
                            </Label>
                            <RadioGroup value={sourceType} onValueChange={(value) => setSourceType(value as SourceType)} className="grid grid-cols-2 gap-4">
                                <div className={cn(
                                    "relative flex items-center p-4 border rounded-lg cursor-pointer transition-all",
                                    sourceType === 's3' 
                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                                )}>
                                    <RadioGroupItem value="s3" id="s3" className="sr-only" />
                                    <Label htmlFor="s3" className="flex items-center gap-3 cursor-pointer w-full">
                                        <Database className="w-5 h-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">S3 Bucket</p>
                                            <p className="text-xs text-gray-500">Upload from S3</p>
                                        </div>
                                    </Label>
                                </div>
                                <div className={cn(
                                    "relative flex items-center p-4 border rounded-lg cursor-pointer transition-all",
                                    sourceType === 'ecr' 
                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                                )}>
                                    <RadioGroupItem value="ecr" id="ecr" className="sr-only" />
                                    <Label htmlFor="ecr" className="flex items-center gap-3 cursor-pointer w-full">
                                        <Box className="w-5 h-5 text-orange-600" />
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">ECR Container</p>
                                            <p className="text-xs text-gray-500">Deploy from ECR</p>
                                        </div>
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {sourceType === 's3' ? (
                            <div>
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                    S3 Bucket Path
                                </Label>
                                <Input
                                    value={s3BucketPath}
                                    onChange={(e) => setS3BucketPath(e.target.value)}
                                    placeholder="s3://my-bucket/workflows/"
                                    className="w-full"
                                />
                            </div>
                        ) : (
                            <div>
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                    ECR Image URI
                                </Label>
                                <Input
                                    value={ecrImageUri}
                                    onChange={(e) => setEcrImageUri(e.target.value)}
                                    placeholder="123456789.dkr.ecr.us-east-1.amazonaws.com/my-image:latest"
                                    className="w-full"
                                />
                            </div>
                        )}
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Deployment Progress
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {deploymentProgress}%
                                </span>
                            </div>
                            <Progress value={deploymentProgress} className="h-2" />
                        </div>

                        <div className="space-y-2">
                            {deploymentSteps.map((step, index) => (
                                <div key={index} className="flex items-center gap-3 p-2">
                                    {step.status === 'pending' && (
                                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                                    )}
                                    {step.status === 'running' && (
                                        <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                                    )}
                                    {step.status === 'completed' && (
                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    )}
                                    {step.status === 'error' && (
                                        <XCircle className="w-5 h-5 text-red-500" />
                                    )}
                                    <span className={cn(
                                        "text-sm",
                                        step.status === 'pending' && "text-gray-400 dark:text-gray-500",
                                        step.status === 'running' && "text-blue-600 dark:text-blue-400 font-medium",
                                        step.status === 'completed' && "text-gray-700 dark:text-gray-300",
                                        step.status === 'error' && "text-red-600 dark:text-red-400"
                                    )}>
                                        {step.name}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 h-40 overflow-y-auto font-mono text-xs">
                            {deploymentLogs.map((log, index) => (
                                <div key={index} className={cn(
                                    "py-0.5",
                                    log.type === 'info' && "text-gray-400",
                                    log.type === 'success' && "text-green-400",
                                    log.type === 'error' && "text-red-400"
                                )}>
                                    <span className="text-gray-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{' '}
                                    {log.message}
                                </div>
                            ))}
                            {isDeploying && (
                                <div className="text-gray-400 animate-pulse">{'>'} _</div>
                            )}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div>
            {/* Publish form modal */}
            <Dialog open={open} onOpenChange={handleModalCancel}>
                <DialogContent hideCloseButtonClass="block top-6" className="gap-0 max-w-none w-[650px]">
                    <DialogHeader className="px-4 py-4 flex flex-row gap-x-2">
                        <div className="w-8 h-8 flex items-center justify-center bg-blue-200 rounded">
                            <CircleFadingArrowUp size={16} color="#316FED" />
                        </div>
                        <p className="text-md font-semibold text-gray-700 relative bottom-1 dark:text-gray-100">
                            {executionRuntime === 'aws-agentcore' && agentCoreStep > 0
                                ? `Deploy to AgentCore - ${getStepTitle()}`
                                : `Publish Workflow | Draft ${watch('draftVersion')} → ${watch('publishedVersion')}`
                            }
                        </p>
                    </DialogHeader>

                    {/* Step indicator for AgentCore */}
                    {executionRuntime === 'aws-agentcore' && !deploymentComplete && (
                        <div className="px-4 pb-4">
                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 4].map((step) => (
                                    <React.Fragment key={step}>
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                                            step < agentCoreStep && "bg-blue-600 text-white",
                                            step === agentCoreStep && "bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900",
                                            step > agentCoreStep && "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                                        )}>
                                            {step < agentCoreStep ? <CheckCircle2 className="w-4 h-4" /> : step}
                                        </div>
                                        {step < 4 && (
                                            <div className={cn(
                                                "flex-1 h-1 rounded",
                                                step < agentCoreStep ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
                                            )} />
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    )}

                    <DialogBody className="px-4 py-6 flex flex-col gap-y-6">
                        {isSuccessfullyPublished && executionRuntime === 'kaya-default' ? (
                            <div className="w-full flex flex-col gap-y-4 items-center">
                                <Image
                                    src="/png/success-publish.png"
                                    width={100}
                                    height={100}
                                    alt="publish-workflow-success"
                                />
                                <p className="text-md font-semibold text-gray-800 dark:text-gray-100">
                                    Workflow published successfully
                                </p>
                            </div>
                        ) : executionRuntime === 'aws-agentcore' ? (
                            renderAgentCoreContent()
                        ) : (
                            <>
                                <BannerInfo
                                    label={
                                        <p className="text-sm text-blue-600">
                                            Publishing this workflow will create version{' '}
                                            <span className="font-bold">{watch('publishedVersion')}</span> from the
                                            current draft <span className="font-bold">{watch('draftVersion')}</span>
                                        </p>
                                    }
                                    icon="ri-information-2-fill"
                                />

                                {/* Execution Runtime Selection */}
                                <div>
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                                        Execution Runtime
                                    </Label>
                                    <RadioGroup value={executionRuntime} onValueChange={(value) => setExecutionRuntime(value as ExecutionRuntime)} className="grid grid-cols-2 gap-4">
                                        <div className={cn(
                                            "relative flex items-center p-4 border rounded-lg cursor-pointer transition-all",
                                            executionRuntime === 'kaya-default' 
                                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                                                : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                                        )}>
                                            <RadioGroupItem value="kaya-default" id="kaya-default" className="sr-only" />
                                            <Label htmlFor="kaya-default" className="flex items-center gap-3 cursor-pointer w-full">
                                                <Cloud className="w-5 h-5 text-blue-600" />
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-gray-100">KAYA Default</p>
                                                    <p className="text-xs text-gray-500">Standard execution</p>
                                                </div>
                                            </Label>
                                        </div>
                                        <div className={cn(
                                            "relative flex items-center p-4 border rounded-lg cursor-pointer transition-all",
                                            executionRuntime === 'aws-agentcore' 
                                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                                                : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                                        )}>
                                            <RadioGroupItem value="aws-agentcore" id="aws-agentcore" className="sr-only" />
                                            <Label htmlFor="aws-agentcore" className="flex items-center gap-3 cursor-pointer w-full">
                                                <Server className="w-5 h-5 text-orange-500" />
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-gray-100">AWS AgentCore</p>
                                                    <p className="text-xs text-gray-500">Custom runtime</p>
                                                </div>
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                <Textarea
                                    {...register('comment', {
                                        validate: value => validateSpaces(value, 'publish comment'),
                                    })}
                                    label="Publish Comment"
                                    placeholder="Add a short note about the updates or changes in this version..."
                                    rows={8}
                                    className="w-full resize-none"
                                    isDestructive={!!errors?.comment?.message}
                                    supportiveText={errors?.comment?.message}
                                />
                            </>
                        )}
                    </DialogBody>

                    {!isSuccessfullyPublished && !deploymentComplete && (
                        <DialogFooter>
                            {executionRuntime === 'aws-agentcore' && agentCoreStep > 1 && !isDeploying && (
                                <Button variant="secondary" onClick={handleAgentCoreBack}>
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back
                                </Button>
                            )}
                            <Button variant="secondary" onClick={handleModalCancel} disabled={isDeploying}>
                                Cancel
                            </Button>
                            {executionRuntime === 'kaya-default' ? (
                                <Button variant="primary" onClick={onSubmit} loading={isPublishing}>
                                    {isPublishing ? 'Publishing...' : 'Publish'}
                                </Button>
                            ) : agentCoreStep < 4 ? (
                                <Button 
                                    variant="primary" 
                                    onClick={handleAgentCoreNext}
                                    disabled={!canProceedToNextStep()}
                                >
                                    {agentCoreStep === 3 ? (
                                        <>
                                            <Upload className="w-4 h-4 mr-2" />
                                            Deploy
                                        </>
                                    ) : (
                                        <>
                                            Next
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </>
                                    )}
                                </Button>
                            ) : null}
                        </DialogFooter>
                    )}
                </DialogContent>
            </Dialog>

            {/* Save confirmation modal */}
            <Dialog open={openSaveConfirmationModal} onOpenChange={setOpenSaveConfirmationModal}>
                <DialogContent hideCloseButtonClass="block top-6" className="gap-0 max-w-none w-[450px]">
                    <DialogHeader className="px-4 py-4 flex flex-row gap-x-2">
                        <div className="w-8 h-8 flex items-center justify-center bg-blue-200 rounded">
                            <SaveOff size={16} color="#316FED" />
                        </div>
                        <p className="text-md font-semibold text-gray-700 relative bottom-1 dark:text-gray-100">
                            Publish Without Saving?
                        </p>
                    </DialogHeader>
                    <DialogBody className="px-4 py-6 flex flex-col justify-center items-center gap-y-4">
                        <SaveOff size={96} color="#316FED" />
                        <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                            You have changes that haven&apos;t been saved. You can still proceed with publishing, but the
                            latest edits won&apos;t be included.
                        </p>
                    </DialogBody>
                    <DialogFooter>
                        <Button size={'sm'} variant="secondary" onClick={() => setOpenSaveConfirmationModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            size={'sm'}
                            variant="primary"
                            onClick={() => {
                                setOpen(true);
                                setOpenSaveConfirmationModal(false);
                            }}
                            loading={isPublishing}
                        >
                            Publish Anyway
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
