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
import { logger } from '@/utils';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from 'react-query';
import { toast } from 'sonner';
import { IMCPBody } from './use-mcp-configuration';

const MOCK_LLM_PROVIDERS = [
    {
        id: 'openai',
        value: 'openai',
        name: 'OpenAI',
        logo: { dark: '', light: '' },
        models: [
            { id: 'gpt-4o', value: 'gpt-4o', description: 'GPT-4o' },
            { id: 'gpt-4-turbo', value: 'gpt-4-turbo', description: 'GPT-4 Turbo' },
            { id: 'gpt-3.5-turbo', value: 'gpt-3.5-turbo', description: 'GPT-3.5 Turbo' },
        ],
    },
    {
        id: 'anthropic',
        value: 'anthropic',
        name: 'Anthropic',
        logo: { dark: '', light: '' },
        models: [
            { id: 'claude-3-5-sonnet-20240620', value: 'claude-3-5-sonnet-20240620', description: 'Claude 3.5 Sonnet' },
            { id: 'claude-3-opus-20240229', value: 'claude-3-opus-20240229', description: 'Claude 3 Opus' },
        ],
    },
    {
        id: 'google',
        value: 'google',
        name: 'Google',
        logo: { dark: '', light: '' },
        models: [
            { id: 'gemini-1.5-pro', value: 'gemini-1.5-pro', description: 'Gemini 1.5 Pro' },
            { id: 'gemini-1.5-flash', value: 'gemini-1.5-flash', description: 'Gemini 1.5 Flash' },
        ],
    },
];

const MOCK_LLM_CONFIGS: ILLMForm[] = [
    {
        id: 'mock-llm-1',
        name: 'Default OpenAI',
        provider: 'openai',
        modelName: 'gpt-4o',
        apiKeyReference: 'vault:openai-api-key',
        configurations: {
            description: 'Mock OpenAI Configuration',
            apiAuthorization: 'Bearer sk-...',
            maxTokens: 4096,
            temperature: 0.7,
            baseUrl: 'https://api.openai.com/v1',
            customerHeaders: [],
            providerConfig: {
                id: 'openai',
                value: 'openai',
                description: 'OpenAI',
                logo: {},
            },
        },
    },
];

const MOCK_VAULT_DATA: IVault[] = [
    {
        id: 'mock-vault-1',
        keyName: 'openai-api-key',
        description: 'OpenAI API Key for demonstrations',
        keyValue: 'sk-mock-key-12345',
        isActive: true,
        isReadOnly: false,
    },
    {
        id: 'mock-vault-2',
        keyName: 'anthropic-api-key',
        description: 'Anthropic API Key for demonstrations',
        keyValue: 'sk-ant-mock-key-67890',
        isActive: true,
        isReadOnly: false,
    },
];

const MOCK_SLM_PROVIDERS = [
    {
        id: 'phi-3',
        value: 'phi-3',
        name: 'Microsoft Phi-3',
        logo: { dark: '', light: '' },
        models: [
            { id: 'phi-3-mini', value: 'phi-3-mini', description: 'Phi-3 Mini' },
            { id: 'phi-3-medium', value: 'phi-3-medium', description: 'Phi-3 Medium' },
        ],
    },
];

const MOCK_SLM_CONFIGS: ISLMForm[] = [
    {
        id: 'mock-slm-1',
        name: 'Default Phi-3',
        provider: 'phi-3',
        modelName: 'phi-3-mini',
        configurations: {
            description: 'Mock Phi-3 Configuration',
            temperature: 0.5,
            baseUrl: 'http://localhost:11434',
            apiAuthorization: '',
            customRuntime: false,
            tokenLimit: null as unknown as number,
            providerConfig: {
                id: 'phi-3',
                value: 'phi-3',
                description: 'Microsoft Phi-3',
                logo: {},
            },
        },
    },
];

const MOCK_STS_PROVIDERS = [
    {
        id: 'openai-sts',
        value: 'openai',
        name: 'OpenAI TTS/STT',
        logo: { dark: '', light: '' },
        models: [
            { id: 'tts-1', value: 'tts-1', description: 'OpenAI TTS-1' },
            { id: 'whisper-1', value: 'whisper-1', description: 'OpenAI Whisper-1' },
        ],
    },
];

const MOCK_STS_CONFIGS: ISTSForm[] = [
    {
        id: 'mock-sts-1',
        name: 'Default OpenAI STS',
        provider: 'openai',
        modelName: 'tts-1',
        description: 'Mock OpenAI Speech configuration',
        configurations: {
            tone: 'neutral',
            voice: 'alloy',
            language: 'en',
            temperature: 0.7,
            providerConfig: {
                id: 'openai-sts',
                value: 'openai',
                description: 'OpenAI TTS/STT',
                logo: {},
            },
        },
    },
];

