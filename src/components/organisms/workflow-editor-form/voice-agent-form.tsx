/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { APISelector } from '@/app/editor/[wid]/[workflow_id]/components/api-selector';
import { LanguageSelector } from '@/app/editor/[wid]/[workflow_id]/components/language-selector';
import { PromptSelector } from '@/app/editor/[wid]/[workflow_id]/components/prompt-selector';
import { TranscriptExport } from '@/components/molecules/transcript-export/transcript-export';
import { IntellisenseTools } from '@/app/workspace/[wid]/prompt-templates/components/monaco-editor';
import { Button, Input, Textarea } from '@/components/atoms';
import { useAuth, useDnD } from '@/context';
import { cn } from '@/lib/utils';
import {
    IAuthorization,
    IConnectorForm,
    IHeaderValues,
    IGraphRag,
    IVectorRag,
    ISelfLearning,
    ISharedItem,
} from '@/models';
import { Node, useReactFlow } from '@xyflow/react';

import { useParams } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { toast } from 'sonner';
import { GuardrailBindingLevelType, IntelligenceSourceType } from '@/enums';
import { CallTransfer } from '@/components/molecules/call-transfer/call-transfer';
import { McpConfigurationData } from '@/app/workspace/[wid]/mcp-configurations/components/mcp-configuration-table-container';
import { useApp } from '@/context/app-context';
import { GuardrailSelector } from '@/app/editor/[wid]/[workflow_id]/components/guardrail-selector';
import { PanelSection } from '@/app/editor/[wid]/[workflow_id]/components/panel-section';
import { EditorPanelAgentProps } from '@/app/editor/[wid]/[workflow_id]/components/editor-panel';
import { promptService } from '@/services';
import { useGuardrailQuery } from '@/hooks/use-common';

const OPENAI_LOGO = `<svg data-testid="geist-icon" height="48" stroke-linejoin="round" viewBox="0 0 16 16" width="48" style="color: currentcolor">
                     <path d="M14.9449 6.54871C15.3128 5.45919 15.1861 4.26567 14.5978 3.27464C13.7131 1.75461 11.9345 0.972595 10.1974 1.3406C9.42464 0.481584 8.3144 -0.00692594 7.15045 7.42132e-05C5.37487 -0.00392587 3.79946 1.1241 3.2532 2.79113C2.11256 3.02164 1.12799 3.72615 0.551837 4.72468C-0.339497 6.24071 -0.1363 8.15175 1.05451 9.45178C0.686626 10.5413 0.813308 11.7348 1.40162 12.7258C2.28637 14.2459 4.06498 15.0279 5.80204 14.6599C6.5743 15.5189 7.68504 16.0074 8.849 15.9999C10.6256 16.0044 12.2015 14.8754 12.7478 13.2069C13.8884 12.9764 14.873 12.2718 15.4491 11.2733C16.3394 9.75728 16.1357 7.84774 14.9454 6.54771L14.9449 6.54871ZM8.85001 14.9544C8.13907 14.9554 7.45043 14.7099 6.90468 14.2604C6.92951 14.2474 6.97259 14.2239 7.00046 14.2069L10.2293 12.3668C10.3945 12.2743 10.4959 12.1008 10.4949 11.9133V7.42173L11.8595 8.19925C11.8742 8.20625 11.8838 8.22025 11.8858 8.23625V11.9558C11.8838 13.6099 10.5263 14.9509 8.85001 14.9544ZM2.32133 12.2028C1.9651 11.5958 1.8369 10.8843 1.95902 10.1938C1.98284 10.2078 2.02489 10.2333 2.05479 10.2503L5.28366 12.0903C5.44733 12.1848 5.65003 12.1848 5.81421 12.0903L9.75604 9.84429V11.3993C9.75705 11.4153 9.74945 11.4308 9.73678 11.4408L6.47295 13.3004C5.01915 14.1264 3.1625 13.6354 2.32184 12.2028H2.32133ZM1.47155 5.24819C1.82626 4.64017 2.38619 4.17516 3.05305 3.93366C3.05305 3.96116 3.05152 4.00966 3.05152 4.04366V7.72424C3.05051 7.91124 3.15186 8.08475 3.31654 8.17725L7.25838 10.4228L5.89376 11.2003C5.88008 11.2093 5.86285 11.2108 5.84765 11.2043L2.58331 9.34327C1.13255 8.51426 0.63494 6.68272 1.47104 5.24869L1.47155 5.24819ZM12.6834 7.82274L8.74157 5.57669L10.1062 4.79968C10.1199 4.79068 10.1371 4.78918 10.1523 4.79568L13.4166 6.65522C14.8699 7.48373 15.3681 9.31827 14.5284 10.7523C14.1732 11.3593 13.6138 11.8243 12.9474 12.0663V8.27575C12.9489 8.08875 12.8481 7.91574 12.6839 7.82274H12.6834ZM14.0414 5.8057C14.0176 5.7912 13.9756 5.7662 13.9457 5.7492L10.7168 3.90916C10.5531 3.81466 10.3504 3.81466 10.1863 3.90916L6.24442 6.15521V4.60017C6.2434 4.58417 6.251 4.56867 6.26367 4.55867L9.52751 2.70063C10.9813 1.87311 12.84 2.36563 13.6781 3.80066C14.0323 4.40667 14.1605 5.11618 14.0404 5.8057H14.0414ZM5.50257 8.57726L4.13744 7.79974C4.12275 7.79274 4.11312 7.77874 4.11109 7.76274V4.04316C4.11211 2.38713 5.47368 1.0451 7.15197 1.0461C7.86189 1.0461 8.54902 1.2921 9.09476 1.74011C9.06993 1.75311 9.02737 1.77661 8.99899 1.79361L5.77012 3.63365C5.60493 3.72615 5.50358 3.89916 5.50459 4.08666L5.50257 8.57626V8.57726ZM6.24391 7.00022L7.99972 5.9997L9.75553 6.99972V9.00027L7.99972 10.0003L6.24391 9.00027V7.00022Z" fill="currentColor"></path>
                     </svg>`;

