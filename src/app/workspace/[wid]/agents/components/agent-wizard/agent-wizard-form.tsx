'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { WizardContainer, WizardStep, WizardStepCard, WizardFieldGroup, WizardSectionDivider } from './index';
import { Input, Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components';
import { AgentCategory, DEFAULT_HORIZON_CONFIG, IAgentForm, IConnectorForm, IGraphRag, IVectorRag, ISelfLearning, INodeHumanInput, IMessagePublisher, IGuardrailSetup, IMessageBroker, Tool, RequestToolType } from '@/models';
import { IMCPBody } from '@/hooks/use-mcp-configuration';
import { Control, Controller, FieldErrors, UseFormGetValues, UseFormHandleSubmit, UseFormRegister, UseFormReset, UseFormSetValue, UseFormTrigger, UseFormWatch } from 'react-hook-form';
import { cn, validateSpaces } from '@/lib/utils';
import { Bot, Brain, Settings2, Boxes, Zap, Shield, Rocket, FileText, User2, Cpu } from 'lucide-react';

// Import selectors
import { PromptSelector, PromptSelectorRef } from '@/app/editor/[wid]/[workflow_id]/components/prompt-selector';
import { LanguageSelector } from '@/app/editor/[wid]/[workflow_id]/components/language-selector';
import { APISelector } from '@/app/editor/[wid]/[workflow_id]/components/api-selector';
import { MCPSelector } from '@/app/editor/[wid]/[workflow_id]/components/mcp-selector';
import { HumanInput } from '@/app/editor/[wid]/[workflow_id]/components/human-input';
import SelfLearning from '@/app/editor/[wid]/[workflow_id]/components/self-learning';
import { GraphRagConfigSelector, GraphRagSelectorRef } from '@/app/editor/[wid]/[workflow_id]/components/graph-rag-selector';
import { VectorRagSelector, VectorRagSelectorRef } from '@/app/editor/[wid]/[workflow_id]/components/vector-rag-selector';
import { GuardrailSelector } from '@/app/editor/[wid]/[workflow_id]/components/guardrail-selector';
import { ConnectorSelector } from '@/app/editor/[wid]/[workflow_id]/components/connector-selector';
import { ExecutableFunctionSelector } from '@/app/editor/[wid]/[workflow_id]/components/executable-function-selector';
import MessagePublisher from '@/app/editor/[wid]/[workflow_id]/components/end-node/message-publisher';
import { GuardrailBindingLevelType } from '@/enums';
import { useSyncPrompt } from '@/hooks/use-common';
import { AgentType, API, ExecutableFunction, IntelligenceSourceModel, Prompt } from '@/components/organisms';
import { PromptResponse, ApiToolResponseType, ExecutableFunctionResponseType } from '../agent-form';

// Horizon sections
import {
    AgentCategorySelector,
    DeployConfigSection,
    IdentitySection,
    SkillsSection,
    ExecutionPolicySection,
    PersistenceSection,
    NotificationSection,
    PublishDialog,
} from '../horizon';

interface AgentWizardFormProps {
    isOpen: boolean;
    isValid: boolean;
    isSaving: boolean;
    isEdit: boolean;
    isPublishing?: boolean;
    errors: FieldErrors<IAgentForm>;
    isLoadingResources: boolean;
    allPrompts: PromptResponse[] | undefined;
    allModels: any;
    allApiTools: ApiToolResponseType[] | undefined;
    allExecutableFunctions: ExecutableFunctionResponseType[] | undefined;
    allMcpTools: IMCPBody[] | undefined;
    allConnectors: IConnectorForm[];
    allSLMModels: any;
    allGraphRag: IGraphRag[] | undefined;
    allVectorRags: IVectorRag[] | undefined;
    promptsLoading?: boolean;
    llmModelsLoading?: boolean;
    slmModelsLoading?: boolean;
    connectorsLoading?: boolean;
    apiLoading?: boolean;
    executableFunctionLoading?: boolean;
    mcpLoading: boolean;
    control: Control<IAgentForm, any>;
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
    onPublish?: () => void;
    workspaceName?: string;
}

// Define wizard steps
const WIZARD_STEPS: WizardStep[] = [
    {
        id: 'basics',
        title: 'Basic Info',
        description: 'Name & type',
        icon: <FileText size={20} />,
    },
    {
        id: 'intelligence',
        title: 'Intelligence',
        description: 'AI model & prompt',
        icon: <Brain size={20} />,
    },
    {
        id: 'capabilities',
        title: 'Capabilities',
        description: 'Tools & connectors',
        icon: <Boxes size={20} />,
    },
    {
        id: 'advanced',
        title: 'Advanced',
        description: 'Settings & policies',
        icon: <Settings2 size={20} />,
    },
];

// Horizon-specific steps (added when Horizon agent is selected)
const HORIZON_WIZARD_STEPS: WizardStep[] = [
    ...WIZARD_STEPS.slice(0, 3),
    {
        id: 'horizon-config',
        title: 'Horizon Config',
        description: 'Deploy & identity',
        icon: <Rocket size={20} />,
    },
    WIZARD_STEPS[3],
];

export const AgentWizardForm = (props: AgentWizardFormProps) => {
    const {
        isOpen,
        setOpen,
        isValid,
        isSaving,
        isEdit,
        isPublishing,
        errors,
        register,
        setValue,
        getValues,
        watch,
        trigger,
        control,
        handleSubmit,
        onHandleSubmit,
        reset,
        onPublish,
        workspaceName,
        // Resources
        allPrompts,
        allModels,
        allApiTools,
        allExecutableFunctions,
        allMcpTools,
        allConnectors,
        allSLMModels,
        allGraphRag,
        allVectorRags,
        messageBrokers,
        guardrailData,
        // Loading states
        promptsLoading,
        llmModelsLoading,
        slmModelsLoading,
        connectorsLoading,
        apiLoading,
        executableFunctionLoading,
        mcpLoading,
        guardrailLoading,
        // Refetch functions
        onRefetchPrompts,
        onRefetchLlms,
        onRefetchApiTools,
        onRefetchExecutableFunctions,
        onRefetchSLMModel,
        onRefetchConnector,
        onRefetchMcp,
        refetchGraphRag,
        refetchVectorRag,
        refetchGuardrails,
        refetchMessageBroker,
    } = props;

    const { syncTools } = useSyncPrompt();
    const promptRef = useRef<PromptSelectorRef>(null);
    const vectorRef = useRef<VectorRagSelectorRef>(null);
    const graphRef = useRef<GraphRagSelectorRef>(null);

    // Wizard state
    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
    const [publishDialogOpen, setPublishDialogOpen] = useState(false);

    // Form state
    const [prompt, setPrompt] = useState<Prompt>();
    const [loading, setLoading] = useState<boolean>(true);
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
    const [mounted, setMounted] = useState<boolean>(false);

    // Watch agent category
    const agentCategory = watch('agentCategory') || AgentCategory.REUSABLE;
    const isHorizonAgent = agentCategory === AgentCategory.HORIZON;
    const steps = isHorizonAgent ? HORIZON_WIZARD_STEPS : WIZARD_STEPS;

    // Handle agent category change
    const handleCategoryChange = useCallback((category: AgentCategory) => {
        if (category === AgentCategory.HORIZON && !getValues('horizonConfig')) {
            setValue('horizonConfig', DEFAULT_HORIZON_CONFIG);
        }
    }, [setValue, getValues]);

    // Reset wizard when modal closes
    useEffect(() => {
        if (!isOpen) {
            setCurrentStep(0);
            setCompletedSteps(new Set());
        }
    }, [isOpen]);

    // Initialize form state from existing agent (edit mode)
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

    const initPromptState = useCallback(() => {
        setPrompt(allPrompts?.find(p => p.id === getValues().promptTemplateId));
    }, [allPrompts, getValues]);

    const initLanguageModelState = useCallback(() => {
        const slmId = getValues().slmId;
        const llmId = getValues().llmId;
        const llm = isSlm
            ? allSLMModels?.find((model: any) => model.id === slmId)
            : allModels?.find((model: any) => model.id === llmId);

        if (llm) {
            setLanguageModel({
                id: llm.provider,
                provider: llm.provider,
                modelName: llm.modelName || llm.name || '',
                modelId: llm.id ?? '',
                modelDescription: llm.configurations.description || llm.configurations.providerConfig.description || '',
                providerLogo: llm.configurations.providerConfig.logo?.['32'] ?? '',
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
    };

    const manageExecutableFunction = (response: ExecutableFunction[] | undefined) => {
        const currentTools = getValues('tools') ?? [];
        const otherTools = currentTools.filter(tool => tool.type !== 'EXECUTABLE_FUNCTION');
        if (response && response.length > 0) {
            const functionTools = response?.map(func => ({ id: func.id, type: 'EXECUTABLE_FUNCTION' })) ?? [];
            setValue('tools', [...otherTools, ...functionTools]);
        } else {
            setValue('tools', otherTools);
        }
    };

    const managePrompt = async (response: Prompt | undefined) => {
        if (response) {
            setValue('promptTemplateId', response.id);
        } else {
            setValue('promptTemplateId', '');
        }
    };

    const manageLanguageModel = (response: IntelligenceSourceModel | undefined) => {
        if (response && !isSlm) {
            setValue('llmId', response.modelId);
            setValue('slmId', undefined);
            setValue('sourceValue', response.modelId);
        } else if (response && isSlm) {
            setValue('slmId', response.modelId);
            setValue('llmId', undefined);
            setValue('sourceValue', response.modelId);
        } else {
            setValue('llmId', undefined);
            setValue('slmId', undefined);
            setValue('sourceValue', undefined);
        }
    };

    const onHumanInputChange = (value: INodeHumanInput | undefined) => {
        setHumanInput(value);
        setValue('humanInput', value);
    };

    const onSelfLearningChange = (learning: ISelfLearning | undefined) => {
        setValue('selfLearning', learning);
    };

    const manageMcp = (response: IMCPBody[]) => {
        setValue('mcpServers', [...response]);
    };

    const onGraphRagChange = (response: IGraphRag[] | undefined) => {
        if (response && response.length > 0) {
            setValue('knowledgeGraphs', [...response]);
        } else {
            setValue('knowledgeGraphs', undefined);
        }
    };

    const onConnectorChange = (connectors: IConnectorForm[] | undefined) => {
        if (connectors && connectors.length > 0) {
            setValue('connectors', [...connectors]);
        } else {
            setValue('connectors', undefined);
        }
    };

    const onRagChange = (response: IVectorRag[] | undefined) => {
        if (response) {
            setValue('rags', [...response]);
        } else {
            setValue('rags', undefined);
        }
    };

    const onOutputBroadcasting = (data: IMessagePublisher | undefined) => {
        setValue('publisherIntegration', data);
    };

    const onGuardrailsChange = async (items: string[] | undefined) => {
        setValue('guardrails', items);
    };

    const refetchApiTools = async () => {
        onRefetchApiTools();
        await promptRef.current?.refetchVariables();
    };

    const refetchExecutableFunctions = async () => {
        onRefetchExecutableFunctions();
        await promptRef.current?.refetchVariables();
    };

    const onVectorGraphRefetch = async (isVectorRag?: boolean) => {
        if (isVectorRag) {
            await refetchVectorRag();
            if (vectorRef?.current) {
                vectorRef.current.onMount();
            }
        } else {
            await refetchGraphRag();
            if (graphRef?.current) {
                graphRef.current.onMount();
            }
        }
        await promptRef.current?.refetchVariables();
    };

    // Wizard navigation
    const validateCurrentStep = useCallback(async () => {
        const stepId = steps[currentStep].id;
        
        switch (stepId) {
            case 'basics':
                return await trigger(['agentName', 'agentDescription']);
            case 'intelligence':
                return await trigger(['promptTemplateId', 'sourceValue']);
            default:
                return true;
        }
    }, [currentStep, steps, trigger]);

    const handleNext = useCallback(async () => {
        const isStepValid = await validateCurrentStep();
        if (isStepValid) {
            setCompletedSteps(prev => new Set([...prev, currentStep]));
            setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
        }
    }, [currentStep, steps.length, validateCurrentStep]);

    const handlePrevious = useCallback(() => {
        setCurrentStep(prev => Math.max(prev - 1, 0));
    }, []);

    const handleStepClick = useCallback((stepIndex: number) => {
        if (stepIndex < currentStep || completedSteps.has(stepIndex)) {
            setCurrentStep(stepIndex);
        }
    }, [currentStep, completedSteps]);

    const handleComplete = useCallback(() => {
        handleSubmit(onHandleSubmit)();
    }, [handleSubmit, onHandleSubmit]);

    const handleCancel = useCallback(() => {
        setOpen(false);
        reset();
        setCurrentStep(0);
        setCompletedSteps(new Set());
    }, [setOpen, reset]);

    const handlePublish = () => {
        if (onPublish) {
            onPublish();
        }
        setPublishDialogOpen(false);
    };

    // Check if current step allows proceeding
    const canProceedFromCurrentStep = useMemo(() => {
        const stepId = steps[currentStep].id;
        const agentName = watch('agentName');
        const agentDescription = watch('agentDescription');
        const promptTemplateId = watch('promptTemplateId');
        const sourceValue = watch('sourceValue');

        switch (stepId) {
            case 'basics':
                return !!agentName && !!agentDescription && agentName.trim() !== '' && agentDescription.trim() !== '';
            case 'intelligence':
                return !!promptTemplateId && !!sourceValue;
            default:
                return true;
        }
    }, [currentStep, steps, watch]);

    // Render step content
    const renderStepContent = () => {
        const stepId = steps[currentStep].id;

        switch (stepId) {
            case 'basics':
                return (
                    <WizardStepCard
                        title="Basic Information"
                        description="Define the fundamental details of your AI agent"
                        icon={<FileText size={24} />}
                    >
                        <WizardFieldGroup title="Agent Identity">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    {...register('agentName', {
                                        required: { value: true, message: 'Please enter an agent name' },
                                        validate: value => validateSpaces(value, 'agent name'),
                                    })}
                                    placeholder="Enter your Agent Name"
                                    label="Agent Name"
                                    isDestructive={!!errors?.agentName?.message}
                                    supportiveText={errors?.agentName?.message}
                                />
                                <Input
                                    {...register('agentDescription', {
                                        required: { value: true, message: 'Please enter an agent description' },
                                        validate: value => validateSpaces(value, 'agent description'),
                                    })}
                                    placeholder="Enter your Agent Description"
                                    label="Agent Description"
                                    isDestructive={!!errors?.agentDescription?.message}
                                    supportiveText={errors?.agentDescription?.message}
                                />
                            </div>
                        </WizardFieldGroup>

                        <WizardSectionDivider label="Agent Type" />

                        <AgentCategorySelector
                            control={control}
                            isReadOnly={isEdit && !!watch('isReadOnly')}
                            isEdit={isEdit}
                            onCategoryChange={handleCategoryChange}
                        />
                    </WizardStepCard>
                );

            case 'intelligence':
                return (
                    <WizardStepCard
                        title="Intelligence Configuration"
                        description="Configure the AI model and prompt template that powers your agent"
                        icon={<Brain size={24} />}
                    >
                        <WizardFieldGroup title="Prompt Template" description="Select or create a prompt template for your agent">
                            <Controller
                                name="promptTemplateId"
                                control={control}
                                rules={{ required: { value: true, message: 'Please select a prompt' } }}
                                render={({ field, fieldState }) => (
                                    <PromptSelector
                                        ref={promptRef}
                                        prompt={prompt}
                                        allPrompts={allPrompts ?? []}
                                        setPrompt={(p) => { setPrompt(p); managePrompt(p); field.onChange(p?.id); }}
                                        isDestructive={!!fieldState?.error?.message}
                                        supportiveText={fieldState?.error?.message}
                                        onRefetchPrompts={onRefetchPrompts}
                                        promptsLoading={promptsLoading}
                                        isReadOnly={isEdit && !!watch('isReadOnly')}
                                    />
                                )}
                            />
                        </WizardFieldGroup>

                        <WizardFieldGroup title="Language Model" description="Choose the AI model that will process requests">
                            <Controller
                                name="sourceValue"
                                control={control}
                                rules={{ required: { value: true, message: 'Please select a language model' } }}
                                render={({ field, fieldState }) => (
                                    <LanguageSelector
                                        languageModel={languageModel}
                                        allModels={allModels ?? []}
                                        allSLMModels={allSLMModels ?? []}
                                        setLanguageModel={(lm) => { setLanguageModel(lm); manageLanguageModel(lm); }}
                                        isDestructive={!!fieldState?.error?.message}
                                        supportiveText={fieldState?.error?.message}
                                        onRefetchLlms={onRefetchLlms}
                                        onRefetchSLMModel={onRefetchSLMModel}
                                        llmModelsLoading={llmModelsLoading}
                                        slmModelsLoading={slmModelsLoading}
                                        isSlm={isSlm}
                                        setIsSlm={setIsSlm}
                                        isReadOnly={isEdit && !!watch('isReadOnly')}
                                    />
                                )}
                            />
                        </WizardFieldGroup>
                    </WizardStepCard>
                );

            case 'capabilities':
                return (
                    <WizardStepCard
                        title="Capabilities & Tools"
                        description="Configure the tools and data sources your agent can access"
                        icon={<Boxes size={24} />}
                    >
                        <WizardFieldGroup title="Input Data Connects" description="Configure data sources and tools required for this agent">
                            <ConnectorSelector
                                selectedConnectors={connectors ?? []}
                                allConnectors={allConnectors ?? []}
                                onChange={(c) => { setConnectors(c); onConnectorChange(c); }}
                                onRefetch={onRefetchConnector}
                                isLoading={connectorsLoading}
                                isReadOnly={isEdit && !!watch('isReadOnly')}
                            />
                        </WizardFieldGroup>

                        <WizardFieldGroup title="API Tools" description="External APIs the agent can call">
                            <APISelector
                                selectedApis={apis ?? []}
                                allApis={allApiTools ?? []}
                                onChange={(a) => { setApis(a); manageApi(a); }}
                                onRefetch={refetchApiTools}
                                isLoading={apiLoading}
                                isReadOnly={isEdit && !!watch('isReadOnly')}
                            />
                        </WizardFieldGroup>

                        <WizardFieldGroup title="Executable Functions" description="Custom functions the agent can execute">
                            <ExecutableFunctionSelector
                                selectedFunctions={executableFunctions ?? []}
                                allFunctions={allExecutableFunctions ?? []}
                                onChange={(f) => { setExecutableFunctions(f); manageExecutableFunction(f); }}
                                onRefetch={refetchExecutableFunctions}
                                isLoading={executableFunctionLoading}
                                isReadOnly={isEdit && !!watch('isReadOnly')}
                            />
                        </WizardFieldGroup>

                        <WizardFieldGroup title="MCP Servers" description="Model Context Protocol servers for enhanced capabilities">
                            <MCPSelector
                                mcpServers={mcpServers}
                                allMcpTools={allMcpTools ?? []}
                                setMcpServers={(m) => { setMcpServers(m); manageMcp(m); }}
                                onRefetch={onRefetchMcp}
                                mcpLoading={mcpLoading}
                                isReadOnly={isEdit && !!watch('isReadOnly')}
                            />
                        </WizardFieldGroup>

                        <WizardFieldGroup title="Knowledge Sources">
                            <div className="space-y-4">
                                <VectorRagSelector
                                    ref={vectorRef}
                                    vectorRags={vectorRags}
                                    allRags={allVectorRags ?? []}
                                    onChange={(v) => { setVectorRags(v); onRagChange(v); }}
                                    onRefetch={() => onVectorGraphRefetch(true)}
                                    isReadOnly={isEdit && !!watch('isReadOnly')}
                                />
                                <GraphRagConfigSelector
                                    ref={graphRef}
                                    graphRags={graphRags}
                                    allGraphRag={allGraphRag ?? []}
                                    onChange={(g) => { setGraphRags(g); onGraphRagChange(g); }}
                                    onRefetch={() => onVectorGraphRefetch(false)}
                                    isReadOnly={isEdit && !!watch('isReadOnly')}
                                />
                            </div>
                        </WizardFieldGroup>
                    </WizardStepCard>
                );

            case 'horizon-config':
                return (
                    <WizardStepCard
                        title="Horizon Agent Configuration"
                        description="Configure deployment, identity, and skills for your Horizon Agent"
                        icon={<Rocket size={24} />}
                    >
                        <DeployConfigSection
                            control={control}
                            watch={watch}
                            setValue={setValue}
                            isReadOnly={isEdit && !!watch('isReadOnly')}
                        />

                        <WizardSectionDivider label="Identity" />

                        <IdentitySection
                            control={control}
                            watch={watch}
                            setValue={setValue}
                            errors={errors}
                            isReadOnly={isEdit && !!watch('isReadOnly')}
                        />

                        <WizardSectionDivider label="Skills" />

                        <SkillsSection
                            control={control}
                            watch={watch}
                            setValue={setValue}
                            errors={errors}
                            isReadOnly={isEdit && !!watch('isReadOnly')}
                            connectors={connectors}
                        />
                    </WizardStepCard>
                );

            case 'advanced':
                return (
                    <WizardStepCard
                        title="Advanced Settings"
                        description="Configure additional features, policies, and integrations"
                        icon={<Settings2 size={24} />}
                    >
                        <WizardFieldGroup title="Human Input" description="Configure how the agent handles human interaction">
                            <HumanInput
                                humanInput={humanInput}
                                setHumanInput={onHumanInputChange}
                                isReadOnly={isEdit && !!watch('isReadOnly')}
                            />
                        </WizardFieldGroup>

                        <WizardFieldGroup title="Self Learning" description="Enable autonomous learning capabilities">
                            <SelfLearning
                                selfLearning={selfLearning}
                                setSelfLearning={(sl) => { setSelfLearning(sl); onSelfLearningChange(sl); }}
                                apis={apis}
                                isReadOnly={isEdit && !!watch('isReadOnly')}
                            />
                        </WizardFieldGroup>

                        <WizardFieldGroup title="Guardrails" description="Safety and compliance constraints">
                            <GuardrailSelector
                                selectedGuardrails={guardrails}
                                allGuardrails={guardrailData ?? []}
                                onChange={onGuardrailsChange}
                                onRefetch={refetchGuardrails}
                                isLoading={guardrailLoading}
                                bindingLevel={GuardrailBindingLevelType.AGENT}
                                isReadOnly={isEdit && !!watch('isReadOnly')}
                            />
                        </WizardFieldGroup>

                        <WizardFieldGroup title="Output Broadcasting" description="Configure message publishing">
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
                        </WizardFieldGroup>

                        {/* Horizon-specific advanced sections */}
                        {isHorizonAgent && (
                            <>
                                <WizardSectionDivider label="Horizon Policies" />

                                <ExecutionPolicySection
                                    control={control}
                                    watch={watch}
                                    isReadOnly={isEdit && !!watch('isReadOnly')}
                                />

                                <PersistenceSection
                                    control={control}
                                    watch={watch}
                                    isReadOnly={isEdit && !!watch('isReadOnly')}
                                />

                                <NotificationSection
                                    control={control}
                                    watch={watch}
                                    setValue={setValue}
                                    errors={errors}
                                    isReadOnly={isEdit && !!watch('isReadOnly')}
                                />
                            </>
                        )}
                    </WizardStepCard>
                );

            default:
                return null;
        }
    };

    return (
        <>
            <WizardContainer
                open={isOpen}
                setOpen={setOpen}
                steps={steps}
                currentStep={currentStep}
                completedSteps={completedSteps}
                onStepChange={handleStepClick}
                onNext={handleNext}
                onPrevious={handlePrevious}
                onComplete={handleComplete}
                onCancel={handleCancel}
                isValid={isValid}
                isSaving={isSaving}
                isEdit={isEdit}
                canProceed={canProceedFromCurrentStep}
                title={isEdit ? 'Edit Agent' : 'Create New Agent'}
            >
                {renderStepContent()}
            </WizardContainer>

            {/* Publish Dialog for Horizon Agents */}
            {isHorizonAgent && (
                <PublishDialog
                    open={publishDialogOpen}
                    onOpenChange={setPublishDialogOpen}
                    watch={watch}
                    onPublish={handlePublish}
                    isPublishing={isPublishing}
                    workspaceName={workspaceName}
                />
            )}
        </>
    );
};

export default AgentWizardForm;
