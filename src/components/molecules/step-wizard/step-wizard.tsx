'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export type ContentStep = {
    id: number | string;
    label: string;
};

type StepWizardProps = {
    steps: ContentStep[];
    activeStep: number | string;
    className?: string;
    onStepClick?: (id: number | string) => void;
    showSeparators?: boolean;
};

export function StepWizard({ steps, activeStep, className, onStepClick, showSeparators = true }: Readonly<StepWizardProps>) {
    const activeIndex = steps.findIndex(s => String(s.id) === String(activeStep));
    return (
        <div
            className={cn(
                'grid grid-flow-col auto-cols-max items-center gap-3 text-xs text-gray-600 dark:text-gray-300',
                className
            )}
        >
            {steps.map((step, idx) => {
                const isActive = String(activeStep) === String(step.id);
                const isCompleted = idx < activeIndex;
                const isLast = idx === steps.length - 1;
                return (
                    <div key={step.id} className="grid grid-flow-col auto-cols-max items-center gap-2">
                        <button
                            type="button"
                            className={cn(
                                'h-6 w-6 rounded-full border select-none flex items-center justify-center text-[12px] leading-none bg-transparent',
                                (() => {
                                    if (isActive) return 'bg-primary text-primary-foreground border-primary';
                                    if (isCompleted) return 'bg-green-500 text-white border-green-500 opacity-60';
                                    return 'bg-transparent text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-700';
                                })(),
                                onStepClick && 'cursor-pointer'
                            )}
                            onClick={() => onStepClick?.(step.id)}
                            aria-label={`Step ${step.id}: ${step.label}`}
                        >
                            <span className="leading-none">{step.id}</span>
                        </button>
                        <span
                            className={cn('transition-colors text-md', {
                                'font-semibold text-primary': isActive,
                                'text-green-600 font-medium opacity-80': isCompleted,
                            })}
                        >
                            {step.label}
                        </span>
                        {showSeparators && !isLast && (
                            <div
                                className={cn(
                                    'w-8 h-px transition-colors',
                                    (() => {
                                        if (isCompleted) return 'bg-green-500 opacity-60';
                                        if (idx === activeIndex) return 'bg-primary';
                                        return 'bg-gray-300 dark:bg-gray-700';
                                    })()
                                )}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
