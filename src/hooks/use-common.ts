/* eslint-disable @typescript-eslint/no-explicit-any */
import { GuardrailSelectorRef } from '@/app/editor/[wid]/[workflow_id]/components/guardrail-selector';
import { IntellisenseOption, IntellisenseTools } from '@/app/workspace/[wid]/prompt-templates/components/monaco-editor';
import { useAuth } from '@/context';
import { useApp } from '@/context/app-context';
import { QueryKeyType } from '@/enums';
import { isNullOrEmpty, resolveTriggerQuery } from '@/lib/utils';
import {
    Agent,
    ExecutableFunctionAPI,
    IConnectorForm,
    IDatabase,
    IEmbedding,
    IGraphRag,
    IGuardrailBinding,
    IGuardrailBindingRequest,
    IGuardrailModelConfig,
    IGuardrailSetup,
    IHookProps,
    ILLMForm,
    IMessageBroker,
    IPlatformConfiguration,
    IPromptToolResponse,
    IReRanking,
    ISharedItem,
    ISLMForm,
    ISTSForm,
    ISyncPrompt,
    IVariable,
    IVault,
    IVectorRag,
    PromptTemplate,
    ToolAPI,
} from '@/models';
import {
    agentService,
    apiService,
    connectorService,
    databaseService,
    embeddingModelService,
    executableFunctionService,
    graphRagService,
    guardrailBindingService,
    guardrailModelService,
    guardrailService,
    llmService,
    mcpService,
    messageBrokerService,
    platformService,
    promptService,
    reRankingModelService,
    slmService,
    stsService,
    variableService,
    vaultService,
    vectorRagService,
} from '@/services';
import { FetchError, logger } from '@/utils';
import { useParams } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { toast } from 'sonner';
import { IMCPBody } from './use-mcp-configuration';

export const useIntellisense = (workflowId?: string) => {
    const params = useParams();
    const { token } = useAuth();
    const [allIntellisenseValues, setAllIntellisenseValues] = useState<string[]>([]);

    const buildTree = (node: ISharedItem, path: string) => {
        const currentPath = path ? `${path}.${node.name}` : node.name;

        const mapped: IntellisenseOption = {
            label: node.name,
            value: `${IntellisenseTools.Metadata}:${currentPath}`,
        };

        if (node.children && node.children.length > 0) {
            mapped.children = node.children.map(child => buildTree(child, currentPath));
        }

        return mapped;
    };

    const extractLeafValues = (items: any[]): string[] => {
        const result: string[] = [];

        const traverse = (item: any) => {
            if (!item) return;
            const hasChildren = item.children && item.children.length > 0;

            if (!hasChildren && item.value) {
                result.push(item.value);
            }

            if (hasChildren) {
                item.children.forEach(traverse);
            }
        };

        items.forEach(traverse);
        return result;
    };

    const {
        isLoading: loadingIntellisense,
        data: allIntellisense,
        refetch: refetchVariables,
    } = useQuery(
        'meta-intellisense',
        () => ({ variables: { shared: [] }, metadata: { shared: [] } } as any),
        {
            enabled: !!token,
            refetchOnWindowFocus: false,
            select: data => ({
                variables: data?.variables?.shared
                    ?.filter((variable: ISharedItem) => variable?.name)
                    ?.map((variable: ISharedItem) => ({
                        label: variable.name,
                        value: `${IntellisenseTools.Variable}:${variable.name}`,
                    })),
                metadata: data?.metadata?.shared
                    ?.filter((metadata: ISharedItem) => metadata?.name)
                    ?.map((metadata: ISharedItem) => buildTree(metadata, '')),
            }),
        }
    );

    const intellisenseOptions = useMemo(() => {
        if (!allIntellisense?.variables || !allIntellisense?.metadata) return [];

        const allValues = extractLeafValues(Object.values(allIntellisense).flat());

        setAllIntellisenseValues(allValues);

        return [
            {
                name: 'Variables',
                options: allIntellisense?.variables,
            },
            {
                name: 'Metadata',
                options: allIntellisense?.metadata,
            },
        ];
    }, [allIntellisense]);

    return {
        loadingIntellisense,
        allIntellisense,
        allIntellisenseValues,
        intellisenseOptions,
        setAllIntellisenseValues,
        refetchVariables,
    };
};

