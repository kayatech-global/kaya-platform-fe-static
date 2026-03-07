import { Button, StepWizardView, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components';
import AppDrawer from '@/components/molecules/drawer/app-drawer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/atoms/dialog';
import { cn } from '@/lib/utils';
import { Play, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useExecutionContext } from '@/context';
import { TestExecutionStepType } from '../../data-generation';
import { SelectTestStep } from './select-test-step';
import { ExecuteWorkflowStep } from './execute-workflow-step';

type NewExecutionFormProps = {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    initialTestId?: string;
    onExecutionComplete?: () => void;
};

type ExecuteActionButtonProps = {
    activeStep: number;
    isExecuteDisabled: boolean;
    onExecuteClick: () => void;
    onClose: () => void;
    getTooltipMessage: () => string;
};

const ExecuteActionButton = ({ activeStep, isExecuteDisabled, onExecuteClick, onClose, getTooltipMessage }: ExecuteActionButtonProps) => {
    if (activeStep >= 2) {
        return (
            <Button size={'sm'} onClick={onClose}>
                Close
            </Button>
        );
    }
    if (isExecuteDisabled) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span>
                            <Button
                                size={'sm'}
                                onClick={onExecuteClick}
                                disabled={isExecuteDisabled}
                            >
                                Execute
                            </Button>
                        </span>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="center">
                        {getTooltipMessage()}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }
    return (
        <Button size={'sm'} onClick={onExecuteClick}>
            Execute
        </Button>
    );
};

