import {
    ApiToolResponseType,
    PromptResponse,
    ExecutableFunctionResponseType,
} from '@/app/workspace/[wid]/agents/components/agent-form';
import { AgentData } from '@/app/workspace/[wid]/agents/components/agent-table-container';
import { IntellisenseTools } from '@/app/workspace/[wid]/prompt-templates/components/monaco-editor';
import { ActivityProps, DashboardDataCardProps } from '@/components';
import { ActivityColorCode } from '@/enums/activity-color-code-type';
import { areObjectsEqual, isNullOrEmpty } from '@/lib/utils';
import { Agent, IAgent, IAgentForm, IAllModel, IHookProps, IOption, IVariable, INodeHumanInput, AgentCategory, DEFAULT_HORIZON_CONFIG } from '@/models';
import { logger } from '@/utils';
import { Unplug, Database, Link, TrendingUpIcon, TrendingDownIcon } from 'lucide-react';
// import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useInView } from 'react-intersection-observer';
import { useMutation, useQueryClient } from 'react-query';
import { toast } from 'sonner';
import { MessageBrokerTriggerType, QueryKeyType } from '@/enums';
import { useApp } from '@/context/app-context';
import {
    useAgentQuery,
    useApiQuery,
    useConnectorQuery,
    useExecutableFunctionQuery,
    useGraphRagQuery,
    useGuardrailBindingQuery,
    useGuardrailQuery,
    useLLMQuery,
    useMcpQuery,
    useMessageBrokerQuery,
    usePromptQuery,
    useSLMQuery,
    useVariableQuery,
    useVectorRagQuery,
} from './use-common';
// import { agentService } from '@/services';

const initWorkspaceDataCardInfo: DashboardDataCardProps[] = [
    {
        title: 'Most Frequently Triggered',
        value: <p className="text-d-xs font-semibold text-gray-800 dark:text-gray-300">N/A</p>,
        description: 'Used Most Credits Last Month',
        trendValue: '',
        trendColor: 'text-green-600',
        Icon: Unplug,
        TrendIcon: TrendingUpIcon,
        showTrendIcon: true,
    },
    {
        title: 'Most credit consumed',
        value: <p className="text-d-xs font-semibold text-gray-800 dark:text-gray-300">N/A</p>,
        description: 'Used Highest Tokens Last Month',
        trendValue: '',
        trendColor: 'text-red-500',
        Icon: Database,
        TrendIcon: TrendingDownIcon,
        showTrendIcon: true,
    },
    {
        title: 'Highest processing time',
        value: <p className="text-d-xs font-semibold text-gray-800 dark:text-gray-300">N/A</p>,
        description: 'Executed Most in Last Month',
        trendValue: '',
        trendColor: 'text-green-600',
        Icon: Link,
        TrendIcon: TrendingUpIcon,
        showTrendIcon: true,
    },
];

const activityData: ActivityProps[] = [
    {
        title: 'Workflow Execution',
        description: 'Workflow Execution',
        date: '2024/12/12',
        colorCode: ActivityColorCode.Amber,
    },
    {
        title: 'API Execution',
        description: (
            <div>
                API Execution <span style={{ color: ActivityColorCode.Purple }}>AWS</span>
            </div>
        ),
        date: '2024/12/12',
        colorCode: ActivityColorCode.Purple,
    },
    {
        title: 'LLM Execution',
        description: 'LLM Execution',
        date: '2024/12/12',
        colorCode: ActivityColorCode.Red,
    },
];

const defaultHumanInput: INodeHumanInput = {
    enableHumanInput: false,
    instruction: '',
    enableBroker: false,
    option: MessageBrokerTriggerType.MessageBroker,
    topicProducer: { messageBrokerId: '', topicId: '', requestStructure: '' },
    topicConsumer: { messageBrokerId: '', topicId: '', requestStructure: '' },
};

