'use client';
import { X, Network, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Button, TruncateCell } from '@/components';
import { useExecutionConfiguration } from '@/hooks/use-test-execution';
import { ExecutionSessionStatus } from '@/enums/test-studio-type';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/atoms/dialog';
import { useState } from 'react';

interface MiniExecutionTrackerProps {
    sessionId: string;
    onCancel: () => void;
    onExpand: () => void;
    onComplete: () => void;
}

export const MiniExecutionTracker = ({ sessionId, onCancel, onExpand, onComplete }: MiniExecutionTrackerProps) => {
    const { progress, progressPercentage, isLoadingProgress, cancelExecution } = useExecutionConfiguration(sessionId);
    const [showCancelDialog, setShowCancelDialog] = useState(false);

    // Handle completion
    if (progress?.status === ExecutionSessionStatus.Completed || progress?.status === ExecutionSessionStatus.Failed) {
        onComplete();
    }

    const handleCancelClick = () => {
        setShowCancelDialog(true);
    };

    const handleConfirmCancel = async () => {
        // Stop polling and call backend API to cancel execution
        await cancelExecution();
        // Call parent's onCancel to update context
        onCancel();
        setShowCancelDialog(false);
    };

    if (!progress || isLoadingProgress) {
        return null;
    }

    const isCompleted = progress.status === ExecutionSessionStatus.Completed;
    const isFailed = progress.status === ExecutionSessionStatus.Failed;

    return (
        <div
            className={cn(
                'fixed right-3 bottom-2 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border-2 transition-all duration-300 w-96',
                (() => {
                    if (isCompleted) return 'border-green-500';
                    if (isFailed) return 'border-red-500';
                    return 'border-blue-300 border-2';
                })()
            )}
        >
            <div className="p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-5 flex al">
                    <div className="flex items-center gap-2">
                        <Image src="/png/Progress_spin.gif" alt="Executing" width={25} height={25} unoptimized />
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {(() => {
                                if (isCompleted) return 'Execution Completed';
                                if (isFailed) return 'Execution Failed';
                                return 'Executing Tests';
                            })()}
                        </h3>
                    </div>
                    {/* Test Suite Name */}
                    <div className="flex items-center gap-2 mb-0">
                        <Network size={15} className="text-blue-500 flex-shrink-0" />
                        <TruncateCell value={progress.testSuiteName} length={25} className="text-xs text-blue-600 dark:text-blue-400 font-bold" />
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Progress</span>
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            {progressPercentage}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                            className={cn(
                                'h-full rounded-full transition-all duration-500',
                                (() => {
                                    if (isFailed) return 'bg-red-500';
                                    if (isCompleted) return 'bg-green-500';
                                    return 'bg-blue-500';
                                })()
                            )}
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>

                {/* Test Case Stats */}
                <div className="flex items-center justify-between mb-3 text-xs">
                    <div className="flex items-center gap-4">
                        <span className="text-gray-600 dark:text-gray-400">
                            Total:{' '}
                            <span className="font-semibold text-gray-900 dark:text-gray-100">{progress.total}</span>
                        </span>
                        <span className="text-green-600 dark:text-green-400">
                            Completed: <span className="font-semibold">{progress.passed}</span>
                        </span>
                        <span className="text-red-600 dark:text-red-400">
                            Failed: <span className="font-semibold">{progress.failed}</span>
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {!isCompleted && !isFailed && (
                        <Button size="sm" variant="destructive" onClick={handleCancelClick} className="flex-1 h-8 text-xs">
                            <X size={14} className="mr-1" />
                            Cancel Execution
                        </Button>
                    )}
                    <Button size="sm" variant="secondary" onClick={onExpand} className="flex-1 h-8 text-xs">
                        View Details
                    </Button>
                </div>
            </div>

            {/* Cancel Confirmation Dialog */}
            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogContent className="overflow-y-auto max-h-[80%]">
                    <DialogHeader>
                        <DialogTitle>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                                    <AlertTriangle size={24} className="text-red-600 dark:text-red-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    Cancel Execution
                                </h3>
                            </div>
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 py-0 px-6">
                        Are you sure you want to cancel this execution? If you cancel this one, you will have to re-run the execution.
                    </p>
                    <div className="flex justify-end gap-3 p-3">
                        <DialogClose asChild>
                            <Button variant="secondary" size="sm">
                                Keep
                            </Button>
                        </DialogClose>
                        <Button variant="destructive" size="sm" onClick={handleConfirmCancel} className="bg-red-600 hover:bg-red-700">
                            Yes, Cancel
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
