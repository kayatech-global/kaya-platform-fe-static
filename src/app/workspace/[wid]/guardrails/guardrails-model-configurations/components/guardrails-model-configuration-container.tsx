'use client';

import React from 'react';
import { GuardrailsModelConfigurationTableContainer } from './guardrails-model-configuration-table-container';
import { useBreakpoint } from '@/hooks/use-breakpoints';
import { cn } from '@/lib/utils';
import { useGuardrailsModelConfiguration } from '@/hooks/use-guardrails-model-configuration';
import GuardrailsModelConfigurationForm from './guardrails-model-configuration-form';
import { PlatformConfigurationSuiteSkeleton } from '@/components/organisms';

export const GuardrailsModelConfigurationContainer = () => {
    const {
        isFetching,
        control,
        isOpen,
        isEdit,
        errors,
        isValid,
        secrets,
        isSaving,
        loadingSecrets,
        guardrailsModelConfigTableData,
        register,
        watch,
        setValue,
        handleCreate,
        handleEdit,
        handleSubmit,
        onHandleSubmit,
        setOpen,
        onDelete,
        onGuardrailsModelConfigFilter,
        refetch,
    } = useGuardrailsModelConfiguration();
    const { isLg } = useBreakpoint();

    if (isFetching) return <PlatformConfigurationSuiteSkeleton hasCards={false} />;

    return (
        <div className="metric-page pb-4">
            <div className="flex justify-between gap-x-9">
                <div
                    className={cn('dashboard-left-section flex flex-col w-full', {
                        'gap-y-9': isLg,
                    })}
                >
                    <GuardrailsModelConfigurationTableContainer
                        GuardrailsModelConfigurations={guardrailsModelConfigTableData}
                        onGuardrailsModelConfigFilter={onGuardrailsModelConfigFilter}
                        onNewButtonClick={handleCreate}
                        onEditButtonClick={handleEdit}
                        onDelete={onDelete}
                    />
                </div>
            </div>

            {/* Guardrails API Configuration Form */}
            <GuardrailsModelConfigurationForm
                isOpen={isOpen}
                isEdit={isEdit}
                errors={errors}
                isValid={isValid}
                secrets={secrets}
                isSaving={isSaving}
                setOpen={setOpen}
                register={register}
                watch={watch}
                setValue={setValue}
                control={control}
                loadingSecrets={loadingSecrets}
                handleSubmit={handleSubmit}
                onHandleSubmit={onHandleSubmit}
                refetch={refetch}
            />
        </div>
    );
};
