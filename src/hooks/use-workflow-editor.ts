/* eslint-disable @typescript-eslint/no-explicit-any */

import {
    ApiToolResponseType,
    ExecutableFunctionResponseType,
} from '@/app/workspace/[wid]/agents/components/agent-form';
import { useAuth, useDnD } from '@/context';
import { CustomNodeTypes } from '@/enums';
import { IWorkflowGraphResponse } from '@/models';
import { MOCK_WORKFLOW_VISUAL_GRAPH_API_RESPONSE } from '@/mocks/workflow-builder-mock';
import { $fetch } from '@/utils';
import { Edge, Node } from '@xyflow/react';
import { redirect, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { validateLargeLanguageModel } from '@/utils/workflow-node-utils';
import {
    useApiQuery,
    useConnectorQuery,
    useExecutableFunctionQuery,
    useGraphRagQuery,
    useLLMQuery,
    useMcpQuery,
    usePromptQuery,
    useSLMQuery,
    useSTSQuery,
    useSyncPrompt,
    useVectorRagQuery,
} from './use-common';

const INITIAL_VISUAL_GRAPH = {
    nodes: [
        {
            id: 'start-node-1',
            position: { x: 50, y: 50 },
            measured: { width: 88, height: 92 },
            type: CustomNodeTypes.startNode,
            data: { label: 'Start' },
        },
    ],
    edges: [
        {
            id: 'e1-2',
            source: '1',
            target: '',
            animated: true,
            type: 'smoothstep',
        },
    ],
};

const getWorkflowById = async (workspaceId: string, workflowId: string, versionType?: string) => {
    // const url = `/workspaces/${workspaceId}/workflows/${workflowId}/visual-graph${
    //     versionType ? `?version_type=${versionType}` : ''
    // }`;
    //
    // const response = await $fetch<IWorkflowGraphResponse>(url, {
    //     method: 'GET',
    //     headers: {
    //         'x-workspace-id': workspaceId,
    //     },
    // });
    // return response.data;
    return MOCK_WORKFLOW_VISUAL_GRAPH_API_RESPONSE.data as any;
};

const agentTypesSet = new Set([
    CustomNodeTypes.agentNode,
    CustomNodeTypes.decisionNode,
    CustomNodeTypes.loaderNode,
    CustomNodeTypes.cleanerNode,
    CustomNodeTypes.wranglerNode,
    CustomNodeTypes.reportNode,
]);

const executionTypesSet = new Set([CustomNodeTypes.plannerNode, CustomNodeTypes.rePlannerNode]);

export const useWorkflowEditor = () => {
    const params = useParams();
    const { token } = useAuth();
    const { setIsVoiceWorkflow } = useDnD();
    const { syncTools } = useSyncPrompt();
    const queryClient = useQueryClient();

    const [loader, setLoader] = useState<boolean>(false);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [initialSnapshot, setInitialSnapshot] = useState<{ nodes: Node[]; edges: Edge[] } | null>(null);
    const [workflowVisual, setWorkflowVisual] = useState<IWorkflowGraphResponse | undefined>();
    const [latestNodes, setLatestNodes] = useState<Node[]>();

    const { data, isLoading, refetch, isFetching } = useQuery(
        ['workflow', params.workflow_id],
        () => getWorkflowById(params.wid as string, params.workflow_id as string),
        {
            enabled: !!token,
            refetchOnWindowFocus: false,
            onSuccess: data => {
                setWorkflowVisual(data);
                setLoader(false);
                if (data?.isDeleted) {
                    redirect(`/404`);
                }
                // Once workflow data is received, store a deep copy snapshot
                const graph = data?.visualGraphData;

                if (graph) {
                    setInitialSnapshot({
                        nodes: structuredClone(graph.nodes ?? []),
                        edges: structuredClone(graph.edges ?? []),
                    });
                } else {
                    setInitialSnapshot(INITIAL_VISUAL_GRAPH);
                }
                const hasVoiceNode = data?.visualGraphData?.nodes?.some(
                    (node: Node) => node.type === 'voice_agent_node' || node.data?.type === 'voice_agent_node'
                );
                setIsVoiceWorkflow(!!hasVoiceNode);
            },
            onError: () => {
                setWorkflowVisual(undefined);
                console.error('Failed to fetch workflow data');
            },
        }
    );

    const {
        data: allPrompts,
        isFetching: fetchingPrompts,
        isLoading: promptsLoading,
        refetch: refetchPrompts,
    } = usePromptQuery({ queryKey: 'prompts' });

    const {
        data: allModels,
        isFetching: fetchingModels,
        isLoading: llmModelsLoading,
        refetch: refetchLLM,
    } = useLLMQuery({ queryKey: 'llmModels' });

    const {
        data: allSLMModels,
        isFetching: fetchingSLMModels,
        isLoading: slmModelsLoading,
        refetch: refetchSLM,
    } = useSLMQuery();

    const {
        data: allSTSModels,
        isFetching: fetchingSTSModels,
        isLoading: stsModelsLoading,
        refetch: refetchSTS,
    } = useSTSQuery({ queryKey: 'stsModels' });

    const {
        data: allApiTools,
        isFetching: fetchingApiTools,
        isLoading: apiLoading,
        refetch: refetchApiTools,
    } = useApiQuery<ApiToolResponseType>({ queryKey: 'apiTools' });

    const { data: allMcpTools, isFetching: fetchingMcp, isLoading: mcpLoading, refetch: refetchMcp } = useMcpQuery();

    const {
        data: allGraphRag,
        isFetching: fetchingGraphRag,
        isLoading: graphRagLoading,
        refetch: refetchGraphRag,
    } = useGraphRagQuery({ queryKey: 'graph-rag' });

    const {
        data: allVectorRags,
        isFetching: vectorRagLoading,
        isLoading: ragLoading,
        refetch: refetchVectorRag,
    } = useVectorRagQuery({ queryKey: 'vector-rag' });

    const {
        data: allConnectors,
        isFetching: fetchingConnectors,
        isLoading: connectorsLoading,
        refetch: refetchConnectors,
    } = useConnectorQuery();

    const {
        data: allExecutableFunctions,
        isLoading: executableFunctionsLoading,
        refetch: refetchExecutableFunctions,
    } = useExecutableFunctionQuery<ExecutableFunctionResponseType>({ queryKey: 'executableFunctions' });

    useEffect(() => {
        if (
            !promptsLoading &&
            !isLoading &&
            !llmModelsLoading &&
            !slmModelsLoading &&
            !stsModelsLoading &&
            !apiLoading &&
            !mcpLoading &&
            !graphRagLoading &&
            !ragLoading &&
            !connectorsLoading &&
            !executableFunctionsLoading
        ) {
            updateNodeData();
        }
    }, [
        isLoading,
        promptsLoading,
        llmModelsLoading,
        slmModelsLoading,
        stsModelsLoading,
        apiLoading,
        mcpLoading,
        graphRagLoading,
        ragLoading,
        connectorsLoading,
        executableFunctionsLoading,
    ]);

    const refetchWorkflow = async (versionType?: string) => {
        const data = await getWorkflowById(params.wid as string, params.workflow_id as string, versionType);
        //Update cached query data so UI auto-refreshes
        queryClient.setQueryData(['workflow', params.workflow_id], data);
        return data;
    };

    const updateVisualGraphData = (updatedNodes: Node[]) => {
        setWorkflowVisual(prev => {
            if (!prev) return prev;

            return {
                ...prev,
                visualGraphData: {
                    ...prev.visualGraphData,
                    nodes: updatedNodes,
                },
            };
        });
        onClear();
    };

    const deepClone = <T>(value: T): T => {
        return structuredClone(value);
    };

    const updatePromptInNode = (node: Node) => {
        const _data = node.data as any;
        if (_data?.prompt) {
            const result = validatePrompt(_data?.prompt);
            if (result) {
                node.data.prompt = result;
            } else if (result === undefined) {
                node.data.prompt = undefined;
            }
        }
    };

    const updateLargeLanguageInNode = (node: Node) => {
        const _data = node.data as any;
        if (_data?.languageModal) {
            const result = validateLargeLanguage(_data?.languageModal);
            if (result) {
                node.data.languageModal = result;
            } else if (result === undefined) {
                node.data.languageModal = undefined;
            }
        }
    };

    const processAgentNode = async (node: Node) => {
        updatePromptInNode(node);
        updateLargeLanguageInNode(node);
        const _data = node.data as any;

        if (_data?.apis) {
            node.data.apis = validateBasicTemplate(_data?.apis, allApiTools);
        }
        if (_data?.mcpServers) {
            node.data.mcpServers = validateEntireTemplate(_data?.mcpServers, allMcpTools);
        }
        if (_data?.knowledgeGraphs) {
            node.data.knowledgeGraphs = validateEntireTemplate(_data?.knowledgeGraphs, allGraphRag);
        }
        if (_data?.rags) {
            node.data.rags = validateEntireTemplate(_data?.rags, allVectorRags);
        }
        if (_data?.connectors) {
            node.data.connectors = validateEntireTemplate(_data?.connectors, allConnectors);
        }
        if (_data?.executableFunctions) {
            node.data.executableFunctions = validateBasicTemplate(_data?.executableFunctions, allExecutableFunctions);
        }

        const _prompt = node.data.prompt as any;

        const result = await syncTools({
            prompt: _prompt?.configurations?.prompt_template as string | undefined,
            allApiTools,
            apis: node.data.apis as any[],
            allMcpTools,
            mcpServers: node.data.mcpServers as any[],
            allVectorRags,
            vectorRags: node.data.rags as any[],
            allGraphRag,
            graphRags: node.data.knowledgeGraphs as any[],
            allConnectors,
            connectors: node.data.connectors as any[],
            allExecutableFunctions,
            executableFunctions: node.data.executableFunctions as any[],
        });

        if (result) {
            node.data.apis = result.apis?.map(api => ({
                id: api.id,
                name: api.name,
                description: api.description,
            }));
            node.data.mcpServers = result.mcps;
            node.data.rags = result.vectorRags;
            node.data.knowledgeGraphs = result.graphRags;
            node.data.connectors = result.connectors;
            if (result.executableFunctions) {
                node.data.executableFunctions = result.executableFunctions.map((ef: any) => ({
                    id: ef.id,
                    name: ef.name,
                    description: ef.description,
                }));
            }
        }
    };

    const processExecutionNode = (node: Node) => {
        updatePromptInNode(node);
        updateLargeLanguageInNode(node);
    };

    const processVoiceNode = async (node: Node) => {
        updatePromptInNode(node);
        const _data = node.data as any;
        if (_data?.voiceConfig?.voiceModel) {
            const result = validateLargeLanguage(_data?.voiceConfig?.voiceModel, true);
            if (result && node.data.voiceConfig) {
                node.data.voiceConfig = { ...node.data.voiceConfig, voiceModel: result };
            } else if (result === undefined && node.data.voiceConfig) {
                node.data.voiceConfig = { ...node.data.voiceConfig, voiceModel: undefined };
            }
        }
        if (_data?.apis) {
            node.data.apis = validateBasicTemplate(_data?.apis, allApiTools);
        }

        const _prompt = node.data.prompt as any;

        const result = await syncTools({
            prompt: _prompt?.configurations?.prompt_template as string | undefined,
            allApiTools,
            apis: node.data.apis as any[],
            allMcpTools: undefined,
            mcpServers: [],
            allVectorRags: undefined,
            vectorRags: [],
            allGraphRag: undefined,
            graphRags: [],
            allConnectors: undefined,
            connectors: undefined,
            allExecutableFunctions,
            executableFunctions: node.data.executableFunctions as any[],
        });

        if (result) {
            node.data.apis = result.apis?.map(api => ({
                id: api.id,
                name: api.name,
                description: api.description,
            }));
            if (result.executableFunctions) {
                node.data.executableFunctions = result.executableFunctions.map((ef: any) => ({
                    id: ef.id,
                    name: ef.name,
                    description: ef.description,
                }));
            }
        }
    };

    const updateNodeData = () => {
        const _nodes: Node[] = deepClone(data?.visualGraphData?.nodes ?? []);

        if (_nodes && _nodes.length > 0) {
            _nodes.forEach(async (node: Node) => {
                if ([CustomNodeTypes.startNode, CustomNodeTypes.endNode].includes(node?.type as CustomNodeTypes)) {
                    return;
                }

                const type = node.type as CustomNodeTypes;

                if (agentTypesSet.has(type)) {
                    await processAgentNode(node);
                } else if (executionTypesSet.has(type)) {
                    processExecutionNode(node);
                } else if (type === CustomNodeTypes.voiceNode) {
                    await processVoiceNode(node);
                }
            });

            /*Previously, there was a requirement to handle duplicate names when copying a workflow. When that occurred, we needed a way to update the visual graph since it continued to display the old names. 
            That is why we proposed this solution. However, the requirement has recently changed. Copying a workflow no longer creates new sub-entities instead, the copied workflow is linked directly to the same entities as the original workflow.
            Therefore, updating names is no longer necessary. instead of removing this code I have commented this functionality for future use.
            const isEquals = areObjectsEqual(data?.visualGraphData?.nodes, _nodes);
            if (!isEquals) {
                setOpenModal(true);
                setLatestNodes(_nodes);
            }*/
        }
    };

    const onUpdate = () => {
        updateVisualGraphData(latestNodes as Node[]);
    };

    const onClear = () => {
        setOpenModal(false);
        setLatestNodes(undefined);
    };

    const validatePrompt = (currentData: any) => {
        const result = allPrompts?.find(prompt => prompt.id === currentData?.id);
        if (
            result &&
            (currentData?.name !== result?.name ||
                currentData?.description !== result?.description ||
                currentData?.configurations?.prompt_template !== result?.configurations?.prompt_template)
        ) {
            return {
                id: result?.id,
                name: result?.name,
                description: result?.description,
                configurations: result?.configurations,
            };
        } else if (!result) {
            return undefined;
        }
        return false;
    };

    const validateLargeLanguage = (currentData: any, isSTS = false) => {
        return validateLargeLanguageModel(
            currentData,
            isSTS,
            allModels as any,
            allSLMModels as any,
            allSTSModels as any
        );
    };

    const validateBasicTemplate = (currentData: any[], allData: any[] | undefined) => {
        const ids = currentData?.map(api => api.id);
        const result = allData?.filter(api => ids?.includes(api.id));
        return result?.map(api => ({
            id: api.id,
            name: api.name,
            description: api.description,
        }));
    };

    const validateEntireTemplate = (currentData: any[], allData: any[] | undefined) => {
        const ids = currentData?.map(mcp => mcp.id);
        const result = allData?.filter(mcp => ids?.includes(mcp.id));
        return result;
    };

    return {
        data: workflowVisual,
        allPrompts,
        allModels,
        allSLMModels,
        allSTSModels,
        allApiTools,
        allMcpTools,
        allGraphRag,
        allVectorRags,
        allConnectors,
        allExecutableFunctions,
        isFetching,
        fetchingPrompts,
        fetchingModels,
        fetchingSLMModels,
        fetchingSTSModels,
        fetchingApiTools,
        fetchingMcp,
        fetchingGraphRag,
        fetchingConnectors,
        promptsLoading,
        llmModelsLoading,
        slmModelsLoading,
        stsModelsLoading,
        apiLoading,
        mcpLoading,
        vectorRagLoading,
        executableFunctionsLoading,
        isLoading,
        loader,
        initialSnapshot,
        openModal,
        setOpenModal,
        setLoader,
        onUpdate,
        onClear,
        refetch,
        refetchPrompts,
        refetchLLM,
        refetchSLM,
        refetchSTS,
        refetchApiTools,
        refetchMcp,
        refetchGraphRag,
        refetchVectorRag,
        refetchConnectors,
        refetchExecutableFunctions,
        refetchWorkflow,
    };
};
