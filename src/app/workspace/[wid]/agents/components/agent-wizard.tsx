'use client';

import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { Button, Input, Textarea, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, Switch, Label } from '@/components';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/atoms/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/atoms/dialog';
import { cn, getSubmitButtonLabel, validateSpaces } from '@/lib/utils';
import { Bot, FileText, Brain, Zap, Settings, Database, Shield, Fingerprint, Rocket, Check, ChevronLeft, ChevronRight, Radio, UserCheck, GraduationCap, Gauge, Scale, Globe, Server, Network, Link2, ShieldCheck, Code } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AgentCategory, DEFAULT_HORIZON_CONFIG, IAgentForm, IAuthorization, IHeaderValues, IGraphRag, INodeHumanInput, IVectorRag, ISelfLearning, RequestToolType, IConnectorForm, Tool, IMessageBroker, IMessagePublisher, IGuardrailSetup, IExecutableFunctionCredential } from '@/models';
import { Control, Controller, FieldErrors, UseFormGetValues, UseFormHandleSubmit, UseFormRegister, UseFormReset, UseFormSetValue, UseFormTrigger, UseFormWatch } from 'react-hook-form';
import { IMCPBody } from '@/hooks/use-mcp-configuration';

// Step Components Imports
import { AgentCategorySelector, DeployConfigSection, IdentitySection, SkillsSection, ExecutionPolicySection, PersistenceSection, NotificationSection, ExecutionPrimitivesSection, validateHorizonConfig } from './horizon';
import { PromptSelector, PromptSelectorRef } from '@/app/editor/[wid]/[workflow_id]/components/prompt-selector';
import { LanguageSelector } from '@/app/editor/[wid]/[workflow_id]/components/language-selector';
import { HumanInput } from '@/app/editor/[wid]/[workflow_id]/components/human-input';
import { APISelector } from '@/app/editor/[wid]/[workflow_id]/components/api-selector';
import { MCPSelector } from '@/app/editor/[wid]/[workflow_id]/components/mcp-selector';
import { VectorRagSelector, VectorRagSelectorRef } from '@/app/editor/[wid]/[workflow_id]/components/vector-rag-selector';
import { GraphRagConfigSelector, GraphRagSelectorRef } from '@/app/editor/[wid]/[workflow_id]/components/graph-rag-selector';
import { ConnectorSelector } from '@/app/editor/[wid]/[workflow_id]/components/connector-selector';
import { GuardrailSelector } from '@/app/editor/[wid]/[workflow_id]/components/guardrail-selector';
import { ExecutableFunctionSelector } from '@/app/editor/[wid]/[workflow_id]/components/executable-function-selector';
import SelfLearning from '@/app/editor/[wid]/[workflow_id]/components/self-learning';
import MessagePublisher from '@/app/editor/[wid]/[workflow_id]/components/end-node/message-publisher';
import { AgentType, API, ExecutableFunction, IntelligenceSourceModel, McpToolResponseType, Prompt } from '@/components/organisms';
import { GuardrailBindingLevelType } from '@/enums';
import { useSyncPrompt } from '@/hooks/use-common';

export type PromptResponse = {
    id: string;
    name: string;
    description: string;
    configurations: { prompt_template: string };
};

