/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';
import React, { useEffect, useState } from 'react';
import { Button, Input, SelectableRadioItem, Spinner } from '@/components';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/atoms/dialog';
import { DetailItemInput } from '@/components/molecules/detail-item-input/detail-item-input';
import { AgentType, API, Prompt } from '@/components/organisms';
import { FileX } from 'lucide-react';
import {
    IAgent,
    IConnectorForm,
    IConnectorTool,
    IGraphRag,
    IMessageBroker,
    INodeHumanInput,
    IVectorRag,
} from '@/models';
import { useAgent } from '@/hooks/use-agent';
import { FormBody as AgentFormBody } from '@/app/workspace/[wid]/agents/components/agent-form';
import { IMCPBody, mapMcpBodyToConfigurationData } from '@/hooks/use-mcp-configuration';
import { useApp } from '@/context/app-context';
import { useAgentQuery } from '@/hooks/use-common';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/atoms/tabs';
import { Bot, BotMessageSquare, Globe, Lock } from 'lucide-react';
import { mockAgents } from '@/app/workspace/[wid]/standalone-agents/mock-data';
import type { StandaloneAgent } from '@/app/workspace/[wid]/standalone-agents/mock-data';

type LanguageModel = {
    id: string;
    modelId: string;
    provider: string;
    modelName: string;
    modelDescription: string;
    providerLogo: string;
};

type Agent = {
    id: string;
    name: string;
    description: string;
    prompt: Prompt;
    languageModal: LanguageModel;
    isHumanInput: boolean;
    apis: API[];
};

type IModel = {
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
};

interface ReusableAgentSelectorProps {
    agent: AgentType | undefined;
    setAgent: React.Dispatch<React.SetStateAction<AgentType | undefined>>;
    allApiTools: IConnectorTool[];
    allExecutableFunctions: IConnectorTool[];
    allModels: IModel[];
    allSLMModels: IModel[];
    allPrompts: { id: string; name: string; description: string; configurations: { prompt_template: string } }[];
    allMcpTools: IMCPBody[] | undefined;
    allKnowledgeGraph: IGraphRag[] | undefined;
    allVectorRags: IVectorRag[] | undefined;
    messageBrokers: IMessageBroker[];
    allConnectors: IConnectorForm[] | undefined;
    onAgentChange?: (agent: IAgent | undefined) => void;
    onRefetchPrompts: () => void;
    onRefetchLlms: () => void;
    onRefetchApiTools: () => void;
    onRefetchExecutableFunction: () => void;
    onRefetchSLMModel: () => void;
    onRefetchMcp: () => void;
    onRefetchConnectors: () => void;
    refetchKnowledgeGraph: () => Promise<void>;
    refetchVectorRag: () => Promise<void>;
    refetchMessageBroker: () => Promise<void>;
}

interface ReusableAgentListContentProps {
    readonly isFetching: boolean;
    readonly searchTerm: string;
    readonly reusableAgentsList: Agent[] | undefined;
    readonly sortedAgentsList: ReadonlyArray<Agent>;
    readonly selectedReusableAgentId: string | undefined;
    readonly selectedReusableAgentIdFromList: string | undefined;
    readonly onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
    readonly onSelectAgent: (agent: Agent) => void;
    readonly onEdit: (id: string) => void;
}

