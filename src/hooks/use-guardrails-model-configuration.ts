import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { IHookProps, IGuardrailModelConfig } from '@/models';
import { logger } from '@/utils';
import { isNullOrEmpty } from '@/lib/utils';
import { toast } from 'sonner';
import { AuthenticationType, GuardrailApiConfigurationType, GuardrailModelProviderType } from '@/enums';
import { OptionModel } from '@/components';

const MOCK_GUARDRAIL_MODEL_CONFIGS: IGuardrailModelConfig[] = [
    {
        id: 'mock-grm-1',
        name: 'Microsoft Presidio Analyzer',
        description: 'Mock Presidio analyzer service',
        guardrailType: GuardrailApiConfigurationType.SENSITIVE_DATA_DETECTION,
        provider: GuardrailModelProviderType.MICROSOFT_PRESIDIO,
        configurations: {
            analyzerServiceHost: 'http://localhost:5001/analyze',
            anonymizerServiceHost: 'http://localhost:5001/anonymize',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
    },
];

const MOCK_SECRETS: OptionModel[] = [
    { name: 'GOOGLE_CREDENTIALS', value: 'GOOGLE_CREDENTIALS' },
    { name: 'ANTHROPIC_API_KEY', value: 'ANTHROPIC_API_KEY' },
];

export const useGuardrailsModelConfiguration = (props?: IHookProps) => {
    const [guardrailsModelConfigTableData, setGuardrailsModelConfigTableData] = useState<IGuardrailModelConfig[]>([]);
    const [guardrailsModelConfigs, setGuardrailsModelConfigs] = useState<IGuardrailModelConfig[]>([]);
    const [isOpen, setOpen] = useState<boolean>(false);
    const [isEdit, setEdit] = useState<boolean>(false);
    const [secrets] = useState<OptionModel[]>(MOCK_SECRETS);

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        reset,
        formState: { errors, isValid },
    } = useForm<IGuardrailModelConfig>({
        mode: 'all',
        defaultValues: {
            name: '',
            description: '',
            configurations: {
                analyzerServiceHost: '',
                anonymizerServiceHost: '',
            },
        },
    });

    useEffect(() => {
        const stored = localStorage.getItem('mock_guardrail_models');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setGuardrailsModelConfigs(parsed);
                setGuardrailsModelConfigTableData(parsed);
            } catch {
                setGuardrailsModelConfigs(MOCK_GUARDRAIL_MODEL_CONFIGS);
                setGuardrailsModelConfigTableData(MOCK_GUARDRAIL_MODEL_CONFIGS);
            }
        } else {
            setGuardrailsModelConfigs(MOCK_GUARDRAIL_MODEL_CONFIGS);
            setGuardrailsModelConfigTableData(MOCK_GUARDRAIL_MODEL_CONFIGS);
        }
    }, []);

    const saveToLocalStorage = (data: IGuardrailModelConfig[]) => {
        localStorage.setItem('mock_guardrail_models', JSON.stringify(data));
        setGuardrailsModelConfigs(data);
        setGuardrailsModelConfigTableData(data);
    };

    useEffect(() => {
        if (!isOpen) {
            reset({
                id: undefined,
                name: '',
                description: '',
                guardrailType: GuardrailApiConfigurationType.EMPTY,
                provider: GuardrailModelProviderType.EMPTY,
                configurations: {
                    analyzerServiceHost: '',
                    anonymizerServiceHost: '',
                    apiKey: '',
                    projectId: '',
                    location: '',
                    modelName: '',
                    baseUrl: '',
                    authenticationType: AuthenticationType.Empty,
                },
                isReadOnly: undefined,
                search: undefined,
            });
        }
    }, [isOpen, reset]);

    const isFetching = false;
    const loadingSecrets = false;
    const creating = false;
    const updating = false;

    const refetch = async () => {
        logger.log('Mock vault refetch called');
    };

    const mutateCreate = (data: IGuardrailModelConfig) => {
        const newModel = { ...data, id: Math.random().toString(36).substring(2, 11) };
        const updated = [...guardrailsModelConfigs, newModel];
        saveToLocalStorage(updated);
        setOpen(false);
        toast.success('Guardrails model configuration saved successfully (Mock)');
        if (props?.onRefetch) props.onRefetch();
    };

    const mutateUpdate = ({ data, id }: { data: IGuardrailModelConfig; id: string }) => {
        const updated = guardrailsModelConfigs.map(x => (x.id === id ? { ...data, id } : x));
        saveToLocalStorage(updated);
        setOpen(false);
        toast.success('Guardrails model configuration updated successfully (Mock)');
        if (props?.onRefetch) props.onRefetch();
    };

    const mutateDelete = ({ id }: { id: string }) => {
        const updated = guardrailsModelConfigs.filter(x => x.id !== id);
        saveToLocalStorage(updated);
        toast.success('Guardrails model configuration deleted successfully (Mock)');
    };

    const onEdit = (id: string) => {
        if (id) {
            const obj = guardrailsModelConfigs.find(x => x.id === id);
            if (obj) {
                setValue('id', obj.id);
                setValue('name', obj.name);
                setValue('description', obj.description);
                setValue('guardrailType', obj.guardrailType);
                setValue('provider', obj.provider);
                setValue('isReadOnly', obj?.isReadOnly);
                setValue('configurations', obj.configurations);
            }
        }
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

    const mapGuardrailsModel = (data: IGuardrailModelConfig) => {
        const obj = { ...data, isReadOnly: undefined } as IGuardrailModelConfig;

        if (
            data?.guardrailType === GuardrailApiConfigurationType.SENSITIVE_DATA_DETECTION &&
            data?.provider === GuardrailModelProviderType.MICROSOFT_PRESIDIO
        ) {
            return {
                ...obj,
                configurations: {
                    analyzerServiceHost: data?.configurations?.analyzerServiceHost,
                    anonymizerServiceHost: data?.configurations?.anonymizerServiceHost,
                },
            } as IGuardrailModelConfig;
        } else if (
            (data?.guardrailType === GuardrailApiConfigurationType.CONTENT_MODERATION &&
                data?.provider === GuardrailModelProviderType.VERTEX_AI_CONTENT_MODERATION) ||
            (data?.guardrailType === GuardrailApiConfigurationType.PROMPT_INJECTION_DETECTION &&
                data?.provider === GuardrailModelProviderType.GOOGLE_DEEPMIND_GEMINI) ||
            (data?.guardrailType === GuardrailApiConfigurationType.HALLUCINATION_PROTECTION &&
                data?.provider === GuardrailModelProviderType.GOOGLE_DEEPMIND_GEMINI)
        ) {
            return {
                ...obj,
                configurations: {
                    projectId: data?.configurations?.projectId,
                    location: data?.configurations?.location,
                    modelName: data?.configurations?.modelName,
                    authenticationType: data?.configurations?.authenticationType,
                    meta: {
                        token: data?.configurations?.meta?.token,
                    },
                },
            } as IGuardrailModelConfig;
        } else if (
            (data?.guardrailType === GuardrailApiConfigurationType.PROMPT_INJECTION_DETECTION &&
                data?.provider === GuardrailModelProviderType.ANTHROPIC_CLAUDE_3) ||
            (data?.guardrailType === GuardrailApiConfigurationType.HALLUCINATION_PROTECTION &&
                data?.provider === GuardrailModelProviderType.ANTHROPIC_CLAUDE_3)
        ) {
            return {
                ...obj,
                configurations: {
                    baseUrl: data?.configurations?.baseUrl,
                    modelName: data?.configurations?.modelName,
                    apiKey: data?.configurations?.apiKey,
                },
            } as IGuardrailModelConfig;
        }

        return obj;
    };

    const onHandleSubmit = (data: IGuardrailModelConfig) => {
        const body = mapGuardrailsModel(data);
        if (data.id) {
            mutateUpdate({ data: body, id: data.id });
        } else {
            mutateCreate(body);
        }
    };

    const buttonText = () => {
        if (isFetching) return 'Please Wait';
        if (creating || updating) return 'Saving';
        return 'Save';
    };

    const onGuardrailsModelConfigFilter = (filter: IGuardrailModelConfig | null) => {
        let result = guardrailsModelConfigs ?? [];

        if (!isNullOrEmpty(filter?.search)) {
            result = result.filter(x => x.name.toLowerCase().includes(filter?.search?.toLowerCase()?.trim() as string));
        }

        setGuardrailsModelConfigTableData(result);
    };

    const onDelete = (id: string) => {
        if (id) {
            mutateDelete({ id });
        }
    };

    return {
        isFetching,
        control,
        errors,
        isOpen,
        isValid,
        secrets,
        isSaving: creating || updating,
        loadingSecrets,
        isEdit,
        guardrailsModelConfigTableData,
        setOpen,
        setEdit,
        onEdit,
        buttonText,
        register,
        watch,
        setValue,
        handleCreate,
        handleEdit,
        handleSubmit,
        onHandleSubmit,
        onDelete,
        onGuardrailsModelConfigFilter,
        refetch,
    };
};
