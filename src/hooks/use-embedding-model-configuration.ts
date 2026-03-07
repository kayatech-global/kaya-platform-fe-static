import { EmbeddingData } from '@/app/workspace/[wid]/intelligence-enhancers/embedding-models/components/embedding-model-configuration-table-container';
import { OptionModel } from '@/components';
import { EmbeddingProviderType, QueryKeyType } from '@/enums';
import { isNullOrEmpty } from '@/lib/utils';
import { IEmbedding, IProvider, IHookProps } from '@/models';
import { FetchError, logger } from '@/utils';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { toast } from 'sonner';
import { useEmbeddingModelQuery, usePlatformQuery, useVaultQuery } from './use-common';
import { embeddingModelService } from '@/services';

export const useEmbeddingModelConfiguration = (props?: IHookProps) => {
    const params = useParams();
    const queryClient = useQueryClient();
    const [embeddingTableData, setEmbeddingTableData] = useState<EmbeddingData[]>([]);
    const [embeddings, setEmbeddings] = useState<EmbeddingData[]>([]);
    const [isOpen, setOpen] = useState<boolean>(false);
    const [isEdit, setEdit] = useState<boolean>(false);
    const [secrets, setSecrets] = useState<OptionModel[]>([]);
    const [providers, setProviders] = useState<IProvider[]>([]);
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        unregister,
        formState: { errors, isValid },
        control,
    } = useForm<IEmbedding>({ mode: 'all' });

    useEffect(() => {
        if (!isOpen) {
            reset({
                id: undefined,
                name: '',
                description: '',
                provider: '',
                modelName: '',
                configurations: {
                    apiKey: '',
                    dimensions: undefined,
                    baseURL: '',
                    secretKey: undefined,
                    accessKeyId: undefined,
                    region: undefined,
                },
                isReadOnly: undefined,
                modelNameOption: undefined,
            });
        }
    }, [isOpen]);

    useEffect(() => {
        unregister('configurations.apiKey', { keepValue: true });
    }, [watch('provider')]);

    const { isFetching } = useEmbeddingModelQuery({
        props,
        onSuccess: data => {
            setEmbeddingTableData([...data]);
            setEmbeddings([...data]);
        },
        onError: () => {
            setEmbeddingTableData([]);
            setEmbeddings([]);
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

    usePlatformQuery({
        queryKey: 'providers',
        onSuccess: data => {
            setProviders(JSON.parse(data.embeddingModelProviders));
        },
        onError: () => {
            setProviders([]);
        },
    });

    const { mutate: mutateCreate, isLoading: creating } = useMutation(
        (data: IEmbedding) => embeddingModelService.create<IEmbedding>(data, params.wid as string),
        {
            onSuccess: data => {
                if (props?.hookForm?.formName && props?.hookForm?.setValue) {
                    props.hookForm.setValue(props.hookForm.formName, data.id);
                }
                if (props?.onRefetch) {
                    props.onRefetch(data?.id);
                }
                queryClient.invalidateQueries(QueryKeyType.EMBEDDING_MODEL);
                setOpen(false);
                toast.success('Embedding model saved successfully');
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                logger.error('Error creating embedding model:', error?.message);
            },
        }
    );

    const { mutate: mutateUpdate, isLoading: updating } = useMutation(
        ({ data, id }: { data: IEmbedding; id: string }) =>
            embeddingModelService.update<IEmbedding>(data, params.wid as string, id),
        {
            onSuccess: () => {
                if (props?.onRefetch) {
                    props.onRefetch();
                }
                queryClient.invalidateQueries(QueryKeyType.EMBEDDING_MODEL);
                setOpen(false);
                toast.success('Embedding model updated successfully');
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                logger.error('Error updating embedding model:', error?.message);
            },
        }
    );

    const { mutate: mutateDelete } = useMutation(
        async ({ id }: { id: string }) => await embeddingModelService.delete(id, params.wid as string),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(QueryKeyType.EMBEDDING_MODEL);
                toast.success('Embedding model deleted successfully');
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                logger.error('Error deleting embedding model:', error?.message);
            },
        }
    );

    const handleCreate = () => {
        setEdit(false);
        setOpen(true);
    };

    const onEdit = (id: string) => {
        if (id) {
            setEdit(true);
            setOpen(true);
            const obj = embeddings?.find(x => x.id === id);
            if (obj) {
                setValue('id', obj.id);
                setValue('name', obj.name);
                setValue('description', obj.description);
                setValue('provider', obj.provider);
                setValue('modelName', obj.modelName);
                setValue('configurations', obj.configurations);
                setValue('configurations.apiKey', obj.configurations.apiKey);
                const originalProvider = providers?.find(x => x.value === obj.provider);
                if (originalProvider) {
                    const originalModel = originalProvider.models?.find(x => x.value === obj.modelName);
                    if (originalModel) {
                        setValue('modelNameOption', { label: originalModel.value, value: originalModel.value });
                    } else {
                        setValue('modelNameOption', { label: obj.modelName, value: obj.modelName });
                    }
                }
            }
        }
    };

    const onHandleSubmit = (data: IEmbedding) => {
        try {
            const bedrock = data.provider === EmbeddingProviderType.Bedrock;
            const body: IEmbedding = {
                name: data.name,
                description: data.description,
                provider: data.provider,
                modelName: data?.modelNameOption?.value as string,
                configurations: {
                    apiKey: data.configurations.apiKey,
                    dimensions: data.configurations.dimensions,
                    baseURL: data.configurations.baseURL,
                    secretKey: bedrock ? data.configurations.secretKey : undefined,
                    accessKeyId: bedrock ? data.configurations.accessKeyId : undefined,
                    region: bedrock ? data.configurations.region : undefined,
                },
            };
            if (data.id) {
                mutateUpdate({ data: body, id: data.id });
            } else {
                mutateCreate(body);
            }
        } catch (error) {
            toast.error("Something went wrong! We couldn't save your embedding model");
            logger.error(`An unexpected error occurred: ${error}`);
        }
    };

    const onEmbeddingFilter = (filter: EmbeddingData | null) => {
        let result = embeddings;

        if (!isNullOrEmpty(filter?.search)) {
            result = result.filter(x => x.name.toLowerCase().includes(filter?.search?.toLowerCase()?.trim() as string));
        }
        if (!isNullOrEmpty(filter?.provider)) {
            result = result.filter(x => x.provider.toLowerCase() === filter?.provider.toLowerCase());
        }

        setEmbeddingTableData(result);
    };

    const onDelete = (id: string) => {
        if (id) {
            mutateDelete({ id });
        }
    };

    return {
        embeddingTableData,
        isFetching,
        providers,
        errors,
        isOpen,
        isValid,
        secrets,
        isSaving: creating || updating,
        loadingSecrets,
        isEdit,
        control,
        onEmbeddingFilter,
        register,
        watch,
        setValue,
        setEdit,
        handleSubmit,
        onHandleSubmit,
        handleCreate,
        onEdit,
        setOpen,
        onDelete,
        refetch,
    };
};