function ReusableAgentListContent({
    isFetching,
    searchTerm,
    reusableAgentsList,
    sortedAgentsList,
    selectedReusableAgentId,
    selectedReusableAgentIdFromList,
    onSearch,
    onSelectAgent,
    onEdit,
}: ReusableAgentListContentProps) {
    if (isFetching) {
        return (
            <div className="w-full flex flex-col items-center gap-y-1 justify-center py-4 h-full">
                <Spinner />
                <p className="w-[300px] text-center">Just a moment, we&apos;are checking for new Reusable agents...</p>
            </div>
        );
    }
    return (
        <>
            <Input className="w-full" placeholder="Agent name" onChange={onSearch} />
            {reusableAgentsList && reusableAgentsList.length > 0 ? (
                <div className="item-list-container overflow-y-auto flex flex-col gap-y-2">
                    {sortedAgentsList?.map(agent => (
                        <SelectableRadioItem
                            key={agent.id}
                            id={agent.id}
                            label={agent.name}
                            description={agent.description}
                            isChecked={
                                selectedReusableAgentId === agent?.id &&
                                selectedReusableAgentIdFromList === agent.description.toLowerCase()
                            }
                            imagePath="/png/nodes/agent.png"
                            handleClick={() => onSelectAgent(agent)}
                            onEdit={onEdit}
                        />
                    ))}
                </div>
            ) : (
                <div className="w-full flex flex-col items-center gap-y-1 justify-center py-4 h-full">
                    <FileX className="text-gray-500 dark:text-gray-300" />
                    <p className="text-sm text-gray-500 dark:text-gray-300 text-center">
                        {searchTerm ? (
                            <>No results found</>
                        ) : (
                            <>
                                No Reusable Agents have been
                                <br /> configured
                            </>
                        )}
                    </p>
                </div>
            )}
        </>
    );
}

const MOCK_EXTERNAL_AGENTS_FOR_SELECTOR = [
    { id: 'ext-001', name: 'OpenAI Assistant', description: 'GPT-4 powered assistant via A2A', protocol: 'a2a' as const, endpointUrl: 'https://api.openai.com/v1/a2a', status: 'reachable' },
    { id: 'ext-002', name: 'Langchain Research Agent', description: 'External research agent via ACP', protocol: 'acp' as const, endpointUrl: 'https://langchain-agent.acme.io/api/v1', status: 'reachable' },
    { id: 'ext-003', name: 'AutoGen Task Planner', description: 'Microsoft AutoGen orchestrator via A2A', protocol: 'a2a' as const, endpointUrl: 'https://autogen.contoso.com/a2a', status: 'auth_error' },
];

interface AgentSelectorTabsProps {
    isFetching: boolean;
    searchTerm: string;
    reusableAgentsList: Agent[] | undefined;
    sortedAgentsList: ReadonlyArray<Agent>;
    selectedReusableAgentId: string | undefined;
    selectedReusableAgentIdFromList: string | undefined;
    onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSelectReusableAgent: (agent: Agent) => void;
    onEdit: (id: string) => void;
}

