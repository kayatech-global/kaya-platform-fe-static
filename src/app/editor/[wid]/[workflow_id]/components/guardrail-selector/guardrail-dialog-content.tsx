import React, { Dispatch, SetStateAction } from 'react';
import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, OptionModel } from '@/components';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/atoms/dialog';
import { FormBody as GuardrailConfigurationFormBody } from '@/app/workspace/[wid]/guardrails/setup-guardrails/components/guardrails-form';
import { Unplug } from 'lucide-react';
import { GuardrailSelectionView } from './guardrail-selection-view';
import { IGuardrailSetup, IGuardrailGroup, IAllModel, IGuardrailModelConfig } from '@/models';
import { GuardrailBindingLevelType } from '@/enums';
import {
    Control,
    FieldErrors,
    UseFormRegister,
    UseFormWatch,
    UseFormTrigger,
    UseFormGetValues,
    UseFormSetValue,
    FieldArrayWithId,
    UseFormHandleSubmit,
    UseFormClearErrors,
    UseFieldArrayRemove,
} from 'react-hook-form';

// Initializing types that match useGuardrailSelector hook return values
interface GuardrailDialogContentProps {
    title: string;
    isOpen: boolean;
    isEdit: boolean;
    isReadonly?: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    onModalClose: (open: boolean, cancel?: boolean) => void;

    // Selection View Props
    loading: boolean;
    searchTerm: string;
    onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
    allSearchableGuardrails: IGuardrailSetup[] | undefined;
    selectedItems: string[] | undefined;
    disabledOptions: string[];
    onCheck: (item: IGuardrailSetup) => void;
    onEdit: (id: string) => void;
    selectedGuardrails: IGuardrailGroup[];
    level: GuardrailBindingLevelType;

    // Footer / Logic Props
    checkedItemId: string[] | undefined;
    hasAnyChanges: boolean;
    handleClick: () => void; // Apply Changes

    // Edit Form Props
    isValid: boolean;
    errors: FieldErrors<IGuardrailSetup>;
    isSaving: boolean;
    control: Control<IGuardrailSetup>;

    sensitiveDataRuleFields: FieldArrayWithId<
        IGuardrailSetup,
        'configurations.sensitiveDataManagement.sensitiveDataRule',
        'id'
    >[];
    customSensitiveDataRuleFields: FieldArrayWithId<
        IGuardrailSetup,
        'configurations.sensitiveDataManagement.customSensitiveDataRule',
        'id'
    >[];
    languageModerationFields: FieldArrayWithId<
        IGuardrailSetup,
        'configurations.contentAndLanguageModeration.languageModeration',
        'id'
    >[];

    microsoftPresidioFields: OptionModel[];
    allModels: IAllModel[] | undefined;
    guardrailsModels: IGuardrailModelConfig[] | undefined;
    llmModelsLoading: boolean;
    guardrailsModelsLoading: boolean;
    hasDuplicateError: boolean;
    isValidSensitiveDataRule: boolean;
    isValidCustomSensitiveDataRule: boolean;
    protectionModeErrorMessage: string | undefined;

    register: UseFormRegister<IGuardrailSetup>;
    trigger: UseFormTrigger<IGuardrailSetup>;
    getValues: UseFormGetValues<IGuardrailSetup>;
    watch: UseFormWatch<IGuardrailSetup>;
    setValue: UseFormSetValue<IGuardrailSetup>;
    clearErrors: UseFormClearErrors<IGuardrailSetup>;

    appendSensitiveDataRule: () => void;
    appendCustomSensitiveDataRule: () => void;
    appendLanguageModeration: () => void;
    removeSensitiveDataRule: UseFieldArrayRemove;
    removeCustomSensitiveDataRule: UseFieldArrayRemove;
    removeLanguageModeration: UseFieldArrayRemove;
    validateRegex: (value: string) => true | string;
    validateProtection: (value: boolean) => true | string;
    handleSubmit: UseFormHandleSubmit<IGuardrailSetup>;
    onHandleSubmit: (data: IGuardrailSetup) => void;
    refetchLLM: () => void;
    refetchGuardrailModels: () => void;
}

