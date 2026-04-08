'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components';
import { ChevronLeft, ChevronRight, Check, X, Bot } from 'lucide-react';
import { WizardStepIndicator, WizardStep } from './wizard-step-indicator';
import { Dialog, DialogContent } from '@/components/atoms/dialog';

interface WizardContainerProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    steps: WizardStep[];
    currentStep: number;
    completedSteps: Set<number>;
    onStepChange: (step: number) => void;
    onNext: () => void;
    onPrevious: () => void;
    onComplete: () => void;
    onCancel: () => void;
    isValid: boolean;
    isSaving: boolean;
    isEdit: boolean;
    canProceed: boolean;
    children: React.ReactNode;
    title?: string;
}

export const WizardContainer = ({
    open,
    setOpen,
    steps,
    currentStep,
    completedSteps,
    onStepChange,
    onNext,
    onPrevious,
    onComplete,
    onCancel,
    isValid,
    isSaving,
    isEdit,
    canProceed,
    children,
    title,
}: WizardContainerProps) => {
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === steps.length - 1;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent 
                className={cn(
                    'max-w-5xl w-[95vw] h-[90vh] max-h-[900px] p-0 gap-0 overflow-hidden',
                    'flex flex-col bg-white dark:bg-gray-900'
                )}
                autoClose={false}
            >
                {/* Header */}
                <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700">
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-100 dark:bg-blue-900 flex items-center justify-center w-10 h-10 rounded-lg">
                                    <Bot size={20} className="text-blue-600 dark:text-blue-300" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {title || (isEdit ? 'Edit Agent' : 'Create New Agent')}
                                    </h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Configure your AI agent step by step
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onCancel}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <X size={20} />
                            </Button>
                        </div>

                        {/* Step Indicator */}
                        <WizardStepIndicator
                            steps={steps}
                            currentStep={currentStep}
                            completedSteps={completedSteps}
                            onStepClick={onStepChange}
                            isClickable={true}
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                    <div className="max-w-4xl mx-auto">
                        {children}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                            {/* Left side - step info */}
                            <div className="hidden sm:block">
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    Step {currentStep + 1} of {steps.length}
                                </span>
                            </div>

                            {/* Right side - action buttons */}
                            <div className="flex items-center gap-3 ml-auto">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={onCancel}
                                >
                                    Cancel
                                </Button>

                                {!isFirstStep && (
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={onPrevious}
                                        leadingIcon={<ChevronLeft size={16} />}
                                    >
                                        Previous
                                    </Button>
                                )}

                                {!isLastStep ? (
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={onNext}
                                        disabled={!canProceed}
                                        trailingIcon={<ChevronRight size={16} />}
                                    >
                                        Next
                                    </Button>
                                ) : (
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={onComplete}
                                        disabled={!isValid || isSaving}
                                        loading={isSaving}
                                        leadingIcon={!isSaving ? <Check size={16} /> : undefined}
                                    >
                                        {isSaving ? 'Saving...' : isEdit ? 'Update Agent' : 'Create Agent'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default WizardContainer;
