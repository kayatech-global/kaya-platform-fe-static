/* eslint-disable @typescript-eslint/no-explicit-any */

import { SelfLearningProps } from '@/app/editor/[wid]/[workflow_id]/components/self-learning';
import { valuesProps } from '@/components/molecules/detail-item-input/detail-item-input';
import { API, IntelligenceSourceModel, Prompt } from '@/components/organisms/workflow-editor-form/agent-form';
import config from '@/config/environment-variables';
import { LEARNING_LIST } from '@/constants';
import { DataType, LearningModeType, LearningSourceType, MessageBrokerTopicType } from '@/enums';
import {
    ConnectorType,
    FeedbackRequestType,
    IConnectorForm,
    ILearningOption,
    ISelfLearning,
    RequestToolType,
    IEmbedding,
} from '@/models';
import { IWorkspaceUserResponse } from '@/models/workspace.model';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Category, Variable } from './use-condition-completion';
import { OptionModel } from '@/components';
import { useEmbeddingModelQuery, useIntellisense } from './use-common';
import { useQuery } from 'react-query';
import { $fetch } from '@/utils';

const fetchAuthorMails = async (workspaceId: string): Promise<string[]> => {
    const response = await $fetch<IWorkspaceUserResponse[]>(`/workspaces/${workspaceId}/users?role=2`, {
        method: 'GET',
        headers: {
            'x-workspace-id': workspaceId,
        },
    });

    // Extract emails from the response
    const emails = (response.data || []).map(user => user.email);
    return emails;
};

export enum HeaderType {
    OutputInstructions,
}

