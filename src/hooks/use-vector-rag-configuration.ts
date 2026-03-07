'use client';

import { useState, useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useParams } from 'next/navigation';
import { useMutation, useQueryClient } from 'react-query';
import { toast } from 'sonner';
import { FetchError, logger } from '@/utils';
import { IAllModel, IHookProps, IVectorRag } from '@/models';
import { getEnumKeyByValue, isNullOrEmpty } from '@/lib/utils';
import { DatabaseItemType, QueryKeyType } from '@/enums';
import { PromptResponse } from '@/app/workspace/[wid]/agents/components/agent-form';
import {
    useDatabaseQuery,
    useEmbeddingModelQuery,
    useLLMQuery,
    usePromptQuery,
    useReRankingModelQuery,
    useSLMQuery,
    useVectorRagQuery,
} from './use-common';
import { vectorRagService } from '@/services';
import { prepareVectorRagApiBody, transformVectorRagToForm } from '@/utils/vector-rag-utils';

export const useVectorRagConfiguration = (props?: IHookProps) => {
    const params = useParams();
    const queryClient = useQueryClient();

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [vectorRagConfigurations, setVectorRagConfigurations] = useState<IVectorRag[]>([]);
    const [vectorRagConfigurationsTableData, setVectorRagConfigurationsTableData] = useState<IVectorRag[]>([]);
    const [currentRetriever, setCurrentRetriever] = useState<string>('');
    const [isEdit, setEdit] = useState<boolean>(false);
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [completed, setCompleted] = useState<boolean>(false);

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        getValues,
        reset,
        formState: { errors, isValid },
        trigger,
    } = useForm<IVectorRag>({ mode: 'all' });

    useEffect(() => {
        if (!isOpen) {
            reset({
                id: undefined,
                name: '',
                description: '',
                isReadOnly: undefined,
                configurations: {
                    ragVariant: '',
                    generator: false,
                    generatorSource: undefined,
                    fusionRag: undefined,
                    retrievals: [],
                },
            });
            setCurrentStep(1);
            setCompleted(false);
            setEdit(false);
        }
    }, [isOpen, reset]);

    useEffect(() => {
        if (!completed && currentStep === 3) {
            setCompleted(true);
        }
    }, [currentStep]);

    const { isFetching } = useVectorRagQuery({
        props,
        onSuccess: data => {
            setVectorRagConfigurations([...data]);
            setVectorRagConfigurationsTableData([...data]);
        },
        onError: () => {
            setVectorRagConfigurations([]);
            setVectorRagConfigurationsTableData([]);
        },
    });

    const {
        refetch,
        isLoading: loadingDatabases,
        data: databases,
    } = useDatabaseQuery({
        select: data => data.filter(x => x?.type === getEnumKeyByValue(DatabaseItemType.VECTOR, DatabaseItemType)),
    });

    const { isLoading: loadingEmbeddings, data: embeddings, refetch: refetchEmbedding } = useEmbeddingModelQuery();

    const { isLoading: loadingReRankings, data: reRankings, refetch: refetchReRanking } = useReRankingModelQuery();

    const {
        data: allModels,
        isLoading: llmModelsLoading,
        refetch: refetchLlms,
    } = useLLMQuery<IAllModel>({ queryKey: 'llmModels' });

    const { data: allSLMModels, isLoading: slmModelsLoading, refetch: refetchSLM } = useSLMQuery();

    const {
        data: allPrompts,
        isLoading: promptsLoading,
        refetch: refetchPrompts,
    } = usePromptQuery<PromptResponse>({ queryKey: 'prompts' });

    const { mutate: mutateCreate, isLoading: creating } = useMutation(
        (data: IVectorRag) => vectorRagService.create<IVectorRag>(data, params.wid as string),
        {
            onSuccess: () => {
                if (props?.onRefetch) {
                    props.onRefetch();
                }
                queryClient.invalidateQueries(QueryKeyType.VECTOR_RAG);
                setIsOpen(false);
                toast.success('RAG saved successfully');
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                logger.error('Error creating RAG:', error?.message);
            },
        }
    );

    const { mutate: mutateUpdate, isLoading: updating } = useMutation(
        ({ data, id }: { data: IVectorRag; id: string }) =>
            vectorRagService.update<IVectorRag>(data, params.wid as string, id),
        {
            onSuccess: () => {
                if (props?.onRefetch) {
                    props.onRefetch();
                }
                queryClient.invalidateQueries(QueryKeyType.VECTOR_RAG);
                setIsOpen(false);
                toast.success('RAG updated successfully');
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                logger.error('Error updating RAG:', error?.message);
            },
        }
    );

    const { mutate: mutateDelete } = useMutation(
        async ({ id }: { id: string }) => await vectorRagService.delete(id, params.wid as string),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(QueryKeyType.VECTOR_RAG);
                toast.success('RAG deleted successfully');
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                logger.error('Error deleting RAG:', error?.message);
            },
        }
    );

    const {
        fields: retrievalFields,
        append,
        remove: removeRetrieval,
    } = useFieldArray({
        name: 'configurations.retrievals',
        control,
    });

    const appendRetrieval = () => {
        append({
            databaseId: '',
            tableName: '',
            type: '',
            embeddingModel: '',
            distanceStrategy: '',
            searchType: '',
            topK: undefined,
            metadata: '',
            scoreThreshold: undefined,
            fetchK: undefined,
            lambdaMult: undefined,
            enableReRanking: false,
            reRankingModel: '',
            reRankingScoreThreshold: undefined,
            queryExpansion: false,
            hyde: false,
            queryExpansionSource: undefined,
            hydeSource: undefined,
            enableHybridSearch: false,
            hybridSearch: '',
            hybridSearchTopK: undefined,
        });
    };

    const onVectorRagConfigurationFilter = (filter: IVectorRag | null) => {
        let result = vectorRagConfigurations;

        if (!isNullOrEmpty(filter?.search)) {
            result = result.filter(x => x.name.toLowerCase().includes(filter?.search?.toLowerCase()?.trim() as string));
        }
        if (!isNullOrEmpty(filter?.name)) {
            result = result.filter(x => x.name.toLowerCase() === filter?.name.toLowerCase());
        }

        setVectorRagConfigurationsTableData(result);
    };

    const handleCreate = () => {
        setEdit(false);
        setIsOpen(true);
    };

    const onEdit = (id: string) => {
        if (id) {
            setEdit(true);
            setIsOpen(true);
            const data = vectorRagConfigurations.find(x => x.id === id);
            if (data) {
                const formData = transformVectorRagToForm(data);
                reset(formData);
            }
        }
    };

    const onHandleSubmit = (data: IVectorRag) => {
        try {
            const body = prepareVectorRagApiBody(data);

            if (data.id) {
                mutateUpdate({ data: body, id: data.id });
            } else {
                mutateCreate(body);
            }
        } catch (error) {
            toast.error('Failed to save RAG Configuration');
            logger.error(`RAG Config Save Error: ${error}`);
        }
    };

    const onDelete = (id: string) => {
        if (id) {
            mutateDelete({ id });
        }
    };

    return {
        isFetching,
        control,
        isOpen,
        isSaving: creating || updating,
        errors,
        isValid,
        vectorRagConfigurations,
        vectorRagConfigurationsTableData,
        isEdit,
        currentRetriever,
        loadingDatabases,
        databases,
        embeddings: embeddings ?? [],
        reRankings: reRankings ?? [],
        allModels,
        allSLMModels,
        allPrompts,
        promptsLoading,
        slmModelsLoading,
        llmModelsLoading,
        loadingEmbeddings,
        loadingReRankings,
        retrievalFields,
        currentStep,
        completed,
        removeRetrieval,
        appendRetrieval,
        register,
        handleSubmit,
        watch,
        reset,
        trigger,
        getValues,
        setCurrentStep,
        setValue,
        setVectorRagConfigurations,
        setIsOpen,
        setEdit,
        setCurrentRetriever,
        handleCreate,
        onEdit,
        onHandleSubmit,
        onVectorRagConfigurationFilter,
        onDelete,
        refetch,
        refetchEmbedding,
        refetchReRanking,
        refetchLlms,
        refetchSLM,
        refetchPrompts,
    };
};