const AWS_LOGO = `<svg width="48" height="48" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#FF9900" d="M200 20L20 110v180l180 90 180-90V110L200 20z"/>
                  <text x="200" y="235" text-anchor="middle" font-size="90" fill="#232F3E" font-family="Arial, Helvetica, sans-serif">aws</text>
                  </svg>`;

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
interface TranscriptExportConfig {
    isEnabled: boolean;
    webhooks: Array<{
        url: string;
        headers: Array<{
            key: string;
            value: string;
        }>;
    }>;
}

export type TimeRange = {
    from: string;
    to: string;
};

export type DayAvailability = {
    day: string;
    isEnabled: boolean;
    time_ranges: TimeRange[];
};

export type AvailabilityConfig = {
    days: DayAvailability[];
};

export type TransferRule = {
    id: string;
    name: string;
    description: string;
    priority: number;
    scenarioId: string;
    scenarioDescription?: string;
    exampleUtterances?: string[];
    targetType: 'phone' | 'queue';
    targetValue: string;
    askConfirmation: boolean;
    preTransferMessage?: string;
    availabilityEnabled: boolean;
    timezone?: string;
    availability: AvailabilityConfig;
    fallbackRule?: string;
};

export type HumanAgentCallTransferConfig = {
    isEnabled: boolean;
    description?: string;
    rules: TransferRule[];
};