export type ApiToolResponseType = {
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

export type ExecutableFunctionResponseType = {
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

// Wizard Step Definition
interface WizardStep {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
    forAgentTypes: AgentCategory[];
}

// Define wizard steps for Horizon Agent
const HORIZON_STEPS: WizardStep[] = [
    { id: 'basic-info', title: 'Basic Info', description: 'Agent name, description and category', icon: Bot, forAgentTypes: [AgentCategory.HORIZON, AgentCategory.REUSABLE] },
    { id: 'prompt-intelligence', title: 'Prompt & Intelligence', description: 'Configure prompt and AI model', icon: FileText, forAgentTypes: [AgentCategory.HORIZON, AgentCategory.REUSABLE] },
    { id: 'skills', title: 'Skills', description: 'Define agent skills and capabilities', icon: Zap, forAgentTypes: [AgentCategory.HORIZON] },
    { id: 'capabilities', title: 'Capabilities', description: 'Configure agent capabilities', icon: Settings, forAgentTypes: [AgentCategory.HORIZON, AgentCategory.REUSABLE] },
    { id: 'input-data-connects', title: 'Input Data Connects', description: 'Add data sources and tools', icon: Database, forAgentTypes: [AgentCategory.HORIZON, AgentCategory.REUSABLE] },
    { id: 'execution-config', title: 'Execution Config', description: 'Execution primitives and policies', icon: Shield, forAgentTypes: [AgentCategory.HORIZON] },
    { id: 'a2a-identity', title: 'A2A Identity', description: 'Agent-to-agent identity configuration', icon: Fingerprint, forAgentTypes: [AgentCategory.HORIZON] },
    { id: 'deployment-config', title: 'Deployment Config', description: 'Deploy configuration settings', icon: Rocket, forAgentTypes: [AgentCategory.HORIZON] },
];

interface AgentWizardProps {
    isOpen: boolean;
    isValid: boolean;
    isSaving: boolean;
    isEdit: boolean;
    errors: FieldErrors<IAgentForm>;
    isLoadingResources: boolean;
    allPrompts: PromptResponse[] | undefined;
    allModels: unknown;
    allApiTools: ApiToolResponseType[] | undefined;
    allExecutableFunctions: ExecutableFunctionResponseType[] | undefined;
    allMcpTools: IMCPBody[] | undefined;
    allConnectors: IConnectorForm[];
    allSLMModels: unknown;
    allGraphRag: IGraphRag[] | undefined;
    allVectorRags: IVectorRag[] | undefined;
    promptsLoading?: boolean;
    llmModelsLoading?: boolean;
    slmModelsLoading?: boolean;
    connectorsLoading?: boolean;
    apiLoading?: boolean;
    executableFunctionLoading?: boolean;
    mcpLoading: boolean;
    control: Control<IAgentForm>;
    messageBrokers: IMessageBroker[] | undefined;
    guardrailData: IGuardrailSetup[] | undefined;
    guardrailLoading: boolean;
    trigger: UseFormTrigger<IAgentForm>;
    setValue: UseFormSetValue<IAgentForm>;
    getValues: UseFormGetValues<IAgentForm>;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    register: UseFormRegister<IAgentForm>;
    handleSubmit: UseFormHandleSubmit<IAgentForm>;
    onHandleSubmit: (data: IAgentForm) => void;
    watch: UseFormWatch<IAgentForm>;
    reset: UseFormReset<IAgentForm>;
    onRefetchPrompts: () => void;
    onRefetchLlms: () => void;
    onRefetchApiTools: () => void;
    onRefetchExecutableFunctions: () => void;
    onRefetchSLMModel: () => void;
    onRefetchConnector: () => void;
    onRefetchMcp: () => void;
    refetchGraphRag: () => Promise<void>;
    refetchVectorRag: () => Promise<void>;
    refetchMessageBroker: () => Promise<void>;
    refetchGuardrails: () => void;
}

// Stepper Component
const WizardStepper = ({ 
    steps, 
    currentStepId, 
    onStepClick,
    completedSteps 
}: { 
    steps: WizardStep[]; 
    currentStepId: string;
    onStepClick?: (stepId: string) => void;
    completedSteps: Set<string>;
}) => {
    return (
        <div className="flex items-center justify-between w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            {steps.map((step, index) => {
                const isActive = step.id === currentStepId;
                const isCompleted = completedSteps.has(step.id);
                const isLast = index === steps.length - 1;
                const Icon = step.icon;
                
                return (
                    <React.Fragment key={step.id}>
                        <button
                            type="button"
                            onClick={() => onStepClick?.(step.id)}
                            className={cn(
                                'flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200',
                                isActive && 'bg-primary/10 text-primary',
                                !isActive && isCompleted && 'text-green-600 dark:text-green-400',
                                !isActive && !isCompleted && 'text-gray-400 dark:text-gray-500',
                                onStepClick && 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800'
                            )}
                        >
                            <div className={cn(
                                'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-200',
                                isActive && 'border-primary bg-primary text-white',
                                !isActive && isCompleted && 'border-green-500 bg-green-500 text-white',
                                !isActive && !isCompleted && 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                            )}>
                                {isCompleted && !isActive ? (
                                    <Check size={14} strokeWidth={3} />
                                ) : (
                                    <Icon size={14} />
                                )}
                            </div>
                            <div className="hidden lg:flex flex-col items-start">
                                <span className={cn(
                                    'text-xs font-semibold',
                                    isActive && 'text-primary',
                                    !isActive && isCompleted && 'text-green-600 dark:text-green-400',
                                    !isActive && !isCompleted && 'text-gray-500 dark:text-gray-400'
                                )}>
                                    {step.title}
                                </span>
                            </div>
                        </button>
                        {!isLast && (
                            <div className={cn(
                                'flex-1 h-[2px] mx-2 rounded transition-all duration-300',
                                isCompleted ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                            )} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export const AgentWizard = (props: AgentWizardProps) => {
    const {
        isOpen,
        setOpen,
        handleSubmit,
        onHandleSubmit,
        watch,
        reset,
        isValid,
        isEdit,
        isSaving,
        register,
        setValue,
        getValues,
        onRefetchPrompts,
        onRefetchLlms,
        onRefetchApiTools,
        onRefetchExecutableFunctions,
        onRefetchSLMModel,
        onRefetchMcp,
        onRefetchConnector,
        trigger,
        refetchGraphRag,
        refetchVectorRag,
        refetchGuardrails,
        control,
        errors,
        isLoadingResources,
        allPrompts,
        allModels,
        allApiTools,
        allExecutableFunctions,
        allSLMModels,
        allMcpTools,
        promptsLoading,
        llmModelsLoading,
        apiLoading,
        executableFunctionLoading,
        slmModelsLoading,
        mcpLoading,
        allConnectors,
        connectorsLoading,
        allGraphRag,
        allVectorRags,
        messageBrokers,
        guardrailLoading,
        guardrailData,
    } = props;

    const { syncTools } = useSyncPrompt();
    const promptRef = useRef<PromptSelectorRef>(null);
    const vectorRef = useRef<VectorRagSelectorRef>(null);
    const graphRef = useRef<GraphRagSelectorRef>(null);

    // Wizard state
    const [currentStepId, setCurrentStepId] = useState('basic-info');
    const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState<boolean>(true);
    const [mounted, setMounted] = useState<boolean>(false);

    // Form state
    const [agent] = useState<AgentType>();
    const [prompt, setPrompt] = useState<Prompt>();
    const [isSlm, setIsSlm] = useState<boolean>(false);
    const [languageModel, setLanguageModel] = useState<IntelligenceSourceModel>();
    const [apis, setApis] = useState<API[]>();
    const [executableFunctions, setExecutableFunctions] = useState<ExecutableFunction[]>();
    const [selfLearning, setSelfLearning] = useState<ISelfLearning | undefined>();
    const [humanInput, setHumanInput] = useState<INodeHumanInput | undefined>();
    const [mcpServers, setMcpServers] = useState<IMCPBody[]>([]);
    const [graphRags, setGraphRags] = useState<IGraphRag[]>([]);
    const [connectors, setConnectors] = useState<IConnectorForm[] | undefined>();
    const [vectorRags, setVectorRags] = useState<IVectorRag[]>([]);
    const [outputBroadcasting, setOutputBroadcasting] = useState<IMessagePublisher | undefined>();
    const [guardrails, setGuardrails] = useState<string[] | undefined>();

    // Horizon Agent state
    const agentCategory = watch('agentCategory') || AgentCategory.REUSABLE;
    const isHorizonAgent = agentCategory === AgentCategory.HORIZON;

    // Filter steps based on agent type
    const visibleSteps = useMemo(() => {
        return HORIZON_STEPS.filter(step => step.forAgentTypes.includes(agentCategory));
    }, [agentCategory]);

    // Get current step index
    const currentStepIndex = useMemo(() => {
        return visibleSteps.findIndex(step => step.id === currentStepId);
    }, [visibleSteps, currentStepId]);

    const isFirstStep = currentStepIndex === 0;
    const isLastStep = currentStepIndex === visibleSteps.length - 1;

    // Handle agent category change
    const handleCategoryChange = useCallback((category: AgentCategory) => {
        if (category === AgentCategory.HORIZON && !getValues('horizonConfig')) {
            setValue('horizonConfig', DEFAULT_HORIZON_CONFIG);
        }
        // Reset to first step when category changes
        setCurrentStepId('basic-info');
        setCompletedSteps(new Set());
    }, [setValue, getValues]);

    // Initialize form state
    useEffect(() => {
        if (!isEdit) {
            setLoading(false);
            setValue('promptTemplateId', prompt?.id as string);
            if (isSlm) {
                setValue('llmId', undefined);
                setValue('slmId', languageModel?.modelId as string);
            } else {
                setValue('slmId', undefined);
                setValue('llmId', languageModel?.modelId as string);
            }
            setValue('sourceValue', languageModel?.modelId);
        }
    }, [prompt, languageModel, isSlm, isEdit, setValue]);

    useEffect(() => {
        if (isEdit && !loading) {
            const publisher = getValues('publisherIntegration');
            setOutputBroadcasting(publisher);
            const _guardrails = getValues('guardrails');
            setGuardrails(_guardrails);
        }
    }, [isEdit, loading, getValues]);

    useEffect(() => {
        const slmId = getValues('slmId');
        if (slmId && slmId !== '') {
            setIsSlm(true);
        } else {
            setIsSlm(false);
        }
    }, [getValues, setIsSlm]);

    // Initialize states for edit mode
    const initPromptState = useCallback(() => {
        setPrompt(allPrompts?.find(p => p.id === getValues().promptTemplateId));
    }, [allPrompts, getValues]);

    const initLanguageModelState = useCallback(() => {
        const slmId = getValues().slmId;
        const llmId = getValues().llmId;
        const llm = isSlm
            ? (allSLMModels as Array<{ id: string; provider: string; modelName?: string; name?: string; configurations: { description?: string; providerConfig?: { description?: string; logo?: { '32'?: string } } } }>)?.find((model) => model.id === slmId)
            : (allModels as Array<{ id: string; provider: string; modelName?: string; name?: string; configurations: { description?: string; providerConfig?: { description?: string; logo?: { '32'?: string } } } }>)?.find((model) => model.id === llmId);

        if (llm) {
            setLanguageModel({
                id: llm.provider,
                provider: llm.provider,
                modelName: llm.modelName || llm.name || '',
                modelId: llm.id ?? '',
                modelDescription: llm.configurations.description || llm.configurations.providerConfig?.description || '',
                providerLogo: llm.configurations.providerConfig?.logo?.['32'] ?? '',
                modelUniqueId: llm.id ?? '',
            });
        }
    }, [isSlm, allSLMModels, allModels, getValues]);

    const initMcpServersState = useCallback(() => {
        const mcpServersValue = getValues('mcpServers') ?? [];
        setMcpServers(mcpServersValue.length > 0 ? mcpServersValue : []);
    }, [getValues]);

    const initResourcesState = useCallback(() => {
        const knowledgeGraphsValue = getValues('knowledgeGraphs') ?? [];
        if (knowledgeGraphsValue.length > 0) {
            const _knowledgeGraphs = allGraphRag?.filter(x =>
                knowledgeGraphsValue.map(kg => kg.id).includes(x.id as string)
            );
            setGraphRags(_knowledgeGraphs ?? []);
        } else {
            setGraphRags([]);
        }

        const ragsValue = getValues('rags') ?? [];
        if (ragsValue.length > 0) {
            const _rags = allVectorRags?.filter(x => ragsValue.map(r => r.id).includes(x.id as string));
            setVectorRags(_rags ?? []);
        } else {
            setVectorRags([]);
        }

        const connectorsValue = getValues('connectors') ?? [];
        if (connectorsValue.length > 0) {
            const _selectedConnectors = allConnectors.filter(connector =>
                connectorsValue.map(c => c.id).includes(connector.id)
            );
            setConnectors(_selectedConnectors);
        } else {
            setConnectors([]);
        }
    }, [allGraphRag, allVectorRags, allConnectors, getValues]);

    const initToolsState = useCallback(() => {
        const currentTools = getValues('tools') ?? [];
        if (allApiTools && allApiTools.length > 0 && currentTools.length > 0) {
            const tools = allApiTools.filter(api =>
                currentTools.some((tool: Tool) => tool.id === api.id && tool.type === 'API')
            );
            setApis(tools as API[]);
        } else {
            setApis([]);
        }

        if (allExecutableFunctions && allExecutableFunctions.length > 0 && currentTools.length > 0) {
            const func = allExecutableFunctions.filter(f =>
                currentTools.some((tool: Tool) => tool.id === f.id && tool.type === 'EXECUTABLE_FUNCTION')
            );
            setExecutableFunctions(func as ExecutableFunction[]);
        } else {
            setExecutableFunctions([]);
        }
    }, [allApiTools, allExecutableFunctions, getValues]);

    const initializeAgentData = useCallback(() => {
        if (!isEdit) return;
        initPromptState();
        initLanguageModelState();
        initMcpServersState();
        initResourcesState();
        initToolsState();
        setLoading(false);
    }, [isEdit, initPromptState, initLanguageModelState, initMcpServersState, initResourcesState, initToolsState]);

    useEffect(() => {
        initializeAgentData();
    }, [initializeAgentData]);

    useEffect(() => {
        if (!loading && isEdit) {
            const formHumanInput = getValues('humanInput');
            setHumanInput(formHumanInput);
        }
    }, [loading, isEdit, getValues]);

    // Form handlers
    const manageApi = (response: API[] | undefined) => {
        const currentTools = getValues('tools') ?? [];
        const otherTools = currentTools.filter(tool => tool.type !== 'API');

        if (response && response.length > 0) {
            const apiTools = response?.map(api => ({ id: api.id, type: 'API' })) ?? [];
            setValue('tools', [...otherTools, ...apiTools]);
        } else {
            setValue('tools', otherTools);
        }

        const currentSelfLearning = getValues('selfLearning');
        if (currentSelfLearning && response && response.length > 0) {
            const tools = response.map(api => api.id);
            const _selectedTools = tools?.find(id => currentSelfLearning?.feedbackRequestIntegration?.id == id);
            setValue('selfLearning', {
                ...currentSelfLearning,
                feedbackRequestIntegration: { id: _selectedTools as string, type: RequestToolType?.API },
            });
        }
    };

    const manageExecutableFunction = (response: ExecutableFunction[] | undefined) => {
        const currentTools = getValues('tools') ?? [];
        const otherTools = currentTools.filter(tool => tool.type !== 'EXECUTABLE_FUNCTION');

        if (response && response.length > 0) {
            const executableFunctionTools = response?.map(f => ({ id: f.id, type: 'EXECUTABLE_FUNCTION' })) ?? [];
            setValue('tools', [...otherTools, ...executableFunctionTools]);
        } else {
            setValue('tools', otherTools);
        }
    };

    const managePrompt = (response: Prompt | undefined) => {
        if (!response) {
            setValue('promptTemplateId', '');
            return;
        }

        setValue('promptTemplateId', response?.id as string);
        trigger('promptTemplateId');
        if (mounted && !isEdit) {
            syncTools({
                promptRef,
                vectorRef,
                graphRef,
                apis,
                executableFunctions,
                vectorRags,
                graphRags,
                setApis,
                setExecutableFunctions,
                setVectorRags,
                setGraphRags,
                promptTemplate: response?.configurations?.prompt_template ?? '',
                manageApi,
                manageExecutableFunction,
                allApiTools: allApiTools ?? [],
                allExecutableFunctions: allExecutableFunctions ?? [],
                allVectorRags: allVectorRags ?? [],
                allGraphRags: allGraphRag ?? [],
                onRagChange,
                onGraphRagChange,
            });
        }
    };

    const manageLanguageModel = (response: IntelligenceSourceModel | undefined) => {
        if (isSlm) {
            setValue('slmId', response?.modelId as string);
            setValue('llmId', undefined);
        } else {
            setValue('llmId', response?.modelId as string);
            setValue('slmId', undefined);
        }
        setValue('sourceValue', response?.modelId);
        trigger('sourceValue');
    };

    const manageMcp = (response: IMCPBody[]) => {
        if (response.length === 0) {
            setValue('mcpServers', []);
        } else {
            setValue('mcpServers', response);
        }
    };

    const onRagChange = (vectorRags: IVectorRag[] | undefined) => {
        const formRags = vectorRags?.map(rag => ({ id: rag.id as string })) ?? [];
        setValue('rags', formRags);
    };

    const onGraphRagChange = (graphRags: IGraphRag[] | undefined) => {
        const formGraphRags = graphRags?.map(rag => ({ id: rag.id as string })) ?? [];
        setValue('knowledgeGraphs', formGraphRags);
    };

    const onConnectorChange = (connectors: IConnectorForm[] | undefined) => {
        const formConnectors = connectors?.map(c => ({ id: c.id })) ?? [];
        setValue('connectors', formConnectors);
    };

    const onGuardrailsChange = (guardrails: string[]) => {
        setValue('guardrails', guardrails);
    };

    const onSelfLearningChange = (selfLearning: ISelfLearning | undefined) => {
        if (!selfLearning) {
            setValue('selfLearning', undefined);
            return;
        }
        setValue('selfLearning', selfLearning);
    };

    const onHumanInputChange = (humanInput: INodeHumanInput | undefined) => {
        if (!humanInput) {
            setValue('humanInput', undefined);
            return;
        }
        setValue('humanInput', humanInput);
    };

    const onOutputBroadcasting = (messagePublisher: IMessagePublisher | undefined) => {
        if (!messagePublisher) {
            setValue('publisherIntegration', undefined);
            return;
        }
        setValue('publisherIntegration', messagePublisher);
    };

    const onTriggerValidation = async (field: keyof IAgentForm) => {
        await trigger(field);
        setMounted(false);
    };

    const refetchApiTools = () => {
        onRefetchApiTools();
    };

    const refetchMcp = () => {
        onRefetchMcp();
    };

    const refetchExecutableFunctions = () => {
        onRefetchExecutableFunctions();
    };

    const onVectorGraphRefetch = async (isVector?: boolean) => {
        if (isVector) {
            await refetchVectorRag();
        } else {
            await refetchGraphRag();
        }
    };

    // Navigation handlers
    const handleNext = () => {
        if (!isLastStep) {
            setCompletedSteps(prev => new Set([...prev, currentStepId]));
            const nextStepIndex = currentStepIndex + 1;
            if (nextStepIndex < visibleSteps.length) {
                setCurrentStepId(visibleSteps[nextStepIndex].id);
            }
        }
    };

    const handleBack = () => {
        if (!isFirstStep) {
            const prevStepIndex = currentStepIndex - 1;
            if (prevStepIndex >= 0) {
                setCurrentStepId(visibleSteps[prevStepIndex].id);
            }
        }
    };

    const handleStepClick = (stepId: string) => {
        // Allow navigation to any step
        setCurrentStepId(stepId);
    };

    const handleCancel = () => {
        setOpen(false);
        reset();
        setCurrentStepId('basic-info');
        setCompletedSteps(new Set());
    };

    // Render step content based on current step
    const renderStepContent = () => {
        switch (currentStepId) {
            case 'basic-info':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                            <Controller
                                name="agentName"
                                control={control}
                                rules={{
                                    required: { value: true, message: 'Please enter agent name' },
                                    validate: value => validateSpaces(value) || 'Agent name cannot contain spaces',
                                }}
                                render={({ field }) => (
                                    <div>
                                        <Input
                                            label="Agent Key"
                                            placeholder="Enter agent key (no spaces)"
                                            disabled={isEdit && !!watch('isReadOnly')}
                                            {...field}
                                            className={cn(errors?.agentName?.message && 'border-red-300')}
                                        />
                                        {errors?.agentName?.message && (
                                            <p className="text-xs text-red-500 mt-1">{errors?.agentName?.message}</p>
                                        )}
                                    </div>
                                )}
                            />

                            <Controller
                                name="agentDescription"
                                control={control}
                                rules={{
                                    required: { value: true, message: 'Please enter agent description' },
                                }}
                                render={({ field }) => (
                                    <div>
                                        <Textarea
                                            label="Agent Description"
                                            placeholder="Enter agent description"
                                            disabled={isEdit && !!watch('isReadOnly')}
                                            {...field}
                                            rows={3}
                                            className={cn('resize-none', errors?.agentDescription?.message && 'border-red-300')}
                                        />
                                        {errors?.agentDescription?.message && (
                                            <p className="text-xs text-red-500 mt-1">{errors?.agentDescription?.message}</p>
                                        )}
                                    </div>
                                )}
                            />
                        </div>

                        <AgentCategorySelector
                            control={control}
                            watch={watch}
                            setValue={setValue}
                            isReadOnly={isEdit && !!watch('isReadOnly')}
                            onCategoryChange={handleCategoryChange}
                        />
                    </div>
                );

            case 'prompt-intelligence':
                return (
                    <div className="space-y-6">
                        <Controller
                            name="promptTemplateId"
                            control={control}
                            rules={{
                                required: { value: true, message: 'Please select a prompt instruction' },
                            }}
                            render={() => (
                                <div
                                    className={cn(
                                        'border-2 border-solid rounded-lg p-4',
                                        errors?.promptTemplateId?.message
                                            ? 'border-red-300'
                                            : 'border-gray-300 dark:border-gray-700'
                                    )}
                                >
                                    <PromptSelector
                                        ref={promptRef}
                                        agent={agent}
                                        prompt={prompt}
                                        isReadonly={isEdit && !!watch('isReadOnly')}
                                        promptsLoading={promptsLoading}
                                        setPrompt={setPrompt}
                                        allPrompts={allPrompts as PromptResponse[]}
                                        onRefetch={onRefetchPrompts}
                                        onPromptChange={managePrompt}
                                        onModalChange={value =>
                                            value ? setMounted(true) : onTriggerValidation('promptTemplateId')
                                        }
                                    />
                                </div>
                            )}
                        />
                        {errors?.promptTemplateId?.message && (
                            <p className="text-xs text-red-500">{errors?.promptTemplateId?.message}</p>
                        )}

                        <Controller
                            name="sourceValue"
                            control={control}
                            rules={{
                                required: { value: true, message: 'Please select an intelligence source' },
                            }}
                            render={() => (
                                <div
                                    className={cn(
                                        'border-2 border-solid rounded-lg p-4',
                                        errors?.sourceValue?.message
                                            ? 'border-red-300'
                                            : 'border-gray-300 dark:border-gray-700'
                                    )}
                                >
                                    <LanguageSelector
                                        isSlm={isSlm}
                                        agent={agent}
                                        languageModel={languageModel}
                                        llmModelsLoading={llmModelsLoading}
                                        slmModelsLoading={slmModelsLoading}
                                        setLanguageModel={setLanguageModel}
                                        allModels={(allModels ?? []) as never}
                                        allSLMModels={(allSLMModels ?? []) as never}
                                        allSTSModels={[]}
                                        isReadonly={isEdit && !!watch('isReadOnly')}
                                        onRefetch={() => {
                                            onRefetchLlms();
                                            onRefetchSLMModel();
                                        }}
                                        onLanguageModelChange={manageLanguageModel}
                                        onIntelligenceSourceChange={value => setIsSlm(value)}
                                        onModalChange={value =>
                                            value ? setMounted(true) : onTriggerValidation('sourceValue')
                                        }
                                    />
                                </div>
                            )}
                        />
                        {errors?.sourceValue?.message && (
                            <p className="text-xs text-red-500">{errors?.sourceValue?.message}</p>
                        )}
                    </div>
                );

            case 'skills':
                // Only for Horizon Agent
                if (!isHorizonAgent) return null;
                return (
                    <div className="space-y-6">
                        <SkillsSection
                            control={control}
                            watch={watch}
                            setValue={setValue}
                            errors={errors}
                            isReadOnly={isEdit && !!watch('isReadOnly')}
                        />
                    </div>
                );

            case 'capabilities':
                return (
                    <Accordion type="multiple" defaultValue={isHorizonAgent ? ['streaming-webhook', 'persistence', 'human-review', 'self-learning', 'output-broadcasting'] : ['human-review', 'self-learning', 'output-broadcasting']} className="w-full">
                        {/* Horizon-specific capabilities */}
                        {isHorizonAgent && (
                            <>
                                {/* Streaming & Webhook */}
                                <AccordionItem value="streaming-webhook" className="border-2 border-solid border-gray-300 dark:border-gray-700 rounded-lg mb-4 px-4">
                                    <AccordionTrigger className="hover:no-underline">
                                        <div className="flex items-center gap-x-2">
                                            <Radio size={18} className="text-gray-600 dark:text-gray-400" />
                                            <span className="text-sm font-medium">Streaming & Webhook</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <NotificationSection
                                            control={control}
                                            watch={watch}
                                            setValue={setValue}
                                            errors={errors}
                                            isReadOnly={isEdit && !!watch('isReadOnly')}
                                        />
                                    </AccordionContent>
                                </AccordionItem>

                                {/* Persistence */}
                                <AccordionItem value="persistence" className="border-2 border-solid border-gray-300 dark:border-gray-700 rounded-lg mb-4 px-4">
                                    <AccordionTrigger className="hover:no-underline">
                                        <div className="flex items-center gap-x-2">
                                            <Database size={18} className="text-gray-600 dark:text-gray-400" />
                                            <span className="text-sm font-medium">Persistence Capabilities</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <PersistenceSection
                                            control={control}
                                            watch={watch}
                                            isReadOnly={isEdit && !!watch('isReadOnly')}
                                        />
                                    </AccordionContent>
                                </AccordionItem>
                            </>
                        )}

                        {/* Human Review */}
                        <AccordionItem value="human-review" className="border-2 border-solid border-gray-300 dark:border-gray-700 rounded-lg mb-4 px-4">
                            <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-center gap-x-2">
                                    <UserCheck size={18} className="text-gray-600 dark:text-gray-400" />
                                    <span className="text-sm font-medium">Human Review</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <HumanInput
                                    humanInput={humanInput}
                                    messageBrokers={messageBrokers ?? []}
                                    setHumanInput={setHumanInput}
                                    isReadOnly={isEdit && !!watch('isReadOnly')}
                                    onHumanInputChange={onHumanInputChange}
                                />
                            </AccordionContent>
                        </AccordionItem>

                        {/* Self Learning */}
                        <AccordionItem value="self-learning" className="border-2 border-solid border-gray-300 dark:border-gray-700 rounded-lg mb-4 px-4">
                            <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-center gap-x-2">
                                    <GraduationCap size={18} className="text-gray-600 dark:text-gray-400" />
                                    <span className="text-sm font-medium">Self Learning</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <SelfLearning
                                    selfLearning={watch('selfLearning') || selfLearning}
                                    isReadOnly={isEdit && !!watch('isReadOnly')}
                                    apis={apis}
                                    allApiTools={allApiTools}
                                    llms={allModels as never}
                                    slms={allSLMModels as never}
                                    agent={agent}
                                    allPrompts={allPrompts as PromptResponse[]}
                                    promptsLoading={!!promptsLoading}
                                    llmModelsLoading={!!llmModelsLoading}
                                    slmModelsLoading={!!slmModelsLoading}
                                    messageBrokers={messageBrokers ?? []}
                                    setSelfLearning={setSelfLearning}
                                    onSelfLearningChange={onSelfLearningChange}
                                    onRefetch={onRefetchApiTools}
                                    onRefetchIntelligence={() => {
                                        onRefetchLlms();
                                        onRefetchSLMModel();
                                    }}
                                    onRefetchPrompt={async () => {
                                        onRefetchPrompts();
                                    }}
                                    allConnectors={allConnectors}
                                    connectorsLoading={connectorsLoading ?? false}
                                    onRefetchConnector={onRefetchConnector}
                                />
                            </AccordionContent>
                        </AccordionItem>

                        {/* Output Broadcasting */}
                        <AccordionItem value="output-broadcasting" className="border-2 border-solid border-gray-300 dark:border-gray-700 rounded-lg mb-4 px-4">
                            <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-center gap-x-2">
                                    <Radio size={18} className="text-gray-600 dark:text-gray-400" />
                                    <span className="text-sm font-medium">Output Broadcasting</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <MessagePublisher
                                    title="Output Broadcasting"
                                    detailButtonLabel="Add Output Broadcasting"
                                    viewLabel="View Output Broadcasting"
                                    messagePublisher={outputBroadcasting}
                                    messageBrokers={messageBrokers ?? []}
                                    isReadOnly={isEdit && !!watch('isReadOnly')}
                                    setMessagePublisher={setOutputBroadcasting}
                                    onMessagePublisherChange={onOutputBroadcasting}
                                />
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                );

            case 'input-data-connects':
                return (
                    <Accordion type="multiple" defaultValue={['api-tools', 'mcp-servers', 'vector-rag', 'graph-rag', 'data-connectors', 'guardrails', 'executable-functions']} className="w-full">
                        {/* API Tools */}
                        <AccordionItem value="api-tools" className="border-2 border-solid border-gray-300 dark:border-gray-700 rounded-lg mb-4 px-4">
                            <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-center gap-x-2">
                                    <Globe size={18} className="text-gray-600 dark:text-gray-400" />
                                    <span className="text-sm font-medium">API Tools</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <APISelector
                                    {...register('tools')}
                                    agent={agent}
                                    apis={apis}
                                    setApis={setApis}
                                    allApiTools={allApiTools as ApiToolResponseType[]}
                                    isReadonly={isEdit && !!watch('isReadOnly')}
                                    apiLoading={apiLoading}
                                    onRefetch={() => refetchApiTools()}
                                    onApiChange={manageApi}
                                />
                            </AccordionContent>
                        </AccordionItem>

                        {/* MCP Servers */}
                        <AccordionItem value="mcp-servers" className="border-2 border-solid border-gray-300 dark:border-gray-700 rounded-lg mb-4 px-4">
                            <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-center gap-x-2">
                                    <Server size={18} className="text-gray-600 dark:text-gray-400" />
                                    <span className="text-sm font-medium">MCP Servers</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <MCPSelector
                                    mcpServers={mcpServers}
                                    setMcpServers={setMcpServers}
                                    agent={agent}
                                    isReadonly={isEdit && !!watch('isReadOnly')}
                                    loading={mcpLoading}
                                    allMcpTools={allMcpTools as McpToolResponseType[]}
                                    onRefetch={() => refetchMcp()}
                                    onMcpChange={manageMcp}
                                />
                            </AccordionContent>
                        </AccordionItem>

                        {/* Vector RAG */}
                        <AccordionItem value="vector-rag" className="border-2 border-solid border-gray-300 dark:border-gray-700 rounded-lg mb-4 px-4">
                            <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-center gap-x-2">
                                    <Database size={18} className="text-gray-600 dark:text-gray-400" />
                                    <span className="text-sm font-medium">Vector RAG</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <VectorRagSelector
                                    ref={vectorRef}
                                    vectorRags={vectorRags}
                                    setVectorRags={setVectorRags}
                                    agent={agent}
                                    allVectorRags={allVectorRags ?? []}
                                    onRefetch={() => onVectorGraphRefetch(true)}
                                    onVectorRagChange={onRagChange}
                                />
                            </AccordionContent>
                        </AccordionItem>

                        {/* Graph RAG */}
                        <AccordionItem value="graph-rag" className="border-2 border-solid border-gray-300 dark:border-gray-700 rounded-lg mb-4 px-4">
                            <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-center gap-x-2">
                                    <Network size={18} className="text-gray-600 dark:text-gray-400" />
                                    <span className="text-sm font-medium">Graph RAG</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <GraphRagConfigSelector
                                    ref={graphRef}
                                    allGraphRags={allGraphRag ?? []}
                                    graphRags={graphRags}
                                    setGraphRags={setGraphRags}
                                    agent={agent}
                                    onRefetch={() => onVectorGraphRefetch()}
                                    onGraphRagChange={onGraphRagChange}
                                />
                            </AccordionContent>
                        </AccordionItem>

                        {/* Data Connectors */}
                        <AccordionItem value="data-connectors" className="border-2 border-solid border-gray-300 dark:border-gray-700 rounded-lg mb-4 px-4">
                            <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-center gap-x-2">
                                    <Link2 size={18} className="text-gray-600 dark:text-gray-400" />
                                    <span className="text-sm font-medium">Data Connectors</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <ConnectorSelector
                                    agent={agent}
                                    connectors={connectors ?? []}
                                    isMultiple={true}
                                    setConnectors={setConnectors}
                                    allConnectors={allConnectors}
                                    isSelfLearning={true}
                                    label="Data Connectors"
                                    onRefetch={onRefetchConnector}
                                    onConnectorsChange={onConnectorChange}
                                    connectorLoading={connectorsLoading}
                                />
                            </AccordionContent>
                        </AccordionItem>

                        {/* Guardrails */}
                        <AccordionItem value="guardrails" className="border-2 border-solid border-gray-300 dark:border-gray-700 rounded-lg mb-4 px-4">
                            <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-center gap-x-2">
                                    <ShieldCheck size={18} className="text-gray-600 dark:text-gray-400" />
                                    <span className="text-sm font-medium">Agent Level Guardrails</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <GuardrailSelector
                                    agent={agent}
                                    allGuardrails={guardrailData ?? []}
                                    guardrails={guardrails}
                                    isReadonly={isEdit && !!watch('isReadOnly')}
                                    guardrailsLoading={guardrailLoading}
                                    title="Agent Level Guardrails"
                                    level={GuardrailBindingLevelType.AGENT}
                                    setGuardrails={setGuardrails}
                                    onRefetch={refetchGuardrails}
                                    onGuardrailsChange={onGuardrailsChange}
                                />
                            </AccordionContent>
                        </AccordionItem>

                        {/* Executable Functions */}
                        <AccordionItem value="executable-functions" className="border-2 border-solid border-gray-300 dark:border-gray-700 rounded-lg mb-4 px-4">
                            <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-center gap-x-2">
                                    <Code size={18} className="text-gray-600 dark:text-gray-400" />
                                    <span className="text-sm font-medium">Executable Functions</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <ExecutableFunctionSelector
                                    {...register('tools')}
                                    agent={agent}
                                    functions={executableFunctions}
                                    setFunctions={setExecutableFunctions}
                                    allExecutableFunctions={allExecutableFunctions as ExecutableFunctionResponseType[]}
                                    isReadonly={isEdit && !!watch('isReadOnly')}
                                    functionLoading={executableFunctionLoading}
                                    onRefetch={() => refetchExecutableFunctions()}
                                    onExecutableFunctionChange={manageExecutableFunction}
                                />
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                );

            case 'execution-config':
                // Only for Horizon Agent
                if (!isHorizonAgent) return null;
                return (
                    <Accordion type="multiple" defaultValue={['execution-primitives', 'execution-policy']} className="w-full">
                        {/* Execution Primitives */}
                        <AccordionItem value="execution-primitives" className="border-2 border-solid border-gray-300 dark:border-gray-700 rounded-lg mb-4 px-4">
                            <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-center gap-x-2">
                                    <Gauge size={18} className="text-gray-600 dark:text-gray-400" />
                                    <span className="text-sm font-medium">Execution Primitives</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <ExecutionPrimitivesSection
                                    control={control}
                                    watch={watch}
                                    setValue={setValue}
                                    isReadOnly={isEdit && !!watch('isReadOnly')}
                                />
                            </AccordionContent>
                        </AccordionItem>

                        {/* Execution Policy */}
                        <AccordionItem value="execution-policy" className="border-2 border-solid border-gray-300 dark:border-gray-700 rounded-lg mb-4 px-4">
                            <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-center gap-x-2">
                                    <Scale size={18} className="text-gray-600 dark:text-gray-400" />
                                    <span className="text-sm font-medium">Execution Policy</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <ExecutionPolicySection
                                    control={control}
                                    watch={watch}
                                    isReadOnly={isEdit && !!watch('isReadOnly')}
                                />
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                );

            case 'a2a-identity':
                // Only for Horizon Agent
                if (!isHorizonAgent) return null;
                return (
                    <div className="space-y-6">
                        <IdentitySection
                            control={control}
                            watch={watch}
                            setValue={setValue}
                            getValues={getValues}
                            errors={errors}
                            isReadOnly={isEdit && !!watch('isReadOnly')}
                            isEdit={isEdit}
                        />
                    </div>
                );

            case 'deployment-config':
                // Only for Horizon Agent
                if (!isHorizonAgent) return null;
                return (
                    <div className="space-y-6">
                        <DeployConfigSection
                            control={control}
                            watch={watch}
                            setValue={setValue}
                            isReadOnly={isEdit && !!watch('isReadOnly')}
                        />
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleCancel}>
            <DialogContent
                hideCloseButtonClass="block top-6"
                className="gap-0 max-w-none w-[calc(100vw-320px)] h-[calc(100vh-100px)] max-h-[calc(100vh-100px)] flex flex-col p-0 left-[calc(50%+140px)] top-[50%]"
            >
                <DialogHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <DialogTitle>
                        <div className="flex items-center gap-x-3">
                            <div className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-lg">
                                <Bot size={20} className="text-primary" />
                            </div>
                            <div>
                                <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                    {isEdit ? 'Edit Agent' : 'Create New Agent'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                                    {visibleSteps.find(s => s.id === currentStepId)?.description}
                                </p>
                            </div>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                {/* Stepper */}
                <WizardStepper
                    steps={visibleSteps}
                    currentStepId={currentStepId}
                    onStepClick={handleStepClick}
                    completedSteps={completedSteps}
                />

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStepId}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {renderStepContent()}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <DialogFooter className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <div className="flex justify-between w-full">
                        <Button
                            variant="secondary"
                            onClick={handleCancel}
                        >
                            Cancel
                        </Button>
                        <div className="flex gap-x-2">
                            {!isFirstStep && (
                                <Button
                                    variant="outline"
                                    onClick={handleBack}
                                >
                                    <ChevronLeft size={16} className="mr-1" />
                                    Back
                                </Button>
                            )}
                            {isLastStep ? (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div>
                                                <Button
                                                    disabled={!isValid || isSaving || (isEdit && !!watch('isReadOnly'))}
                                                    onClick={handleSubmit(onHandleSubmit)}
                                                >
                                                    {getSubmitButtonLabel(isSaving, isEdit)}
                                                </Button>
                                            </div>
                                        </TooltipTrigger>
                                        {!isValid && (
                                            <TooltipContent side="left" align="center">
                                                All required details need to be filled before saving
                                            </TooltipContent>
                                        )}
                                    </Tooltip>
                                </TooltipProvider>
                            ) : (
                                <Button onClick={handleNext}>
                                    Next
                                    <ChevronRight size={16} className="ml-1" />
                                </Button>
                            )}
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
