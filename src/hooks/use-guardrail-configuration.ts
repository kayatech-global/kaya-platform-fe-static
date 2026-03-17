/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { OptionModel } from '@/components';
import { GuardrailActionType, GuardrailMaskingRuleType, GuardrailSensitiveDataManagementModeType } from '@/enums';
import { isNullOrEmpty } from '@/lib/utils';
import { IAllModel, IGuardrailSetup, IGuardrailModelConfig, IHookProps } from '@/models';
import { logger } from '@/utils';
import { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

const MOCK_GUARDRAILS: IGuardrailSetup[] = [
    {
        id: 'gr-1',
        name: 'Default Safety Guardrail',
        description: 'Standard protection against sensitive data Leakage and hallucinations.',
        configurations: {
            enableSensitiveDataManagement: true,
            enableContentAndLanguageModeration: true,
            enablePromptInjectionDetection: true,
            enableHallucinationProtection: true,
            sensitiveDataManagement: {
                mode: GuardrailSensitiveDataManagementModeType.USE_A_LLM,
                intelligenceSourceId: { id: 'llm-1', isSlm: false },
                prompt: 'Analyze for PII',
                sensitiveDataRule: [
                    {
                        fieldName: 'EMAIL',
                        classification: 'Highly Sensitive',
                        promptMaskingRule: GuardrailMaskingRuleType.REDACT,
                        responseMaskingRule: GuardrailMaskingRuleType.REDACT,
                    },
                ],
            },
        } as any,
    },
];

const MOCK_PRESIDIO_FIELDS: OptionModel[] = [
    { name: 'Email Address', value: 'EMAIL_ADDRESS', meta: 'Sensitive' },
    { name: 'Phone Number', value: 'PHONE_NUMBER', meta: 'Sensitive' },
    { name: 'Person Name', value: 'PERSON', meta: 'Highly Sensitive' },
    { name: 'Credit Card', value: 'CREDIT_CARD', meta: 'Critical' },
];

const MOCK_GUARDRAIL_MODELS: IGuardrailModelConfig[] = [
    { id: 'grm-1', name: 'Llama-Guard-3', provider: 'Meta' } as any,
    { id: 'grm-2', name: 'ShieldGemma', provider: 'Google' } as any,
];

const MOCK_LLM_MODELS: IAllModel[] = [
    { id: 'llm-1', name: 'GPT-4o', provider: 'OpenAI' } as any,
    { id: 'llm-2', name: 'Gemini 1.5 Pro', provider: 'Google' } as any,
];

const formDefaultValues = {
    name: '',
    description: '',
    configurations: {
        enableSensitiveDataManagement: false,
        enableContentAndLanguageModeration: false,
        enablePromptInjectionDetection: false,
        enableHallucinationProtection: false,
        sensitiveDataManagement: {
            mode: GuardrailSensitiveDataManagementModeType.EMPTY,
            apiModelId: '',
            guardrailModelId: '',
            intelligenceSourceId: { id: '', isSlm: false },
            prompt: '',
            sensitiveDataRule: [
                {
                    fieldName: '',
                    classification: '',
                    promptMaskingRule: GuardrailMaskingRuleType.EMPTY,
                    responseMaskingRule: GuardrailMaskingRuleType.EMPTY,
                },
            ],
            customSensitiveDataRule: [
                {
                    fieldName: '',
                    regex: '',
                    promptMaskingRule: GuardrailMaskingRuleType.EMPTY,
                    responseMaskingRule: GuardrailMaskingRuleType.EMPTY,
                },
            ],
        },
        contentAndLanguageModeration: {
            mode: GuardrailSensitiveDataManagementModeType.EMPTY,
            apiModelId: '',
            guardrailModelId: '',
            languageModeration: [
                {
                    categoryName: '',
                    scoreThreshold: null,
                    promptAction: GuardrailActionType.EMPTY,
                    responseAction: GuardrailActionType.EMPTY,
                },
            ],
        },
        promptInjectionDetection: {
            mode: GuardrailSensitiveDataManagementModeType.EMPTY,
            apiModelId: '',
            guardrailModelId: '',
            threshold: null,
            action: GuardrailActionType.EMPTY,
        },
        hallucinationProtection: {
            mode: GuardrailSensitiveDataManagementModeType.EMPTY,
            apiModelId: '',
            guardrailModelId: '',
            threshold: null,
            action: GuardrailActionType.EMPTY,
        },
    },
};

export const useGuardrailConfiguration = (props?: IHookProps) => {
    const [isOpen, setOpen] = useState<boolean>(false);
    const [isEdit, setEdit] = useState<boolean>(false);
    const [guardrailsTableData, setGuardrailTableData] = useState<IGuardrailSetup[]>([]);
    const [guardrails, setGuardrails] = useState<IGuardrailSetup[]>([]);

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        reset,
        formState: { errors, isValid },
        trigger,
        getValues,
        setError,
        clearErrors,
    } = useForm<IGuardrailSetup>({
        mode: 'all',
        defaultValues: { ...formDefaultValues },
    });

    const sensitiveDataRule = useWatch({ control, name: 'configurations.sensitiveDataManagement.sensitiveDataRule' });
    const customSensitiveDataRule = useWatch({
        control,
        name: 'configurations.sensitiveDataManagement.customSensitiveDataRule',
    });

    useEffect(() => {
        const stored = localStorage.getItem('mock_guardrails');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setGuardrails(parsed);
                setGuardrailTableData(parsed);
            } catch {
                setGuardrails(MOCK_GUARDRAILS);
                setGuardrailTableData(MOCK_GUARDRAILS);
            }
        } else {
            setGuardrails(MOCK_GUARDRAILS);
            setGuardrailTableData(MOCK_GUARDRAILS);
        }
    }, []);

    const saveToLocalStorage = (data: IGuardrailSetup[]) => {
        localStorage.setItem('mock_guardrails', JSON.stringify(data));
        setGuardrails(data);
        setGuardrailTableData(data);
    };

    useEffect(() => {
        const duplicates = findSensitiveDataRuleDuplicates(sensitiveDataRule || []);
        if (duplicates.length > 0) {
            setError('configurations.sensitiveDataManagement.validateSensitiveDataRule', {
                type: 'manual',
                message: 'Duplicate entries',
            });
        } else {
            clearErrors('configurations.sensitiveDataManagement.validateSensitiveDataRule');
        }
    }, [sensitiveDataRule, setError, clearErrors]);

    useEffect(() => {
        const duplicates = findCustomSensitiveDataRuleDuplicates(customSensitiveDataRule || []);
        if (duplicates.length > 0) {
            setError('configurations.sensitiveDataManagement.validateCustomSensitiveDataRule', {
                type: 'manual',
                message: 'Duplicate entries',
            });
        } else {
            clearErrors('configurations.sensitiveDataManagement.validateCustomSensitiveDataRule');
        }
    }, [customSensitiveDataRule, setError, clearErrors]);

    useEffect(() => {
        if (!isOpen) reset({ ...formDefaultValues, id: undefined, isReadOnly: undefined, search: undefined });
    }, [isOpen, reset]);

    const hasDuplicateError = useMemo(() => {
        return (
            !!errors?.configurations?.sensitiveDataManagement?.validateSensitiveDataRule?.message ||
            !!errors?.configurations?.sensitiveDataManagement?.validateCustomSensitiveDataRule?.message
        );
    }, [errors]);

    const isValidSensitiveDataRule = useMemo(() => {
        if (!sensitiveDataRule) return true;
        return !sensitiveDataRule.some(x => isNullOrEmpty(x.fieldName) || isNullOrEmpty(x.classification));
    }, [sensitiveDataRule]);

    const isValidCustomSensitiveDataRule = useMemo(() => {
        if (!customSensitiveDataRule) return true;
        return !customSensitiveDataRule.some(x => isNullOrEmpty(x.fieldName) || isNullOrEmpty(x.regex));
    }, [customSensitiveDataRule]);

    const protectionModeErrorMessage = useMemo(() => {
        return (
            errors?.configurations?.enableSensitiveDataManagement?.message ||
            errors?.configurations?.enableContentAndLanguageModeration?.message ||
            errors?.configurations?.enablePromptInjectionDetection?.message ||
            errors?.configurations?.enableHallucinationProtection?.message
        );
    }, [errors]);

    const isFetching = false;
    const guardrailsModelsLoading = false;
    const llmModelsLoading = false;
    const creating = false;
    const updating = false;
    const loadingBinding = false;

    const microsoftPresidioFields = useMemo(() => {
        return MOCK_PRESIDIO_FIELDS.map(x => ({
            ...x,
            disabled: sensitiveDataRule?.some(o => o.fieldName === x.value),
        }));
    }, [sensitiveDataRule]);

    const guardrailsModels = MOCK_GUARDRAIL_MODELS;
    const allModels = MOCK_LLM_MODELS;

    const {
        fields: sensitiveDataRuleFields,
        append: _appendSensitiveDataRule,
        remove: removeSensitiveDataRule,
    } = useFieldArray({
        name: 'configurations.sensitiveDataManagement.sensitiveDataRule',
        control,
    });

    const {
        fields: customSensitiveDataRuleFields,
        append: _appendCustomSensitiveDataRule,
        remove: removeCustomSensitiveDataRule,
    } = useFieldArray({
        name: 'configurations.sensitiveDataManagement.customSensitiveDataRule',
        control,
    });

    const {
        fields: languageModerationFields,
        append: _appendLanguageModeration,
        remove: removeLanguageModeration,
    } = useFieldArray({
        name: 'configurations.contentAndLanguageModeration.languageModeration',
        control,
    });

    const appendSensitiveDataRule = () =>
        _appendSensitiveDataRule({
            fieldName: 'EMAIL',
            classification: 'Highly Sensitive',
            promptMaskingRule: GuardrailMaskingRuleType.REDACT,
            responseMaskingRule: GuardrailMaskingRuleType.REDACT,
        });
    const appendCustomSensitiveDataRule = () =>
        _appendCustomSensitiveDataRule({
            fieldName: '',
            regex: '',
            promptMaskingRule: GuardrailMaskingRuleType.EMPTY,
            responseMaskingRule: GuardrailMaskingRuleType.EMPTY,
        });
    const appendLanguageModeration = () =>
        _appendLanguageModeration({
            categoryName: '',
            scoreThreshold: null,
            promptAction: GuardrailActionType.EMPTY,
            responseAction: GuardrailActionType.EMPTY,
        });

    const onEdit = (id: string) => {
        const obj = guardrails.find(x => x.id === id);
        if (obj) setGuardrailValues(obj);
    };

    const setGuardrailValues = (data: IGuardrailSetup) => {
        setValue('id', data.id);
        setValue('name', data.name);
        setValue('description', data.description);
        setValue('isReadOnly', data?.isReadOnly);
        setValue('configurations', data.configurations);
    };

    const handleCreate = () => {
        setEdit(false);
        setOpen(true);
    };
    const handleEdit = (id: string) => {
        onEdit(id);
        setEdit(true);
        setOpen(true);
    };

    const onHandleSubmit = (data: IGuardrailSetup) => {
        const body = { ...data, id: data.id || Math.random().toString(36).substring(2, 11) };
        const updated = data.id ? guardrails.map(x => (x.id === data.id ? body : x)) : [...guardrails, body];
        saveToLocalStorage(updated);

        if (props?.onRefetch) {
            props.onRefetch();
        }

        toast.success(data.id ? 'Guardrail updated successfully (Mock)' : 'Guardrail saved successfully (Mock)');
        setOpen(false);
    };

    const onGuardrailsFilter = (filter: IGuardrailSetup | null) => {
        let result = guardrails;
        if (!isNullOrEmpty(filter?.search)) {
            result = result.filter(x => x.name.toLowerCase().includes(filter?.search?.toLowerCase()?.trim() as string));
        }
        setGuardrailTableData(result);
    };

    const onDelete = (id: string) => {
        const updated = guardrails.filter(x => x.id !== id);
        saveToLocalStorage(updated);
        toast.success('Guardrail deleted successfully (Mock)');
    };

    const findSensitiveDataRuleDuplicates = (rules: any[]) => {
        const seen = new Set();
        return rules.filter(rule => {
            const key = `${rule.fieldName}-${rule.classification}`;
            return seen.has(key) ? true : !seen.add(key);
        });
    };

    const findCustomSensitiveDataRuleDuplicates = (rules: any[]) => {
        const seen = new Set();
        return rules.filter(rule => {
            const key = `${rule.fieldName}-${rule.regex}`;
            return seen.has(key) ? true : !seen.add(key);
        });
    };

    const validateRegex = (value: string) => {
        try {
            new RegExp(value);
            return true;
        } catch {
            return 'Invalid regex';
        }
    };
    const validateProtection = () => {
        const config = getValues('configurations');
        const isAnyEnabled =
            config.enableSensitiveDataManagement ||
            config.enableContentAndLanguageModeration ||
            config.enablePromptInjectionDetection ||
            config.enableHallucinationProtection;
        return isAnyEnabled ? true : 'At least one protection must be selected';
    };

    return {
        isFetching,
        control,
        errors,
        isOpen,
        isValid,
        isSaving: creating || updating,
        loadingBinding,
        isEdit,
        guardrails,
        guardrailsTableData,
        guardrailBindingData: [] as any[],
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
        setEdit,
        register,
        watch,
        reset,
        trigger,
        getValues,
        setValue,
        clearErrors,
        setGuardrailValues,
        getGuardrailBinding: () => {},
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
        refetchLLM: () => logger.log('Mock refetchLLM'),
        refetchGuardrailModels: () => logger.log('Mock refetchGuardrailModels'),
    };
};
