'use client';
import { Check, Loader2, AlertCircle, X, Network, Info } from 'lucide-react';
import Image from 'next/image';
import { useExecutionConfiguration } from '@/hooks/use-test-execution';
import { ExecutionSessionStatus, ExecutionItemStatus } from '../../data-generation';
import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';
import { Switch } from '@/components/atoms/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/atoms/tooltip';

interface ExecutionStatusHeaderProps {
    status: ExecutionSessionStatus;
    progressPercentage: number;
}

const ExecutionStatusHeader = ({ status, progressPercentage }: ExecutionStatusHeaderProps) => {
    const getStatusText = () => {
        if (status === ExecutionSessionStatus.Completed) return 'Execution Completed';
        if (status === ExecutionSessionStatus.Failed) return 'Execution Failed';
        return 'Executing Workflow Tests :';
    };

    return (
        <div className="flex items-baseline gap-2">
            <h2 className="text-md font-medium text-gray-900">
                {getStatusText()}
            </h2>
            <span className="text-lg text-gray-400">{progressPercentage}%</span>
        </div>
    );
};

interface ExecuteWorkflowStepProps {
    sessionId: string | null;
    onComplete?: () => void;
    onCancel?: (cancelFn: () => void) => void;
    enableMiniTracker?: boolean;
    onMiniTrackerToggle?: (enabled: boolean) => void;
}

export const ExecuteWorkflowStep = ({ sessionId, onComplete, onCancel, enableMiniTracker = false, onMiniTrackerToggle }: ExecuteWorkflowStepProps) => {
    const { progress, progressPercentage, isLoadingProgress, progressError, cancelExecution } = useExecutionConfiguration(sessionId);
    const hasCalledOnComplete = useRef(false);

    // Reset completion flag when sessionId changes
    useEffect(() => {
        hasCalledOnComplete.current = false;
    }, [sessionId]);

    // Pass cancelExecution to parent via onCancel callback
    useEffect(() => {
        if (onCancel && cancelExecution) {
            onCancel(cancelExecution);
        }
    }, [onCancel, cancelExecution]);

    // Call onComplete when execution is finished
    useEffect(() => {
        if (
            progress &&
            !hasCalledOnComplete.current &&
            (progress.status === ExecutionSessionStatus.Completed || progress.status === ExecutionSessionStatus.Failed)
        ) {
            hasCalledOnComplete.current = true;
            // Add a small delay to show the completed state before closing
            setTimeout(() => {
                onComplete?.();
            }, 2000);
        }
    }, [progress, onComplete]);

    if (!progress) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-2 bg-gray-50 border p-4 rounded-md">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                <p className="text-sm text-gray-500">Waiting for execution to start...</p>
            </div>
        );
    }

    if (progressError) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-2 bg-red-50 border border-red-200 p-4 rounded-md">
                <AlertCircle className="w-8 h-8 text-red-500" />
                <p className="text-sm font-medium text-red-700">Failed to fetch execution progress</p>
                <p className="text-xs text-red-600">
                    {progressError instanceof Error ? progressError.message : 'Unknown error'}
                </p>
            </div>
        );
    }

    // Show loading state
    if (isLoadingProgress) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-2 bg-gray-50 border p-4 rounded-md">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                <p className="text-sm text-gray-600">Loading execution progress...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full gap-2 bg-gray-50 border p-4 rounded-md overflow-auto">
            <div className="w-full">
                {/* Header Section */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <ExecutionStatusHeader 
                            status={progress.status} 
                            progressPercentage={progressPercentage} 
                        />
                        <div className="flex items-center gap-2">
                            <Network size={15} className="text-blue-500" />
                            <p className="text-xs text-blue-600 font-bold">{progress.testSuiteName}</p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden mt-4">
                        <div
                            className={cn(
                                'h-full rounded-full transition-all duration-1000 ease-in-out',
                                progress.status === ExecutionSessionStatus.Failed && 'bg-red-500',
                                progress.status !== ExecutionSessionStatus.Failed && progress.failed > 0 && 'bg-yellow-500',
                                progress.status !== ExecutionSessionStatus.Failed && progress.failed === 0 && 'bg-blue-500'
                            )}
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>

                {/* Current Execution Status */}
                {progress.currentIndex >= 0 && progress.currentDataSetName && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 text-blue-500 animate-spin flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-xs text-blue-600 font-medium">Currently executing:</p>
                                <p className="text-sm text-blue-700">{progress.currentDataSetName}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Test Case Items */}
                {progress.items && progress.items.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between mb-2 mt-3">
                            <p className="text-xs font-medium text-gray-500">Test Cases:</p>
                            <div className="flex items-center gap-2">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Info size={14} className="text-gray-400 hover:text-gray-600 cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent side="left" className="max-w-xs">
                                            <p className="text-xs">Enable the mini execution progress tracker to monitor progress after closing this window. If not enabled, the execution will continue in the background, and progress can be viewed in the Execution table.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        id="mini-tracker-toggle"
                                        checked={enableMiniTracker}
                                        onCheckedChange={(checked) => onMiniTrackerToggle?.(checked)}
                                    />
                                    <label htmlFor="mini-tracker-toggle" className="text-xs text-gray-600 cursor-pointer">
                                        Show Progress Monitor
                                    </label>
                                </div>
                            </div>
                        </div>
                        {progress.items.map(item => {
                            
                            const isCurrentlyRunning = item.index === progress.currentIndex;
                            const isPassed = item.status === ExecutionItemStatus.Passed;
                            const isFailed = item.status === ExecutionItemStatus.Failed;
                            const isPending = item.status === ExecutionItemStatus.Pending;

                            return (
                                <div
                                    key={item.index}
                                    className={cn(
                                        'flex items-start gap-3 p-3 rounded-md border-2 relative',
                                        isCurrentlyRunning && 'bg-white animate-[borderGradient_3s_linear_infinite]',
                                        isPassed && 'bg-green-50 border-green-200',
                                        isFailed && 'bg-red-50 border-red-200',
                                        !isCurrentlyRunning && !isPassed && !isFailed && 'bg-white border-gray-200'
                                    )}
                                >
                                    {isPassed && (
                                        <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                            <Check className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                    {isFailed && (
                                        <div className="flex-shrink-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                            <X className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                    {(isCurrentlyRunning || isPending) && (
                                        <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                                            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-gray-400">Test Case</span>
                                                <span
                                                    className={cn(
                                                        'text-sm font-medium transition-colors',
                                                        isPassed && 'text-green-700',
                                                        isFailed && 'text-red-700',
                                                        isCurrentlyRunning && 'text-blue-700',
                                                        !isPassed && !isFailed && !isCurrentlyRunning && 'text-gray-500'
                                                    )}
                                                >
                                                    {item.name ?? `Test Case ${item.index + 1}`}
                                                    {isCurrentlyRunning && (
                                                        <span className="inline-flex ml-1 text-[35px]">
                                                            <span className="animate-[dotFade_1.4s_ease-in-out_infinite]" style={{ animationDelay: '0s' }}>.</span>
                                                            <span className="animate-[dotFade_1.4s_ease-in-out_infinite]" style={{ animationDelay: '0.2s' }}>.</span>
                                                            <span className="animate-[dotFade_1.4s_ease-in-out_infinite]" style={{ animationDelay: '0.4s' }}>.</span>
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {isCurrentlyRunning && (
                                        
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                              <span className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full ml-2">
                                                        Running
                                                        </span>
                                                        <span className='text-gray-400 font-thin'>|</span>
                                            <Image src="/png/loading.gif" alt="Running" width={50} height={50} unoptimized />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
