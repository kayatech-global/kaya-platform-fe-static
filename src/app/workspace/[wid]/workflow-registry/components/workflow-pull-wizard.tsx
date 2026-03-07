'use client';
import React from 'react';
import { Button } from '@/components';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/atoms/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/atoms/tooltip';
import { Stepper } from '@/components/organisms/stepper/stepper';
import { Repeat2 } from 'lucide-react';
import { useWorkflowPull } from '@/hooks/use-workflow-pull';
import { cn } from '@/lib/utils';

interface WorkflowDeploymentWizardProps {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    artifactPath: string | null;
    artifactVersion: string | null;
    setArtifactVersion: React.Dispatch<React.SetStateAction<string | null>>;
    setArtifactPath: React.Dispatch<React.SetStateAction<string | null>>;
    refetch: () => void;
}

export const WorkflowDeploymentWizard = ({
    isOpen,
    setIsOpen,
    artifactPath,
    artifactVersion,
    setArtifactPath,
    setArtifactVersion,
    refetch,
}: WorkflowDeploymentWizardProps) => {
    const {
        hasError,
        wizardSteps,
        currentStep,
        onCancel,
        handleBack,
        handleNext,
        workflowComparisonLoading,
        workflowEnvSpecificValuesLoading,
        pullTypeLoading,
        loadingSecrets,
        isValid,
        validating,
    } = useWorkflowPull({
        artifactPath,
        artifactVersion,
        isOpen,
        setIsOpen,
        setArtifactPath,
        setArtifactVersion,
        refetch,
    });

    return (
        <div>
            <Dialog open={isOpen} onOpenChange={onCancel}>
                <DialogContent
                    hideCloseButtonClass="block top-6"
                    className="gap-0 max-w-none w-[60vw] max-h-[95vh] flex flex-col"
                >
                    <DialogHeader className="px-4 py-4">
                        <DialogTitle>
                            <div className="flex flex-row gap-x-2 items-center">
                                <div className="w-8 h-8 flex items-center justify-center bg-blue-200 rounded">
                                    <Repeat2 size={16} color="#316FED" />
                                </div>
                                <p className="text-md font-semibold text-gray-700 relative bottom-[2px] dark:text-gray-100 mt-1.5 ">
                                    Pull Workflow
                                </p>
                            </div>
                        </DialogTitle>
                    </DialogHeader>
                    <div
                        className={cn('px-6 py-6 flex flex-col gap-y-6 h-full', {
                            'overflow-y-auto': currentStep !== 4,
                        })}
                    >
                        <Stepper steps={wizardSteps} currentStep={currentStep} />
                    </div>
                    {currentStep !== 4 && (
                        <DialogFooter className="flex gap-x-1 items-center flex-none">
                            {currentStep === 1 ? (
                                <Button
                                    variant="secondary"
                                    onClick={onCancel}
                                    disabled={loadingSecrets || pullTypeLoading}
                                >
                                    Cancel
                                </Button>
                            ) : (
                                <Button
                                    disabled={workflowComparisonLoading || workflowEnvSpecificValuesLoading}
                                    variant="secondary"
                                    onClick={handleBack}
                                >
                                    Back
                                </Button>
                            )}
                            {currentStep === 3 && !isValid ? (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div>
                                                <Button
                                                    variant="primary"
                                                    onClick={handleNext}
                                                    loading={
                                                        pullTypeLoading ||
                                                        workflowComparisonLoading ||
                                                        workflowEnvSpecificValuesLoading ||
                                                        loadingSecrets
                                                    }
                                                    disabled={true}
                                                >
                                                    {pullTypeLoading ||
                                                    workflowComparisonLoading ||
                                                    workflowEnvSpecificValuesLoading ||
                                                    loadingSecrets
                                                        ? 'Loading...'
                                                        : 'Pull Workflow'}
                                                </Button>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Please provide valid values for all required environment variables</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            ) : (
                                <Button
                                    variant="primary"
                                    onClick={handleNext}
                                    loading={
                                        pullTypeLoading ||
                                        workflowComparisonLoading ||
                                        workflowEnvSpecificValuesLoading ||
                                        loadingSecrets ||
                                        validating
                                    }
                                    disabled={currentStep === 3 || currentStep === 1 ? hasError || !isValid : hasError}
                                >
                                    {pullTypeLoading ||
                                    workflowComparisonLoading ||
                                    workflowEnvSpecificValuesLoading ||
                                    loadingSecrets ? (
                                        'Loading...'
                                    ) : (
                                        <>{currentStep === 3 ? 'Pull Workflow' : 'Next'}</>
                                    )}
                                </Button>
                            )}
                        </DialogFooter>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};
