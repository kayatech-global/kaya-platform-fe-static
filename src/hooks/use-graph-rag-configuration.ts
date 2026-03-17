import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { GraphRagTableData } from '@/app/workspace/[wid]/knowledge-source-configs/graph-rag-configurations/components/graph-rag-configuration-table';
import { getEnumKeyByValue, getEnumValueByKey, isNullOrEmpty } from '@/lib/utils';
import { IAllModel, IHookProps, IGraphRag } from '@/models';
import { FetchError, logger } from '@/utils';
import { toast } from 'sonner';
import { DatabaseItemType, GraphRagType, KnowledgeGraphSearchType, QueryKeyType } from '@/enums';
import { PromptResponse } from '@/app/workspace/[wid]/agents/components/agent-form';
import {
    useDatabaseQuery,
    useEmbeddingModelQuery,
    useGraphRagQuery,
    useLLMQuery,
    usePromptQuery,
    useReRankingModelQuery,
    useSLMQuery,
} from './use-common';


export const useGraphRagConfiguration = (props?: IHookProps) => {
    const queryClient = useQueryClient();

    const [graphRagConfigs, setGraphRagConfigs] = useState<GraphRagTableData[]>([]);
    const [graphRagConfigsTableData, setGraphRagConfigsTableData] = useState<GraphRagTableData[]>([]);
    const [isOpen, setIsOpen] = useState<boolean>(false);
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
    } = useForm<IGraphRag>({ mode: 'all' });

    useEffect(() => {
        if (!isOpen) {
            reset({
                id: undefined,
                name: '',
                description: '',
                isReadOnly: undefined,
                configurations: {
                    graphRagType: GraphRagType.STANDARDRAG,
                    generator: false,
                    generatorSource: undefined,
                    correctiveRag: undefined,
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
    }, [currentStep, completed]);

    const { isFetching } = useGraphRagQuery({
        props,
        onSuccess: data => {
            const knowledgeGraphs = data.map(item => ({
                ...item,
                graphRagType: item?.configurations?.graphRagType,
            }));
            setGraphRagConfigs([...knowledgeGraphs]);
            setGraphRagConfigsTableData([...knowledgeGraphs]);
        },
        onError: () => {
            setGraphRagConfigs([]);
            setGraphRagConfigsTableData([]);
        },
    });

    const {
        isLoading: loadingDatabases,
        data: databases,
        refetch: refetchDatabase,
    } = useDatabaseQuery({
        select: data => data.filter(x => x?.type === getEnumKeyByValue(DatabaseItemType.GRAPH, DatabaseItemType)),
    });

    const { isLoading: loadingEmbeddings, data: embeddings, refetch: refetchEmbedding } = useEmbeddingModelQuery();

    const { isLoading: loadingReRankings, data: reRankings, refetch: refetchReRanking } = useReRankingModelQuery();

    const {
        isLoading: loadingLlmModels,
        data: llmModels,
        refetch: refetchLLM,
    } = useLLMQuery<IAllModel>({ queryKey: 'llmModels' });

    const { isLoading: loadingSlmModels, data: slmModels, refetch: refetchSLM } = useSLMQuery();

    const {
        isLoading: loadingPrompts,
        data: prompts,
        refetch: refetchPrompt,
    } = usePromptQuery<PromptResponse>({ queryKey: 'prompts' });

    const { mutate: mutateCreate, isLoading: creating } = useMutation(
        async (data: IGraphRag) => {
            const stored = localStorage.getItem('mock_graph_rag_data');
            const configs = stored ? JSON.parse(stored) : [];
            const newConfig = { ...data, id: `graph-rag-${Date.now()}` };
            configs.push(newConfig);
            localStorage.setItem('mock_graph_rag_data', JSON.stringify(configs));
            return newConfig;
        },
        {
            onSuccess: () => {
                if (props?.onRefetch) {
                    props.onRefetch();
                }
                queryClient.invalidateQueries(QueryKeyType.GRAPH_RAG);
                setIsOpen(false);
                toast.success('Knowledge Graph saved successfully');
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                logger.error('Error creating Knowledge Graph:', error?.message);
            },
        }
    );

    const { mutate: mutateUpdate, isLoading: updating } = useMutation(
        async ({ data, id }: { data: IGraphRag; id: string }) => {
            const stored = localStorage.getItem('mock_graph_rag_data');
            const configs = stored ? JSON.parse(stored) : [];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const index = configs.findIndex((x: any) => x.id === id);
            if (index > -1) {
                configs[index] = { ...configs[index], ...data, id };
                localStorage.setItem('mock_graph_rag_data', JSON.stringify(configs));
            }
            return { data: configs[index], id };
        },
        {
            onSuccess: () => {
                if (props?.onRefetch) {
                    props.onRefetch();
                }
                queryClient.invalidateQueries(QueryKeyType.GRAPH_RAG);
                setIsOpen(false);
                toast.success('Knowledge Graph updated successfully');
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                logger.error('Error updating Knowledge Graph:', error?.message);
            },
        }
    );

    const { mutate: mutateDelete } = useMutation(
        async ({ id }: { id: string }) => {
            const stored = localStorage.getItem('mock_graph_rag_data');
            const configs = stored ? JSON.parse(stored) : [];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const filtered = configs.filter((x: any) => x.id !== id);
            localStorage.setItem('mock_graph_rag_data', JSON.stringify(filtered));
            return { id };
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(QueryKeyType.GRAPH_RAG);
                toast.success('Knowledge Graph deleted successfully');
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                logger.error('Error deleting Knowledge Graph:', error?.message);
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
            database: '',
            queryLanguage: '',
            topK: undefined,
            nodeLabel: '',
            embeddingNodeProperty: '',
            textNodeProperties: [],
            embeddingModelId: '',
            enableReRanking: false,
            reRankingModelId: undefined,
            reRankingScoreThreshold: 0,
            queryExpansion: false,
            hyde: false,
            queryUnderstanding: undefined,
            enableQueryUnderstanding: false,
            queryExpansionSource: undefined,
            hydeSource: undefined,
            enableHybridSearch: false,
            hybridSearch: '',
        });
    };

    const onGraphRagConfigurationFilter = (filter: GraphRagTableData | null) => {
        let result = graphRagConfigs;

        if (!isNullOrEmpty(filter?.search)) {
            result = result.filter(x => x.name.toLowerCase().includes(filter?.search?.toLowerCase()?.trim() as string));
        }

        setGraphRagConfigsTableData(result);
    };

    const onDelete = (id: string) => {
        if (id) {
            mutateDelete({ id });
        }
    };

    const onHandleSubmit = (data: IGraphRag) => {
        try {
            const graphRagType = getEnumKeyByValue(data.configurations.graphRagType, GraphRagType);
            const isGeneratorLlm = !!(
                data?.configurations?.generatorSource?.llmId &&
                data?.configurations?.generatorSource?.llmId?.trim() !== ''
            );
            const isCorrectiveRagLlm = !!(
                data?.configurations?.correctiveRag?.llmId && data?.configurations?.correctiveRag?.llmId?.trim() !== ''
            );

            const processedRetrievals = data?.configurations?.retrievals?.map(retrieval => {
                const queryUnderstandingType = getEnumKeyByValue(
                    retrieval.queryUnderstanding?.queryType ?? '',
                    KnowledgeGraphSearchType
                ) as KnowledgeGraphSearchType;
                const isUnderstandingLlm = !!(
                    retrieval?.queryUnderstanding?.llmId && retrieval?.queryUnderstanding?.llmId.trim() !== ''
                );

                const isQueryExpansionLlm = !!(
                    retrieval?.queryExpansionSource?.llmId && retrieval?.queryExpansionSource?.llmId.trim() !== ''
                );

                const isHydeLlm = !!(retrieval?.hydeSource?.llmId && retrieval?.hydeSource?.llmId.trim() !== '');

                return {
                    ...retrieval,
                    enableReRanking: retrieval.enableReRanking === true ? true : undefined,
                    reRankingModelId: retrieval.enableReRanking ? retrieval.reRankingModelId : undefined,
                    reRankingScoreThreshold: retrieval.enableReRanking ? retrieval.reRankingScoreThreshold : undefined,

                    queryExpansion: retrieval.queryExpansion === true ? true : undefined,
                    queryExpansionSource: retrieval.queryExpansion
                        ? {
                              llmId: isQueryExpansionLlm ? retrieval.queryExpansionSource?.llmId : undefined,
                              slmId: isQueryExpansionLlm ? undefined : retrieval.queryExpansionSource?.slmId,
                              promptId: retrieval.queryExpansionSource?.promptId,
                          }
                        : undefined,

                    hyde: retrieval.hyde === true ? true : undefined,
                    hydeSource: retrieval.hyde
                        ? {
                              llmId: isHydeLlm ? retrieval.hydeSource?.llmId : undefined,
                              slmId: isHydeLlm ? undefined : retrieval.hydeSource?.slmId,
                              promptId: retrieval.hydeSource?.promptId,
                          }
                        : undefined,

                    enableQueryUnderstanding: retrieval.enableQueryUnderstanding === true ? true : undefined,
                    queryUnderstanding: retrieval.enableQueryUnderstanding
                        ? {
                              queryType: queryUnderstandingType,
                              llmId: isUnderstandingLlm ? retrieval.queryUnderstanding?.llmId : undefined,
                              slmId: isUnderstandingLlm ? retrieval.queryUnderstanding?.slmId : undefined,
                              fullTextSearchIndex:
                                  retrieval.queryUnderstanding?.queryType === KnowledgeGraphSearchType.NER
                                      ? retrieval.queryUnderstanding?.fullTextSearchIndex
                                      : undefined,
                              fullTextSearchProperty:
                                  retrieval.queryUnderstanding?.queryType === KnowledgeGraphSearchType.NER
                                      ? retrieval.queryUnderstanding?.fullTextSearchProperty
                                      : undefined,
                          }
                        : undefined,
                    enableHybridSearch: retrieval.enableHybridSearch === true ? true : undefined,
                    hybridSearch: retrieval.enableHybridSearch ? retrieval.hybridSearch : undefined,
                };
            });

            const body: IGraphRag = {
                ...data,
                configurations: {
                    ...data.configurations,
                    graphRagType: graphRagType as string,
                    generator:
                        data.configurations.generator !== undefined && data.configurations.generator === true
                            ? true
                            : undefined,
                    generatorSource: data.configurations.generator
                        ? {
                              llmId: isGeneratorLlm ? data.configurations?.generatorSource?.llmId : undefined,
                              slmId: isGeneratorLlm ? undefined : data.configurations?.generatorSource?.slmId,
                              promptId: data.configurations?.generatorSource?.promptId,
                          }
                        : undefined,
                    correctiveRag:
                        data.configurations.graphRagType === GraphRagType.CORRECTIVERAG
                            ? {
                                  llmId: isCorrectiveRagLlm ? data.configurations?.correctiveRag?.llmId : undefined,
                                  slmId: isCorrectiveRagLlm ? undefined : data.configurations?.correctiveRag?.slmId,
                              }
                            : undefined,
                    retrievals: processedRetrievals,
                },
                isReadOnly: undefined,
            };

            if (data.id) {
                mutateUpdate({ data: body, id: data.id });
            } else {
                mutateCreate(body);
            }
        } catch (error) {
            toast.error("Something went wrong! We couldn't save your Knowledge graph");
            logger.error(`An unexpected error occurred: ${error}`);
        }
    };

    const handleCreate = () => {
        setEdit(false);
        setIsOpen(true);
    };

    const onEdit = (id: string) => {
        if (id) {
            setEdit(true);
            setIsOpen(true);
            const obj = graphRagConfigs?.find(data => data?.id === id);
            if (obj) {
                const graphRagType = getEnumValueByKey(obj.configurations.graphRagType, GraphRagType) as GraphRagType;
                const isGeneratorLlm = !!(
                    obj?.configurations?.generatorSource?.llmId &&
                    obj?.configurations?.generatorSource?.llmId?.trim() !== ''
                );
                const isCorrectiveRagLlm = !!(
                    obj?.configurations?.correctiveRag?.llmId &&
                    obj?.configurations?.correctiveRag?.llmId?.trim() !== ''
                );
                setValue('id', obj.id);
                setValue('name', obj.name);
                setValue('description', obj.description);
                setValue('isReadOnly', obj.isReadOnly);
                setValue('configurations', obj.configurations);
                setValue('configurations.graphRagType', graphRagType);
                setValue('configurations.retrievals', obj.configurations.retrievals);
                setValue(
                    'configurations.generatorSource.sourceValue',
                    isGeneratorLlm
                        ? obj?.configurations?.generatorSource?.llmId
                        : obj?.configurations?.generatorSource?.slmId
                );
                setValue(
                    'configurations.correctiveRag.sourceValue',
                    isCorrectiveRagLlm
                        ? obj?.configurations?.correctiveRag?.llmId
                        : obj?.configurations?.correctiveRag?.slmId
                );
                if (obj.configurations?.retrievals?.length > 0) {
                    obj.configurations.retrievals.forEach((item, index) => {
                        const queryUnderstandingType = getEnumValueByKey(
                            item.queryUnderstanding?.queryType ?? '',
                            KnowledgeGraphSearchType
                        ) as KnowledgeGraphSearchType;
                        const isQueryExpansionLlm = !!(
                            item?.queryExpansionSource?.llmId && item?.queryExpansionSource?.llmId?.trim() !== ''
                        );
                        const isHydeLlm = !!(item?.hydeSource?.llmId && item?.hydeSource?.llmId?.trim() !== '');
                        const isQueryExpansionSourceLlm = !!(
                            item?.queryUnderstanding?.llmId && item?.queryUnderstanding?.llmId?.trim() !== ''
                        );
                        setValue(
                            `configurations.retrievals.${index}.queryUnderstanding.queryType`,
                            queryUnderstandingType ?? ''
                        );
                        setValue(
                            `configurations.retrievals.${index}.queryUnderstanding.sourceValue`,
                            isQueryExpansionSourceLlm
                                ? item?.queryUnderstanding?.llmId
                                : item?.queryUnderstanding?.slmId
                        );
                        setValue(
                            `configurations.retrievals.${index}.reRankingScoreThreshold`,
                            item.reRankingScoreThreshold ?? 0
                        );
                        setValue(
                            `configurations.retrievals.${index}.queryExpansionSource.sourceValue`,
                            isQueryExpansionLlm ? item?.queryExpansionSource?.llmId : item?.queryExpansionSource?.slmId
                        );
                        setValue(
                            `configurations.retrievals.${index}.hydeSource.sourceValue`,
                            isHydeLlm ? item?.hydeSource?.llmId : item?.hydeSource?.slmId
                        );
                    });
                }
            }
        }
    };

    return {
        isFetching,
        graphRagConfigs,
        graphRagConfigsTableData,
        isOpen,
        isEdit,
        isSaving: creating || updating,
        isValid,
        errors,
        control,
        databases,
        embeddings: embeddings ?? [],
        reRankings: reRankings ?? [],
        llmModels,
        slmModels,
        prompts,
        loadingDatabases,
        loadingEmbeddings,
        loadingReRankings,
        loadingLlmModels,
        loadingSlmModels,
        loadingPrompts,
        currentStep,
        completed,
        retrievalFields,
        setCurrentStep,
        trigger,
        appendRetrieval,
        removeRetrieval,
        onGraphRagConfigurationFilter,
        setIsOpen,
        setGraphRagConfigs,
        onDelete,
        onEdit,
        register,
        handleSubmit,
        watch,
        getValues,
        reset,
        setValue,
        onHandleSubmit,
        setEdit,
        handleCreate,
        refetchDatabase,
        refetchEmbedding,
        refetchReRanking,
        refetchLLM,
        refetchSLM,
        refetchPrompt,
    };
};
