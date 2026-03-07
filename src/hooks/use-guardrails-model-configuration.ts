import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { IHookProps, IGuardrailModelConfig } from '@/models';
import { useMutation, useQueryClient } from 'react-query';
import { useParams } from 'next/navigation';
import { FetchError, logger } from '@/utils';
import { isNullOrEmpty } from '@/lib/utils';
import { toast } from 'sonner';
import { AuthenticationType, GuardrailApiConfigurationType, GuardrailModelProviderType, QueryKeyType } from '@/enums';
import { OptionModel } from '@/components';
import { useGuardrailModelQuery, useVaultQuery } from './use-common';
import { guardrailModelService } from '@/services';

export const useGuardrailsModelConfiguration = (props?: IHookProps) => {
    const params = useParams();
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState<boolean>(false);
    const [guardrailsModelConfigTableData, setGuardrailsModelConfigTableData] = useState<IGuardrailModelConfig[]>([]);
    const [isOpen, setOpen] = useState<boolean>(false);
    const [isEdit, setEdit] = useState<boolean>(false);
    const [secrets, setSecrets] = useState<OptionModel[]>([]);

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
    }, [isOpen]);

    const { isFetching, data: guardrailsModelConfigs } = useGuardrailModelQuery({
        props,
        onSuccess: data => {
            setGuardrailsModelConfigTableData(data);
        },
        onError: () => {
            setGuardrailsModelConfigTableData([]);
        },
    });

    const { refetch, isLoading: loadingSecrets } = useVaultQuery({
        onSuccess: data => {
            const mapData = data?.map(x => ({
                name: x.keyName as string,
                value: x.keyName as string,
            }));
            setSecrets([...mapData]);
        },
        onError: () => {
            setSecrets([]);
        },
    });

    const { isLoading: creating, mutate: mutateCreate } = useMutation(
        (data: IGuardrailModelConfig) =>
            guardrailModelService.create<IGuardrailModelConfig>(data, params.wid as string),
        {
            onSuccess: () => {
                if (props?.onRefetch) {
                    props.onRefetch();
                }
                queryClient.invalidateQueries(QueryKeyType.GUARDRAIL_MODEL);
                setLoading(false);
                setOpen(false);
                toast.success('Guardrails model configuration saved successfully');
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                logger.error('Error creating guardrails model configuration:', error?.message);
            },
        }
    );

    const { isLoading: updating, mutate: mutateUpdate } = useMutation(
        ({ data, id }: { data: IGuardrailModelConfig; id: string }) =>
            guardrailModelService.update<IGuardrailModelConfig>(data, params.wid as string, id),
        {
            onSuccess: () => {
                if (props?.onRefetch) {
                    props.onRefetch();
                }
                queryClient.invalidateQueries(QueryKeyType.GUARDRAIL_MODEL);
                setLoading(false);
                setOpen(false);
                toast.success('Guardrails model configuration updated successfully');
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                logger.error('Error updating guardrails model configuration:', error?.message);
            },
        }
    );

    const { mutate: mutateDelete } = useMutation(
        async ({ id }: { id: string }) => await guardrailModelService.delete(id, params.wid as string),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(QueryKeyType.GUARDRAIL_MODEL);
                toast.success('Guardrails model configuration deleted successfully');
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                logger.error('Error deleting guardrails model configuration:', error?.message);
            },
        }
    );

    const onEdit = (id: string) => {
        if (id) {
            const obj = guardrailsModelConfigs?.find(x => x.id === id);
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
        if (loading) return 'Verifying';
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