export const useGuardrail = () => {
    const params = useParams();
    const { setTriggerGuardrailBinding } = useApp();
    const guardrailRef = useRef<GuardrailSelectorRef>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const {
        mutate,
        data: guardrails,
        isLoading: guardrailsLoading,
    } = useMutation(() => guardrailService.get<IGuardrailSetup[]>(params.wid as string), {
        onSuccess: () => {
            setLoading(false);
        },
        onError: (error: FetchError) => {
            toast.error(error?.message);
            logger.error('Failed to fetch guardrails:', error?.message);
            setLoading(false);
        },
    });

    const { mutateAsync: mutateWorkspaceUpdate } = useMutation(
        async ({ data }: { data: IGuardrailBindingRequest }) =>
            await guardrailBindingService.manage(data, params.wid as string),
        {
            onSuccess: () => {
                toast.success('Workspace guardrails associated successfully');
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                logger.error('Error while workspace guardrail associating:', error?.message);
                setLoading(false);
            },
        }
    );

    const { mutateAsync: mutateWorkflowUpdate } = useMutation(
        async ({ data }: { data: IGuardrailBindingRequest }) =>
            await guardrailBindingService.workflow(data, params.wid as string, params.workflow_id as string),
        {
            onSuccess: () => {
                toast.success('Workflow guardrails associated successfully');
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                logger.error('Error while workflow guardrail associating:', error?.message);
                setLoading(false);
            },
        }
    );

    const onGuardrail = () => {
        if (guardrailRef?.current) {
            setLoading(true);
            guardrailRef.current.onOpen();
            mutate();
        }
    };

    const onRefetch = () => {
        mutate();
    };

    const onWorkspaceGuardrailsChange = async (items: string[] | undefined) => {
        await mutateWorkspaceUpdate({ data: { guardrailIds: items ?? [] } });
        setTriggerGuardrailBinding(prev => (prev ?? 0) + 1);
    };

    const onWorkflowGuardrailsChange = async (items: string[] | undefined) => {
        await mutateWorkflowUpdate({ data: { workflowId: params.workflow_id as string, guardrailIds: items ?? [] } });
    };

    return {
        guardrailRef,
        guardrails,
        guardrailsLoading: guardrailsLoading && loading,
        onGuardrail,
        onRefetch,
        onWorkspaceGuardrailsChange,
        onWorkflowGuardrailsChange,
    };
};

export const useSyncPrompt = () => {
    const syncTools = async ({
        prompt,
        allApiTools,
        allMcpTools,
        allVectorRags,
        allGraphRag,
        allConnectors,
        allExecutableFunctions,
        apis,
        mcpServers,
        vectorRags,
        graphRags,
        connectors,
        executableFunctions,
    }: ISyncPrompt): Promise<IPromptToolResponse> => {
        const apiResult = syncToolsByType(prompt, allApiTools, apis, IntellisenseTools.API);
        const mcpResult = syncToolsByType(prompt, allMcpTools, mcpServers, IntellisenseTools.MCP) ?? [];
        const vectorResult = syncToolsByType(prompt, allVectorRags, vectorRags, IntellisenseTools.VectorRAG) ?? [];
        const graphResult = syncToolsByType(prompt, allGraphRag, graphRags, IntellisenseTools.GraphRAG) ?? [];
        const connectorResult =
            syncToolsByType(prompt, allConnectors, connectors, IntellisenseTools.DatabaseConnector) ?? [];
        const executableFunctionResult =
            syncToolsByType(prompt, allExecutableFunctions, executableFunctions, IntellisenseTools.ExecutableFunction) ?? [];

        return {
            apis: apiResult,
            mcps: mcpResult,
            vectorRags: vectorResult,
            graphRags: graphResult,
            connectors: connectorResult,
            executableFunctions: executableFunctionResult,
        } as IPromptToolResponse;
    };

    const syncToolsByType = <T extends { id?: string; name?: string }>(
        prompt: string | undefined,
        allTools: T[] | undefined,
        existingTools: T[] | undefined,
        prefix: IntellisenseTools
    ): T[] | undefined => {
        if (!isNullOrEmpty(prompt)) {
            const result = allTools
                ?.map(x => ({ id: x.id, value: `${prefix}:${x.name}` }))
                ?.filter(x => prompt?.includes(x.value));

            if (result && result.length > 0 && existingTools && existingTools.length > 0) {
                const output = result.filter(x => !existingTools.map(r => r.id).includes(x.id));
                if (output?.length > 0) {
                    const records = allTools?.filter(x => output.map(p => p.id).includes(x.id));
                    if (records && records.length > 0) {
                        return [...existingTools, ...records];
                    }
                }
            } else if (
                (result && result.length > 0 && !existingTools) ||
                (existingTools?.length === 0)
            ) {
                const records = allTools?.filter(x => result?.map(p => p.id).includes(x.id));
                if (records && records.length > 0) {
                    return records;
                }
            }
        }
        return existingTools;
    };

    return { syncTools };
};

