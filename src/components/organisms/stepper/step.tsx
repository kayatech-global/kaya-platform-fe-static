import React from 'react';
import { IStep } from './stepper';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface IStepProps {
    steps: IStep[];
    currentStep: number;
}

export const Step = ({ steps, currentStep }: IStepProps) => {
    const stepWidth = (step: number) => {
        if (step === 2) return '30%';
        if (step === 3) return '70%';
        if (step === 4) return '100%';
        return '0%';
    };

    return (
        <div className="w-full flex flex-col items-center">
            {/* Step circles + connectors */}
            <div className="relative flex w-[65%] items-center justify-between">
                {steps.map((s, i) => {
                    // Determine status
                    const isCompleted = i + 1 < currentStep;
                    const isActive = i + 1 === currentStep;
                    const isDisabled = s.isDisabled;

                    // Colors
                    const circleColor = (() => {
                        if (isDisabled) return 'border-gray-300 text-gray-300';
                        if (isCompleted || isActive) return 'border-blue-600 dark:border-blue-300 text-blue-600 dark:text-white';
                        return 'border-gray-400 text-gray-400';
                    })();
                    const circleBg = (() => {
                        if (isDisabled) return 'bg-white dark:bg-gray-500';
                        if (isCompleted || isActive) return 'bg-white dark:bg-blue-600';
                        return 'bg-white dark:bg-gray-500';
                    })();
                    const lineColor = isCompleted ? 'bg-blue-600' : 'bg-gray-300';

                    return (
                        <React.Fragment key={s.id}>
                            {/* Step node */}
                            <div className="flex flex-col items-center bg-transparent z-10 w-0">
                                <div
                                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${circleColor} ${circleBg} transition-all duration-300`}
                                >
                                    <i className={`${s.icon} text-[20px]`} />
                                </div>
                                <p
                                    className={`font-medium text-[13px] mt-1 whitespace-nowrap text-center ${(() => {
                                        if (isDisabled) return 'text-gray-300';
                                        if (isCompleted || isActive) return 'text-blue-600 dark:text-blue-300 font-semibold';
                                        return 'text-gray-700 dark:text-gray-400';
                                    })()}`}
                                >
                                    {s.title}
                                </p>
                            </div>

                            {/* Connector line */}
                            {i !== steps.length - 1 && (
                                <>
                                    <div className="absolute top-5 left-0 w-full flex justify-between">
                                        <div
                                            className={`flex-1 h-[2px] ${lineColor} rounded-full translate-y-[-50%]`}
                                        />
                                    </div>
                                    <motion.div
                                        className={cn(
                                            'absolute top-5 left-0 flex justify-between transition-all duration-[10000] ease-in-out w-[0%]',
                                            {
                                                'w-[30%]': currentStep === 2,
                                                'w-[70%]': currentStep === 3,
                                                'w-[100%]': currentStep === 4,
                                            }
                                        )}
                                        animate={{ width: stepWidth(currentStep) }}
                                        transition={{
                                            duration: 0.6,
                                            ease: 'linear',
                                        }} // 10 seconds animation
                                    >
                                        <div className={'flex-1 h-[2px] bg-blue-600 rounded-full translate-y-[-50%]'} />
                                    </motion.div>
                                </>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};