export const NewExecutionForm = (props: NewExecutionFormProps) => {
    const { isOpen, setIsOpen, initialTestId, onExecutionComplete } = props;
    const { startBackgroundExecution, startSilentExecution, stopBackgroundExecution, backgroundExecution } = useExecutionContext();
    const [activeStep, setActiveStep] = useState<TestExecutionStepType>(1);
    const [triggerExecute, setTriggerExecute] = useState(0);
    const [selectedTestSuiteId, setSelectedTestSuiteId] = useState<string>('');
    const [selectedTestCaseCount, setSelectedTestCaseCount] = useState(0);
    const [executionSessionId, setExecutionSessionId] = useState<string | null>(null);
    const [cancelExecutionFn, setCancelExecutionFn] = useState<(() => void | Promise<void>) | null>(null);
    const [enableMiniTracker, setEnableMiniTracker] = useState(true);
    const [showCancelDialog, setShowCancelDialog] = useState(false);

    // Restore from background execution when expanding
    useEffect(() => {
        if (isOpen && backgroundExecution.sessionId && !backgroundExecution.isMinimized) {
            setExecutionSessionId(backgroundExecution.sessionId);
            setActiveStep(2);
            if (backgroundExecution.testSuiteId) {
                setSelectedTestSuiteId(backgroundExecution.testSuiteId);
            }
            // Restore mini tracker toggle state
            if (backgroundExecution.miniTrackerEnabled !== undefined) {
                setEnableMiniTracker(backgroundExecution.miniTrackerEnabled);
            }
        }
    }, [isOpen, backgroundExecution]);

    useEffect(() => {
        if (!isOpen && !backgroundExecution.sessionId && executionSessionId) {
            // Background execution was cleared while drawer is closed, reset local state
            setExecutionSessionId(null);
            setCancelExecutionFn(null);
            setActiveStep(1);
        }
    }, [isOpen, backgroundExecution.sessionId, executionSessionId]);

    // Reset states when drawer closes
    useEffect(() => {
        if (!isOpen && !executionSessionId) {
            setActiveStep(1);
            setSelectedTestSuiteId('');
            setSelectedTestCaseCount(0);
            setTriggerExecute(0);
        }
    }, [isOpen, executionSessionId]);

    const handleCancelClick = () => {
        // Open confirmation dialog
        setShowCancelDialog(true);
    };

    const handleConfirmCancel = async () => {
        // Cancel button stops the execution
        if (cancelExecutionFn) {
            await cancelExecutionFn(); // Stop polling and call backend API
        }
        stopBackgroundExecution();
        setExecutionSessionId(null);
        setCancelExecutionFn(null);
        setIsOpen(false);
        setShowCancelDialog(false);
    };

    const handleClose = () => {
        // Close button minimizes to background if executing
        if (executionSessionId && activeStep === 2) {
            if (enableMiniTracker) {
                // Show mini tracker - pass the toggle state to persist it
                startBackgroundExecution(executionSessionId, selectedTestSuiteId, enableMiniTracker);
            } else {
                // Run silently in background - show "Running..." in table
                startSilentExecution(executionSessionId, selectedTestSuiteId);
            }
        }
        setIsOpen(false);
    };

    // Handle X icon close - same logic as Close button
    const handleDrawerClose = (isOpen: boolean) => {
        if (!isOpen) {
            // User is closing the drawer
            if (executionSessionId && activeStep === 2) {
                // Execution is in progress
                if (enableMiniTracker) {
                    // Show mini tracker
                    startBackgroundExecution(executionSessionId, selectedTestSuiteId, enableMiniTracker);
                } else {
                    // Run silently - show "Running..." in table
                    startSilentExecution(executionSessionId, selectedTestSuiteId);
                }
            }
        }
        setIsOpen(isOpen);
    };

    const handlePrevious = () => {
        // Previous just navigates back, doesn't stop execution
        setActiveStep(1);
    };

    const onExecuteClick = () => {
        // Trigger execution in SelectTestStep component
        setTriggerExecute(prev => prev + 1);
        // Step 2 navigation will happen when sessionId is received via onExecutionStart
    };

    const isExecuteDisabled = !selectedTestSuiteId || selectedTestCaseCount === 0;
    const getTooltipMessage = () => {
        if (!selectedTestSuiteId) {
            return 'Please select a Test Suite to continue';
        }
        if (selectedTestCaseCount === 0) {
            return 'Please select at least 1 test case to proceed';
        }
        return '';
    };

    return (
        <>
            <AppDrawer
                open={isOpen}
                direction="right"
                isPlainContentSheet={false}
                setOpen={handleDrawerClose}
                className="custom-drawer-content"
                dismissible={false}
                headerIcon={<Play />}
                header="New Execution"
                footer={
                <div className="flex justify-between items-center w-full">
                    <div>
                        {activeStep > 1 && activeStep < 4 && (
                            <Button
                                variant={'secondary'}
                                size={'sm'}
                                onClick={handlePrevious}
                                disabled={!!executionSessionId}
                            >
                                Previous
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        {activeStep === 2 && (
                            <Button variant={'secondary'} size={'sm'} onClick={handleCancelClick}>
                                Cancel
                            </Button>
                        )}
                        {activeStep < 2 && (
                            <Button variant={'secondary'} size={'sm'} onClick={handleCancelClick}>
                                Cancel
                            </Button>
                        )}
                        <ExecuteActionButton
                            activeStep={activeStep}
                            isExecuteDisabled={isExecuteDisabled}
                            onExecuteClick={onExecuteClick}
                            onClose={handleClose}
                            getTooltipMessage={getTooltipMessage}
                        />
                    </div>
                </div>
            }
            content={
                <div className={cn('activity-feed-container p-4 h-full')}>
                    <StepWizardView
                        activeStep={activeStep}
                        panes={[
                            {
                                id: TestExecutionStepType.CONFIGURE,
                                label: 'Execution Configurations',
                                content: (
                                    <SelectTestStep
                                        initialTestId={initialTestId}
                                        triggerExecute={triggerExecute}
                                        onStateChange={(testSuiteId, testCaseCount) => {
                                            setSelectedTestSuiteId(testSuiteId);
                                            setSelectedTestCaseCount(testCaseCount);
                                        }}
                                        onExecutionStart={(sessionId) => {
                                            setExecutionSessionId(sessionId);
                                            setActiveStep(2);
                                        }}
                                    />
                                ),
                            },
                            {
                                id: TestExecutionStepType.EXECUTION,
                                label: 'Execute Workflow',
                                content: (
                                    <ExecuteWorkflowStep
                                        sessionId={executionSessionId}
                                        enableMiniTracker={enableMiniTracker}
                                        onMiniTrackerToggle={setEnableMiniTracker}
                                        onCancel={(cancelFn) => {
                                            setCancelExecutionFn(() => cancelFn);
                                        }}
                                        onComplete={() => {
                                            stopBackgroundExecution();
                                            setExecutionSessionId(null);
                                            setCancelExecutionFn(null);
                                            setActiveStep(1);
                                            setIsOpen(false);
                                            // Refetch executions list after completion
                                            if (onExecutionComplete) {
                                                onExecutionComplete();
                                            }
                                        }}
                                    />
                                ),
                            },
                        ]}
                    />
                </div>
            }
        />
        
        {/* Cancel Confirmation Dialog */}
        <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
            <DialogContent className="overflow-y-auto max-h-[80%]">
                <DialogHeader>
                    <DialogTitle>
                        <div className="flex items-center gap-3 ">
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
        </>
    );
};
