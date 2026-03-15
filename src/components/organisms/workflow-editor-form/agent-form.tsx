/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { GuardrailSelector } from '@/app/editor/[wid]/[workflow_id]/components/guardrail-selector';
import { GraphRagSelectorRef } from '@/app/editor/[wid]/[workflow_id]/components/graph-rag-selector';
import { LanguageSelector } from '@/app/editor/[wid]/[workflow_id]/components/language-selector';
import { PanelSection } from '@/app/editor/[wid]/[workflow_id]/components/panel-section';
import { PromptSelector, PromptSelectorRef } from '@/app/editor/[wid]/[workflow_id]/components/prompt-selector';
import { VectorRagSelectorRef } from '@/app/editor/[wid]/[workflow_id]/components/vector-rag-selector';
import { ReusableAgentSelector } from '@/app/editor/[wid]/[workflow_id]/components/reusable-agent-selector';
import SelfLearning from '@/app/editor/[wid]/[workflow_id]/components/self-learning';
import {
    IMessageBrokerSelector,
    IExecutableFunctionCredential,
    IAgent,
    IAuthorization,
    IConnectorForm,
    IHeaderValues,
    IGraphRag,
    IVectorRag,
    ISelfLearning,
    IWorkflowGraphResponse,
    INodeHumanInput,
    IMessagePublisher,
} from '@/models';
import { McpConfigurationData } from '@/app/workspace/[wid]/mcp-configurations/components/mcp-configuration-table-container';
import {
    Button,
    Checkbox,
    Input,
    Textarea,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/atoms';
import { useDnD } from '@/context';
import { IMCPBody } from '@/hooks/use-mcp-configuration';
import { cn } from '@/lib/utils';
import { FetchError, logger } from '@/utils';
import { Node, useReactFlow } from '@xyflow/react';
import { useParams } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation } from 'react-query';
import { toast } from 'sonner';
import { useConnector } from '@/hooks/use-connector';
import { CustomNodeTypes, GuardrailBindingLevelType } from '@/enums';
import { StructuredOutputCreator } from '@/app/editor/[wid]/[workflow_id]/components/structure-output-creator';
import MessagePublisher from '@/app/editor/[wid]/[workflow_id]/components/end-node/message-publisher';
import HumanInput from '@/app/editor/[wid]/[workflow_id]/components/human-input';
import { InputDataConnectContainer } from '@/app/editor/[wid]/[workflow_id]/components/input-data-connect/input-data-connect-container';
import { SelectedInputConnects } from '@/app/editor/[wid]/[workflow_id]/components/input-data-connect/selected-input-connects';
import { useApp } from '@/context/app-context';
import { EditorPanelAgentProps } from '@/app/editor/[wid]/[workflow_id]/components/editor-panel';
import { agentService } from '@/services';
import { useGuardrailQuery, useMessageBrokerQuery, useSyncPrompt } from '@/hooks/use-common';

export type Prompt = {
    id: string;
    name: string;
    description: string;
    configurations: { prompt_template: string };
};

export type IntelligenceSourceModel = {
    id: string;
    provider: string;
    modelName: string;
    modelId: string;
    modelDescription: string;
    providerLogo: string;
    modelUniqueId: string;
};

export type API = {
    id: string;
    name: string;
    description: string;
};

export type ExecutableFunction = {
    id: string;
    name: string;
    description: string;
};

export type Model = {
    id: string;
    name: string;
    description: string;
};

export type HumanInputType = {
    isHumanInput: boolean;
    instructions: string;
};

export type StructuredOutputType = {
    enabled: boolean;
    data: { name: string; value: string; dataType: string }[];
};

export type AgentType = {
    id: string;
    name: string;
    description: string;
    prompt: { id: string; name: string; description: string; configurations: { prompt_template: string } };
    languageModal: {
        id: string;
        provider: string;
        modelName: string;
        modelDescription: string;
        modelId: string;
        providerLogo: string;
    };
    humanInput?: INodeHumanInput;
    apis: { id: string; name: string; description: string }[];
    guardrails?: string[];
    mcpServers?: McpConfigurationData[];
    executableFunctions?: ExecutableFunction[];
    selfLearning?: ISelfLearning;
    saveAsReusableAgent: boolean;
    isReusableAgentSelected: boolean;
    isSlm: boolean;
    rags?: IVectorRag[];
    knowledgeGraphs?: IGraphRag[];
    connectors?: IConnectorForm[];
    guardrailsApis?: { id: string; name: string; description: string }[];
    guardrailsModels?: { id: string; name: string; description: string }[];
    outputBroadcasting?: IMessageBrokerSelector;
    structuredOutput?: StructuredOutputType;
    customAttributes?: string;
    enableCustomAttributes?: boolean;
    publisherIntegration?: IMessagePublisher;
};

interface AgentFormProps extends EditorPanelAgentProps {
    selectedNode: Node;
    isReadOnly?: boolean;
    workflow?: IWorkflowGraphResponse;
    onIntellisenseRefetch: () => Promise<void>;
    data?: AgentType | null;
}

type PromptResponse = {
    id: string;
    name: string;
    description: string;
    configurations: { prompt_template: string };
};

type ApiToolResponseType = {
    id: string;
    toolId: string;
    name: string;
    description: string;
    isReadOnly?: boolean;
    configurations: {
        url: string;
        method: string;
        headers: IHeaderValues[];
        payload: string;
        authorization: IAuthorization;
        promotedVariables: string;
        defaultApiParameters: string;
    };
};