const MOCK_EMBEDDING_PROVIDERS = [
    {
        id: 'openai-embedding',
        value: 'openai',
        name: 'OpenAI Embedding',
        logo: { dark: '', light: '' },
        models: [
            { id: 'text-embedding-3-small', value: 'text-embedding-3-small', description: 'Text Embedding 3 Small' },
            { id: 'text-embedding-3-large', value: 'text-embedding-3-large', description: 'Text Embedding 3 Large' },
            { id: 'text-embedding-ada-002', value: 'text-embedding-ada-002', description: 'Text Embedding Ada 002' },
        ],
    },
];

const MOCK_EMBEDDING_CONFIGS: IEmbedding[] = [
    {
        id: 'mock-embedding-1',
        name: 'Default OpenAI Embedding',
        description: 'Mock OpenAI Embedding Configuration',
        provider: 'openai',
        modelName: 'text-embedding-3-small',
        configurations: {
            apiKey: 'sk-mock-key-123',
            dimensions: 1536,
            baseURL: 'https://api.openai.com/v1',
        },
    },
];

const MOCK_RERANKING_PROVIDERS = [
    {
        id: 'cohere-rerank',
        value: 'cohere',
        name: 'Cohere Rerank',
        logo: { dark: '', light: '' },
        models: [
            { id: 'rerank-english-v3.0', value: 'rerank-english-v3.0', description: 'Rerank English v3.0' },
            { id: 'rerank-multilingual-v3.0', value: 'rerank-multilingual-v3.0', description: 'Rerank Multilingual v3.0' },
        ],
    },
    {
        id: 'jina-rerank',
        value: 'jina',
        name: 'Jina AI Rerank',
        logo: { dark: '', light: '' },
        models: [
            { id: 'jina-reranker-v2-base-multilingual', value: 'jina-reranker-v2-base-multilingual', description: 'Jina Reranker v2 Base Multilingual' },
        ],
    },
];

const MOCK_RERANKING_CONFIGS: IReRanking[] = [
    {
        id: 'mock-reranking-1',
        name: 'Default Cohere Rerank',
        description: 'Mock Cohere Reranking Configuration',
        provider: 'cohere',
        modelName: 'rerank-english-v3.0',
        configurations: {
            apiKey: 'sk-mock-key-abc',
            baseURL: 'https://api.cohere.ai/v1',
        },
    },
];

