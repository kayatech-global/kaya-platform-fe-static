import { useEffect } from 'react';
import { UseFormTrigger } from 'react-hook-form';
import { WorkflowEnvConfigFormBase } from '@/models/workflow-pull.model';

export const useAccordionInitialValidation = (
    configs: WorkflowEnvConfigFormBase['configs'] | undefined,
    trigger: UseFormTrigger<WorkflowEnvConfigFormBase>,
    openAccordions: string[],
    setOpenAccordions: (ids: string[]) => void
) => {
    useEffect(() => {
        if (!configs || configs.length === 0) return;

        // 1. Run validation for all configs immediately
        configs.forEach((_, index) => {
            trigger(`configs.${index}`);
        });

        // 2. Open the first accordion if none opened yet
        if (openAccordions.length === 0) {
            setOpenAccordions([configs[0].id]);
        }
    }, [configs]);
};