export const useSelfLearning = (props: SelfLearningProps) => {
    const params = useParams();
    const {
        workflow,
        selfLearning,
        agent,
        allApiTools,
        llms,
        slms,
        allPrompts,
        messageBrokers,
        setSelfLearning,
        onSelfLearningChange,
        allConnectors,
    } = props;
    const [feedbackUrlCopied, setFeedbackUrlCopied] = useState<boolean>(false);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [isSlm, setSlm] = useState<boolean>(false);
    const [tools, setTools] = useState<API[]>();
    const [connectors, setConnectors] = useState<IConnectorForm[]>();
    const [languageModel, setLanguageModel] = useState<IntelligenceSourceModel>();
    const [embeddingModel, setEmbeddingModel] = useState<IEmbedding>();
    const [prompt, setPrompt] = useState<Prompt>();
    const [completion, setCompletion] = useState<Category[]>([]);
    const [attributes, setAttributes] = useState<{ label: string; value: string }[]>([]);
    const [triggerMessageBroker, setTriggerMessageBroker] = useState<boolean>(false);

    const { loadingIntellisense, allIntellisenseValues, intellisenseOptions, refetchVariables } = useIntellisense(
        workflow?.id
    );

    const {
        register,
        reset,
        setValue,
        watch,
        getValues,
        trigger,
        handleSubmit,
        clearErrors,
        control,
        formState: { errors, isValid },
    } = useForm<ISelfLearning>({
        defaultValues: {
            learningSource: LearningSourceType.LearnFromAllFeedback,
            retry: false,
            overridePrompt: false,
            promptId: undefined,
            maxSummaryLength: 5000,
            overrideMaxSummaryLength: false,
            feedbackRequestIntegration: {
                type: RequestToolType.Connector,
                messageBroker: {
                    topicProducer: { messageBrokerId: '', topicId: '', requestStructure: '' },
                    topicConsumer: { messageBrokerId: '', topicId: '', requestStructure: '' },
                },
            },
            feedbackTriggeringCriteria: '',
            additionalCriteria: [],
            outputInstructions: [{ name: '', dataType: 'string', value: '' }],
            feedbackAuthoring: true,
            allowedAuthors: [],
            enable_metadata_filter: false,
            metadataFilter: '',
            similarityScoreThreshold: undefined,
            embedding: undefined,
        },
        mode: 'all',
    });

    const { isLoading: loadingEmbeddings, data: embeddings, refetch: refetchEmbedding } = useEmbeddingModelQuery();

    const {
        isLoading: loadingAdminEmails,
        data: adminEmails,
        refetch: refetchAdminEmails,
    } = useQuery('adminEmails', async () => await fetchAuthorMails(params.wid as string), {
        enabled: true,
        refetchOnWindowFocus: false,
        onError: error => {
            console.error('Failed to fetch admin emails:', error);
        },
    });

    useEffect(() => {
        if (selfLearning && openModal) {
            reset({
                learningSource: selfLearning.learningSource ?? undefined,
                enableLearning: selfLearning.enableLearning ?? true,
                learningType: selfLearning.learningType ?? watch('learningType'),
                retry: selfLearning.retry ?? false,
                intelligentSource: selfLearning.intelligentSource ?? undefined,
                maxSummaryLength: selfLearning.maxSummaryLength ?? 5000,
                overridePrompt: selfLearning.overridePrompt ?? false,
                promptId: selfLearning.promptId ?? undefined,
                overrideMaxSummaryLength: selfLearning.overrideMaxSummaryLength ?? false,
                feedbackRequestIntegration: (watch('feedbackRequestIntegration')?.id
                    ? mapFeedbackRequestIntegration(watch('feedbackRequestIntegration'))
                    : mapFeedbackRequestIntegration(selfLearning.feedbackRequestIntegration)) ?? {
                    type: RequestToolType.Connector,
                },
                feedbackTriggeringCriteria:
                    selfLearning?.feedbackTriggeringCriteria || watch('feedbackTriggeringCriteria') || '',
                additionalCriteria: selfLearning?.additionalCriteria ?? [],
                outputInstructions: selfLearning?.outputInstructions ?? [{ name: '', dataType: 'string', value: '' }],
                feedbackAuthoring: selfLearning?.feedbackAuthoring ?? false,
                allowedAuthors: selfLearning?.allowedAuthors ?? [],
                enable_metadata_filter: selfLearning?.enable_metadata_filter ?? false,
                metadataFilter: selfLearning?.metadataFilter ?? undefined,
                similarityScoreThreshold: selfLearning?.similarityScoreThreshold,
                embedding: selfLearning?.embedding,
            });
        } else {
            reset({
                learningSource: LearningSourceType.LearnFromAllFeedback,
                enableLearning: false,
                learningType: undefined,
                retry: false,
                intelligentSource: undefined,
                maxSummaryLength: 5000,
                overridePrompt: false,
                promptId: undefined,
                overrideMaxSummaryLength: false,
                feedbackRequestIntegration: {
                    type: RequestToolType.Connector,
                    messageBroker: {
                        topicProducer: { messageBrokerId: '', topicId: '', requestStructure: '' },
                        topicConsumer: { messageBrokerId: '', topicId: '', requestStructure: '' },
                    },
                },
                feedbackTriggeringCriteria: '',
                additionalCriteria: [],
                outputInstructions: [{ name: '', dataType: 'string', value: '' }],
                feedbackAuthoring: true,
                allowedAuthors: [],
                enable_metadata_filter: false,
                metadataFilter: '',
                similarityScoreThreshold: undefined,
                embedding: undefined,
            });
            setTriggerMessageBroker(false);
        }
        if (!selfLearning && openModal) {
            setTools(undefined);
            setSlm(false);
            setLanguageModel(undefined);
            setEmbeddingModel(undefined);
            setPrompt(undefined);
            setConnectors(undefined);
        }
    }, [openModal, selfLearning]);

    // Clear allowedAuthors when metadata filtering is disabled
    const enableMetadataFilter = watch('enable_metadata_filter');
    useEffect(() => {
        if (!enableMetadataFilter) {
            setValue('allowedAuthors', []);
        }
    }, [enableMetadataFilter, setValue]);

    const inboundOptions = useMemo(() => {
        if (watch('feedbackRequestIntegration.type') === RequestToolType.MessageBroker && messageBrokers?.length > 0) {
            return messageBrokers
                ?.filter(
                    broker =>
                        Array.isArray(broker?.configurations?.topics) &&
                        broker?.configurations?.topics?.some(
                            topic => topic.topicType === MessageBrokerTopicType.Inbound
                        )
                )
                ?.map(m => ({ name: m.name, value: m.id }) as OptionModel);
        }
        return [];
    }, [messageBrokers, watch('feedbackRequestIntegration.type')]);

    const outboundOptions = useMemo(() => {
        if (watch('feedbackRequestIntegration.type') === RequestToolType.MessageBroker && messageBrokers?.length > 0) {
            return messageBrokers
                ?.filter(
                    broker =>
                        Array.isArray(broker?.configurations?.topics) &&
                        broker?.configurations?.topics?.some(
                            topic => topic.topicType === MessageBrokerTopicType.Outbound
                        )
                )
                ?.map(m => ({ name: m.name, value: m.id }) as OptionModel);
        }
        return [];
    }, [messageBrokers, watch('feedbackRequestIntegration.type')]);

    const {
        fields: outputInstructions,
        append,
        remove: removeInstructions,
        update: updateInstructions,
    } = useFieldArray({
        name: 'outputInstructions',
        control,
    });

    const {
        fields: additionalCriteriaFields,
        append: _appendAdditionalCriteria,
        remove: removeAdditionalCriteria,
    } = useFieldArray({
        name: 'additionalCriteria' as any,
        control,
    });

    const appendAdditionalCriteria = () => {
        _appendAdditionalCriteria('' as any);
    };

    const mapFeedbackRequestIntegration = (feedback: FeedbackRequestType | undefined) => {
        if (feedback) {
            return {
                ...feedback,
                messageBroker: {
                    topicProducer: feedback?.messageBroker?.topicProducer ?? {
                        messageBrokerId: '',
                        topicId: '',
                        requestStructure: '',
                    },
                    topicConsumer: feedback?.messageBroker?.topicConsumer ?? {
                        messageBrokerId: '',
                        topicId: '',
                        requestStructure: '',
                    },
                },
            } as FeedbackRequestType;
        }
        return feedback;
    };

    const updateInstructionsList = () => {
        outputInstructions.forEach((_, index) => {
            updateInstructions(index, { ...outputInstructions[index], dataType: 'string' });
        });
    };

    const appendInstructions = (type: number) => {
        if (type < 0) return null;

        append({ name: '', dataType: 'string', value: '' });
    };

    const handleApiToolsSetup = (selfLearningData: ISelfLearning, allApiToolsList: API[]) => {
        if (selfLearningData.feedbackRequestIntegration?.type !== RequestToolType.API) return;

        if (allApiToolsList.length > 0) {
            const toolsIds = allApiToolsList.map(api => api.id);
            const _api = allApiToolsList.find(x => selfLearningData.feedbackRequestIntegration?.id == x.id);
            const savedTool = selfLearningData.feedbackRequestIntegration?.id ?? '';
            const _selectedTools = toolsIds.includes(savedTool) ? savedTool : '';
            const { configuration, connectorType } = selfLearningData.feedbackRequestIntegration;

            setValue('feedbackRequestIntegration.id', _selectedTools);
            setValue('feedbackRequestIntegration.type', RequestToolType.API);
            if (_selectedTools) {
                setValue('feedbackRequestIntegration.connectorType', connectorType);
                setValue('feedbackRequestIntegration.configuration', configuration);
            }
            if (_api?.id) setTools([_api]);
        } else {
            setValue('feedbackRequestIntegration.id', '');
            setValue('feedbackRequestIntegration.type', RequestToolType.API);
        }
    };

    const handleConnectorsSetup = (selfLearningData: ISelfLearning, allConnectorsList: IConnectorForm[]) => {
        if (selfLearningData.feedbackRequestIntegration?.type !== RequestToolType.Connector) return;

        if (allConnectorsList.length > 0) {
            const connectorIds = allConnectorsList.map(api => api.id);
            const _connector = allConnectorsList.find(x => selfLearningData.feedbackRequestIntegration?.id == x.id);
            const savedConnectors = selfLearningData.feedbackRequestIntegration?.id ?? '';
            const _selectedConnectors = connectorIds.includes(savedConnectors) ? savedConnectors : '';
            const { configuration, connectorType } = selfLearningData.feedbackRequestIntegration;

            setValue('feedbackRequestIntegration.id', _selectedConnectors);
            setValue('feedbackRequestIntegration.type', RequestToolType.Connector);
            if (_selectedConnectors) {
                setValue('feedbackRequestIntegration.connectorType', connectorType);
                setValue('feedbackRequestIntegration.configuration', configuration);
            }
            setConnectors(_connector ? [_connector] : []);
        } else {
            setValue('feedbackRequestIntegration.id', '');
            setValue('feedbackRequestIntegration.type', RequestToolType.API);
        }
    };

    const mapLanguageModel = (language: any) => {
        if (language) {
            setLanguageModel({
                id: language?.provider as string,
                provider: language?.provider as string,
                modelName: language?.name as string,
                modelDescription: language?.configurations?.description as string,
                modelId: language?.id as string,
                providerLogo: language?.configurations?.providerConfig?.logo?.['48'] ?? '',
                modelUniqueId: language?.modelUniqueId as string,
            });
        } else {
            setLanguageModel(undefined);
        }
    };

    const handleIntelligenceSourceSetup = (selfLearningData: ISelfLearning, llmsList: any, slmsList: any) => {
        const isSlmType = selfLearningData.intelligentSource?.isSlm;
        const sourceId = selfLearningData.intelligentSource?.id;

        if (isSlmType) {
            const language = slmsList?.find((x: any) => x.id === sourceId);
            mapLanguageModel(language);
            setSlm(true);
        } else if (isSlmType === false) {
            const language = llmsList?.find((x: any) => x.id === sourceId);
            mapLanguageModel(language);
            setSlm(false);
        }
    };

    useEffect(() => {
        if (!openModal) return;

        if (selfLearning) {
            if (allApiTools) handleApiToolsSetup(selfLearning, allApiTools);
            if (allConnectors) handleConnectorsSetup(selfLearning, allConnectors);
            if (llms || slms) handleIntelligenceSourceSetup(selfLearning, llms, slms);

            if (embeddings && selfLearning.embedding) {
                const embedding = embeddings.find(x => x.id === selfLearning.embedding);
                setEmbeddingModel(embedding);
            }

            if (allPrompts && selfLearning.promptId) {
                const promptVal = allPrompts.find(x => x.id === selfLearning.promptId);
                setPrompt(promptVal);
            }
        } else {
            setValue('feedbackRequestIntegration.messageBroker.topicProducer', {
                messageBrokerId: '',
                topicId: '',
                requestStructure: '',
            });
            setValue('feedbackRequestIntegration.messageBroker.topicConsumer', {
                messageBrokerId: '',
                topicId: '',
                requestStructure: '',
            });
        }
    }, [openModal, selfLearning, allApiTools, llms, slms, allPrompts]);

    const handleUnsupervisedLearningType = () => {
        setValue('feedbackRequestIntegration', undefined);
        setTools(undefined);
        setConnectors(undefined);
        setValue('feedbackRequestIntegration.messageBroker.topicProducer', {
            messageBrokerId: '',
            topicId: '',
            requestStructure: '',
        });
        setValue('feedbackRequestIntegration.messageBroker.topicConsumer', {
            messageBrokerId: '',
            topicId: '',
            requestStructure: '',
        });
    };

    const handleFeedbackIntegrationSetup = (feedbackRequestIntegration: FeedbackRequestType) => {
        if (!feedbackRequestIntegration?.id) {
            const requestToolType = watch('feedbackRequestIntegration.type') ?? RequestToolType.Connector;
            setValue('feedbackRequestIntegration.type', requestToolType);
            return;
        }

        if (allApiTools && feedbackRequestIntegration.type === RequestToolType.API) {
            const toolsIds = allApiTools.map(api => api.id);
            const _api = allApiTools.find(x => feedbackRequestIntegration.id == x.id) as API;
            const savedTool = feedbackRequestIntegration.id ?? '';
            const _selectedTools = toolsIds.includes(savedTool) ? savedTool : '';
            setValue('feedbackRequestIntegration.id', _selectedTools);
            setValue('feedbackRequestIntegration.type', RequestToolType.API);
            if (_api?.id) setTools([_api]);
        } else if (allConnectors && feedbackRequestIntegration.type === RequestToolType.Connector) {
            const connectorIds = allConnectors.map(api => api.id);
            const _connector = allConnectors.find(x => feedbackRequestIntegration.id == x.id) as IConnectorForm;
            const savedConnectors = feedbackRequestIntegration.id ?? '';
            const _selectedConnectors = connectorIds.includes(savedConnectors) ? savedConnectors : '';
            setValue('feedbackRequestIntegration.id', _selectedConnectors);
            setValue('feedbackRequestIntegration.type', RequestToolType.Connector);
            setConnectors(_connector ? [_connector] : []);
        }
    };

    useEffect(() => {
        if (watch('learningType') === LearningModeType.Unsupervised) {
            handleUnsupervisedLearningType();
        } else {
            const feedbackRequestIntegration = watch('feedbackRequestIntegration')?.id
                ? watch('feedbackRequestIntegration')
                : selfLearning?.feedbackRequestIntegration;

            if (feedbackRequestIntegration) {
                handleFeedbackIntegrationSetup(feedbackRequestIntegration);
            } else {
                const requestToolType = watch('feedbackRequestIntegration.type') ?? RequestToolType.Connector;
                setValue('feedbackRequestIntegration.type', requestToolType);
            }
        }
    }, [watch('learningType'), selfLearning, allApiTools]);

    useEffect(() => {
        if (!watch('overrideMaxSummaryLength')) {
            setValue('maxSummaryLength', 5000);
        }
    }, [watch('overrideMaxSummaryLength')]);

    useEffect(() => {
        if (!watch('overridePrompt')) {
            setValue('promptId', undefined);
            setPrompt(undefined);
        }
    }, [watch('overridePrompt')]);

    const resetValues = () => {
        setValue('intelligentSource', undefined);
        setLanguageModel(undefined);
        setValue('promptId', undefined);
        setValue('overridePrompt', false);
        setValue('overrideMaxSummaryLength', false);
        setPrompt(undefined);
        setValue(
            'maxSummaryLength',
            watch('learningSource') === LearningSourceType.LearnFromSummary ? 5000 : undefined
        );
        setValue('embedding', undefined);
        setEmbeddingModel(undefined);
    };

    const applySelfLearningMapping = async (data: ISelfLearning) => {
        if (data.intelligentSource?.isSlm) {
            const language = slms?.find((x: any) => x.id === data.intelligentSource?.id);
            mapLanguageModel(language);
            setSlm(true);
        } else {
            const language = llms?.find((x: any) => x.id === data.intelligentSource?.id);
            mapLanguageModel(language);
            setSlm(false);
        }

        if (data.promptId) {
            const promptVal = allPrompts?.find(x => x.id === data.promptId);
            setPrompt(promptVal);
        } else {
            setPrompt(undefined);
        }

        setValue('intelligentSource', data.intelligentSource);
        setValue('promptId', data.promptId);
        setValue('overridePrompt', data.overridePrompt);

        if (watch('learningSource') === LearningSourceType.SmartFeedbackSearch) {
            setValue('overrideMaxSummaryLength', false);
            setValue('maxSummaryLength', undefined);
        } else {
            setValue('overrideMaxSummaryLength', data.overrideMaxSummaryLength);
            setValue('maxSummaryLength', data.maxSummaryLength ?? 5000);
        }

        await trigger('intelligentSource');
        await trigger('promptId');
    };

    const mapValues = async (data: ISelfLearning | undefined) => {
        const isSummaryOrSearch =
            watch('learningSource') === LearningSourceType.LearnFromSummary ||
            watch('learningSource') === LearningSourceType.SmartFeedbackSearch;

        if (data && isSummaryOrSearch) {
            if (watch('learningSource') === data.learningSource) {
                await applySelfLearningMapping(data);
            } else {
                resetValues();
            }
        } else {
            resetValues();
        }
    };

    useEffect(() => {
        (async () => await mapValues(selfLearning))();
    }, [watch('learningSource'), selfLearning]);

    const feedbackUrl = useMemo(() => {
        if (workflow) {
            return config.CHAT_BOT_URL + '/feedback/' + workflow?.id;
        }
        return '';
    }, [workflow]);

    const getModelFromReusableAgent = useMemo(() => {
        if (!agent && !selfLearning) {
            return undefined;
        }

        let value: valuesProps[] = [];

        const getDetails = (item: ISelfLearning | undefined) => {
            const source = LEARNING_LIST.find(x => x.source === item?.learningSource) as ILearningOption;
            return {
                title: source?.title,
                description: `${source?.description?.slice(0, 65)}...`,
                descriptionTagTitle: source?.description.length > 65 ? source?.description : undefined,
            };
        };

        if (agent?.isReusableAgentSelected && agent?.selfLearning) {
            const { title, description, descriptionTagTitle } = getDetails(agent?.selfLearning);
            const data = {
                title,
                description,
                descriptionTagTitle,
                imagePath: '/png/knowledge.png',
            };
            value = [data];
        } else if (selfLearning) {
            const { title, description, descriptionTagTitle } = getDetails(selfLearning);
            const data = {
                title,
                description,
                descriptionTagTitle,
                imagePath: '/png/knowledge.png',
            };
            value = [data];
        }

        return value.length > 0 ? value : undefined;
    }, [agent, selfLearning, llms, slms, allPrompts]);

    const getLearningConfig = useMemo(() => {
        if (!agent && !selfLearning) {
            return undefined;
        }

        const getDescription = (item: ISelfLearning | undefined) => {
            if (item && (llms || slms)) {
                if (item?.intelligentSource?.isSlm) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const language = slms?.find((x: any) => x.id === item?.intelligentSource?.id);
                    return `${language?.provider} - ${language?.name}`;
                } else if (item?.intelligentSource?.isSlm === false) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const language = llms?.find((x: any) => x.id === item?.intelligentSource?.id);
                    return `${language?.provider} - ${language?.name}`;
                }
            }
            return undefined;
        };

        if (agent?.isReusableAgentSelected && agent?.selfLearning) {
            return getDescription(agent?.selfLearning);
        } else if (selfLearning) {
            return getDescription(selfLearning);
        }

        return undefined;
    }, [agent, selfLearning, llms, slms, allPrompts]);

    const handleFeedbackUrlCopy = () => {
        navigator.clipboard.writeText(feedbackUrl);
        setFeedbackUrlCopied(true);
        setTimeout(() => setFeedbackUrlCopied(false), 2000);
    };

    const handleRemove = () => {
        reset({
            learningSource: LearningSourceType.LearnFromAllFeedback,
            enableLearning: false,
            learningType: undefined,
            retry: false,
            intelligentSource: undefined,
            maxSummaryLength: 5000,
            overridePrompt: false,
            promptId: undefined,
            overrideMaxSummaryLength: false,
            feedbackRequestIntegration: undefined,
            feedbackTriggeringCriteria: '',
            additionalCriteria: [],
            feedbackAuthoring: true,
            allowedAuthors: [],
            enable_metadata_filter: false,
            metadataFilter: '',
            similarityScoreThreshold: undefined,
            embedding: undefined,
        });
        setSelfLearning(undefined);
        if (onSelfLearningChange) {
            onSelfLearningChange(undefined);
        }
    };

    const onApiChange = async (items: API[] | undefined) => {
        if (items && items?.length <= 0) return null;

        setConnectors([]);
        setValue('feedbackRequestIntegration.messageBroker.topicProducer', {
            messageBrokerId: '',
            topicId: '',
            requestStructure: '',
        });
        setValue('feedbackRequestIntegration.messageBroker.topicConsumer', {
            messageBrokerId: '',
            topicId: '',
            requestStructure: '',
        });
        setValue('feedbackRequestIntegration.configuration', undefined, { shouldDirty: true });
        setValue('feedbackRequestIntegration.connectorType', undefined, { shouldDirty: true });
        if (items && items.length > 0) {
            const value = items?.find(x => x.id);
            setValue('feedbackRequestIntegration.id', value?.id as string, { shouldDirty: true });
            setValue('feedbackRequestIntegration.type', RequestToolType.API, { shouldDirty: true });
        } else {
            setValue('feedbackRequestIntegration.id', '');
            setValue('feedbackRequestIntegration.type', RequestToolType.API);
        }
        await trigger('feedbackRequestIntegration.id');
        await trigger('feedbackRequestIntegration.type');
    };

    const onConnectorChange = async (items: IConnectorForm[] | undefined) => {
        setTools([]);
        setValue('feedbackRequestIntegration.messageBroker.topicProducer', {
            messageBrokerId: '',
            topicId: '',
            requestStructure: '',
        });
        setValue('feedbackRequestIntegration.messageBroker.topicConsumer', {
            messageBrokerId: '',
            topicId: '',
            requestStructure: '',
        });
        if (items && items.length > 0) {
            const value = items?.find(x => x.id);
            setValue('feedbackRequestIntegration.id', value?.id as string, { shouldDirty: true });
            setValue('feedbackRequestIntegration.type', RequestToolType.Connector, { shouldDirty: true });
            setValue('feedbackRequestIntegration.connectorType', ConnectorType.Pega, { shouldDirty: true });
        } else {
            setValue('feedbackRequestIntegration.id', '');
            setValue('feedbackRequestIntegration.type', RequestToolType.Connector);
        }
        await trigger('feedbackRequestIntegration.id');
        await trigger('feedbackRequestIntegration.type');
    };

    const onLanguageChange = async (item: IntelligenceSourceModel | undefined) => {
        if (item) {
            setValue('intelligentSource', {
                isSlm,
                id: item?.modelId,
            });
        } else {
            setValue('intelligentSource', undefined);
        }
        await trigger('intelligentSource');
    };

    const onPromptChange = async (item: Prompt | undefined) => {
        setValue('promptId', item?.id);
        await trigger('promptId');
    };

    const onHandleSubmit = (data: ISelfLearning) => {
        const formattedData = getFormattedLearningData(data);
        setSelfLearning({ ...formattedData, enableLearning: true });
        if (onSelfLearningChange) {
            onSelfLearningChange({ ...formattedData, enableLearning: true });
        }
        setOpenModal(false);
    };

    const getFormattedLearningData = (data: ISelfLearning): ISelfLearning => {
        const isUnsupervised = data?.learningType == LearningModeType.Unsupervised;
        const formattedData = { ...data };

        if (isUnsupervised) {
            formattedData.outputInstructions = [];
            formattedData.feedbackTriggeringCriteria = undefined;
            formattedData.feedbackRequestIntegration = undefined;
        } else if (!isUnsupervised && data?.feedbackRequestIntegration?.type !== RequestToolType.MessageBroker) {
            formattedData.feedbackRequestIntegration = formattedData.feedbackRequestIntegration
                ? { ...formattedData.feedbackRequestIntegration, messageBroker: undefined }
                : undefined;
        }

        // Set metadataFilter to null if enable_metadata_filter is false
        if (!data?.enable_metadata_filter) {
            formattedData.metadataFilter = null as any;
        }

        // Clear allowedAuthors if feedbackAuthoring is disabled
        if (!data?.feedbackAuthoring) {
            formattedData.allowedAuthors = [];
        }

        return formattedData;
    };

    const onViewLearning = () => {
        const agentId = props.nodeId ?? '';
        const url = `/workspace/${params.wid}/learnings?workflowId=${workflow?.id}&agentId=${agentId}`;
        window.open(url, '_blank');
    };

    // Purpose: Get the default value based on the given type.
    const valueMapper = (type: DataType) => {
        const typeMapping = {
            string: '',
            int: 0,
            float: 0,
            bool: false,
        } as const;
        if (type === DataType.list || type === DataType.dict) {
            return JSON.stringify(type ?? {});
        }
        return String(typeMapping[type]);
    };

    // purpose: Update the completion list each time the user creates a new variable.
    const updateIntellisenseVariable = () => {
        const variables: Variable[] = watch('outputInstructions')
            .map(instructions => {
                if (instructions?.name)
                    return {
                        defaultValue: valueMapper(instructions?.dataType as DataType) ?? '',
                        description: instructions?.value ?? '',
                        name: instructions?.name,
                        parent: 'Variable',
                        type: instructions?.dataType ?? 'string',
                    };
            })
            .filter(value => value?.type) as Variable[];

        const completionData: Category = {
            name: 'Variables',
            tools: [
                {
                    name: 'variable',
                    displayName: 'Variable',
                    type: 'Variable',
                    description: 'Feedback Triggering Attribute',
                    variables: variables,
                },
            ],
        };
        const attr = watch('outputInstructions')
            .filter(instructions => instructions.name)
            .map(instructions => ({
                label: instructions?.name,
                value: `Attribute:${instructions?.name}`,
            }));
        setAttributes(attr);
        setCompletion([completionData]);
    };

    const onIntegrationTypeChange = (id: string) => {
        if (watch('feedbackRequestIntegration.type') === RequestToolType.MessageBroker && !triggerMessageBroker) {
            setTriggerMessageBroker(true);
            setConnectors([]);
            setTools([]);
            setValue('feedbackRequestIntegration.configuration', undefined, { shouldDirty: true });
            setValue('feedbackRequestIntegration.connectorType', undefined, { shouldDirty: true });
            setValue('feedbackRequestIntegration.id', id);
            setValue('feedbackRequestIntegration.type', RequestToolType.MessageBroker, { shouldDirty: true });
        } else {
            setTriggerMessageBroker(false);
        }
    };

    return {
        isValid,
        feedbackUrl,
        feedbackUrlCopied,
        control,
        getModelFromReusableAgent,
        getLearningConfig,
        openModal,
        tools,
        errors,
        isSlm,
        languageModel,
        prompt,
        inboundOptions,
        outboundOptions,
        loadingIntellisense,
        intellisenseOptions,
        allIntellisenseValues,
        attributes,
        setPrompt,
        setLanguageModel,
        setSlm,
        register,
        clearErrors,
        setTools,
        handleSubmit,
        onHandleSubmit,
        onApiChange,
        setOpenModal,
        setValue,
        watch,
        getValues,
        onViewLearning,
        handleFeedbackUrlCopy,
        handleRemove,
        onLanguageChange,
        onPromptChange,
        onIntegrationTypeChange,
        connectors,
        setConnectors,
        onConnectorChange,
        outputInstructions,
        appendInstructions,
        removeInstructions,
        updateInstructionsList,
        setCompletion,
        completion,
        updateIntellisenseVariable,
        trigger,
        refetchVariables,
        embeddings: embeddings ?? [],
        refetchEmbedding,
        loadingEmbeddings,
        setEmbeddingModel,
        embeddingModel,
        additionalCriteriaFields,
        appendAdditionalCriteria,
        removeAdditionalCriteria,
        adminEmails: adminEmails ?? [],
        loadingAdminEmails,
        refetchAdminEmails,
    };
};