export const usePlatformQuery = <TSelected = IPlatformConfiguration>({
    props,
    queryKey,
    select,
    onSuccess,
    onError,
}: {
    props?: IHookProps;
    queryKey?: string;
    select?: (data: IPlatformConfiguration) => TSelected;
    onSuccess?: (data: TSelected) => void;
    onError?: (error: any) => void;
} = {}) => {
    const { token } = useAuth();

    return useQuery<IPlatformConfiguration, any, TSelected>(
        queryKey ?? QueryKeyType.PLATFORM_CONFIG,
        async () => ({} as any),
        {
            enabled: !!token && resolveTriggerQuery(props?.triggerQuery),
            refetchOnWindowFocus: false,
            select,
            onSuccess,
            onError: e => {
                onError?.(e);
                console.error('Failed to fetch Platform Configurations:', e);
            },
        }
    );
};

export const useVaultQuery = ({
    props,
    queryKey,
    onSuccess,
    onError,
}: {
    props?: IHookProps;
    queryKey?: string;
    onSuccess?: (data: IVault[]) => void;
    onError?: (error: any) => void;
} = {}) => {
    const params = useParams();
    const { token } = useAuth();

    return useQuery(
        queryKey ?? QueryKeyType.VAULT,
        async () => [] as IVault[],
        {
            enabled: !!token && resolveTriggerQuery(props?.triggerQuery),
            refetchOnWindowFocus: false,
            onSuccess: data => onSuccess?.(data),
            onError: e => {
                onError?.(e);
                console.error('Failed to fetch Vault:', e);
            },
        }
    );
};

export const usePromptQuery = <T = PromptTemplate>({
    props,
    queryKey,
    onSuccess,
    onError,
}: {
    props?: IHookProps;
    queryKey?: string;
    onSuccess?: (data: T[]) => void;
    onError?: (error: any) => void;
} = {}) => {
    const params = useParams();
    const { token } = useAuth();

    return useQuery(queryKey ?? QueryKeyType.PROMPT, async () => [] as T[], {
        enabled: !!token && resolveTriggerQuery(props?.triggerQuery),
        refetchOnWindowFocus: false,
        onSuccess: data => onSuccess?.(data),
        onError: e => {
            onError?.(e);
            console.error('Failed to fetch Prompt:', e);
        },
    });
};

export const useLLMQuery = <T = ILLMForm, TSelected = T[]>({
    props,
    queryKey,
    select,
    onSuccess,
    onError,
}: {
    props?: IHookProps;
    queryKey?: string;
    select?: (data: T[]) => TSelected;
    onSuccess?: (data: TSelected) => void;
    onError?: (error: any) => void;
} = {}) => {
    const params = useParams();
    const { token } = useAuth();

    return useQuery<T[], any, TSelected>(
        queryKey ?? QueryKeyType.LLM,
        async () => [] as T[],
        {
            enabled: !!token && resolveTriggerQuery(props?.triggerQuery),
            refetchOnWindowFocus: false,
            select,
            onSuccess,
            onError: e => {
                onError?.(e);
                console.error('Failed to fetch LLM:', e);
            },
        }
    );
};

export const useSLMQuery = <T = ISLMForm, TSelected = T[]>({
    props,
    queryKey,
    select,
    onSuccess,
    onError,
}: {
    props?: IHookProps;
    queryKey?: string;
    select?: (data: T[]) => TSelected;
    onSuccess?: (data: TSelected) => void;
    onError?: (error: any) => void;
} = {}) => {
    const params = useParams();
    const { token } = useAuth();

    return useQuery<T[], any, TSelected>(
        queryKey ?? QueryKeyType.SLM,
        async () => [] as T[],
        {
            enabled: !!token && resolveTriggerQuery(props?.triggerQuery),
            refetchOnWindowFocus: false,
            select,
            onSuccess,
            onError: e => {
                onError?.(e);
                console.error('Failed to fetch SLM:', e);
            },
        }
    );
};