type ExecutableFunctionResponseType = {
    id: string;
    toolId: string;
    name: string;
    description: string;
    configurations: {
        provider: string;
        region: string;
        startupOption: string;
        credentials: IExecutableFunctionCredential;
        language: string;
        code: string;
        payload: IHeaderValues[];
    };
    isReadOnly?: boolean;
};

export type IConfiguration = {
    url: string;
    transport: string;
    timeout?: number;
    retryCount?: number;
    authorization: IAuthorization;
};

export type McpToolResponseType = {
    id: string;
    name: string;
    toolId: string;
    isReadOnly?: boolean;
    description: string;
    configurations: IConfiguration;
};

type ReusableAgentPayloadType = {
    name: string;
    description: string;
    type: string;
    configurations: {
        humanInput: INodeHumanInput;
        structuredOutput?: StructuredOutputType;
        customAttributes?: string;
        enableCustomAttributes?: boolean;
        selfLearning?: ISelfLearning;
        mcpServers?: any;
        knowledgeGraphs?: any;
        rags?: any;
        publisherIntegration?: any;
        guardrails?: any;
        connectors?: any;
    };
    llmId?: string;
    slmId?: string;
    promptTemplateId: string;
    tools: { id: string; type: string }[];
};

export const AgentForm = ({
    selectedNode,
    isReadOnly,
    workflow,
    allPrompts,
    allModels,
    allSLMModels,
    allApiTools,
    allMcpTools,
    allGraphRag,
    allVectorRags,
    allConnectors,
    allExecutableFunctions,
    fetchingPrompts,
    fetchingModels,
    fetchingSLMModels,
    fetchingApiTools,
    fetchingMcp,
    fetchingGraphRag,
    fetchingConnectors,
    promptsLoading,
    llmModelsLoading,
    slmModelsLoading,
    apiLoading,
    mcpLoading,
    vectorRagLoading,
    executableFunctionsLoading,
    data,
    onIntellisenseRefetch,
    refetchPrompts,
    refetchLLM,
    refetchSLM,
    refetchApiTools,
    refetchMcp,
    refetchGraphRag,
    refetchVectorRag,
    refetchConnectors,
    refetchExecutableFunctions,
}: AgentFormProps) => {
    const { guardrailBinding } = useApp();
    const promptRef = useRef<PromptSelectorRef>(null);
    const vectorRef = useRef<VectorRagSelectorRef>(null);
    const graphRef = useRef<GraphRagSelectorRef>(null);
    const [agent, setAgent] = useState<AgentType>();
    const [agentName, setAgentName] = useState<string>();
    const [description, setDescription] = useState<string>();
    const [isSlm, setSlm] = useState<boolean>(false);
    const [prompt, setPrompt] = useState<Prompt>();
    const [languageModel, setLanguageModel] = useState<IntelligenceSourceModel>();
    const [humanInput, setHumanInput] = useState<INodeHumanInput>();
    const [apis, setApis] = useState<API[]>();
    const [guardrails, setGuardrails] = useState<string[] | undefined>();
    const [mcpServers, setMcpServers] = useState<IMCPBody[]>([]);
    const [vectorRags, setVectorRags] = useState<IVectorRag[]>([]);
    const [graphRags, setGraphRags] = useState<IGraphRag[]>([]);
    const [executableFunctions, setExecutableFunctions] = useState<ExecutableFunction[]>();
    const [selfLearning, setSelfLearning] = useState<ISelfLearning | undefined>();
    const [outputBroadcasting, setOutputBroadcasting] = useState<IMessagePublisher>();
    const [saveAsReusableAgent, setSaveAsReusableAgent] = useState(false);
    const [enableCustomAttributes, setEnableCustomAttributes] = useState(false);
    const [customAttributes, setCustomAttributes] = useState<string>('');
    const [selectedConnector, setSelectedConnector] = useState<IConnectorForm[] | undefined>();
    const [structuredOutput, setStructuredOutput] = useState<StructuredOutputType>({ enabled: false, data: [] });

    const params = useParams();
    const { trigger, setSelectedNodeId, setTrigger, setGuardrailStore } = useDnD();
    const { syncTools } = useSyncPrompt();

    const { onRefetchConnector } = useConnector();

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
    } = useGuardrailQuery({
        onSuccess: data => {
            setGuardrailStore(data);
        },
        onError: () => {
            setGuardrailStore([]);
        },
    });

    useEffect(() => {
        if (agent && allSLMModels && agent?.languageModal?.modelId) {
            setSlm(allSLMModels.some(slm => slm.id === agent.languageModal.modelId));
        }
    }, [agent, allSLMModels]);

    // Auto-select MCP if prompt contains @MCP.mcpname_tool_name
    useEffect(() => {
        if (!prompt || !allMcpTools) return;
        const promptText = prompt.configurations?.prompt_template ?? '';
        // Regex to match @MCP.mcpname_tool_name
        const mcpMatches = [...promptText.matchAll(/@MCP\.(\w+)/g)];
        if (mcpMatches.length === 0) return;
        // Find all unique MCP names referenced
        const mcpNames = Array.from(new Set(mcpMatches.map(match => match[1])));
        // Find matching MCP tools (by name or toolId)
        const matchingMcps = allMcpTools.filter(tool =>
            mcpNames.some(
                name => tool.name === name || tool.toolId === name || tool.name?.replaceAll(/\s+/g, '_') === name
            )
        );
        if (matchingMcps.length > 0) {
            // Optionally merge with existing MCPs if you want multi-select, or replace
            setMcpServers(matchingMcps);
        }
    }, [prompt, allMcpTools]);

    const { mutateAsync: mutateCreate } = useMutation(
        (data: ReusableAgentPayloadType) => agentService.create<ReusableAgentPayloadType>(data, params.wid as string),
        {
            onSuccess: () => {
                toast.success('Agent updated & successfully saved as a reusable agent');
            },
            onError: (error: FetchError) => {
                if (error.status === 400) {
                    const errorMessage = error?.message + '\n' + (error?.errors ? error?.errors?.join('\n') : '');
                    const results = errorMessage
                        .split('\n')
                        .map((item, index) => <div key={`error-line-${index}-${item}`}>{item}</div>);
                    toast.error(results);
                } else {
                    toast.error(error?.message);
                }
                logger.error('Error creating agent:', error?.message);
            },
        }
    );

    const getFilteredGuardrails = React.useCallback(
        (data: string[] | undefined) => {
            if (guardrailBinding && guardrailBinding?.length > 0 && data && data?.length > 0) {
                const results = guardrailBinding?.map(x => x.guardrailId);
                const filteredIds = data.filter(id => !results.includes(id));
                return filteredIds?.length > 0 ? filteredIds : undefined;
            } else {
                return data;
            }
        },
        [guardrailBinding]
    );

    useEffect(() => {
        const results = getFilteredGuardrails(guardrails);
        setGuardrails(results);
    }, [guardrailBinding, getFilteredGuardrails, guardrails]);

    const { updateNodeData } = useReactFlow();

    const mapPrompt = React.useCallback(
        (p: any) =>
            p === undefined
                ? undefined
                : {
                      id: p.id,
                      name: p.name,
                      description: p.description,
                      configurations: p.configurations,
                  },
        []
    );

    const mapLanguageModal = React.useCallback(
        (lm: any, slm: boolean) =>
            lm === undefined
                ? undefined
                : {
                      id: lm.id,
                      provider: lm.provider,
                      modelName: lm.modelName,
                      modelDescription: lm.modelDescription,
                      modelId: lm.modelId,
                      providerLogo: lm.providerLogo,
                      isSlm: slm,
                  },
        []
    );

    const mapApis = React.useCallback(
        (apiList: any[] | undefined) =>
            apiList?.map(api => ({
                id: api.id,
                name: api.name,
                description: api.description,
            })) ?? undefined,
        []
    );

    const mapExecutableFunctions = React.useCallback(
        (funcList: any[] | undefined) =>
            funcList?.map(func => ({
                id: func.id,
                name: func.name,
                description: func.description,
            })) ?? undefined,
        []
    );

    const constructReusableAgentNodeData = React.useCallback(
        () => ({
            id: agent?.id,
            name: agent?.name,
            description: agent?.description,
            prompt: mapPrompt(agent?.prompt),
            languageModal: mapLanguageModal(agent?.languageModal, isSlm),
            humanInput: agent?.humanInput ? humanInput : undefined,
            apis: mapApis(agent?.apis),
            guardrails: agent?.guardrails && agent.guardrails?.length > 0 ? agent.guardrails : undefined,
            mcpServers: agent?.mcpServers,
            selfLearning: agent?.selfLearning
                ? {
                      ...agent.selfLearning,
                      feedbackTriggeringCriteria: agent.selfLearning?.feedbackTriggeringCriteria?.replaceAll(
                          'variable.',
                          ''
                      ),
                  }
                : undefined,
            knowledgeGraphs: agent?.knowledgeGraphs,
            rags: agent?.rags,
            saveAsReusableAgent: agent?.saveAsReusableAgent,
            isReusableAgentSelected: true,
            connectors: agent?.connectors,
            publisherIntegration: agent?.publisherIntegration,
            executableFunctions: mapExecutableFunctions(agent?.executableFunctions),
            structuredOutput: agent?.structuredOutput,
            customAttributes: customAttributes,
            enableCustomAttributes: enableCustomAttributes,
        }),
        [
            agent,
            isSlm,
            humanInput,
            customAttributes,
            enableCustomAttributes,
            mapPrompt,
            mapLanguageModal,
            mapApis,
            mapExecutableFunctions,
        ]
    );

    const constructRegularAgentNodeData = React.useCallback(
        () => ({
            name: agentName,
            description: description,
            prompt: mapPrompt(prompt),
            languageModal: mapLanguageModal(languageModel, isSlm),
            humanInput,
            apis: mapApis(apis),
            guardrails: guardrails && guardrails?.length > 0 ? guardrails : [],
            mcpServers: mcpServers,
            selfLearning: selfLearning
                ? {
                      ...selfLearning,
                      feedbackTriggeringCriteria: selfLearning?.feedbackTriggeringCriteria?.replaceAll('variable.', ''),
                  }
                : undefined,
            knowledgeGraphs: graphRags?.length > 0 ? graphRags : undefined,
            rags: vectorRags?.length > 0 ? vectorRags : undefined,
            saveAsReusableAgent: saveAsReusableAgent,
            isReusableAgentSelected: false,
            connectors: selectedConnector,
            publisherIntegration: outputBroadcasting,
            executableFunctions: mapExecutableFunctions(executableFunctions),
            structuredOutput: structuredOutput,
            customAttributes: customAttributes,
            enableCustomAttributes: enableCustomAttributes,
        }),
        [
            agentName,
            description,
            prompt,
            languageModel,
            isSlm,
            humanInput,
            apis,
            guardrails,
            mcpServers,
            selfLearning,
            graphRags,
            vectorRags,
            saveAsReusableAgent,
            selectedConnector,
            outputBroadcasting,
            executableFunctions,
            structuredOutput,
            customAttributes,
            enableCustomAttributes,
            mapPrompt,
            mapLanguageModal,
            mapApis,
            mapExecutableFunctions,
        ]
    );

    const constructReusableAgentPayload = React.useCallback((): ReusableAgentPayloadType => {
        const tools = apis?.map(api => ({ id: api.id, type: 'API' })) ?? [];
        const toolExecutableFunctions =
            executableFunctions?.map(func => ({ id: func.id, type: 'EXECUTABLE_FUNCTION' })) ?? [];

        return {
            name: agentName ?? '',
            description: description ?? '',
            type: CustomNodeTypes.agentNode,
            configurations: {
                humanInput: humanInput as INodeHumanInput,
                selfLearning,
                mcpServers: mcpServers?.length > 0 ? mcpServers : undefined,
                knowledgeGraphs: graphRags?.length > 0 ? graphRags : undefined,
                rags: vectorRags?.length > 0 ? vectorRags : undefined,
                publisherIntegration: outputBroadcasting,
                guardrails: guardrails,
                connectors: selectedConnector,
            },
            llmId: isSlm ? undefined : languageModel?.modelId,
            slmId: isSlm ? languageModel?.modelId : undefined,
            promptTemplateId: prompt?.id ?? '',
            tools: [...tools, ...toolExecutableFunctions],
        } as ReusableAgentPayloadType;
    }, [
        agentName,
        description,
        humanInput,
        selfLearning,
        mcpServers,
        graphRags,
        vectorRags,
        outputBroadcasting,
        guardrails,
        selectedConnector,
        isSlm,
        languageModel,
        prompt,
        apis,
        executableFunctions,
    ]);

    const handleSaveNodeData = async () => {
        if (agent?.isReusableAgentSelected) {
            updateNodeData(selectedNode.id, constructReusableAgentNodeData());
            toast.success('Updated agent with selected reusable agent');
        } else {
            updateNodeData(selectedNode.id, constructRegularAgentNodeData());
            if (saveAsReusableAgent) {
                await mutateCreate(constructReusableAgentPayload());
            } else {
                toast.success('Agent updated');
            }
        }
        await Promise.resolve().then(() => {
            setTrigger((trigger ?? 0) + 1);
        });
    };

    const initReusableAgent = React.useCallback(() => {
        setAgent({
            id: selectedNode.data.id as string,
            name: selectedNode.data.name as string,
            description: selectedNode.data.description as string,
            prompt: selectedNode.data.prompt as {
                id: string;
                name: string;
                description: string;
                configurations: { prompt_template: string };
            },
            languageModal: selectedNode.data.languageModal as {
                id: string;
                provider: string;
                modelName: string;
                modelDescription: string;
                modelId: string;
                providerLogo: string;
            },
            humanInput: selectedNode?.data?.humanInput as INodeHumanInput,
            apis: selectedNode.data.apis as { id: string; name: string; description: string }[],
            executableFunctions: selectedNode.data.executableFunctions as {
                id: string;
                name: string;
                description: string;
            }[],
            guardrails: selectedNode.data.guardrails as string[],
            mcpServers: selectedNode.data.mcpServers as McpConfigurationData[],
            knowledgeGraphs: selectedNode.data.knowledgeGraphs as never,
            rags: selectedNode.data.rags as never,
            saveAsReusableAgent: !!selectedNode.data.saveAsReusableAgent,
            isReusableAgentSelected: !!selectedNode.data.isReusableAgentSelected,
            isSlm: !!(selectedNode?.data?.languageModal as any)?.isSlm,
            selfLearning: selectedNode?.data?.selfLearning as ISelfLearning,
            connectors: selectedNode?.data?.connectors as IConnectorForm[],
            publisherIntegration: selectedNode?.data?.publisherIntegration as IMessagePublisher,
            structuredOutput: selectedNode?.data?.structuredOutput as StructuredOutputType,
            customAttributes: customAttributes,
            enableCustomAttributes: enableCustomAttributes,
        });

        if (selectedNode.data.humanInput) {
            setHumanInput(selectedNode.data.humanInput as INodeHumanInput);
        }

        setSlm(!!(selectedNode?.data?.languageModal as any)?.isSlm);

        if (selectedNode.data.guardrails) {
            setGuardrails(getFilteredGuardrails(selectedNode.data.guardrails as string[]));
        }
        if (selectedNode.data.mcpServers) {
            setMcpServers(selectedNode.data.mcpServers as IMCPBody[]);
        }
        if (selectedNode.data.selfLearning) {
            setSelfLearning(selectedNode.data.selfLearning as ISelfLearning);
        }
        if (selectedNode.data.knowledgeGraphs) {
            setGraphRags(selectedNode.data.knowledgeGraphs as IGraphRag[]);
        }
        if (selectedNode.data.rags) {
            setVectorRags(selectedNode.data.rags as IVectorRag[]);
        }
        if (selectedNode.data.structuredOutput) {
            setStructuredOutput(selectedNode.data.structuredOutput as StructuredOutputType);
        }
        if (selectedNode.data.customAttributes) {
            setCustomAttributes(selectedNode.data.customAttributes as string);
        }
        if (selectedNode.data.connectors) {
            setSelectedConnector(selectedNode.data.connectors as IConnectorForm[]);
        }
        if (selectedNode.data.enableCustomAttributes) {
            setEnableCustomAttributes(selectedNode.data.enableCustomAttributes as boolean);
        }
        if (selectedNode.data.publisherIntegration) {
            setOutputBroadcasting(selectedNode.data.publisherIntegration as IMessagePublisher);
        }
        if (selectedNode.data.executableFunctions) {
            setExecutableFunctions(selectedNode.data.executableFunctions as ExecutableFunction[]);
        }
    }, [selectedNode.data, getFilteredGuardrails]);

    const initRegularAgent = React.useCallback(() => {
        setAgent(undefined);
        setAgentName(selectedNode?.data?.name ? (selectedNode.data?.name as string) : undefined);
        setDescription(selectedNode?.data?.description ? (selectedNode.data?.description as string) : undefined);
        const promptData = selectedNode?.data?.prompt as Prompt;
        setPrompt(
            promptData
                ? {
                      id: promptData.id,
                      name: promptData.name,
                      description: promptData.description,
                      configurations: promptData.configurations,
                  }
                : undefined
        );
        const langModel = selectedNode?.data?.languageModal as IntelligenceSourceModel;
        setLanguageModel(
            langModel
                ? {
                      id: langModel.id,
                      provider: langModel.provider,
                      modelName: langModel.modelName,
                      modelId: langModel.modelId,
                      modelDescription: langModel.modelDescription,
                      providerLogo: langModel.providerLogo,
                      modelUniqueId: langModel.modelUniqueId,
                  }
                : undefined
        );
        const apisList = selectedNode?.data?.apis as API[];
        setApis(apisList);

        const guardrailsList = selectedNode?.data?.guardrails as string[];
        setGuardrails(guardrailsList ? getFilteredGuardrails(guardrailsList) : undefined);

        const mcpServersList = selectedNode?.data?.mcpServers as IMCPBody[];
        setMcpServers(mcpServersList ?? []);

        const selfLearningList = selectedNode?.data?.selfLearning as ISelfLearning;
        setSelfLearning(selfLearningList);

        const graphRagList = selectedNode?.data?.knowledgeGraphs as IGraphRag[];
        setGraphRags(graphRagList ?? []);

        const vectorRagList = selectedNode?.data?.rags as IVectorRag[];
        setVectorRags(vectorRagList ?? []);

        const connectorList = selectedNode?.data?.connectors as IConnectorForm[];
        setSelectedConnector(connectorList ?? []);

        const humanInputList = selectedNode?.data?.humanInput as INodeHumanInput;
        setHumanInput(humanInputList);

        // Set Structured Output from node data
        const structuredOutputData = selectedNode?.data?.structuredOutput as StructuredOutputType;
        if (structuredOutputData === undefined) {
            setStructuredOutput({ enabled: false, data: [] });
        } else {
            setStructuredOutput(structuredOutputData);
        }

        // Set custom attributes from node data
        const customAttributesData = selectedNode?.data?.customAttributes as string;
        if (customAttributesData === undefined) {
            setCustomAttributes('');
        } else {
            setCustomAttributes(customAttributesData);
        }

        // Set enable custom attributes from node data
        const enableCustomAttributesData = selectedNode?.data?.enableCustomAttributes as boolean;
        if (enableCustomAttributesData === undefined) {
            setEnableCustomAttributes(false);
        } else {
            setEnableCustomAttributes(enableCustomAttributesData);
        }

        const outputBroadcastingList = selectedNode?.data?.publisherIntegration as IMessagePublisher;
        setOutputBroadcasting(outputBroadcastingList);

        const executableFunctionsList = selectedNode?.data?.executableFunctions as ExecutableFunction[];
        setExecutableFunctions(executableFunctionsList);

        setSaveAsReusableAgent(false);
        setSlm(!!(selectedNode?.data?.languageModal as any)?.isSlm);
    }, [selectedNode.data, getFilteredGuardrails]);

    // update agent form based on the selected agent node data
    useEffect(() => {
        if (selectedNode.data.isReusableAgentSelected) {
            initReusableAgent();
        } else {
            initRegularAgent();
        }
    }, [selectedNode.data.isReusableAgentSelected, initReusableAgent, initRegularAgent]);

    const selectedInputConnectData = useMemo(() => {
        if (agent?.isReusableAgentSelected) {
            return {
                ...data,
                apis: agent?.apis ?? [],
                mcpServers: agent?.mcpServers as any,
                rags: agent?.rags ?? [],
                knowledgeGraphs: agent?.knowledgeGraphs ?? [],
                connectors: agent?.connectors ?? [],
                executableFunctions: agent?.executableFunctions ?? [],
            } as AgentType;
        }
        return {
            ...data,
            apis: apis ?? [],
            mcpServers: mcpServers as any,
            rags: vectorRags ?? [],
            knowledgeGraphs: graphRags ?? [],
            connectors: selectedConnector ?? [],
            executableFunctions: executableFunctions ?? [],
        } as AgentType;
    }, [agent, data, apis, mcpServers, vectorRags, graphRags, selectedConnector, executableFunctions]);

    const manageAgent = (data: IAgent | undefined) => {
        if (data?.configurations?.humanInput) {
            setHumanInput(data?.configurations?.humanInput);
            setSelfLearning(data?.configurations?.selfLearning);
            setStructuredOutput((data?.configurations as any)?.structuredOutput || { enabled: false, data: [] });
            setOutputBroadcasting(data?.configurations?.publisherIntegration);
        } else if (data) {
            setHumanInput(undefined);
            setSelfLearning(data?.configurations?.selfLearning);
            setStructuredOutput((data?.configurations as any)?.structuredOutput || { enabled: false, data: [] });
            setOutputBroadcasting(data?.configurations?.publisherIntegration);
            onPromptChange(allPrompts?.find(prompt => prompt.id === data?.promptTemplateId));
        } else {
            setHumanInput(undefined);
            setAgentName(undefined);
            setDescription(undefined);
            setPrompt(undefined);
            setLanguageModel(undefined);
            setApis(undefined);
            setGuardrails(undefined);
            setMcpServers([]);
            setSelfLearning(undefined);
            setGraphRags([]);
            setVectorRags([]);
            setStructuredOutput({ enabled: false, data: [] });
            setOutputBroadcasting(undefined);
            setSelectedConnector([]);
        }
    };

    const onPromptChange = async (prompt: Prompt | undefined) => {
        const result = await syncTools({
            prompt: prompt?.configurations?.prompt_template,
            allApiTools,
            apis,
            allMcpTools,
            mcpServers,
            allVectorRags,
            vectorRags,
            allGraphRag,
            graphRags,
            allConnectors,
            connectors: selectedConnector,
            allExecutableFunctions,
            executableFunctions,
        });

        setApis(result?.apis);
        setMcpServers(result?.mcps);
        setVectorRags(result?.vectorRags);
        setGraphRags(result?.graphRags);
        setSelectedConnector(result?.connectors);
        if (result?.executableFunctions) {
            setExecutableFunctions(result.executableFunctions);
        }
    };

    const onRefetchPrompt = async () => {
        await refetchPrompts();
        onIntellisenseRefetch();
    };

    const onRefetchGraphRag = async (isAgent?: boolean) => {
        await refetchGraphRag();
        if (!isAgent) {
            await promptRef.current?.refetchVariables();
            await Promise.resolve().then(() => {
                setTrigger((trigger ?? 0) + 1);
            });
        }
        if (graphRef?.current) {
            graphRef.current.onMount();
        }
    };

    const onRefetchVectorRag = async (isAgent?: boolean) => {
        await refetchVectorRag();
        if (!isAgent) {
            await promptRef.current?.refetchVariables();
            await Promise.resolve().then(() => {
                setTrigger((trigger ?? 0) + 1);
            });
        }
        if (vectorRef?.current) {
            vectorRef.current.onMount();
        }
    };

    const onRefetchApiTools = async () => {
        await refetchApiTools();
        await promptRef.current?.refetchVariables();
    };

    const onRefetchMcp = async () => {
        await refetchMcp();
        await promptRef.current?.refetchVariables();
    };

    return (
        <React.Fragment>
            <div
                className={cn('h-full flex items-center justify-center mt-[30%]', {
                    hidden:
                        !fetchingPrompts &&
                        !fetchingApiTools &&
                        !fetchingModels &&
                        !fetchingSLMModels &&
                        !fetchingMcp &&
                        !fetchingGraphRag &&
                        !vectorRagLoading &&
                        !fetchingMessageBroker &&
                        !fetchingGuardrails,
                })}
            >
                <div className="flex flex-col items-center gap-y-2">
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="text-sm text-gray-700 font-normal dark:text-gray-200 max-w-[250px] text-center">
                        Hang tight! We&apos;re loading the agent data for you...
                    </p>
                </div>
            </div>
            <div
                className={cn('group flex flex-col h-[calc(100vh-210px)]', {
                    hidden:
                        fetchingPrompts ||
                        fetchingApiTools ||
                        fetchingModels ||
                        fetchingSLMModels ||
                        fetchingMcp ||
                        fetchingGraphRag ||
                        vectorRagLoading ||
                        fetchingMessageBroker ||
                        fetchingGuardrails,
                })}
            >
                {/* Scrollable sections */}
                <div className="agent-form pr-1 flex flex-col gap-y-2 flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:transparent [&::-webkit-scrollbar-thumb]:bg-transparent group-hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-transparent group-hover:dark:[&::-webkit-scrollbar-thumb]:bg-gray-700">

                    {/* Reusable Agent Selector — always visible, no accordion */}
                    <div className="pb-2">
                        <ReusableAgentSelector
                            agent={agent}
                            setAgent={setAgent}
                            allApiTools={allApiTools as ApiToolResponseType[]}
                            allExecutableFunctions={allExecutableFunctions as ExecutableFunctionResponseType[]}
                            allKnowledgeGraph={allGraphRag}
                            allVectorRags={allVectorRags}
                            allModels={
                                allModels as {
                                    id: string;
                                    modelName: string;
                                    provider: string;
                                    name: string;
                                    configurations: {
                                        providerConfig: { description: string; logo?: Record<number, string> };
                                        description: string;
                                        accessKey?: string;
                                        secretKey?: string;
                                        region?: string;
                                    };
                                }[]
                            }
                            allSLMModels={allSLMModels as never}
                            allPrompts={allPrompts as PromptResponse[]}
                            allMcpTools={allMcpTools}
                            messageBrokers={messageBrokers ?? []}
                            allConnectors={allConnectors}
                            onAgentChange={manageAgent}
                            onRefetchPrompts={refetchPrompts}
                            onRefetchLlms={refetchLLM}
                            onRefetchApiTools={refetchApiTools}
                            onRefetchExecutableFunction={refetchExecutableFunctions}
                            onRefetchSLMModel={refetchSLM}
                            onRefetchMcp={refetchMcp}
                            onRefetchConnectors={refetchConnectors}
                            refetchKnowledgeGraph={() => onRefetchGraphRag(true)}
                            refetchVectorRag={() => onRefetchVectorRag(true)}
                            refetchMessageBroker={async () => {
                                await refetchMessageBrokers();
                            }}
                        />
                    </div>

                    {/* Prompt Instruction */}
                    <PanelSection
                        key={`prompt-${selectedNode.id}`}
                        title="Prompt Instruction"
                        isConfigured={!!prompt || !!agent?.prompt?.id}
                    >
                        <div className="flex flex-col gap-y-4">
                            <Input
                                label="Name"
                                placeholder="Name of the agent"
                                value={agent?.isReusableAgentSelected ? agent.name : (agentName ?? '')}
                                onChange={e => setAgentName(e.target.value)}
                                disabled={agent?.isReusableAgentSelected}
                            />
                            <Textarea
                                label="Description"
                                placeholder="Outline the specific tasks and responsibilities you expect this agent to handle"
                                rows={5}
                                value={agent?.isReusableAgentSelected ? agent.description : (description ?? '')}
                                onChange={e => setDescription(e.target.value)}
                                disabled={agent?.isReusableAgentSelected}
                            />
                            <PromptSelector
                                ref={promptRef}
                                agent={agent}
                                prompt={prompt}
                                setPrompt={setPrompt}
                                allPrompts={allPrompts as PromptResponse[]}
                                isReadonly={isReadOnly}
                                promptsLoading={promptsLoading}
                                onRefetch={onRefetchPrompt}
                                onPromptChange={onPromptChange}
                            />
                        </div>
                    </PanelSection>

                    {/* Intelligence Source */}
                    <PanelSection
                        key={`intelligence-${selectedNode.id}`}
                        title="Intelligence Source"
                        isConfigured={!!languageModel || !!agent?.languageModal?.modelId}
                    >
                        <LanguageSelector
                            isSlm={isSlm}
                            agent={agent}
                            languageModel={languageModel}
                            setLanguageModel={setLanguageModel}
                            allModels={allModels}
                            allSLMModels={allSLMModels as never}
                            allSTSModels={[]}
                            isReadonly={isReadOnly}
                            llmModelsLoading={llmModelsLoading}
                            slmModelsLoading={slmModelsLoading}
                            onRefetch={() => {
                                refetchLLM();
                                refetchSLM();
                            }}
                            onIntelligenceSourceChange={value => setSlm(value)}
                        />
                    </PanelSection>

                    {/* Tools / Input Data Connect */}
                    <PanelSection
                        key={`tools-${selectedNode.id}`}
                        title="Tools & Data Sources"
                        isConfigured={
                            (apis?.length ?? 0) > 0 ||
                            (mcpServers?.length ?? 0) > 0 ||
                            (vectorRags?.length ?? 0) > 0 ||
                            (graphRags?.length ?? 0) > 0 ||
                            (selectedConnector?.length ?? 0) > 0 ||
                            (executableFunctions?.length ?? 0) > 0
                        }
                    >
                        <div className="flex flex-col gap-y-3">
                            <InputDataConnectContainer
                                agent={agent}
                                apiSelectorProps={{
                                    agent: agent,
                                    apis: apis,
                                    setApis: setApis,
                                    allApiTools: allApiTools as ApiToolResponseType[],
                                    isReadonly: isReadOnly,
                                    apiLoading: apiLoading,
                                    onRefetch: () => {
                                        Promise.resolve(onRefetchApiTools()).catch(() => {});
                                    },
                                }}
                                mcpSelectorProps={{
                                    mcpServers: mcpServers,
                                    setMcpServers: setMcpServers,
                                    agent: agent,
                                    onRefetch: () => {
                                        Promise.resolve(onRefetchMcp()).catch(() => {});
                                    },
                                    isReadonly: isReadOnly,
                                    loading: mcpLoading,
                                    allMcpTools: allMcpTools as McpToolResponseType[],
                                }}
                                vectorSelectorProps={{
                                    agent: agent,
                                    vectorRags: vectorRags,
                                    setVectorRags: setVectorRags,
                                    allVectorRags: allVectorRags ?? [],
                                    vectorRagLoading: vectorRagLoading,
                                    isReadonly: isReadOnly,
                                    onRefetch: () => {
                                        Promise.resolve(onRefetchVectorRag()).catch(() => {});
                                    },
                                }}
                                graphSelectorProps={{
                                    agent: agent,
                                    graphRags: graphRags,
                                    setGraphRags: setGraphRags,
                                    allGraphRags: allGraphRag ?? [],
                                    graphRagLoading: fetchingGraphRag,
                                    isReadonly: isReadOnly,
                                    onRefetch: () => {
                                        Promise.resolve(onRefetchGraphRag()).catch(() => {});
                                    },
                                }}
                                connectorSelectorProps={{
                                    agent: agent,
                                    connectors: selectedConnector as IConnectorForm[],
                                    isMultiple: true,
                                    setConnectors: setSelectedConnector,
                                    allConnectors: allConnectors ?? [],
                                    isReadonly: isReadOnly,
                                    onRefetch: () => {
                                        Promise.resolve(onRefetchConnector()).catch(() => {});
                                    },
                                    onConnectorsChange: connector => setSelectedConnector(connector),
                                }}
                                executableSelectorProps={{
                                    agent: agent,
                                    functions: executableFunctions,
                                    setFunctions: setExecutableFunctions,
                                    allExecutableFunctions: allExecutableFunctions as ExecutableFunctionResponseType[],
                                    isReadonly: isReadOnly,
                                    functionLoading: executableFunctionsLoading,
                                    onRefetch: () => {
                                        Promise.resolve(refetchExecutableFunctions()).catch(() => {});
                                    },
                                }}
                            />
                            <SelectedInputConnects data={selectedInputConnectData} />
                        </div>
                    </PanelSection>

                    {/* Human Input */}
                    <PanelSection
                        key={`human-input-${selectedNode.id}`}
                        title="Human Input"
                        isConfigured={!!humanInput?.enableHumanInput}
                    >
                        <HumanInput
                            humanInput={humanInput}
                            messageBrokers={messageBrokers ?? []}
                            agent={agent}
                            isReadOnly={isReadOnly}
                            workflowId={params?.workflow_id as string}
                            setHumanInput={setHumanInput}
                        />
                    </PanelSection>

                    {/* Guardrails */}
                    <PanelSection
                        key={`guardrails-${selectedNode.id}`}
                        title="Guardrails"
                        isConfigured={(guardrails?.length ?? 0) > 0}
                    >
                        <GuardrailSelector
                            agent={agent}
                            allGuardrails={guardrailData ?? []}
                            guardrails={guardrails}
                            isReadonly={isReadOnly}
                            guardrailsLoading={guardrailLoading}
                            title="Agent Level Guardrails"
                            level={GuardrailBindingLevelType.AGENT}
                            setGuardrails={setGuardrails}
                            onRefetch={() => {
                                Promise.resolve(refetchGuardrails()).catch(() => {});
                            }}
                        />
                    </PanelSection>

                    {/* Self Learning */}
                    <PanelSection
                        key={`self-learning-${selectedNode.id}`}
                        title="Self Learning"
                        isConfigured={!!selfLearning?.enableLearning}
                    >
                        <SelfLearning
                            selfLearning={selfLearning}
                            isReadOnly={isReadOnly}
                            apis={apis}
                            allApiTools={allApiTools}
                            llms={allModels}
                            slms={allSLMModels as never}
                            workflow={workflow}
                            agent={agent}
                            nodeId={selectedNode?.id}
                            allPrompts={allPrompts as PromptResponse[]}
                            promptsLoading={promptsLoading}
                            llmModelsLoading={llmModelsLoading}
                            slmModelsLoading={slmModelsLoading}
                            messageBrokers={messageBrokers ?? []}
                            setSelfLearning={setSelfLearning}
                            onRefetch={refetchApiTools}
                            onRefetchIntelligence={() => {
                                refetchLLM();
                                refetchSLM();
                            }}
                            onRefetchPrompt={onRefetchPrompt}
                            allConnectors={allConnectors ?? []}
                            onRefetchConnector={refetchConnectors}
                            connectorsLoading={fetchingConnectors ?? false}
                        />
                    </PanelSection>

                    {/* Output Broadcasting */}
                    <PanelSection
                        key={`output-broadcasting-${selectedNode.id}`}
                        title="Output Broadcasting"
                        isConfigured={!!outputBroadcasting}
                    >
                        <MessagePublisher
                            title="Output Broadcasting"
                            detailButtonLabel="Add Output Broadcasting"
                            viewLabel="View Output Broadcasting"
                            agent={agent}
                            messagePublisher={outputBroadcasting}
                            messageBrokers={messageBrokers ?? []}
                            isReadOnly={isReadOnly}
                            workflowId={params?.workflow_id as string}
                            setMessagePublisher={setOutputBroadcasting}
                        />
                    </PanelSection>

                    {/* Structured Output */}
                    <PanelSection
                        key={`structured-output-${selectedNode.id}`}
                        title="Structured Output"
                        isConfigured={!!structuredOutput?.enabled}
                    >
                        <StructuredOutputCreator
                            agent={agent}
                            setStructuredOutput={setStructuredOutput}
                            structuredOutput={structuredOutput}
                        />
                    </PanelSection>

                    {/* Custom Attributes */}
                    <PanelSection
                        key={`custom-attributes-${selectedNode.id}`}
                        title="Custom Attributes"
                        isConfigured={enableCustomAttributes && customAttributes.trim().length > 0}
                    >
                        <div className="flex flex-col gap-y-3">
                            <div className="flex gap-x-3 items-start">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Checkbox
                                                id="enable-custom-attributes"
                                                disabled={isReadOnly}
                                                checked={enableCustomAttributes}
                                                onCheckedChange={e => setEnableCustomAttributes(!!e)}
                                            />
                                        </TooltipTrigger>
                                        {isReadOnly && (
                                            <TooltipContent side="left" align="center">
                                                You don&apos;t have permission to modify
                                            </TooltipContent>
                                        )}
                                    </Tooltip>
                                </TooltipProvider>
                                <div className="flex flex-col -mt-1 gap-y-1">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-100">
                                        Enable Custom Attributes
                                    </p>
                                    <p className="text-xs font-normal text-gray-500 dark:text-gray-300">
                                        Toggle to attach custom JSON attributes to this agent
                                    </p>
                                </div>
                            </div>
                            {enableCustomAttributes && (
                                <Textarea
                                    label="Custom Attributes"
                                    placeholder={`${'Enter custom attributes in JSON format (e.g., {"key": "value"})'}`}
                                    rows={5}
                                    value={customAttributes}
                                    onChange={e => setCustomAttributes(e.target.value)}
                                    disabled={!enableCustomAttributes || isReadOnly}
                                />
                            )}
                        </div>
                    </PanelSection>

                    {/* Save as Reusable Agent */}
                    <div className="flex items-center gap-x-2 px-1 py-1">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Checkbox
                                        disabled={agent?.isReusableAgentSelected || isReadOnly}
                                        checked={saveAsReusableAgent}
                                        onCheckedChange={e => setSaveAsReusableAgent(!!e)}
                                    />
                                </TooltipTrigger>
                                {isReadOnly && (
                                    <TooltipContent side="left" align="center">
                                        You don&apos;t have permission to modify
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>
                        <p className="text-xs font-medium text-gray-400">Save as reusable agent</p>
                    </div>

                    {/* Hidden retry count */}
                    <div hidden>
                        <Input label="Retry Count" type="number" defaultValue={5} />
                    </div>
                </div>

                {/* Sticky footer — always visible at the bottom of the panel */}
                <div className="agent-form-footer shrink-0 flex gap-x-3 justify-end pt-3 pb-1 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                    <Button variant="secondary" onClick={() => setSelectedNodeId(undefined)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSaveNodeData}>
                        Save
                    </Button>
                </div>
            </div>
        </React.Fragment>
    );
};
