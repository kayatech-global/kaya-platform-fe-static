'use client';

import React, { useImperativeHandle } from 'react';
import { Dialog } from '@/components/atoms/dialog';
import { IGuardrailSetup } from '@/models/guardrail.model';
import { useGuardrailSelector } from '@/hooks/use-guardrail-selector';
import { AgentType } from '@/components/organisms';
import { GuardrailBindingLevelType } from '@/enums';
import { GuardrailSelectorTrigger } from './guardrail-selector/guardrail-selector-trigger';
import { GuardrailDialogContent } from './guardrail-selector/guardrail-dialog-content';

export interface GuardrailSelectorRef {
    onOpen: (open?: boolean) => void;
}

export interface GuardrailSelectorProps {
    agent?: AgentType;
    guardrails?: string[];
    allGuardrails: IGuardrailSetup[];
    isReadonly?: boolean;
    guardrailsLoading?: boolean;
    title: string;
    label?: string;
    labelClassName?: string;
    description?: string;
    isMultiple?: boolean;
    level: GuardrailBindingLevelType;
    setGuardrails?: React.Dispatch<React.SetStateAction<string[] | undefined>>;
    onRefetch: () => void;
    onGuardrailsChange?: (guardrails: string[] | undefined) => void;
    onModalChange?: (open: boolean) => void;
}

export const GuardrailSelector = React.forwardRef<GuardrailSelectorRef, GuardrailSelectorProps>((props, ref) => {
    const {
        agent,
        guardrails,
        isReadonly,
        guardrailsLoading,
        title,
        label,
        labelClassName,
        description,
        level,
        allGuardrails,
        isMultiple,
        setGuardrails,
        onRefetch,
        onGuardrailsChange,
        onModalChange,
    } = props;

    const {
        control,
        errors,
        isOpen,
        isValid,
        isSaving,
        isEdit,
        loadingBinding,
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
        allSearchableGuardrails,
        checkedItemId,
        searchTerm,
        openModal,
        selectedItems,
        disabledOptions,
        selectedGuardrails,
        guardrailBinding,
        hasAnyChanges,
        setOpenModal,
        setOpen,
        register,
        watch,
        trigger,
        getValues,
        setValue,
        clearErrors,
        getGuardrailBinding,
        appendSensitiveDataRule,
        appendCustomSensitiveDataRule,
        appendLanguageModeration,
        removeSensitiveDataRule,
        removeCustomSensitiveDataRule,
        removeLanguageModeration,
        validateRegex,
        validateProtection,
        handleSubmit,
        onHandleSubmit,
        refetchLLM,
        refetchGuardrailModels,
        getGuardrails,
        handleChange,
        handleRemove,
        handleSearch,
        handleItemCheck,
        handleClick,
        onEdit,
        onModalClose,
    } = useGuardrailSelector({
        agent,
        guardrails,
        isReadonly,
        guardrailsLoading,
        title,
        label,
        labelClassName,
        description,
        level,
        allGuardrails,
        isMultiple,
        setGuardrails,
        onRefetch,
        onGuardrailsChange,
        onModalChange,
    });

    useImperativeHandle(ref, () => ({
        onOpen: (open = true) => {
            getGuardrailBinding();
            setOpenModal(open);
        },
    }));

    return (
        <>
            <GuardrailSelectorTrigger
                level={level}
                label={label}
                labelClassName={labelClassName}
                description={description}
                agent={agent}
                guardrails={guardrails}
                guardrailBinding={guardrailBinding}
                guardrailsList={getGuardrails()}
                onOpen={setOpenModal}
                onGetBinding={getGuardrailBinding}
                onChange={handleChange}
                onRemove={handleRemove}
            />

            <Dialog open={openModal} onOpenChange={onModalClose}>
                <GuardrailDialogContent
                    title={title}
                    isOpen={isOpen}
                    isEdit={isEdit}
                    isReadonly={isReadonly}
                    setOpen={setOpen}
                    onModalClose={onModalClose}
                    loading={guardrailsLoading || loadingBinding}
                    searchTerm={searchTerm}
                    onSearch={handleSearch}
                    allSearchableGuardrails={allSearchableGuardrails}
                    selectedItems={selectedItems}
                    disabledOptions={disabledOptions}
                    onCheck={handleItemCheck}
                    onEdit={onEdit}
                    selectedGuardrails={selectedGuardrails}
                    level={level}
                    checkedItemId={checkedItemId}
                    hasAnyChanges={hasAnyChanges}
                    handleClick={handleClick}
                    isValid={isValid}
                    errors={errors}
                    isSaving={isSaving}
                    control={control}
                    sensitiveDataRuleFields={sensitiveDataRuleFields}
                    customSensitiveDataRuleFields={customSensitiveDataRuleFields}
                    languageModerationFields={languageModerationFields}
                    microsoftPresidioFields={microsoftPresidioFields}
                    allModels={allModels}
                    guardrailsModels={guardrailsModels}
                    llmModelsLoading={llmModelsLoading}
                    guardrailsModelsLoading={guardrailsModelsLoading}
                    hasDuplicateError={hasDuplicateError}
                    isValidSensitiveDataRule={isValidSensitiveDataRule}
                    isValidCustomSensitiveDataRule={isValidCustomSensitiveDataRule}
                    protectionModeErrorMessage={protectionModeErrorMessage}
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
            </Dialog>
        </>
    );
});

GuardrailSelector.displayName = 'GuardrailSelector';
