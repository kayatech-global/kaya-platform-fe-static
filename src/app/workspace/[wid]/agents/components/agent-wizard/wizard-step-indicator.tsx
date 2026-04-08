'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export interface WizardStep {
    id: string;
    title: string;
    description: string;
    icon?: React.ReactNode;
}

interface WizardStepIndicatorProps {
    steps: WizardStep[];
    currentStep: number;
    completedSteps: Set<number>;
    onStepClick?: (stepIndex: number) => void;
    isClickable?: boolean;
}

export const WizardStepIndicator = ({
    steps,
    currentStep,
    completedSteps,
    onStepClick,
    isClickable = false,
}: WizardStepIndicatorProps) => {
    return (
        <div className="w-full">
            {/* Desktop horizontal stepper */}
            <div className="hidden lg:flex items-center justify-between relative">
                {/* Progress line background */}
                <div className="absolute top-5 left-0 right-0 h-[2px] bg-gray-200 dark:bg-gray-700 mx-12" />
                
                {/* Progress line filled */}
                <div 
                    className="absolute top-5 left-0 h-[2px] bg-blue-500 dark:bg-blue-400 mx-12 transition-all duration-500"
                    style={{ 
                        width: `calc(${(currentStep / (steps.length - 1)) * 100}% - 96px)`,
                        maxWidth: 'calc(100% - 96px)'
                    }}
                />

                {steps.map((step, index) => {
                    const isCompleted = completedSteps.has(index);
                    const isCurrent = index === currentStep;
                    const isPast = index < currentStep;
                    const isAccessible = isClickable && (isPast || isCompleted);

                    return (
                        <div
                            key={step.id}
                            className={cn(
                                'flex flex-col items-center relative z-10 flex-1',
                                isAccessible && 'cursor-pointer'
                            )}
                            onClick={() => isAccessible && onStepClick?.(index)}
                        >
                            {/* Step circle */}
                            <div
                                className={cn(
                                    'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                                    'text-sm font-semibold',
                                    isCompleted && 'bg-green-500 border-green-500 text-white',
                                    isCurrent && !isCompleted && 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/30',
                                    !isCurrent && !isCompleted && 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
                                )}
                            >
                                {isCompleted ? (
                                    <Check size={18} strokeWidth={3} />
                                ) : (
                                    <span>{index + 1}</span>
                                )}
                            </div>

                            {/* Step label */}
                            <div className="mt-3 text-center">
                                <p
                                    className={cn(
                                        'text-sm font-medium transition-colors',
                                        isCurrent && 'text-blue-600 dark:text-blue-400',
                                        isCompleted && 'text-green-600 dark:text-green-400',
                                        !isCurrent && !isCompleted && 'text-gray-500 dark:text-gray-400'
                                    )}
                                >
                                    {step.title}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 max-w-[120px]">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Mobile compact stepper */}
            <div className="lg:hidden">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Step {currentStep + 1} of {steps.length}
                    </span>
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {steps[currentStep].title}
                    </span>
                </div>
                
                {/* Progress bar */}
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-500 dark:bg-blue-400 rounded-full transition-all duration-500"
                        style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                    />
                </div>

                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    {steps[currentStep].description}
                </p>
            </div>
        </div>
    );
};

export default WizardStepIndicator;
