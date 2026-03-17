'use client';

import React, { useState } from 'react';
import { Control, FieldErrors, UseFormRegister, UseFormSetValue, UseFormTrigger, UseFormWatch } from 'react-hook-form';
import { WorkflowEnvConfigFormBase } from '@/models/workflow-pull.model';
import { WorkflowAccordionHeader } from './workflow-accordion-header';
import { ConfigurationSection } from './configuration-section';
import { OptionModel } from '@/components/atoms';
import { useAccordionInitialValidation } from '@/hooks/use-wf-pull-accordion-init-validation';
import { useAccordionValidationState } from '@/hooks/use-wf-pull-accordion-validation-state';
import { HeaderConfigurationSection } from './header-configuration-section';

import { IntellisenseCategory } from '@/app/workspace/[wid]/prompt-templates/components/monaco-editor';

interface WorkflowConfigureAccordionProps {
    watch: UseFormWatch<WorkflowEnvConfigFormBase>;
    errors: FieldErrors<WorkflowEnvConfigFormBase>;
    setValue: UseFormSetValue<WorkflowEnvConfigFormBase>;
    register: UseFormRegister<WorkflowEnvConfigFormBase>;
    secrets: OptionModel[];
    refetchSecrets: () => void;
    loadingSecrets: boolean;
    trigger: UseFormTrigger<WorkflowEnvConfigFormBase>;
    intellisenseOptions?: IntellisenseCategory[];
    control: Control<WorkflowEnvConfigFormBase>;
}

export const WorkflowConfigureAccordion = ({
    watch,
    errors,
    setValue,
    register,
    secrets,
    refetchSecrets,
    loadingSecrets,
    trigger,
    intellisenseOptions,
    control,
}: WorkflowConfigureAccordionProps) => {
    const configs = watch('configs');
    const [openAccordions, setOpenAccordions] = useState<string[]>([]);

    useAccordionInitialValidation(configs, trigger, openAccordions, setOpenAccordions);
    const accordionStats = useAccordionValidationState(configs, watch, errors);

    const toggleAccordion = async (id: string) => {
        setOpenAccordions(prev => {
            if (prev.includes(id)) {
                // close it
                return prev.filter(x => x !== id);
            }
            // open it (without closing others)
            return [...prev, id];
        });

        // find config index
        const index = configs.findIndex(c => c.id === id);

        // trigger validation for fields inside this accordion
        await trigger(`configs.${index}`);
    };

    return (
        <div className="space-y-2">
            {watch('configs').map((config, configIndex) => {
                const isOpen = openAccordions.includes(config.id);
                const { configuredCount, total, hasErrors } = accordionStats[configIndex];

                const fields = watch(`configs.${configIndex}.fields`);

                const headerFieldIndexes = fields
                    ?.map((field, fieldIndex) => (field?.name?.startsWith('header--') ? fieldIndex : null))
                    .filter((v): v is number => v !== null);

                return (
                    <div
                        key={config.id}
                        className="border border-blue-200 dark:border-gray-700 rounded-[4px] overflow-clip"
                    >
                        <WorkflowAccordionHeader
                            name={config.name}
                            id={config.id}
                            type={config.type}
                            fieldCount={total}
                            isOpen={isOpen}
                            configuredCount={configuredCount}
                            hasErrors={hasErrors}
                            toggleAccordion={toggleAccordion}
                        />
                        <div
                            className={`p-2 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 space-y-4 rounded-lg ${
                                isOpen ? 'block' : 'hidden'
                            }`}
                        >
                            {config.fields.map((fieldItem, fieldIndex) => {
                                if (headerFieldIndexes.includes(fieldIndex)) return null;

                                return (
                                    <ConfigurationSection
                                        key={`${config.id}-field-${fieldIndex}`}
                                        configIndex={configIndex}
                                        fieldIndex={fieldIndex}
                                        watch={watch}
                                        errors={errors}
                                        setValue={setValue}
                                        register={register}
                                        secrets={secrets}
                                        refetchSecrets={refetchSecrets}
                                        loadingSecrets={loadingSecrets}
                                        intellisenseOptions={intellisenseOptions}
                                        control={control}
                                    />
                                );
                            })}

                            {headerFieldIndexes.length > 0 && (
                                <HeaderConfigurationSection
                                    configIndex={configIndex}
                                    fieldIndexes={headerFieldIndexes}
                                    watch={watch}
                                    errors={errors}
                                    setValue={setValue}
                                    register={register}
                                    secrets={secrets}
                                    refetchSecrets={refetchSecrets}
                                    loadingSecrets={loadingSecrets}
                                    intellisenseOptions={intellisenseOptions}
                                    control={control}
                                />
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