export const useIntellisense = () => {
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
    const { setTriggerGuardrailBinding } = useApp();
    const guardrailRef = useRef<GuardrailSelectorRef>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [guardrails, setGuardrails] = useState<IGuardrailSetup[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem('mock_guardrails');
        if (stored) {
            try {
                setGuardrails(JSON.parse(stored));
            } catch {
                setGuardrails([]);
            }
        }
    }, []);

    const guardrailsLoading = false;

    const onGuardrail = () => {
        if (guardrailRef?.current) {
            setLoading(true);
            guardrailRef.current.onOpen();
            // In mock mode, we just load from localStorage
            const stored = localStorage.getItem('mock_guardrails');
            if (stored) setGuardrails(JSON.parse(stored));
            setLoading(false);
        }
    };

    const onRefetch = () => {
        const stored = localStorage.getItem('mock_guardrails');
        if (stored) setGuardrails(JSON.parse(stored));
    };

    const mutateWorkspaceUpdate = async ({ data }: { data: IGuardrailBindingRequest }) => {
        logger.log('Mock workspace guardrail association:', data);
        toast.success('Workspace guardrails associated successfully (Mock)');
        return { data: {} };
    };

    const mutateWorkflowUpdate = async ({ data }: { data: IGuardrailBindingRequest }) => {
        logger.log('Mock workflow guardrail association:', data);
        toast.success('Workflow guardrails associated successfully (Mock)');
        return { data: {} };
    };


    const onWorkspaceGuardrailsChange = async (items: string[] | undefined) => {
        await mutateWorkspaceUpdate({ data: { guardrailIds: items ?? [] } });
        setTriggerGuardrailBinding(prev => (prev ?? 0) + 1);
    };

    const onWorkflowGuardrailsChange = async (items: string[] | undefined) => {
        await mutateWorkflowUpdate({ data: { workflowId: '', guardrailIds: items ?? [] } });
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
    return useQuery<IPlatformConfiguration, any, TSelected>(
        queryKey ?? QueryKeyType.PLATFORM_CONFIG,
        async () => {
            return {
                llmProviders: JSON.stringify(MOCK_LLM_PROVIDERS),
                slmProviders: JSON.stringify(MOCK_SLM_PROVIDERS),
                speechToSpeechModelProviders: JSON.stringify(MOCK_STS_PROVIDERS),
                embeddingModelProviders: JSON.stringify(MOCK_EMBEDDING_PROVIDERS),
                rerankingModelProviders: JSON.stringify(MOCK_RERANKING_PROVIDERS),
            } as IPlatformConfiguration;
        },
        {
            enabled: resolveTriggerQuery(props?.triggerQuery),
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
    return useQuery(
        queryKey ?? QueryKeyType.VAULT,
        async () => {
            const stored = localStorage.getItem('mock_vault_data');
            if (stored) {
                try {
                    return JSON.parse(stored);
                } catch {
                    return MOCK_VAULT_DATA;
                }
            }
            localStorage.setItem('mock_vault_data', JSON.stringify(MOCK_VAULT_DATA));
            return MOCK_VAULT_DATA;
        },
        {
            enabled: resolveTriggerQuery(props?.triggerQuery),
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

    return useQuery<T[], any, TSelected>(
        queryKey ?? QueryKeyType.LLM,
        async () => {
            const stored = localStorage.getItem('mock_llm_configs');
            if (stored) {
                try {
                    return JSON.parse(stored);
                } catch {
                    return MOCK_LLM_CONFIGS;
                }
            }
            localStorage.setItem('mock_llm_configs', JSON.stringify(MOCK_LLM_CONFIGS));
            return MOCK_LLM_CONFIGS as unknown as T[];
        },
        {
            enabled: resolveTriggerQuery(props?.triggerQuery),
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
    return useQuery<T[], any, TSelected>(
        queryKey ?? QueryKeyType.SLM,
        async () => {
            const stored = localStorage.getItem('mock_slm_configs');
            if (stored) {
                try {
                    return JSON.parse(stored);
                } catch {
                    return MOCK_SLM_CONFIGS;
                }
            }
            localStorage.setItem('mock_slm_configs', JSON.stringify(MOCK_SLM_CONFIGS));
            return MOCK_SLM_CONFIGS as unknown as T[];
        },
        {
            enabled: resolveTriggerQuery(props?.triggerQuery),
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
    return useQuery<T[], any, TSelected>(
        queryKey ?? QueryKeyType.STS,
        async () => {
            const stored = localStorage.getItem('mock_sts_configs');
            if (stored) {
                try {
                    return JSON.parse(stored);
                } catch {
                    return MOCK_STS_CONFIGS;
                }
            }
            localStorage.setItem('mock_sts_configs', JSON.stringify(MOCK_STS_CONFIGS));
            return MOCK_STS_CONFIGS as unknown as T[];
        },
        {
            enabled: resolveTriggerQuery(props?.triggerQuery),
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
    return useQuery<T[], any, TSelected>(
        queryKey ?? QueryKeyType.EMBEDDING_MODEL,
        async () => {
            const stored = localStorage.getItem('mock_embedding_configs');
            if (stored) {
                try {
                    return JSON.parse(stored);
                } catch {
                    return MOCK_EMBEDDING_CONFIGS;
                }
            }
            localStorage.setItem('mock_embedding_configs', JSON.stringify(MOCK_EMBEDDING_CONFIGS));
            return MOCK_EMBEDDING_CONFIGS as unknown as T[];
        },
        {
            enabled: resolveTriggerQuery(props?.triggerQuery),
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
    return useQuery<T[], any, TSelected>(
        queryKey ?? QueryKeyType.RE_RANKING_MODEL,
        async () => {
            const stored = localStorage.getItem('mock_reranking_configs');
            if (stored) {
                try {
                    return JSON.parse(stored);
                } catch {
                    return MOCK_RERANKING_CONFIGS;
                }
            }
            localStorage.setItem('mock_reranking_configs', JSON.stringify(MOCK_RERANKING_CONFIGS));
            return MOCK_RERANKING_CONFIGS as unknown as T[];
        },
        {
            enabled: resolveTriggerQuery(props?.triggerQuery),
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
    const { token } = useAuth();

    return useQuery<T[], any, TSelected>(
        queryKey ?? QueryKeyType.GUARDRAIL_MODEL,
        async () => {
            const stored = localStorage.getItem('mock_guardrail_models');
            return (stored ? JSON.parse(stored) : []) as T[];
        },
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
    const { token } = useAuth();

    return useQuery<T[], any, TSelected>(
        queryKey ?? QueryKeyType.GUARDRAIL,
        async () => {
            const stored = localStorage.getItem('mock_guardrails');
            return (stored ? JSON.parse(stored) : []) as T[];
        },
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
    onSuccess,
    onError,
}: {
    props?: IHookProps;
    queryKey?: string;
    onSuccess?: (data: IGuardrailBinding[]) => void;
    onError?: (error: any) => void;
} = {}) => {
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