export const useSTSQuery = <T = ISTSForm, TSelected = T[]>({
    props,
    queryKey,
    select,
    onSuccess,
    onError,
}: {
    props?: IHookProps;
    queryKey?: string;
    select?: (data: T[]) => TSelected;
    onSuccess?: (data: TSelected) => void;
    onError?: (error: any) => void;
} = {}) => {
    const params = useParams();
    const { token } = useAuth();

    return useQuery<T[], any, TSelected>(
        queryKey ?? QueryKeyType.STS,
        async () => [] as T[],
        {
            enabled: !!token && resolveTriggerQuery(props?.triggerQuery),
            refetchOnWindowFocus: false,
            select,
            onSuccess,
            onError: e => {
                onError?.(e);
                console.error('Failed to fetch STS:', e);
            },
        }
    );
};

export const useApiQuery = <T = ToolAPI, TSelected = T[]>({
    props,
    queryKey,
    select,
    onSuccess,
    onError,
}: {
    props?: IHookProps;
    queryKey?: string;
    select?: (data: T[]) => TSelected;
    onSuccess?: (data: TSelected) => void;
    onError?: (error: any) => void;
} = {}) => {
    const params = useParams();
    const { token } = useAuth();

    return useQuery<T[], any, TSelected>(
        queryKey ?? QueryKeyType.API,
        async () => [] as T[],
        {
            enabled: !!token && resolveTriggerQuery(props?.triggerQuery),
            refetchOnWindowFocus: false,
            select,
            onSuccess,
            onError: e => {
                onError?.(e);
                console.error('Failed to fetch API:', e);
            },
        }
    );
};

export const useMcpQuery = <T = IMCPBody, TSelected = T[]>({
    props,
    queryKey,
    select,
    onSuccess,
    onError,
}: {
    props?: IHookProps;
    queryKey?: string;
    select?: (data: T[]) => TSelected;
    onSuccess?: (data: TSelected) => void;
    onError?: (error: any) => void;
} = {}) => {
    const params = useParams();
    const { token } = useAuth();

    return useQuery<T[], any, TSelected>(
        queryKey ?? QueryKeyType.MCP,
        async () => [] as T[],
        {
            enabled: !!token && resolveTriggerQuery(props?.triggerQuery),
            refetchOnWindowFocus: false,
            select,
            onSuccess,
            onError: e => {
                onError?.(e);
                console.error('Failed to fetch MCP:', e);
            },
        }
    );
};

export const useVectorRagQuery = <T = IVectorRag, TSelected = T[]>({
    props,
    queryKey,
    select,
    onSuccess,
    onError,
}: {
    props?: IHookProps;
    queryKey?: string;
    select?: (data: T[]) => TSelected;
    onSuccess?: (data: TSelected) => void;
    onError?: (error: any) => void;
} = {}) => {
    const params = useParams();
    const { token } = useAuth();

    return useQuery<T[], any, TSelected>(
        queryKey ?? QueryKeyType.VECTOR_RAG,
        async () => [] as T[],
        {
            enabled: !!token && resolveTriggerQuery(props?.triggerQuery),
            refetchOnWindowFocus: false,
            select,
            onSuccess,
            onError: e => {
                onError?.(e);
                console.error('Failed to fetch Vector RAG:', e);
            },
        }
    );
};

export const useGraphRagQuery = <T = IGraphRag, TSelected = T[]>({
    props,
    queryKey,
    select,
    onSuccess,
    onError,
}: {
    props?: IHookProps;
    queryKey?: string;
    select?: (data: T[]) => TSelected;
    onSuccess?: (data: TSelected) => void;
    onError?: (error: any) => void;
} = {}) => {
    const params = useParams();
    const { token } = useAuth();

    return useQuery<T[], any, TSelected>(
        queryKey ?? QueryKeyType.GRAPH_RAG,
        async () => [] as T[],
        {
            enabled: !!token && resolveTriggerQuery(props?.triggerQuery),
            refetchOnWindowFocus: false,
            select,
            onSuccess,
            onError: e => {
                onError?.(e);
                console.error('Failed to fetch knowledge graph RAG:', e);
            },
        }
    );
};

export const useConnectorQuery = <T = IConnectorForm, TSelected = T[]>({
    props,
    queryKey,
    select,
    onSuccess,
    onError,
}: {
    props?: IHookProps;
    queryKey?: string;
    select?: (data: T[]) => TSelected;
    onSuccess?: (data: TSelected) => void;
    onError?: (error: any) => void;
} = {}) => {
    const params = useParams();
    const { token } = useAuth();

    return useQuery<T[], any, TSelected>(
        queryKey ?? QueryKeyType.CONNECTORS,
        async () => [] as T[],
        {
            enabled: !!token && resolveTriggerQuery(props?.triggerQuery),
            refetchOnWindowFocus: false,
            select,
            onSuccess,
            onError: e => {
                onError?.(e);
                console.error('Failed to fetch Connectors:', e);
            },
        }
    );
};