export const GuardrailDialogContent: React.FC<GuardrailDialogContentProps> = props => {
    const {
        title,
        isOpen,
        isEdit,
        isReadonly,
        setOpen,
        onModalClose,
        loading,
        searchTerm,
        onSearch,
        allSearchableGuardrails,
        selectedItems,
        disabledOptions,
        onCheck,
        onEdit,
        selectedGuardrails,
        level,
        checkedItemId,
        hasAnyChanges,
        handleClick,
        isValid,
        hasDuplicateError,
        isSaving,
        watch,
        handleSubmit,
        onHandleSubmit,
        // ... pass rest to form
    } = props;

    const modeText = isEdit ? 'Edit' : 'New';
    const dialogTitle = isOpen ? `${modeText} Guardrail` : title;

    return (
        <DialogContent className="max-w-[unset] w-[680px]">
            <DialogHeader className="px-0">
                <DialogTitle asChild>
                    <div className="px-4 flex gap-2">
                        {isOpen && <Unplug />}
                        <p className="text-lg font-semibold text-gray-700 dark:text-gray-100">{dialogTitle}</p>
                    </div>
                </DialogTitle>
            </DialogHeader>
            <DialogDescription asChild>
                <div className="px-4 flex flex-col gap-y-4 h-[451px]">
                    {!isOpen && (
                        <div className="flex justify-end">
                            <Button variant="link" disabled={isReadonly} onClick={() => setOpen(true)}>
                                New Guardrail
                            </Button>
                        </div>
                    )}
                    {isOpen ? (
                        <div className="item-list-container overflow-y-auto flex flex-col gap-y-2 px-2">
                            <GuardrailConfigurationFormBody
                                isOpen={props.isOpen}
                                isEdit={props.isEdit}
                                isValid={props.isValid}
                                errors={props.errors}
                                isSaving={props.isSaving}
                                control={props.control}
                                sensitiveDataRuleFields={props.sensitiveDataRuleFields}
                                customSensitiveDataRuleFields={props.customSensitiveDataRuleFields}
                                languageModerationFields={props.languageModerationFields}
                                microsoftPresidioFields={props.microsoftPresidioFields}
                                allModels={props.allModels ?? []}
                                guardrailsModels={props.guardrailsModels ?? []}
                                llmModelsLoading={props.llmModelsLoading}
                                guardrailsModelsLoading={props.guardrailsModelsLoading}
                                hasDuplicateError={props.hasDuplicateError}
                                isValidSensitiveDataRule={props.isValidSensitiveDataRule}
                                isValidCustomSensitiveDataRule={props.isValidCustomSensitiveDataRule}
                                protectionModeErrorMessage={props.protectionModeErrorMessage}
                                setOpen={props.setOpen}
                                register={props.register}
                                trigger={props.trigger}
                                getValues={props.getValues}
                                watch={props.watch}
                                setValue={props.setValue}
                                clearErrors={props.clearErrors}
                                appendSensitiveDataRule={props.appendSensitiveDataRule}
                                appendCustomSensitiveDataRule={props.appendCustomSensitiveDataRule}
                                appendLanguageModeration={props.appendLanguageModeration}
                                removeSensitiveDataRule={props.removeSensitiveDataRule}
                                removeCustomSensitiveDataRule={props.removeCustomSensitiveDataRule}
                                removeLanguageModeration={props.removeLanguageModeration}
                                validateRegex={props.validateRegex}
                                validateProtection={props.validateProtection}
                                handleSubmit={props.handleSubmit}
                                onHandleSubmit={props.onHandleSubmit}
                                refetchLLM={props.refetchLLM}
                                refetchGuardrailModels={props.refetchGuardrailModels}
                            />
                        </div>
                    ) : (
                        <GuardrailSelectionView
                            loading={loading}
                            searchTerm={searchTerm}
                            onSearch={onSearch}
                            allSearchableGuardrails={allSearchableGuardrails}
                            selectedItems={selectedItems}
                            disabledOptions={disabledOptions}
                            isReadonly={isReadonly}
                            onCheck={onCheck}
                            onEdit={onEdit}
                            selectedGuardrails={selectedGuardrails}
                            level={level}
                        />
                    )}
                </div>
            </DialogDescription>
            <DialogFooter>
                <Button variant="secondary" onClick={() => onModalClose(false, true)}>
                    Cancel
                </Button>
                {isOpen ? (
                    <Button
                        variant="primary"
                        disabled={!isValid || hasDuplicateError || isSaving || (isEdit && !!watch('isReadOnly'))}
                        onClick={handleSubmit(onHandleSubmit)}
                    >
                        {isEdit ? 'Update' : 'Create'}
                    </Button>
                ) : (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    disabled={checkedItemId === undefined || isReadonly || !hasAnyChanges}
                                    variant="primary"
                                    onClick={handleClick}
                                >
                                    Apply Changes
                                </Button>
                            </TooltipTrigger>
                            {!hasAnyChanges && (
                                <TooltipContent side="left" align="center">
                                    No changes to apply
                                </TooltipContent>
                            )}
                        </Tooltip>
                    </TooltipProvider>
                )}
            </DialogFooter>
        </DialogContent>
    );
};