export type VoiceAgent = {
    name: string;
    description: string;
    prompt: Prompt;
    languageModal: IntelligenceSourceModel;
    apis?: API[];
    isSlm?: boolean;
    transcriptExport?: TranscriptExportConfig;
    isReusableAgentSelected?: boolean;
    selfLearning?: ISelfLearning;
    mcpServers?: McpConfigurationData[];
    executableFunctions?: ExecutableFunction[];
    connectors?: IConnectorForm[];
    rags?: IVectorRag[];
    knowledgeGraphs?: IGraphRag[];
    guardrails?: string[];
};
interface AgentFormProps extends EditorPanelAgentProps {
    selectedNode: Node;
    isReadOnly?: boolean;
    onIntellisenseRefetch: () => Promise<void>;
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

interface VoiceModalType {
    id: string;
    name: string;
    description: string;
    modelType: string;
    provider: string;
    modelName: string;
    tone: string;
    voice: string;
    language: string;
    temperature?: number;
    region?: string;
    authType?: string;
}

export const VoiceAgentForm = ({
    selectedNode,
    isReadOnly,
    allPrompts,
    allModels,
    allSLMModels,
    allSTSModels,
    allApiTools,
    fetchingPrompts,
    fetchingModels,
    fetchingSLMModels,
    fetchingSTSModels,
    fetchingApiTools,
    promptsLoading,
    llmModelsLoading,
    slmModelsLoading,
    stsModelsLoading,
    apiLoading,
    onIntellisenseRefetch,
    refetchPrompts,
    refetchLLM,
    refetchSLM,
    refetchSTS,
    refetchApiTools,
}: AgentFormProps) => {
    const { guardrailBinding } = useApp();
    const [agent] = useState<VoiceAgent | undefined>(undefined);
    const [agentName, setAgentName] = useState<string>();
    const [agentGreetingMessage, setAgentGreetingMessage] = useState<string>();
    const [tone, setTone] = useState<string>();
    const [callerDisclaimerMessage, setCallerDisclaimerMessage] = useState<string>();
    const [description, setDescription] = useState<string>();
    const [isSlm, setSlm] = useState<boolean>(false);
    const [prompt, setPrompt] = useState<Prompt>();
    const [voiceModal, setVoiceModal] = useState<IntelligenceSourceModel>();
    const [apis, setApis] = useState<API[]>();
    const [guardrails, setGuardrails] = useState<string[] | undefined>();
    const [transcriptExport, setTranscriptExport] = useState<TranscriptExportConfig>({
        isEnabled: false,
        webhooks: [
            {
                url: '',
                headers: [{ key: '', value: '' }],
            },
        ],
    });
    const [humanAgentCallTransferConfig, setHumanAgentCallTransferConfig] = useState<HumanAgentCallTransferConfig>({
        isEnabled: false,
        rules: [],
    });

    const params = useParams();
    const { token } = useAuth();
    const { trigger, setSelectedNodeId, setTrigger, setGuardrailStore } = useDnD();

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

    const {
        isLoading: loadingIntellisense,
        isFetching: fetchingIntellisense,
        data: allIntellisense,
    } = useQuery('prompt-intellisense', () => promptService.intellisense(params.wid as string), {
        enabled: !!token,
        refetchOnWindowFocus: false,
        select: data => ({
            api: data?.tools?.api?.shared
                ?.filter((tool: ISharedItem) => tool?.name)
                ?.map((tool: ISharedItem) => ({
                    label: tool.name,
                    value: `${IntellisenseTools.API}:${tool.name}`,
                })),
            rag: data?.tools?.rag?.shared
                ?.filter((tool: ISharedItem) => tool?.name)
                ?.map((tool: ISharedItem) => ({
                    label: tool.name,
                    value: `${IntellisenseTools.VectorRAG}:${tool.name}`,
                })),
            graphRag: data?.tools?.graphRag?.shared
                ?.filter((tool: ISharedItem) => tool?.name)
                ?.map((tool: ISharedItem) => ({
                    label: tool.name,
                    value: `${IntellisenseTools.GraphRAG}:${tool.name}`,
                })),
            variables: data?.variables?.shared
                ?.filter((variable: ISharedItem) => variable?.name)
                ?.map((variable: ISharedItem) => ({
                    label: variable.name,
                    value: `${IntellisenseTools.Variable}:${variable.name}`,
                })),
            agents: data?.agents?.shared
                ?.filter((agent: ISharedItem) => agent?.name)
                ?.map((agent: ISharedItem) => ({
                    label: agent.name,
                    value: `${IntellisenseTools.Agent}:${agent.name}`,
                })),
        }),
    });

    const intellisenseOptions = useMemo(() => {
        if (!allIntellisense?.agents || !allIntellisense?.api || !allIntellisense?.variables) return [];
        return [
            {
                name: 'Agents',
                options: allIntellisense?.agents,
            },
            {
                name: 'APIs',
                options: allIntellisense?.api,
            },
            {
                name: 'Vector RAGs',
                options: allIntellisense?.rag,
            },
            {
                name: 'Graph RAGs',
                options: allIntellisense?.graphRag,
            },
            {
                name: 'Variables',
                options: allIntellisense?.variables,
            },
        ];
    }, [allIntellisense]);

    const { updateNodeData } = useReactFlow();

    const getVoiceModal = (voiceModal: IntelligenceSourceModel) => {
        const matchedSTSModal = allSTSModels?.find(x => x.id === voiceModal.modelId);
        return {
            id: matchedSTSModal?.id,
            name: matchedSTSModal?.name,
            description: matchedSTSModal?.description,
            modelType: 'speech_to_speech',
            provider: matchedSTSModal?.provider,
            modelName: matchedSTSModal?.modelName,
            voice: matchedSTSModal?.configurations.voice,
            language: matchedSTSModal?.configurations.language,
            temperature: matchedSTSModal?.configurations.temperature,
            region: matchedSTSModal?.configurations.region,
            authType: matchedSTSModal?.configurations.authType,
        };
    };

    const handleSaveNodeData = async () => {
        // ⚠️ Important:
        // If you modify or add new (object or array) properties here, update `updateNodeData` in use-workflow-editor.ts file accordingly.
        updateNodeData(selectedNode.id, {
            name: agentName,
            description: description,
            voiceConfig: {
                agentGreetingMessage: agentGreetingMessage,
                callerDisclaimerMessage: callerDisclaimerMessage,
                tone: tone,
                humanAgentCallTransferConfig: humanAgentCallTransferConfig?.isEnabled
                    ? humanAgentCallTransferConfig
                    : undefined,
                transcriptConfig: transcriptExport?.isEnabled ? transcriptExport : undefined,
                voiceModel: voiceModal === undefined ? undefined : getVoiceModal(voiceModal),
            },
            prompt:
                prompt === undefined
                    ? undefined
                    : {
                          id: prompt?.id,
                          name: prompt?.name,
                          description: prompt?.description,
                          configurations: prompt?.configurations,
                      },

            apis:
                apis?.map(api => ({
                    id: api.id,
                    name: api.name,
                    description: api.description,
                })) ?? undefined,
            guardrails: guardrails,
        });

        toast.success('Agent updated');

        Promise.resolve().then(() => {
            setTrigger((trigger ?? 0) + 1);
        });
    };

    const getProviderLogo = (provider?: string) => {
        switch (provider?.toLowerCase()) {
            case 'openai':
                return OPENAI_LOGO;
            case 'aws':
                return AWS_LOGO;
            default:
                return OPENAI_LOGO;
        }
    };

    /*
     * Update the agent data when the selected node changes.
     * This effect runs when the selectedNode prop changes.
     * It sets the state variables based on the data of the selected node.
     */
    useEffect(() => {
        setAgentName(selectedNode?.data?.name as string | undefined);
        setDescription(selectedNode?.data?.description as string | undefined);

        const prompt = selectedNode?.data?.prompt as Prompt;
        setPrompt(
            prompt
                ? {
                      id: prompt.id,
                      name: prompt.name,
                      description: prompt.description,
                      configurations: prompt.configurations,
                  }
                : undefined
        );

        const apis = selectedNode?.data?.apis as API[] | undefined;
        setApis(apis ?? undefined);

        const voiceConfig = selectedNode?.data?.voiceConfig as
            | {
                  agentGreetingMessage?: string;
                  callerDisclaimerMessage?: string;
                  tone?: string;
                  humanAgentCallTransferConfig?: HumanAgentCallTransferConfig;
                  transcriptConfig?: TranscriptExportConfig;
                  voiceModel: VoiceModalType;
              }
            | undefined;

        setAgentGreetingMessage(voiceConfig?.agentGreetingMessage ?? '');
        setCallerDisclaimerMessage(voiceConfig?.callerDisclaimerMessage ?? '');
        setTone(voiceConfig?.tone ?? '');

        setVoiceModal(
            voiceConfig?.voiceModel
                ? {
                      id: voiceConfig?.voiceModel.id,
                      provider: voiceConfig?.voiceModel.provider,
                      modelName: voiceConfig?.voiceModel.modelName,
                      modelId: voiceConfig?.voiceModel.id,
                      modelDescription: voiceConfig?.voiceModel.description,
                      providerLogo: getProviderLogo(voiceConfig.voiceModel.provider),
                      modelUniqueId: voiceConfig?.voiceModel.id,
                  }
                : undefined
        );

        const transcript = voiceConfig?.transcriptConfig;
        setTranscriptExport(
            transcript
                ? {
                      isEnabled: transcript.isEnabled,
                      webhooks: transcript.webhooks?.length
                          ? transcript.webhooks
                          : [
                                {
                                    url: '',
                                    headers: [{ key: '', value: '' }],
                                },
                            ],
                  }
                : {
                      isEnabled: false,
                      webhooks: [
                          {
                              url: '',
                              headers: [{ key: '', value: '' }],
                          },
                      ],
                  }
        );

        const callTransfer = voiceConfig?.humanAgentCallTransferConfig;
        setHumanAgentCallTransferConfig(
            callTransfer
                ? {
                      isEnabled: callTransfer.isEnabled,
                      rules: callTransfer.rules || [],
                  }
                : {
                      isEnabled: false,
                      rules: [],
                  }
        );

        setSlm(!!(voiceModal as any)?.isSlm);

        if (selectedNode.data.guardrails) {
            const results = getFilteredGuardrails(selectedNode.data.guardrails as string[]);
            setGuardrails(results);
        } else {
            setGuardrails(undefined);
        }
    }, [selectedNode]);

    useEffect(() => {
        const results = getFilteredGuardrails(guardrails);
        setGuardrails(results);
    }, [guardrailBinding]);

    const onPromptChange = (prompt: Prompt | undefined) => {
        if (prompt?.configurations?.prompt_template && prompt?.configurations?.prompt_template?.trim() !== '') {
            const filters = prompt?.configurations?.prompt_template;
            const result = allApiTools
                ?.map(x => ({ id: x.id, value: `API:${x.name}` }))
                ?.filter(x => filters.includes(x.value));
            if (result && result?.length > 0 && apis && apis?.length > 0) {
                const output = result.filter(x => !apis.map(r => r.id).includes(x.id));
                if (output?.length > 0) {
                    const records = allApiTools?.filter(x => output.map(p => p.id).includes(x.id));
                    if (records) {
                        setApis(prev => [...(prev ?? []), ...records]);
                    }
                }
            } else if ((result && result?.length > 0 && !apis) || (apis && apis?.length === 0)) {
                const records = allApiTools?.filter(x => result?.map(p => p.id).includes(x.id));
                if (records) {
                    setApis(records);
                }
            }
        }
    };

    const onRefetchPrompt = async () => {
        await refetchPrompts();
        onIntellisenseRefetch();
    };

    const getFilteredGuardrails = (data: string[] | undefined) => {
        if (guardrailBinding && guardrailBinding?.length > 0 && data && data?.length > 0) {
            const results = guardrailBinding?.map(x => x.guardrailId);
            const filteredIds = data.filter(id => !results.includes(id));
            return filteredIds?.length > 0 ? filteredIds : undefined;
        } else {
            return data;
        }
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
                        !fetchingSTSModels &&
                        !fetchingIntellisense &&
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
                className={cn('group flex flex-col flex-1 min-h-0', {
                    hidden:
                        fetchingPrompts ||
                        fetchingApiTools ||
                        fetchingModels ||
                        fetchingSLMModels ||
                        fetchingSTSModels ||
                        fetchingIntellisense ||
                        fetchingGuardrails,
                })}
            >
                {/* Scrollable sections */}
                <div className="agent-form pr-1 flex flex-col gap-y-2 flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:transparent [&::-webkit-scrollbar-thumb]:bg-transparent group-hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-transparent group-hover:dark:[&::-webkit-scrollbar-thumb]:bg-gray-700">

                    {/* Prompt Instruction */}
                    <PanelSection
                        key={`prompt-${selectedNode.id}`}
                        title="Prompt Instruction"
                        isConfigured={!!prompt}
                    >
                        <div className="flex flex-col gap-y-4">
                            <Input
                                label="Name"
                                placeholder="Name of the agent"
                                value={agentName ?? ''}
                                onChange={e => setAgentName(e.target.value)}
                            />
                            <Textarea
                                label="Description"
                                placeholder="Outline the specific tasks and responsibilities you expect this agent to handle"
                                rows={5}
                                value={description ?? ''}
                                onChange={e => setDescription(e.target.value)}
                            />
                            <PromptSelector
                                agent={agent}
                                prompt={prompt}
                                intellisenseOptions={intellisenseOptions.flatMap(group => group.options)}
                                loadingIntellisense={loadingIntellisense}
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
                        isConfigured={!!voiceModal}
                    >
                        <LanguageSelector
                            agent={agent}
                            isSlm={isSlm}
                            languageModel={voiceModal}
                            setLanguageModel={setVoiceModal}
                            allModels={allModels}
                            allSLMModels={allSLMModels as never}
                            allSTSModels={allSTSModels as never}
                            isReadonly={isReadOnly}
                            llmModelsLoading={llmModelsLoading}
                            slmModelsLoading={slmModelsLoading}
                            stsModelsLoading={stsModelsLoading}
                            onRefetch={() => {
                                refetchLLM();
                                refetchSLM();
                                refetchSTS();
                            }}
                            onIntelligenceSourceChange={value => setSlm(value)}
                            disabledSourceTypes={[IntelligenceSourceType.LLM, IntelligenceSourceType.SLM]}
                        />
                    </PanelSection>

                    {/* Voice Configuration */}
                    <PanelSection
                        key={`voice-config-${selectedNode.id}`}
                        title="Voice Configuration"
                        isConfigured={!!(agentGreetingMessage || callerDisclaimerMessage || tone)}
                    >
                        <div className="flex flex-col gap-y-4">
                            <Textarea
                                label="Caller Disclaimer Message"
                                placeholder="Message played to the caller when the call is first connected."
                                rows={3}
                                value={callerDisclaimerMessage ?? ''}
                                onChange={e => setCallerDisclaimerMessage(e.target.value)}
                            />
                            <Textarea
                                label="Agent Greeting Message"
                                placeholder="Greeting message played by the agent when joined the call."
                                rows={3}
                                value={agentGreetingMessage ?? ''}
                                onChange={e => setAgentGreetingMessage(e.target.value)}
                            />
                            <Textarea
                                label="Tone"
                                placeholder="Please enter the Tone"
                                rows={3}
                                value={tone ?? ''}
                                onChange={e => setTone(e.target.value)}
                            />
                        </div>
                    </PanelSection>

                    {/* Transcript Export */}
                    <PanelSection
                        key={`transcript-${selectedNode.id}`}
                        title="Transcript Export"
                        isConfigured={transcriptExport.isEnabled}
                    >
                        <TranscriptExport
                            defaultEnabled={transcriptExport.isEnabled}
                            initialHeaders={transcriptExport.webhooks[0]?.headers ?? []}
                            initialWebhookUrl={transcriptExport.webhooks[0]?.url ?? ''}
                            isReadonly={isReadOnly}
                            onChange={(enabled, headers, webhookUrl) => {
                                setTranscriptExport({
                                    isEnabled: enabled,
                                    webhooks: [
                                        {
                                            url: webhookUrl,
                                            headers: headers,
                                        },
                                    ],
                                });
                            }}
                        />
                    </PanelSection>

                    {/* Call Transfer */}
                    <PanelSection
                        key={`call-transfer-${selectedNode.id}`}
                        title="Call Transfer"
                        isConfigured={humanAgentCallTransferConfig.isEnabled}
                    >
                        <CallTransfer
                            initialCallTransfer={humanAgentCallTransferConfig}
                            setHumanAgentCallTransferConfig={setHumanAgentCallTransferConfig}
                        />
                    </PanelSection>

                    {/* Helper Tools */}
                    <PanelSection
                        key={`tools-${selectedNode.id}`}
                        title="Helper Tools"
                        isConfigured={(apis?.length ?? 0) > 0}
                    >
                        <APISelector
                            agent={agent}
                            apis={apis}
                            setApis={setApis}
                            allApiTools={allApiTools as ApiToolResponseType[]}
                            isReadonly={isReadOnly}
                            apiLoading={apiLoading}
                            onRefetch={refetchApiTools}
                        />
                    </PanelSection>

                    {/* Guardrails (hidden per original) */}
                    <div hidden>
                        <GuardrailSelector
                            allGuardrails={guardrailData ?? []}
                            guardrails={guardrails}
                            isReadonly={isReadOnly}
                            guardrailsLoading={guardrailLoading}
                            title="Agent Level Guardrails"
                            level={GuardrailBindingLevelType.AGENT}
                            setGuardrails={setGuardrails}
                            onRefetch={refetchGuardrails}
                        />
                    </div>
                </div>

                {/* Sticky footer */}
                <div className="agent-form-footer shrink-0 flex gap-x-3 justify-end pt-3 pb-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-[0_-2px_8px_0_rgba(0,0,0,0.06)]">
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