export const useAgent = (props?: IHookProps) => {
    const { triggerGuardrailBinding, guardrailBinding, setGuardrailBinding } = useApp();
    const [apiConfigurationDataCardInfo] = useState<DashboardDataCardProps[]>(initWorkspaceDataCardInfo);
    const [agentConfigurationTableData, setAgentConfigurationTableData] = useState<AgentData[]>([]);
    const [agents, setAgents] = useState<AgentData[]>([]);
    const [agentDetails, setAgentDetails] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setOpen] = useState(false);
    const [allAgents, setAllAgents] = useState<IOption[]>([]);
    const [allApis, setAllApis] = useState<IOption[]>([]);
    const [allExecutableFunctions, setAllExecutableFunctions] = useState<IOption[]>([]);
    const [allIntellisenseValues, setAllIntellisenseValues] = useState<string[]>([]);

    const queryClient = useQueryClient();

    const {
        register,
        handleSubmit,
        setValue,
        getValues,
        watch,
        reset,
        trigger,
        formState: { errors, isValid },
        control,
    } = useForm<IAgentForm>({
        mode: 'all',
    });

    useEffect(() => {
        if (!isOpen) {
            reset({
                id: undefined,
                agentDescription: '',
                agentName: '',
                agentType: '',
                isReadOnly: undefined,
                humanInput: defaultHumanInput,
                llmId: undefined,
                slmId: undefined,
                promptTemplateId: undefined,
                tools: [],
                selfLearning: undefined,
                mcpServers: undefined,
                knowledgeGraphs: undefined,
                rags: undefined,
                guardrails: undefined,
                sourceValue: undefined,
                connectors: undefined,
                // Horizon Agent fields
                agentCategory: AgentCategory.REUSABLE,
                horizonConfig: undefined,
                publishStatus: undefined,
            });
        }
    }, [isOpen, reset]);

    const { isFetching } = useAgentQuery({
        props,
        onSuccess: data => {
            mapAgents(data);
        },
        onError: () => {
            setAgentConfigurationTableData([]);
            setAgents([]);
        },
    });

    const {
        data: allPrompts,
        isFetching: fetchingPrompts,
        isLoading: promptsLoading,
        refetch: refetchPrompts,
    } = usePromptQuery<PromptResponse>({ queryKey: 'prompts' });

    const {
        data: allModels,
        isFetching: fetchingModels,
        isLoading: llmModelsLoading,
        refetch: refetchLlms,
    } = useLLMQuery<IAllModel>({ queryKey: 'llmModels' });

    const {
        data: allConnectors,
        isFetching: fetchingConnectors,
        isLoading: connectorsLoading,
        refetch: refetchConnectors,
    } = useConnectorQuery({ props });

    const {
        data: allSLMModels,
        isFetching: fetchingSLMModels,
        isLoading: slmModelsLoading,
        refetch: refetchSLM,
    } = useSLMQuery();

    const {
        data: allApiTools,
        isFetching: fetchingApiTools,
        isLoading: apiLoading,
        refetch: refetchApiTools,
    } = useApiQuery<ApiToolResponseType>({
        queryKey: 'apiTools',
        onSuccess: data => {
            setAllApis(
                data
                    .filter((api: ApiToolResponseType) => api?.name)
                    .map((api: ApiToolResponseType) => ({
                        label: api.name,
                        value: `${IntellisenseTools.API}:${api.name}`,
                    }))
            );
        },
    });

    const {
        data: allExecutableFunctionTools,
        isFetching: fetchingAllExecutableFunctionTools,
        isLoading: executableFunctionsLoading,
        refetch: refetchExecutableFunctions,
    } = useExecutableFunctionQuery<ExecutableFunctionResponseType>({
        props,
        queryKey: 'executableFunctions',
        onSuccess: data => {
            setAllExecutableFunctions(
                data
                    .filter((func: ExecutableFunctionResponseType) => func?.name)
                    .map((func: ExecutableFunctionResponseType) => ({
                        label: func.name,
                        value: `${IntellisenseTools.ExecutableFunction}:${func.name}`,
                    }))
            );
        },
    });

    const {
        data: allVariables,
        isLoading: loadingVariables,
        refetch: refetchVariables,
    } = useVariableQuery({
        props,
        select: data =>
            data
                .filter((variable: IVariable) => variable?.name)
                .map((variable: IVariable) => ({
                    label: variable.name,
                    value: `${IntellisenseTools.Variable}:${variable.name}`,
                })),
    });

    const { data: allMcpTools, isLoading: mcpLoading, isFetching: fetchingMcp, refetch: refetchMcp } = useMcpQuery();

    const {
        data: allGraphRag,
        isLoading: graphRagLoading,
        isFetching: fetchingGraphRag,
        refetch: refetchGraphRag,
    } = useGraphRagQuery({ queryKey: 'graph-rag' });

    const {
        data: allVectorRags,
        isLoading: vectorRagLoading,
        isFetching: fetchingVectorRag,
        refetch: refetchVectorRag,
    } = useVectorRagQuery({ queryKey: 'vector-rag' });

    const {
        isFetching: fetchingMessageBroker,
        data: messageBrokers,
        refetch: refetchMessageBrokers,
    } = useMessageBrokerQuery();

    const {
        isFetching: fetchingGuardrails,
        data: guardrailData,
        isLoading: guardrailLoading,
        refetch: refetchGuardrails,
    } = useGuardrailQuery();

    const { isLoading: loadingBinding, refetch: refetchBinding } = useGuardrailBindingQuery({
        props,
        onSuccess: data => {
            setGuardrailBinding(data);
        },
        onError: () => {
            setGuardrailBinding(undefined);
        },
    });

    useEffect(() => {
        if (triggerGuardrailBinding > 0) {
            refetchBinding();
        }
    }, [triggerGuardrailBinding, refetchBinding]);

    const mapAgents = (arr: Agent[]) => {
        const data = arr.map((x: Agent) => ({
            id: x.id,
            agentName: x.name,
            agentDescription: x.description,
            llmId: x.llmId,
            slmId: x.slmId,
            isReadOnly: x?.isReadOnly,
            selfLearning: x?.configurations?.selfLearning,
            knowledgeGraphs: x?.configurations?.knowledgeGraphs,
            rags: x?.configurations?.rags,
            publisherIntegration: x?.configurations?.publisherIntegration,
            guardrails: x?.configurations?.guardrails,
            sourceValue: isNullOrEmpty(x.llmId) ? x.slmId : x.llmId,
            connectors: x?.configurations?.connectors,
            // Horizon Agent fields
            agentCategory: x?.agentCategory || AgentCategory.REUSABLE,
            publishStatus: x?.publishStatus,
        }));
        setAgentDetails(arr);
        setAgentConfigurationTableData(data);
        setAgents(data);
        setAllAgents(
            arr
                .filter((agent: Agent) => agent?.name)
                .map((agent: Agent) => ({
                    label: agent.name,
                    value: `${IntellisenseTools.Agent}:${agent.name}`,
                }))
        );
    };

    const { isLoading: createIsLoading, mutate: mutateAgent } = useMutation(
        async (data: IAgent) => {
            const stored = localStorage.getItem('mock_agent_data');
            const configs = stored ? JSON.parse(stored) : [];
            const newConfig = { ...data, id: `agent-${Date.now()}` };
            configs.push(newConfig);
            localStorage.setItem('mock_agent_data', JSON.stringify(configs));
            return newConfig;
        },
        {
            onSuccess: () => {
                if (props?.onRefetch) {
                    props.onRefetch();
                }
                queryClient.invalidateQueries(QueryKeyType.AGENT);
                setLoading(false);
                reset();
                setOpen(false);
                toast.success('Agent saved successfully');
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onError: (error: any) => {
                toast.error(error?.message || 'Error creating agent');
                logger.error('Error creating agent:', error?.message);
            },
        }
    );

    const { mutate: mutateDeleteAgent } = useMutation(
        async ({ id }: { id: string }) => {
            const stored = localStorage.getItem('mock_agent_data');
            const configs = stored ? JSON.parse(stored) : [];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const filtered = configs.filter((x: any) => x.id !== id);
            localStorage.setItem('mock_agent_data', JSON.stringify(filtered));
            return { id };
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(QueryKeyType.AGENT);
                toast.success('Agent deleted successfully');
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onError: (error: any) => {
                toast.error(error?.message || 'Error deleting agent');
                logger.error('Error deleting agent:', error?.message);
            },
        }
    );

    const { isLoading: updateIsLoading, mutate: mutateUpdateAgent } = useMutation(
        async ({ data, id }: { data: IAgent; id: string }) => {
            const stored = localStorage.getItem('mock_agent_data');
            const configs = stored ? JSON.parse(stored) : [];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const index = configs.findIndex((x: any) => x.id === id);
            if (index > -1) {
                configs[index] = { ...configs[index], ...data, id };
                localStorage.setItem('mock_agent_data', JSON.stringify(configs));
            }
            return { data, id };
        },
        {
            onSuccess: () => {
                if (props?.onRefetch) {
                    props.onRefetch();
                }
                queryClient.invalidateQueries(QueryKeyType.AGENT);
                setLoading(false);
                reset();
                setOpen(false);
                toast.success('Agent updated successfully');
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onError: (error: any) => {
                toast.error(error?.message || 'Error updating agent');
                logger.error('Error updating agent:', error?.message);
            },
        }
    );

    // Publish mutation for Horizon Agents
    const { isLoading: isPublishing, mutate: mutatePublishAgent } = useMutation(
        async ({ id }: { id: string }) => {
            const stored = localStorage.getItem('mock_agent_data');
            const configs = stored ? JSON.parse(stored) : [];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const index = configs.findIndex((x: any) => x.id === id);
            if (index > -1) {
                const currentVersion = configs[index].horizonConfig?.identity?.version || '1.0.0';
                configs[index] = {
                    ...configs[index],
                    publishStatus: {
                        isPublished: true,
                        publishedVersion: currentVersion,
                        publishedAt: new Date().toISOString(),
                        publishedBy: 'current-user',
                    },
                };
                localStorage.setItem('mock_agent_data', JSON.stringify(configs));
            }
            return { id };
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(QueryKeyType.AGENT);
                toast.success('Horizon Agent published successfully');
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onError: (error: any) => {
                toast.error(error?.message || 'Error publishing agent');
                logger.error('Error publishing agent:', error?.message);
            },
        }
    );

    const onPublish = () => {
        const agentId = getValues('id');
        if (agentId) {
            mutatePublishAgent({ id: agentId });
        }
    };

    const intellisenseOptions = useMemo(() => {
        if (!allAgents || !allApis || !allVariables || !allExecutableFunctions) return [];

        const allValues = [
            ...allAgents.map(agent => agent.value),
            ...allApis.map(api => api.value),
            ...allVariables.map(variable => variable.value),
            ...allExecutableFunctions.map(func => func.value),
        ];
        setAllIntellisenseValues(allValues);

        return [
            {
                name: 'Agents',
                options: allAgents,
            },
            {
                name: 'APIs',
                options: allApis,
            },
            {
                name: 'Variables',
                options: allVariables,
            },
            {
                name: 'ExecutableFunctions',
                options: allExecutableFunctions,
            },
        ];
    }, [allAgents, allApis, allVariables, allExecutableFunctions]);

    const onEdit = (id: string) => {
        if (id) {
            const obj = agentDetails.find(x => x.id === id);
            const isLlm = !!(obj?.llmId && obj?.llmId?.trim() !== '');

            if (obj) {
                setValue('id', obj.id);
                setValue('agentName', obj.name);
                setValue('agentDescription', obj.description);
                setValue('llmId', isLlm ? obj.llmId : undefined);
                setValue('humanInput', obj.configurations?.humanInput);
                setValue('slmId', isLlm ? undefined : obj.slmId);
                setValue('promptTemplateId', obj.promptTemplateId);
                setValue('tools', obj.tools);
                setValue('isReadOnly', obj?.isReadOnly);
                setValue('selfLearning', obj?.configurations?.selfLearning);
                setValue('mcpServers', obj?.configurations?.mcpServers);
                setValue('knowledgeGraphs', obj?.configurations?.knowledgeGraphs);
                setValue('rags', obj?.configurations?.rags);
                setValue('publisherIntegration', obj?.configurations?.publisherIntegration);
                setValue('sourceValue', isLlm ? obj.llmId : obj.slmId);
                setValue('connectors', obj?.configurations?.connectors);
                // Horizon Agent fields
                setValue('agentCategory', obj?.agentCategory || AgentCategory.REUSABLE);
                setValue('horizonConfig', obj?.horizonConfig);
                setValue('publishStatus', obj?.publishStatus);
                if (
                    guardrailBinding &&
                    guardrailBinding?.length > 0 &&
                    obj?.configurations?.guardrails &&
                    obj?.configurations?.guardrails?.length > 0
                ) {
                    const results = guardrailBinding?.map(x => x.guardrailId);
                    const filteredIds = obj?.configurations?.guardrails?.filter(id => !results.includes(id));
                    setValue('guardrails', filteredIds?.length > 0 ? filteredIds : undefined);
                } else {
                    setValue('guardrails', obj?.configurations?.guardrails);
                }
            }
        }
    };

    const buttonText = () => {
        if (isFetching) return 'Please Wait';
        if (createIsLoading || updateIsLoading) return 'Saving';
        if (loading) return 'Verifying';
        return 'Save';
    };

    const { ref } = useInView({
        threshold: 0.5,
        rootMargin: '100px',
    });

    const onHandleSubmit = (data: IAgentForm) => {
        try {
            const isLlm = !!(data.llmId && data.llmId?.trim() !== '');
            const body: IAgent = {
                name: data.agentName,
                description: data.agentDescription,
                type: 'agent_node',
                configurations: {
                    humanInput: areObjectsEqual(defaultHumanInput, data.humanInput) ? undefined : data.humanInput,
                    selfLearning: data.selfLearning,
                    mcpServers: data.mcpServers,
                    knowledgeGraphs: data.knowledgeGraphs,
                    rags: data.rags,
                    publisherIntegration: data.publisherIntegration,
                    guardrails: data.guardrails && data.guardrails?.length > 0 ? data.guardrails : undefined,
                    connectors: data.connectors,
                },
                llmId: isLlm ? data.llmId : undefined,
                slmId: isLlm ? undefined : data.slmId,
                promptTemplateId: data.promptTemplateId,
                tools: data.tools,
                // Horizon Agent fields
                agentCategory: data.agentCategory,
                horizonConfig: data.agentCategory === AgentCategory.HORIZON ? data.horizonConfig : undefined,
                publishStatus: data.publishStatus,
            };

            if (data.id) {
                mutateUpdateAgent({ data: body, id: data.id });
            } else {
                mutateAgent(body);
            }
        } catch (error) {
            toast.error("Something went wrong! We couldn't save your agent");
            logger.error(`An unexpected error occurred: ${error}`);
        }
    };

    const onAgentFilter = (filter: AgentData | null) => {
        let result = agents;

        if (!isNullOrEmpty(filter?.search)) {
            result = result.filter(x =>
                x.agentName.toLowerCase().includes(filter?.search?.toLowerCase()?.trim() as string)
            );
        }
        if (!isNullOrEmpty(filter?.agentName)) {
            result = result.filter(x => x.agentName.toLowerCase() === filter?.agentName.toLowerCase());
        }
        if (!isNullOrEmpty(filter?.agentDescription)) {
            result = result.filter(x => x.agentDescription.toLowerCase() === filter?.agentDescription.toLowerCase());
        }

        setAgentConfigurationTableData(result);
    };

    const onDelete = (id: string) => {
        if (id) {
            mutateDeleteAgent({ id });
        }
    };

    const onRefetchGraphRag = async () => {
        await refetchGraphRag();
    };

    const onRefetchVectorRag = async () => {
        await refetchVectorRag();
    };

    const onRefetchMessageBroker = async () => {
        await refetchMessageBrokers();
    };

    return {
        apiConfigurationDataCardInfo,
        activityData,
        isFetching,
        isSaving: createIsLoading || updateIsLoading,
        errors,
        isValid,
        control,
        agentConfigurationTableData,
        isOpen,
        allPrompts,
        allModels,
        allSLMModels,
        allConnectors,
        allApiTools,
        allExecutableFunctionTools,
        allMcpTools,
        allGraphRag,
        allVectorRags,
        isLoadingResources:
            fetchingPrompts ||
            fetchingApiTools ||
            fetchingAllExecutableFunctionTools ||
            fetchingModels ||
            fetchingSLMModels ||
            fetchingMcp ||
            fetchingConnectors ||
            fetchingGraphRag ||
            fetchingVectorRag ||
            fetchingMessageBroker ||
            fetchingGuardrails,
        promptsLoading,
        llmModelsLoading,
        slmModelsLoading,
        connectorsLoading,
        apiLoading,
        executableFunctionsLoading,
        mcpLoading,
        allIntellisenseValues,
        intellisenseOptions: intellisenseOptions as never[],
        loadingIntellisense:
            isFetching || fetchingApiTools || loadingVariables || fetchingGraphRag || fetchingVectorRag,
        graphRagLoading,
        vectorRagLoading,
        messageBrokers,
        guardrailData,
        guardrailLoading: guardrailLoading || loadingBinding,
        trigger,
        buttonText,
        setValue,
        getValues,
        bottomRef: ref,
        onAgentFilter,
        register,
        handleSubmit,
        onHandleSubmit,
        onEdit,
        setOpen,
        onDelete,
        watch,
        reset,
        refetchPrompts,
        refetchLlms,
        refetchApiTools,
        refetchExecutableFunctions,
        refetchSLM,
        refetchVariables,
        refetchMcp,
        refetchConnectors,
        refetchGraphRag,
        refetchVectorRag,
        refetchGuardrails,
        onRefetchGraphRag,
        onRefetchVectorRag,
        onRefetchMessageBroker,
        // Horizon Agent publish
        isPublishing,
        onPublish,
    };
};
