import React from 'react';
import { Step } from './step';

export interface IStep {
    id: string;
    step: number;
    title: string;
    icon: string;
    body: React.ReactNode;
    isDisabled: boolean;
}

interface IStepperProps {
    steps: IStep[];
    currentStep: number;
}

export const Stepper = ({ steps, currentStep }: IStepperProps) => {
    const currentStepData = steps.find(step => step.step === currentStep);

    return (
        <div className="flex flex-col w-full h-full">
            <div className="flex-none mb-6">
                <Step steps={steps} currentStep={currentStep} />
            </div>
            <div className="w-full h-px bg-gray-200 dark:bg-gray-700 flex-none"></div>
            {currentStepData && <div className="w-full flex-1 overflow-y-auto mt-6 pr-2">{currentStepData.body}</div>}
        </div>
    );
};
