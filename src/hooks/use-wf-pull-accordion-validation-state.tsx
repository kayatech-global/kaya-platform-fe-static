import { FieldErrors, UseFormWatch } from 'react-hook-form';
import { WorkflowEnvConfigFormBase } from '@/models/workflow-pull.model';

export const useAccordionValidationState = (
    configs: WorkflowEnvConfigFormBase['configs'] | undefined,
    watch: UseFormWatch<WorkflowEnvConfigFormBase>,
    errors: FieldErrors<WorkflowEnvConfigFormBase>
) => {
    if (!configs) return [];

    return configs.map((config, configIndex) => {
        let configuredCount = 0;
        let hasErrors = false;

        config.fields.forEach((_, fieldIndex) => {
            const value = watch(`configs.${configIndex}.fields.${fieldIndex}.meta.finalValue`);
            const error = errors?.configs?.[configIndex]?.fields?.[fieldIndex]?.meta?.finalValue;

            const isConfigured = value !== '' && !error;

            if (isConfigured) configuredCount++;
            if (error) hasErrors = true;
        });

        return {
            configuredCount,
            total: config.fields.length,
            hasErrors,
        };
    });
};
