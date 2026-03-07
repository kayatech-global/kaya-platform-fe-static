'use client';
import { PlatformConfigurationSuiteSkeleton } from '@/components/organisms';
import { useBreakpoint } from '@/hooks/use-breakpoints';
import { cn } from '@/lib/utils';
import { GuardrailsTableContainer } from './guardrails-table-container';
import { GuardrailsForm } from './guardrails-form';
import { useGuardrailConfiguration } from '@/hooks/use-guardrail-configuration';

export const GuardrailsContainer = () => {
    const {
        isFetching,
        control,
        errors,
        isOpen,
        isValid,
        isSaving,
        isEdit,
        guardrailsTableData,
        sensitiveDataRuleFields,
        customSensitiveDataRuleFields,
        languageModerationFields,
        microsoftPresidioFields,
        allModels,
        guardrailsModels,
        llmModelsLoading,
        guardrailsModelsLoading,
        hasDuplicateError,
        isValidSensitiveDataRule,
        isValidCustomSensitiveDataRule,
        protectionModeErrorMessage,
        setOpen,
        register,
        watch,
        trigger,
        getValues,
        setValue,
        clearErrors,
        appendSensitiveDataRule,
        appendCustomSensitiveDataRule,
        appendLanguageModeration,
        removeSensitiveDataRule,
        removeCustomSensitiveDataRule,
        removeLanguageModeration,
        validateRegex,
        validateProtection,
        handleCreate,
        handleEdit,
        handleSubmit,
        onHandleSubmit,
        onDelete,
        onGuardrailsFilter,
        refetchLLM,
        refetchGuardrailModels,
    } = useGuardrailConfiguration();
    const { isLg } = useBreakpoint();

    if (isFetching) return <PlatformConfigurationSuiteSkeleton hasCards={false} />;

    return (
        <>
            <div className="metric-page pb-4">
                <div className="flex justify-between gap-x-9">
                    <div
                        className={cn('dashboard-left-section flex flex-col w-full', {
                            'gap-y-9': isLg,
                        })}
                    >
                        <GuardrailsTableContainer
                            guardrails={guardrailsTableData}
                            onGuardrailsFilter={onGuardrailsFilter}
                            onNewButtonClick={handleCreate}
                            onEditButtonClick={handleEdit}
                            onDelete={onDelete}
                        />
                    </div>
                </div>
            </div>

            <GuardrailsForm
                isOpen={isOpen}
                isEdit={isEdit}
                isValid={isValid}
                errors={errors}
                isSaving={isSaving}
                control={control}
                sensitiveDataRuleFields={sensitiveDataRuleFields}
                customSensitiveDataRuleFields={customSensitiveDataRuleFields}
                languageModerationFields={languageModerationFields}
                microsoftPresidioFields={microsoftPresidioFields}
                allModels={allModels ?? []}
                guardrailsModels={guardrailsModels ?? []}
                llmModelsLoading={llmModelsLoading}
                guardrailsModelsLoading={guardrailsModelsLoading}
                hasDuplicateError={hasDuplicateError}
                isValidSensitiveDataRule={isValidSensitiveDataRule}
                isValidCustomSensitiveDataRule={isValidCustomSensitiveDataRule}
                protectionModeErrorMessage={protectionModeErrorMessage}
                setOpen={setOpen}
                register={register}
                trigger={trigger}
                getValues={getValues}
                watch={watch}
                setValue={setValue}
                clearErrors={clearErrors}
                appendSensitiveDataRule={appendSensitiveDataRule}
                appendCustomSensitiveDataRule={appendCustomSensitiveDataRule}
                appendLanguageModeration={appendLanguageModeration}
                removeSensitiveDataRule={removeSensitiveDataRule}
                removeCustomSensitiveDataRule={removeCustomSensitiveDataRule}
                removeLanguageModeration={removeLanguageModeration}
                validateRegex={validateRegex}
                validateProtection={validateProtection}
                handleSubmit={handleSubmit}
                onHandleSubmit={onHandleSubmit}
                refetchLLM={refetchLLM}
                refetchGuardrailModels={refetchGuardrailModels}
            />
        </>
    );
};