export const useExecutableFunctionQuery = <T = ExecutableFunctionAPI, TSelected = T[]>({
    props,
    queryKey,
    select,
    onSuccess,
    onError,
}: {
    props?: IHookProps;
    queryKey?: string;
    select?: (data: T[]) => TSelected;
    onSuccess?: (data: TSelected) => void;
    onError?: (error: any) => void;
} = {}) => {
    const params = useParams();
    const { token } = useAuth();

    return useQuery<T[], any, TSelected>(
        queryKey ?? QueryKeyType.EXECUTABLE_FUNCTIONS,
        async () => [] as T[],
        {
            enabled: !!token && resolveTriggerQuery(props?.triggerQuery),
            refetchOnWindowFocus: false,
            select,
            onSuccess,
            onError: e => {
                onError?.(e);
                console.error('Failed to fetch Executable Functions:', e);
            },
        }
    );
};

export const useVariableQuery = <T = IVariable, TSelected = T[]>({
    props,
    queryKey,
    select,
    onSuccess,
    onError,
}: {
    props?: IHookProps;
    queryKey?: string;
    select?: (data: T[]) => TSelected;
    onSuccess?: (data: TSelected) => void;
    onError?: (error: any) => void;
} = {}) => {
    const params = useParams();
    const { token } = useAuth();

    return useQuery<T[], any, TSelected>(
        queryKey ?? QueryKeyType.VARIABLE,
        async () => [] as T[],
        {
            enabled: !!token && resolveTriggerQuery(props?.triggerQuery),
            refetchOnWindowFocus: false,
            select,
            onSuccess,
            onError: e => {
                onError?.(e);
                console.error('Failed to fetch Variables:', e);
            },
        }
    );
};

export const useDatabaseQuery = <T = IDatabase, TSelected = T[]>({
    props,
    queryKey,
    cacheTime,
    select,
    onSuccess,
    onError,
}: {
    props?: IHookProps;
    queryKey?: string | unknown[];
    cacheTime?: number;
    select?: (data: T[]) => TSelected;
    onSuccess?: (data: TSelected) => void;
    onError?: (error: any) => void;
} = {}) => {
    const params = useParams();
    const { token } = useAuth();

    return useQuery<T[], any, TSelected>(
        queryKey ?? QueryKeyType.DATABASE,
        async () => [] as T[],
        {
            enabled: !!token && resolveTriggerQuery(props?.triggerQuery),
            refetchOnWindowFocus: false,
            cacheTime,
            select,
            onSuccess,
            onError: e => {
                onError?.(e);
                console.error('Failed to fetch Databases:', e);
            },
        }
    );
};

export const useEmbeddingModelQuery = <T = IEmbedding, TSelected = T[]>({
    props,
    queryKey,
    select,
    onSuccess,
    onError,
}: {
    props?: IHookProps;
    queryKey?: string;
    select?: (data: T[]) => TSelected;
    onSuccess?: (data: TSelected) => void;
    onError?: (error: any) => void;
} = {}) => {
    const params = useParams();
    const { token } = useAuth();

    return useQuery<T[], any, TSelected>(
        queryKey ?? QueryKeyType.EMBEDDING_MODEL,
        async () => [] as T[],
        {
            enabled: !!token && resolveTriggerQuery(props?.triggerQuery),
            refetchOnWindowFocus: false,
            select,
            onSuccess,
            onError: e => {
                onError?.(e);
                console.error('Failed to fetch Embedding Models:', e);
            },
        }
    );
};

export const useReRankingModelQuery = <T = IReRanking, TSelected = T[]>({
    props,
    queryKey,
    select,
    onSuccess,
    onError,
}: {
    props?: IHookProps;
    queryKey?: string;
    select?: (data: T[]) => TSelected;
    onSuccess?: (data: TSelected) => void;
    onError?: (error: any) => void;
} = {}) => {
    const params = useParams();
    const { token } = useAuth();

    return useQuery<T[], any, TSelected>(
        queryKey ?? QueryKeyType.RE_RANKING_MODEL,
        async () => [] as T[],
        {
            enabled: !!token && resolveTriggerQuery(props?.triggerQuery),
            refetchOnWindowFocus: false,
            select,
            onSuccess,
            onError: e => {
                onError?.(e);
                console.error('Failed to fetch Re-Ranking Models:', e);
            },
        }
    );
};

