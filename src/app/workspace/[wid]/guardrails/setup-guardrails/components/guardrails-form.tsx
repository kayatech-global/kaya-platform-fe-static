'use client';

import { useMemo } from 'react';
import {
    Button,
    Input,
    OptionModel,
    Textarea,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/atoms';
import { IGuardrailModelConfig, IGuardrailSetup } from '@/models/guardrail.model';
import {
    Control,
    FieldArrayWithId,
    FieldErrors,
    UseFieldArrayRemove,
    UseFormClearErrors,
    UseFormGetValues,
    UseFormHandleSubmit,
    UseFormRegister,
    UseFormSetValue,
    UseFormTrigger,
    UseFormWatch,
} from 'react-hook-form';
import AppDrawer from '@/components/molecules/drawer/app-drawer';
import { cn, getSubmitButtonLabel, validateSpaces } from '@/lib/utils';
import { ShieldCheck } from 'lucide-react';
import { IAllModel } from '@/models';
import { descriptionValidate, nameValidate } from '@/utils/validation';
import { SensitiveDataManagement } from './form-field-group/sensitive-data-management';
import { ContentLanguageModeration } from './form-field-group/content-language-moderation';
import { PromptInjectionDetection } from './form-field-group/prompt-injection-detection';
import { HallucinationProtection } from './form-field-group/hallucination-protection';

export type GuardrailsFormProps = {
    isOpen: boolean;
    isEdit: boolean;
    isValid: boolean;
    errors: FieldErrors<IGuardrailSetup>;
    isSaving: boolean;
    control: Control<IGuardrailSetup, unknown>;
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
    allModels: IAllModel[];
    guardrailsModels: IGuardrailModelConfig[];
    llmModelsLoading: boolean;
    guardrailsModelsLoading: boolean;
    isReadOnly?: boolean;
    hasDuplicateError: boolean;
    isValidSensitiveDataRule: boolean;
    isValidCustomSensitiveDataRule: boolean;
    protectionModeErrorMessage: string | undefined;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    register: UseFormRegister<IGuardrailSetup>;
    watch: UseFormWatch<IGuardrailSetup>;
    trigger: UseFormTrigger<IGuardrailSetup>;
    getValues: UseFormGetValues<IGuardrailSetup>;
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
};

export const FormBody = (props: GuardrailsFormProps) => {
    const { isEdit, errors, protectionModeErrorMessage, register, watch } = props;

    const isReadOnly = useMemo(() => {
        return !!watch('isReadOnly');
    }, [watch('isReadOnly')]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-1 sm:col-span-2">
                <Input
                    {...register('name', {
                        required: nameValidate.required,
                        minLength: nameValidate.minLength,
                        maxLength: nameValidate.maxLength,
                        validate: value => validateSpaces(value, 'name'),
                    })}
                    label="Name"
                    placeholder="Enter a Name"
                    readOnly={isEdit && isReadOnly}
                    isDestructive={!!errors?.name?.message}
                    supportiveText={errors?.name?.message}
                />
            </div>
            <div className="col-span-1 sm:col-span-2">
                <Textarea
                    {...register('description', {
                        required: descriptionValidate.required,
                        minLength: descriptionValidate.minLength,
                        maxLength: descriptionValidate.maxLength,
                        validate: value => validateSpaces(value, 'description'),
                    })}
                    label="Description"
                    placeholder="Enter a Description"
                    readOnly={isEdit && isReadOnly}
                    isDestructive={!!errors?.description?.message}
                    supportiveText={errors?.description?.message}
                />
            </div>
            <hr className="col-span-1 sm:col-span-2 my-2 border-b dark:border-gray-700" />
            <div className="col-span-1 sm:col-span-2 flex flex-col gap-y-4">
                <SensitiveDataManagement {...props} isReadOnly={isReadOnly} />
                <ContentLanguageModeration {...props} isReadOnly={isReadOnly} />
                <PromptInjectionDetection {...props} isReadOnly={isReadOnly} />
                <div>
                    <HallucinationProtection {...props} isReadOnly={isReadOnly} />
                    {!!protectionModeErrorMessage && (
                        <p className="text-xs font-normal text-red-500 dark:text-red-500 mt-2">
                            {protectionModeErrorMessage}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export const GuardrailsForm = (props: GuardrailsFormProps) => {
    const { isOpen, isEdit, isValid, isSaving, hasDuplicateError, setOpen, handleSubmit, onHandleSubmit, watch } =
        props;

    return (
        <AppDrawer
            open={isOpen}
            direction="right"
            isPlainContentSheet={false}
            setOpen={setOpen}
            className="custom-drawer-content !w-[700px]"
            dismissible={false}
            headerIcon={<ShieldCheck />}
            header={isEdit ? 'Edit Guardrail' : 'New Guardrail'}
            footer={
                <div className="flex justify-end gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="sm"
                                    disabled={
                                        !isValid || hasDuplicateError || isSaving || (isEdit && !!watch('isReadOnly'))
                                    }
                                    onClick={handleSubmit(onHandleSubmit)}
                                >
                                    {getSubmitButtonLabel(isSaving, isEdit)}
                                </Button>
                            </TooltipTrigger>
                            {!isValid && (
                                <TooltipContent side="left" align="center">
                                    All details need to be filled before the form can be saved
                                </TooltipContent>
                            )}
                        </Tooltip>
                    </TooltipProvider>
                </div>
            }
            content={
                <div className={cn('activity-feed-container p-3')}>
                    <FormBody {...props} />
                </div>
            }
        />
    );
};