function AgentSelectorTabs({
    isFetching, searchTerm, reusableAgentsList, sortedAgentsList,
    selectedReusableAgentId, selectedReusableAgentIdFromList,
    onSearch, onSelectReusableAgent, onEdit,
}: AgentSelectorTabsProps) {
    const standaloneAgents = mockAgents.filter(a => a.status === 'running');

    return (
        <Tabs defaultValue="reusable" className="flex flex-col h-full min-h-0">
            <TabsList className="bg-gray-100 dark:bg-gray-800 p-0.5 rounded-lg shrink-0 self-start">
                <TabsTrigger value="reusable" className="flex items-center gap-x-1 text-xs px-2.5 py-1">
                    <Bot className="h-3 w-3" /> Reusable
                </TabsTrigger>
                <TabsTrigger value="standalone" className="flex items-center gap-x-1 text-xs px-2.5 py-1">
                    <BotMessageSquare className="h-3 w-3" /> Standalone
                </TabsTrigger>
                <TabsTrigger value="external" className="flex items-center gap-x-1 text-xs px-2.5 py-1">
                    <Globe className="h-3 w-3" /> External
                </TabsTrigger>
            </TabsList>

            <TabsContent value="reusable" className="flex-1 min-h-0 mt-2 overflow-hidden flex flex-col gap-y-2 data-[state=inactive]:hidden">
                <ReusableAgentListContent
                    isFetching={isFetching}
                    searchTerm={searchTerm}
                    reusableAgentsList={reusableAgentsList}
                    sortedAgentsList={sortedAgentsList}
                    selectedReusableAgentId={selectedReusableAgentId}
                    selectedReusableAgentIdFromList={selectedReusableAgentIdFromList}
                    onSearch={onSearch}
                    onSelectAgent={onSelectReusableAgent}
                    onEdit={onEdit}
                />
            </TabsContent>

            <TabsContent value="standalone" className="flex-1 min-h-0 mt-2 overflow-y-auto flex flex-col gap-y-2 data-[state=inactive]:hidden">
                <p className="text-xs text-gray-500 dark:text-gray-400 shrink-0">Select a deployed standalone agent to use in this workflow node. Connection settings auto-configure.</p>
                <div className="flex flex-col gap-y-1.5">
                    {standaloneAgents.map((sa: StandaloneAgent) => (
                        <button key={sa.id} type="button" className="w-full flex items-center gap-x-3 px-3 py-2.5 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-gray-700/50 transition-colors">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
                                <BotMessageSquare className="h-4 w-4 text-[#6c3def]" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{sa.name}</p>
                                <p className="text-[11px] text-gray-400 truncate">{sa.description} · v{sa.version}</p>
                            </div>
                            <div className="flex items-center gap-x-1.5 shrink-0">
                                <Lock className="h-3 w-3 text-gray-400" />
                                <span className="text-[10px] text-gray-400 font-medium">A2A</span>
                                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                            </div>
                        </button>
                    ))}
                </div>
            </TabsContent>

            <TabsContent value="external" className="flex-1 min-h-0 mt-2 overflow-y-auto flex flex-col gap-y-2 data-[state=inactive]:hidden">
                <p className="text-xs text-gray-500 dark:text-gray-400 shrink-0">Select a configured external agent connection. Manage external agents from the Agents page.</p>
                <div className="flex flex-col gap-y-1.5">
                    {MOCK_EXTERNAL_AGENTS_FOR_SELECTOR.map(ea => (
                        <button key={ea.id} type="button" className="w-full flex items-center gap-x-3 px-3 py-2.5 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700/50 transition-colors">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                <Globe className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{ea.name}</p>
                                <p className="text-[11px] text-gray-400 truncate">{ea.description}</p>
                            </div>
                            <div className="flex items-center gap-x-1.5 shrink-0">
                                <span className="text-[10px] text-gray-400 font-mono font-semibold">{ea.protocol.toUpperCase()}</span>
                                <span className={`h-1.5 w-1.5 rounded-full ${ea.status === 'reachable' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                            </div>
                        </button>
                    ))}
                </div>
            </TabsContent>
        </Tabs>
    );
}

export const ReusableAgentSelector = ({
    agent,
    allApiTools,
    allExecutableFunctions,
    allModels,
    allSLMModels,
    allPrompts,
    allMcpTools,
    allKnowledgeGraph,
    allVectorRags,
    allConnectors,
    messageBrokers,
    setAgent,
    onAgentChange,
    onRefetchPrompts,
    onRefetchLlms,
    onRefetchApiTools,
    onRefetchExecutableFunction,
    onRefetchSLMModel,
    onRefetchMcp,
    onRefetchConnectors,
    refetchKnowledgeGraph,
    refetchVectorRag,
    refetchMessageBroker,
}: ReusableAgentSelectorProps) => {
    const { guardrailBinding } = useApp();
    const [reusableAgentsList, setReusableAgentsList] = useState<Agent[] | undefined>(undefined);
    const [selectedReusableAgentId, setSelectedReusableAgentId] = useState<string | undefined>(undefined);
    const [selectedReusableAgentIdFromList, setSelectedReusableAgentIdFromList] = useState<string | undefined>(
        undefined
    );
    const [openModal, setOpenModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const applyAgentFromSelection = (
        selectedAgent: Agent,
        rawAgent: IAgent | undefined,
        agentSetter: React.Dispatch<React.SetStateAction<AgentType | undefined>>
    ) => {
        agentSetter({
            ...selectedAgent,
            saveAsReusableAgent: false,
            isReusableAgentSelected: true,
            humanInput: rawAgent?.configurations?.humanInput as INodeHumanInput,
            selfLearning: rawAgent?.configurations?.selfLearning,
            mcpServers: mapMcpBodyToConfigurationData(rawAgent?.configurations?.mcpServers),
            knowledgeGraphs: rawAgent?.configurations?.knowledgeGraphs,
            rags: rawAgent?.configurations?.rags,
            publisherIntegration: rawAgent?.configurations?.publisherIntegration,
            guardrails: rawAgent?.configurations?.guardrails,
            connectors: rawAgent?.configurations?.connectors,
            isSlm: !!(rawAgent?.slmId && rawAgent?.slmId?.trim() !== ''),
        });
    };

    const getGuardrailsForEdit = (objGuardrails: string[] | undefined) => {
        const hasBinding = guardrailBinding && guardrailBinding.length > 0;
        const hasObjGuardrails = objGuardrails && objGuardrails.length > 0;
        if (!hasBinding || !hasObjGuardrails) return objGuardrails;
        const bindingIds = new Set(guardrailBinding.map(x => x.guardrailId));
        const filteredIds = objGuardrails.filter(id => !bindingIds.has(id));
        return filteredIds.length > 0 ? filteredIds : undefined;
    };

    const {
        data: allAgents,
        isFetched,
        refetch,
        isFetching,
    } = useAgentQuery<any>({
        onSuccess: data => {
            if (!selectedReusableAgentId || !data?.length) return;
            const allFormattedAgents: Agent[] = formatAgent(data);
            const selectedAgent = allFormattedAgents?.find(a => a.id === selectedReusableAgentId);
            const rawAgent = data?.find((x: IAgent) => x.id === selectedReusableAgentId);
            if (selectedAgent) applyAgentFromSelection(selectedAgent, rawAgent, setAgent);
        },
    });

    const {
        isSaving,
        isValid,
        errors,
        isOpen,
        isLoadingResources,
        promptsLoading,
        llmModelsLoading,
        apiLoading,
        mcpLoading,
        slmModelsLoading,
        control,
        guardrailData,
        guardrailLoading,
        connectorsLoading,
        trigger,
        setValue,
        getValues,
        register,
        handleSubmit,
        onHandleSubmit,
        setOpen,
        watch,
        reset,
        refetchGuardrails,
    } = useAgent({
        triggerQuery: false,
        onRefetch: () => {
            refetch();
        },
    });

    useEffect(() => {
        if (!isOpen || !openModal) {
            setOpen(false);
            setSearchTerm('');
        }
    }, [isOpen, openModal]);

    useEffect(() => {
        if (openModal && agent) {
            setSelectedReusableAgentId(agent?.id);
            setSelectedReusableAgentIdFromList(agent?.description?.toLowerCase());
        } else {
            setSelectedReusableAgentId(undefined);
            setSelectedReusableAgentIdFromList(undefined);
        }
    }, [openModal, agent]);

    const getPromptInfoForAgent = (
        promptTemplateId: string,
        prompts: { id: string; name: string; description: string; configurations: { prompt_template: string } }[]
    ) => {
        const promptInfo = prompts.find(p => p.id === promptTemplateId);

        return {
            id: promptInfo?.id,
            name: promptInfo?.name,
            description: promptInfo?.description,
            configurations: promptInfo?.configurations,
        };
    };

    const getLlmModelForAgent = (LLMId: string, models: IModel[]) => {
        const llmInfo = models.find((m: IModel) => m.id === LLMId);

        if (!llmInfo) {
            console.warn(`LLM Model with ID ${LLMId} not found.`);
            return null;
        }

        return {
            id: llmInfo.modelName,
            modelId: llmInfo.id,
            provider: llmInfo.provider,
            modelName: llmInfo.name,
            modelDescription:
                llmInfo.configurations?.description ?? llmInfo.configurations?.providerConfig?.description,
            providerLogo: llmInfo.configurations?.providerConfig?.logo?.[32] ?? '',
        };
    };

    const getApiToolForAgent = (apiToolsObj: { id: string; type: string }[], apiTools: IConnectorTool[]) => {
        const apiToolIds = apiToolsObj.filter(tools => tools.type === 'API').map(tools => tools.id);

        if (!Array.isArray(apiTools) || !Array.isArray(apiToolIds)) {
            console.error('Invalid inputs');
            return [];
        }

        // Filter API tools that match the given IDs
        const filteredApiTools = apiTools
            .filter(apiTool => apiToolIds.includes(apiTool.id))
            .map(({ id, name, description }) => ({ id, name, description })); // Directly map to the required format

        return filteredApiTools;
    };

    const getExecutableFunctionsForAgent = (
        toolObjects: { id: string; type: string }[],
        executableFunctionTools: IConnectorTool[]
    ) => {
        const executableFunctionToolIds = toolObjects
            .filter(tools => tools.type === 'EXECUTABLE_FUNCTION')
            .map(tools => tools.id);

        if (!Array.isArray(executableFunctionTools) || !Array.isArray(executableFunctionToolIds)) {
            console.error('Invalid inputs');
            return [];
        }
        // Filter Executable function tools that match the given IDs
        const filteredExecutableFunctions = executableFunctionTools
            .filter(funcTool => executableFunctionToolIds.includes(funcTool.id))
            .map(({ id, name, description }) => ({ id, name, description })); // Directly map to the required format
        return filteredExecutableFunctions;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formatAgent = (allAgents: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const reusableAgentList: Agent[] = allAgents.map((agent: any) => {
            const isSlm = !!(agent?.slmId && agent?.slmId?.trim() !== '');

            const promptInfo = getPromptInfoForAgent(agent.promptTemplateId, allPrompts);
            const languageModalInfo = isSlm
                ? getLlmModelForAgent(agent.slmId, allSLMModels ?? [])
                : getLlmModelForAgent(agent.llmId, allModels ?? []);
            const apiTools = getApiToolForAgent(agent.tools, allApiTools);
            const executableFunctionTools = getExecutableFunctionsForAgent(agent.tools, allExecutableFunctions);

            return {
                id: agent.id,
                name: agent.name,
                description: agent.description,
                prompt: promptInfo,
                languageModal: languageModalInfo,
                isHumanInput: false,
                apis: apiTools,
                executableFunctions: executableFunctionTools,
            } as Agent;
        });

        return reusableAgentList;
    };

    useEffect(() => {
        if (allAgents && allPrompts && allModels && allApiTools) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const formattedAgents: Agent[] = formatAgent(allAgents);

            setReusableAgentsList(formattedAgents);
        }
    }, [allAgents, allPrompts, allModels, allApiTools, allSLMModels]);

    useEffect(() => {
        if (allAgents && allPrompts && allModels && allApiTools) {
            const allFormattedAgents: Agent[] = formatAgent(allAgents);

            if (searchTerm !== '' && allAgents) {
                const filteredAgents = allFormattedAgents?.filter(
                    agent => agent.name.toLowerCase().includes(searchTerm) // Partial match
                );
                setReusableAgentsList(filteredAgents);
            } else {
                setReusableAgentsList(allFormattedAgents);
            }
        }
    }, [searchTerm, allAgents, allPrompts, allModels, allApiTools]);

    const sortedAgentsList = reusableAgentsList
        ? [
              ...reusableAgentsList.filter(agent => agent.id === selectedReusableAgentId),
              ...reusableAgentsList.filter(agent => agent.id !== selectedReusableAgentId),
          ]
        : [];

    const handleClick = () => {
        const selectedAgent = reusableAgentsList?.find(a => a.id === selectedReusableAgentId);
        const rawAgent = allAgents?.find((x: IAgent) => x.id === selectedReusableAgentId);
        if (selectedAgent) applyAgentFromSelection(selectedAgent, rawAgent, setAgent);
        setOpenModal(false);
        const formattedAgents: Agent[] = formatAgent(allAgents);
        setReusableAgentsList(formattedAgents);
        onAgentChange?.(rawAgent);
    };

    const handleRemove = () => {
        setAgent(undefined);
        setOpenModal(false);
        setSelectedReusableAgentId(undefined);
        if (onAgentChange) {
            onAgentChange(undefined);
        }
    };

    const handleChange = () => {
        setOpenModal(true);
        setSelectedReusableAgentIdFromList(agent?.description.toLowerCase()); //set description as unique id for agent list on the list when loading from change button to highlight the agent
        if (agent) {
            setSelectedReusableAgentId(agent.id);
            setSelectedReusableAgentIdFromList(agent.description.toLowerCase());
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchTerm = e.target.value.toLowerCase();
        setSearchTerm(searchTerm);
    };

    const handleCancel = () => {
        setOpenModal(false);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formattedAgents: Agent[] = formatAgent(allAgents);
        setReusableAgentsList(formattedAgents);
    };

    const onModalClose = (open: boolean, cancel?: boolean) => {
        if (isOpen) setOpen(false);
        else if (cancel) setOpenModal(false);
        else setOpenModal(open);
    };

    const onEdit = (id: string) => {
        const obj = allAgents?.find((x: any) => x.id === id);
        if (!obj) return;
        const isLlm = !!(obj?.llmId && obj?.llmId?.trim() !== '');
        setValue('id', obj.id);
        setValue('agentName', obj.name);
        setValue('agentDescription', obj.description);
        setValue('llmId', isLlm ? obj.llmId : undefined);
        setValue('humanInput', obj.configurations?.humanInput);
        setValue('publisherIntegration', obj.configurations?.publisherIntegration);
        setValue('slmId', isLlm ? undefined : obj.slmId);
        setValue('promptTemplateId', obj.promptTemplateId);
        setValue('tools', obj.tools);
        setValue('isReadOnly', obj?.isReadOnly);
        setValue('selfLearning', obj?.configurations?.selfLearning);
        setValue('mcpServers', obj?.configurations?.mcpServers);
        setValue('knowledgeGraphs', obj?.configurations?.knowledgeGraphs);
        setValue('rags', obj?.configurations?.rags);
        setValue('sourceValue', isLlm ? obj.llmId : obj.slmId);
        setValue('connectors', obj?.configurations?.connectors);
        setValue('guardrails', getGuardrailsForEdit(obj?.configurations?.guardrails as string[] | undefined));
        setOpen(true);
    };

    return (
        <>
            <DetailItemInput
                label="Reusable Agent"
                values={
                    agent
                        ? [
                              {
                                  title: agent?.name,
                                  description: agent.description,
                                  imagePath: '/png/nodes/agent.png',
                              },
                          ]
                        : undefined
                }
                imagePath="/png/select_reusable_agent.png"
                imageType="png"
                imageWidth="80"
                description='Select a reusable agent from the saved list to auto-fill the fields below. Click "Add
                        Reusable Agent" to see available agents.'
                footer={
                    agent ? (
                        <div className=" w-full flex justify-start items-center gap-x-3">
                            <Button variant="link" className="text-blue-400" onClick={handleChange}>
                                Change
                            </Button>
                            <Button variant="link" className="text-red-500 hover:text-red-400" onClick={handleRemove}>
                                Remove
                            </Button>
                        </div>
                    ) : (
                        <Button
                            variant="link"
                            onClick={() => {
                                setOpenModal(true);
                                if (isFetched) {
                                    refetch();
                                }
                            }}
                        >
                            Add a Reusable Agent
                        </Button>
                    )
                }
            />
            <Dialog open={openModal} onOpenChange={onModalClose}>
                <DialogContent className="max-w-[unset] w-[620px]">
                    <DialogHeader className="px-0">
                        <DialogTitle asChild>
                            <div className="px-4">
                                <p className="text-lg font-semibold text-gray-700 dark:text-gray-100">
                                    {isOpen ? 'Edit Agent' : 'Select Agent'}
                                </p>
                            </div>
                        </DialogTitle>
                    </DialogHeader>
                    <DialogDescription asChild>
                        <div className="px-4 flex flex-col gap-y-4 h-[400px]">
                            {isOpen ? (
                                <div className="item-list-container overflow-y-auto flex flex-col gap-y-2">
                                    <AgentFormBody
                                        allPrompts={allPrompts}
                                        allModels={allModels}
                                        allApiTools={allApiTools as never}
                                        allExecutableFunctions={allExecutableFunctions as never}
                                        allSLMModels={allSLMModels}
                                        allMcpTools={allMcpTools}
                                        isLoadingResources={isLoadingResources}
                                        allGraphRag={allKnowledgeGraph}
                                        messageBrokers={messageBrokers}
                                        isOpen={isOpen}
                                        control={control}
                                        setOpen={setOpen}
                                        register={register}
                                        handleSubmit={handleSubmit}
                                        onHandleSubmit={onHandleSubmit}
                                        isEdit={isOpen}
                                        watch={watch}
                                        trigger={trigger}
                                        errors={errors}
                                        isSaving={isSaving}
                                        isValid={isValid}
                                        promptsLoading={promptsLoading}
                                        llmModelsLoading={llmModelsLoading}
                                        apiLoading={apiLoading}
                                        slmModelsLoading={slmModelsLoading}
                                        mcpLoading={mcpLoading}
                                        allVectorRags={allVectorRags}
                                        guardrailData={guardrailData}
                                        guardrailLoading={guardrailLoading}
                                        setValue={setValue}
                                        getValues={getValues}
                                        reset={reset}
                                        onRefetchPrompts={onRefetchPrompts}
                                        onRefetchLlms={onRefetchLlms}
                                        onRefetchApiTools={onRefetchApiTools}
                                        onRefetchExecutableFunctions={onRefetchExecutableFunction}
                                        onRefetchSLMModel={onRefetchSLMModel}
                                        onRefetchMcp={onRefetchMcp}
                                        onRefetchConnector={onRefetchConnectors}
                                        allConnectors={allConnectors ?? []}
                                        connectorsLoading={connectorsLoading}
                                        refetchGraphRag={refetchKnowledgeGraph}
                                        refetchVectorRag={refetchVectorRag}
                                        refetchMessageBroker={refetchMessageBroker}
                                        refetchGuardrails={refetchGuardrails}
                                    />
                                </div>
                            ) : (
                                <AgentSelectorTabs
                                    isFetching={isFetching}
                                    searchTerm={searchTerm}
                                    reusableAgentsList={reusableAgentsList}
                                    sortedAgentsList={sortedAgentsList}
                                    selectedReusableAgentId={selectedReusableAgentId}
                                    selectedReusableAgentIdFromList={selectedReusableAgentIdFromList}
                                    onSearch={handleSearch}
                                    onSelectReusableAgent={agent => {
                                        setSelectedReusableAgentId(agent.id);
                                        setSelectedReusableAgentIdFromList(agent.description.toLowerCase());
                                    }}
                                    onEdit={onEdit}
                                />
                            )}
                        </div>
                    </DialogDescription>
                    <DialogFooter>
                        <Button variant="secondary" onClick={handleCancel}>
                            Cancel
                        </Button>
                        {isOpen ? (
                            <Button
                                variant="primary"
                                disabled={!isValid || isSaving}
                                onClick={handleSubmit(onHandleSubmit)}
                            >
                                Update
                            </Button>
                        ) : (
                            <Button
                                disabled={selectedReusableAgentId === undefined}
                                variant="primary"
                                onClick={handleClick}
                            >
                                Add agent
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