export const useAgentQuery = <T = Agent, TSelected = T[]>({
    props,
    queryKey,
    select,
    onSuccess,
    onError,
}: {
    props?: IHookProps;
    queryKey?: string;
    select?: (data: T[]) => TSelected;
    onSuccess?: (data: TSelected) => void;
    onError?: (error: any) => void;
} = {}) => {
    const params = useParams();
    const { token } = useAuth();

    return useQuery<T[], any, TSelected>(
        queryKey ?? QueryKeyType.AGENT,
        async () => [] as T[],
        {
            enabled: !!token && resolveTriggerQuery(props?.triggerQuery),
            refetchOnWindowFocus: false,
            select,
            onSuccess,
            onError: e => {
                onError?.(e);
                console.error('Failed to fetch Agents:', e);
            },
        }
    );
};

export const useMessageBrokerQuery = <T = IMessageBroker, TSelected = T[]>({
    props,
    queryKey,
    select,
    onSuccess,
    onError,
}: {
    props?: IHookProps;
    queryKey?: string;
    select?: (data: T[]) => TSelected;
    onSuccess?: (data: TSelected) => void;
    onError?: (error: any) => void;
} = {}) => {
    const params = useParams();
    const { token } = useAuth();

    return useQuery<T[], any, TSelected>(
        queryKey ?? QueryKeyType.MESSAGE_BROKER,
        async () => [] as T[],
        {
            enabled: !!token && resolveTriggerQuery(props?.triggerQuery),
            refetchOnWindowFocus: false,
            select,
            onSuccess,
            onError: e => {
                onError?.(e);
                console.error('Failed to fetch Message Brokers:', e);
            },
        }
    );
};

export const useGuardrailModelQuery = <T = IGuardrailModelConfig, TSelected = T[]>({
    props,
    queryKey,
    select,
    onSuccess,
    onError,
}: {
    props?: IHookProps;
    queryKey?: string;
    select?: (data: T[]) => TSelected;
    onSuccess?: (data: TSelected) => void;
    onError?: (error: any) => void;
} = {}) => {
    const params = useParams();
    const { token } = useAuth();

    return useQuery<T[], any, TSelected>(
        queryKey ?? QueryKeyType.GUARDRAIL_MODEL,
        async () => [] as T[],
        {
            enabled: !!token && resolveTriggerQuery(props?.triggerQuery),
            refetchOnWindowFocus: false,
            select,
            onSuccess,
            onError: e => {
                onError?.(e);
                console.error('Failed to fetch Guardrail Models:', e);
            },
        }
    );
};

export const useGuardrailQuery = <T = IGuardrailSetup, TSelected = T[]>({
    props,
    queryKey,
    select,
    onSuccess,
    onError,
}: {
    props?: IHookProps;
    queryKey?: string;
    select?: (data: T[]) => TSelected;
    onSuccess?: (data: TSelected) => void;
    onError?: (error: any) => void;
} = {}) => {
    const params = useParams();
    const { token } = useAuth();

    return useQuery<T[], any, TSelected>(
        queryKey ?? QueryKeyType.GUARDRAIL,
        async () => [] as T[],
        {
            enabled: !!token && resolveTriggerQuery(props?.triggerQuery),
            refetchOnWindowFocus: false,
            select,
            onSuccess,
            onError: e => {
                onError?.(e);
                console.error('Failed to fetch Guardrails:', e);
            },
        }
    );
};

export const useGuardrailBindingQuery = ({
    props,
    queryKey,
    workflowId,
    onSuccess,
    onError,
}: {
    props?: IHookProps;
    queryKey?: string;
    workflowId?: string;
    onSuccess?: (data: IGuardrailBinding[]) => void;
    onError?: (error: any) => void;
} = {}) => {
    const params = useParams();
    const { token } = useAuth();

    return useQuery(
        queryKey ?? QueryKeyType.GUARDRAIL_BINDING,
        async () => [] as any,
        {
            enabled: !!token && resolveTriggerQuery(props?.triggerQuery),
            refetchOnWindowFocus: false,
            onSuccess: data => onSuccess?.(data),
            onError: e => {
                onError?.(e);
                console.error('Failed to fetch Guardrail Bindings:', e);
            },
        }
    );
};
