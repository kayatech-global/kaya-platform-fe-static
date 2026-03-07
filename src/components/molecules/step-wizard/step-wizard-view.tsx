'use client';

import React from 'react';
import { ContentStep, StepWizard } from './step-wizard';

export type ApiStepPane = ContentStep & {
    content: React.ReactNode;
};

type StepWizardViewProps = {
    panes: ApiStepPane[];
    activeStep: number | string;
    headerClassName?: string;
    showSeparators?: boolean;
    onStepClick?: (id: number | string) => void;
};

export const StepWizardView = ({
    panes,
    activeStep,
    headerClassName,
    showSeparators,
    onStepClick,
}: StepWizardViewProps) => {
    const steps: ContentStep[] = panes.map(({ id, label }) => ({ id, label }));
    const activePane = panes.find(p => String(p.id) === String(activeStep));

    return (
        <div className="space-y-4">
            <StepWizard
                steps={steps}
                activeStep={activeStep}
                className={headerClassName}
                showSeparators={showSeparators}
                onStepClick={onStepClick}
            />
            <div>{activePane?.content}</div>
        </div>
    );
};
